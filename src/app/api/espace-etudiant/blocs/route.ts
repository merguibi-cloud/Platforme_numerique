import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les blocs de compétence avec progression pour l'étudiant connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id, formation_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    if (!etudiant.formation_id) {
      return NextResponse.json({
        success: true,
        blocs: []
      });
    }

    // Récupérer tous les blocs de la formation
    const { data: blocs, error: blocsError } = await supabase
      .from('blocs_competences')
      .select('id, numero_bloc, titre, description, ordre_affichage')
      .eq('formation_id', etudiant.formation_id)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true })
      .order('numero_bloc', { ascending: true });

    if (blocsError) {
      console.error('Erreur lors de la récupération des blocs:', blocsError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des blocs' },
        { status: 500 }
      );
    }

    if (!blocs || blocs.length === 0) {
      return NextResponse.json({
        success: true,
        blocs: []
      });
    }

    // Pour chaque bloc, calculer la progression
    // Filtrer les blocs qui ont au moins un cours en ligne
    const blocsAvecProgression = await Promise.all(
      blocs.map(async (bloc) => {
        // Récupérer tous les cours du bloc (seulement ceux en ligne)
        const { data: cours, error: coursError } = await supabase
          .from('cours_apprentissage')
          .select('id')
          .eq('bloc_id', bloc.id)
          .eq('actif', true)
          .eq('statut', 'en_ligne');

        const coursIds = cours?.map(c => c.id) || [];
        
        // Si le bloc n'a aucun cours en ligne, ne pas le retourner
        if (coursIds.length === 0) {
          return null;
        }

        // Récupérer tous les chapitres des cours
        const { data: chapitres, error: chapitresError } = await supabase
          .from('chapitres_cours')
          .select('id, cours_id, type_contenu, url_video')
          .in('cours_id', coursIds)
          .eq('actif', true);

        // Récupérer les chapitres réellement lus par l'étudiant
        const chapitreIds = chapitres?.map(c => c.id) || [];
        const { data: chapitresLusData } = await supabase
          .from('notes_etudiants')
          .select('evaluation_id')
          .eq('etudiant_id', etudiant.id)
          .eq('bloc_id', bloc.id)
          .eq('type_evaluation', 'cours')
          .in('evaluation_id', chapitreIds);

        const chapitresLusIds = new Set(chapitresLusData?.map(c => c.evaluation_id) || []);

        // Compter les cours réellement complétés (tous les chapitres du cours sont lus)
        const coursCompletes = new Set<number>();
        coursIds.forEach(coursId => {
          const chapitresDuCours = chapitres?.filter(c => c.cours_id === coursId) || [];
          if (chapitresDuCours.length > 0) {
            // Un cours est complété si tous ses chapitres texte/presentation sont lus
            const chapitresTexte = chapitresDuCours.filter(c => 
              c.type_contenu === 'texte' || c.type_contenu === 'presentation'
            );
            const tousChapitresTexteLus = chapitresTexte.length > 0 && 
              chapitresTexte.every(ch => chapitresLusIds.has(ch.id));
            if (tousChapitresTexteLus) {
              coursCompletes.add(coursId);
            }
          }
        });
        const coursLus = coursCompletes.size;

        // Compter les vidéos réellement vues
        const videosTotal = chapitres?.filter(c => c.type_contenu === 'video' && c.url_video).length || 0;
        // Pour l'instant, on considère qu'une vidéo est vue si le chapitre vidéo est dans les chapitres lus
        // (à améliorer avec une vraie table de progression vidéo si nécessaire)
        const videosVues = chapitres?.filter(c => 
          c.type_contenu === 'video' && 
          c.url_video && 
          chapitresLusIds.has(c.id)
        ).length || 0;

        // Récupérer les quiz du bloc
        const { data: quiz, error: quizError } = await supabase
          .from('quiz_evaluations')
          .select('id')
          .in('cours_id', coursIds)
          .eq('actif', true);

        const quizIds = quiz?.map(q => q.id) || [];

        // Compter les quiz complétés
        const { data: tentativesQuiz } = await supabase
          .from('tentatives_quiz')
          .select('quiz_id')
          .in('quiz_id', quizIds)
          .eq('user_id', user.id)
          .eq('termine', true);

        const quizCompletes = new Set(tentativesQuiz?.map(t => t.quiz_id) || []).size;

        // Compter les études de cas complétées
        const { data: etudesCasData } = await supabase
          .from('etudes_cas')
          .select('id')
          .in('cours_id', coursIds)
          .eq('actif', true);

        const etudeCasIds = etudesCasData?.map(ec => ec.id) || [];
        const { data: soumissionsEtudeCas } = await supabase
          .from('soumissions_etude_cas')
          .select('etude_cas_id')
          .eq('user_id', user.id)
          .in('etude_cas_id', etudeCasIds);

        const etudeCasSoumises = new Set(soumissionsEtudeCas?.map(s => s.etude_cas_id) || []).size;

        // Calculer le pourcentage de progression
        // Formule simple : (Chapitres lus + Quiz faits + Études de cas faites) / Total
        // Les vidéos ne comptent plus
        const totalChapitres = chapitres?.filter(c => 
          c.type_contenu === 'texte' || c.type_contenu === 'presentation'
        ).length || 0;
        const chapitresLusCount = chapitres?.filter(c => 
          (c.type_contenu === 'texte' || c.type_contenu === 'presentation') &&
          chapitresLusIds.has(c.id)
        ).length || 0;
        
        const totalQuiz = quizIds.length;
        const totalEtudeCas = etudeCasIds.length;
        
        // Total des éléments à compléter
        const totalElements = totalChapitres + totalQuiz + totalEtudeCas;
        const elementsCompletes = chapitresLusCount + quizCompletes + etudeCasSoumises;
        
        // Calcul simple : éléments complétés / total éléments
        const progression = totalElements > 0 
          ? Math.round((elementsCompletes / totalElements) * 100) 
          : 0;

        return {
          id: bloc.id,
          numero_bloc: bloc.numero_bloc,
          titre: bloc.titre,
          description: bloc.description,
          progression: progression,
          coursLus: coursLus,
          coursTotal: coursIds.length,
          chapitresLus: chapitresLusCount,
          chapitresTotal: totalChapitres,
          quizCompletes: quizCompletes,
          quizTotal: totalQuiz,
          etudeCasSoumises: etudeCasSoumises,
          etudeCasTotal: totalEtudeCas
        };
      })
    );

    // Filtrer les blocs null (sans cours en ligne)
    const blocsFiltres = blocsAvecProgression.filter(bloc => bloc !== null) as any[];

    // Déterminer quels blocs sont verrouillés
    // Le bloc 1 doit être à 100% pour débloquer le bloc 2, etc.
    const blocsAvecVerrouillage = await Promise.all(
      blocsFiltres.map(async (bloc, index) => {
        let locked = false;
        
        if (bloc.numero_bloc === 1) {
          // Le bloc 1 est toujours débloqué
          locked = false;
        } else {
          // Vérifier si tous les blocs précédents sont à 100%
          const blocsPrecedents = blocsFiltres.slice(0, index);
          const tousBlocsPrecedentsCompletes = blocsPrecedents.every(b => b && b.progression === 100);
          locked = !tousBlocsPrecedentsCompletes;
        }

        // Récupérer le premier cours en ligne du bloc pour la navigation
        const { data: premierCours } = await supabase
          .from('cours_apprentissage')
          .select('id')
          .eq('bloc_id', bloc.id)
          .eq('actif', true)
          .eq('statut', 'en_ligne')
          .order('ordre_affichage', { ascending: true })
          .limit(1)
          .maybeSingle();

        return {
          ...bloc,
          locked: locked,
          premier_cours_id: premierCours?.id || null,
          formation_id: etudiant.formation_id
        };
      })
    );

    return NextResponse.json({
      success: true,
      blocs: blocsAvecVerrouillage
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/blocs:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

