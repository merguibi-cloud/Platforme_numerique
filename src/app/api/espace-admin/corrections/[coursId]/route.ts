import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les soumissions d'études de cas et tentatives de quiz pour un cours
 * Permet aux admins de voir toutes les soumissions à corriger
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coursId: string }> }
) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { coursId } = await params;
    const coursIdNum = parseInt(coursId, 10);

    if (isNaN(coursIdNum)) {
      return NextResponse.json({ error: 'ID de cours invalide' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est admin
    const { data: admin, error: adminError } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer les informations du cours et du bloc
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select(`
        id,
        titre,
        bloc_id,
        blocs_competences (
          id,
          titre,
          formation_id,
          formations (
            id,
            titre,
            ecole
          )
        )
      `)
      .eq('id', coursIdNum)
      .maybeSingle();

    if (coursError || !cours) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      );
    }

    const bloc = cours.blocs_competences as any;
    const formation = bloc?.formations as any;

    // Récupérer tous les cours du bloc pour la liste déroulante
    const { data: tousCoursBloc, error: tousCoursError } = await supabase
      .from('cours_apprentissage')
      .select('id, titre, statut')
      .eq('bloc_id', bloc.id)
      .eq('statut', 'en_ligne')
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    // Récupérer les soumissions d'études de cas pour ce cours
    const { data: etudesCas, error: etudesCasError } = await supabase
      .from('etudes_cas')
      .select('id')
      .eq('cours_id', coursIdNum)
      .eq('actif', true);

    const etudeCasIds = etudesCas?.map(ec => ec.id) || [];

    let soumissionsEtudeCas = [];
    if (etudeCasIds.length > 0) {
      const { data: soumissions, error: soumissionsError } = await supabase
        .from('soumissions_etude_cas')
        .select(`
          id,
          user_id,
          etude_cas_id,
          date_soumission,
          note,
          date_correction
        `)
        .in('etude_cas_id', etudeCasIds)
        .order('date_soumission', { ascending: false });

      if (!soumissionsError && soumissions) {
        // Récupérer les informations utilisateur pour chaque soumission
        soumissionsEtudeCas = await Promise.all(
          soumissions.map(async (s: any) => {
            // Récupérer l'email depuis auth.users
            const { data: authUser } = await supabase.auth.admin.getUserById(s.user_id);
            
            // Récupérer les informations depuis candidatures
            const { data: candidature } = await supabase
              .from('candidatures')
              .select('nom, prenom, email')
              .eq('user_id', s.user_id)
              .maybeSingle();

            const nom = candidature?.nom || '';
            const prenom = candidature?.prenom || '';
            const email = authUser?.user?.email || candidature?.email || '';
            const etudiantNom = nom && prenom ? `${prenom} ${nom}` : email.split('@')[0] || 'Utilisateur';
            
            // Déterminer l'état
            let etat = 'a_corriger';
            if (s.note !== null && s.date_correction) {
              etat = 'corrige';
            } else {
              // Vérifier si en retard (plus de 7 jours depuis la soumission)
              const dateSoumission = new Date(s.date_soumission);
              const maintenant = new Date();
              const joursEcoules = Math.floor((maintenant.getTime() - dateSoumission.getTime()) / (1000 * 60 * 60 * 24));
              if (joursEcoules > 7) {
                etat = 'en_retard';
              }
            }

            return {
              id: s.id,
              etudiant_nom: etudiantNom,
              etudiant_email: email,
              etat,
              date_envoi: s.date_soumission ? new Date(s.date_soumission).toISOString().split('T')[0] : null,
              date_correction: s.date_correction ? new Date(s.date_correction).toISOString().split('T')[0] : null,
              note: s.note,
              etude_cas_id: s.etude_cas_id
            };
          })
        );
      }
    }

    // Récupérer les tentatives de quiz pour ce cours
    const { data: quiz, error: quizError } = await supabase
      .from('quiz_evaluations')
      .select('id, titre')
      .eq('cours_id', coursIdNum)
      .eq('actif', true);

    const quizIds = quiz?.map(q => q.id) || [];

    let tentativesQuiz = [];
    if (quizIds.length > 0) {
      const { data: tentatives, error: tentativesError } = await supabase
        .from('tentatives_quiz')
        .select(`
          id,
          user_id,
          quiz_id,
          score,
          date_tentative,
          termine,
          note_modifiee_manuellement,
          correcteur_id,
          date_modification_note,
          quiz_evaluations (
            id,
            titre
          )
        `)
        .in('quiz_id', quizIds)
        .eq('termine', true)
        .order('date_tentative', { ascending: false });

      if (!tentativesError && tentatives) {
        // Récupérer les informations utilisateur pour chaque tentative
        tentativesQuiz = await Promise.all(
          tentatives.map(async (t: any) => {
            // Récupérer l'email depuis auth.users
            const { data: authUser } = await supabase.auth.admin.getUserById(t.user_id);
            
            // Récupérer les informations depuis candidatures
            const { data: candidature } = await supabase
              .from('candidatures')
              .select('nom, prenom, email')
              .eq('user_id', t.user_id)
              .maybeSingle();

            const nom = candidature?.nom || '';
            const prenom = candidature?.prenom || '';
            const email = authUser?.user?.email || candidature?.email || '';
            const etudiantNom = nom && prenom ? `${prenom} ${nom}` : email.split('@')[0] || 'Utilisateur';
            const quizData = t.quiz_evaluations as any;

            return {
              id: t.id,
              quiz_id: t.quiz_id,
              quiz_titre: quizData?.titre || 'Quiz',
              etudiant_nom: etudiantNom,
              etudiant_email: email,
              score: t.score,
              note_sur_20: t.score ? (t.score * 20 / 100) : 0,
              date_tentative: t.date_tentative ? new Date(t.date_tentative).toISOString().split('T')[0] : null,
              note_modifiee_manuellement: t.note_modifiee_manuellement || false,
              correcteur_id: t.correcteur_id,
              date_modification_note: t.date_modification_note
            };
          })
        );
      }
    }

    // Séparer les soumissions en "à corriger" et "corrigées"
    const aCorriger = soumissionsEtudeCas.filter((s: any) => s.etat === 'a_corriger' || s.etat === 'en_retard');
    const corrigees = soumissionsEtudeCas.filter((s: any) => s.etat === 'corrige');

    return NextResponse.json({
      success: true,
      cours: {
        id: cours.id,
        titre: cours.titre
      },
      bloc: {
        id: bloc.id,
        titre: bloc.titre
      },
      formation: {
        id: formation?.id,
        titre: formation?.titre,
        ecole: formation?.ecole
      },
      coursBloc: tousCoursBloc || [],
      soumissions: {
        aCorriger,
        corrigees
      },
      tentativesQuiz
    });
  } catch (error) {
    console.error('Erreur dans l\'API corrections:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

