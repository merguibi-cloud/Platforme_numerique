import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer la progression réelle d'un étudiant pour un cours
 * Retourne :
 * - Les chapitres réellement lus (avec dates)
 * - Les quiz complétés
 * - Les études de cas soumises
 * - Les chapitres sautés (non lus entre des chapitres lus)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const blocId = searchParams.get('blocId');

    if (!coursId || !blocId) {
      return NextResponse.json(
        { success: false, error: 'coursId et blocId sont requis' },
        { status: 400 }
      );
    }

    // Récupérer tous les chapitres du cours (triés par ordre_affichage)
    const { data: chapitres, error: chapitresError } = await supabase
      .from('chapitres_cours')
      .select('id, ordre_affichage, titre')
      .eq('cours_id', parseInt(coursId))
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (chapitresError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des chapitres' },
        { status: 500 }
      );
    }

    if (!chapitres || chapitres.length === 0) {
      return NextResponse.json({
        success: true,
        chapitresLus: [],
        chapitresSautes: [],
        quizCompletes: [],
        etudeCasSoumise: false,
        progressionPourcentage: 0,
        totalChapitres: 0
      });
    }

    const chapitreIds = chapitres.map(c => c.id);

    // Récupérer les chapitres réellement lus (consultés) par l'étudiant
    const { data: chapitresLusData, error: chapitresLusError } = await supabase
      .from('notes_etudiants')
      .select('evaluation_id, updated_at, date_evaluation')
      .eq('etudiant_id', etudiant.id)
      .eq('bloc_id', parseInt(blocId))
      .eq('type_evaluation', 'cours')
      .in('evaluation_id', chapitreIds)
      .order('date_evaluation', { ascending: true });

    if (chapitresLusError) {
      console.error('Erreur lors de la récupération des chapitres lus:', chapitresLusError);
    }

    // Créer un Set des chapitres lus pour un accès rapide
    const chapitresLusIds = new Set(chapitresLusData?.map(c => c.evaluation_id) || []);
    
    // Mapper les chapitres avec leur statut
    const chapitresAvecStatut = chapitres.map(chapitre => ({
      id: chapitre.id,
      ordre: chapitre.ordre_affichage,
      titre: chapitre.titre,
      estLu: chapitresLusIds.has(chapitre.id),
      dateLecture: chapitresLusData?.find(c => c.evaluation_id === chapitre.id)?.date_evaluation || null
    }));

    // Détecter les chapitres sautés
    // Un chapitre est "sauté" si :
    // 1. Il n'est pas lu
    // 2. Il y a au moins un chapitre lu avant ET un chapitre lu après
    const chapitresSautes: number[] = [];
    const chapitresLus = chapitresAvecStatut.filter(c => c.estLu);
    
    if (chapitresLus.length > 0) {
      const premierChapitreLu = chapitresLus[0];
      const dernierChapitreLu = chapitresLus[chapitresLus.length - 1];
      
      // Vérifier tous les chapitres entre le premier et le dernier chapitre lu
      chapitresAvecStatut.forEach(chapitre => {
        if (!chapitre.estLu && 
            chapitre.ordre >= premierChapitreLu.ordre && 
            chapitre.ordre <= dernierChapitreLu.ordre) {
          chapitresSautes.push(chapitre.id);
        }
      });
    }

    // Récupérer les quiz complétés
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_evaluations')
      .select('id, chapitre_id, titre')
      .in('chapitre_id', chapitreIds)
      .eq('actif', true);

    const quizIds = quizData?.map(q => q.id) || [];

    const { data: quizCompletesData, error: quizCompletesError } = await supabase
      .from('tentatives_quiz')
      .select('quiz_id')
      .eq('user_id', user.id)
      .in('quiz_id', quizIds)
      .eq('termine', true);

    const quizCompletesIds = new Set(quizCompletesData?.map(t => t.quiz_id) || []);
    const quizCompletes = quizData?.filter(q => quizCompletesIds.has(q.id)).map(q => ({
      id: q.id,
      chapitre_id: q.chapitre_id,
      titre: q.titre
    })) || [];

    // Récupérer l'étude de cas du cours
    const { data: etudeCasData, error: etudeCasError } = await supabase
      .from('etudes_cas')
      .select('id')
      .eq('cours_id', parseInt(coursId))
      .eq('actif', true)
      .maybeSingle();

    let etudeCasSoumise = false;
    if (etudeCasData && !etudeCasError) {
      const { data: soumissionData } = await supabase
        .from('soumissions_etude_cas')
        .select('id')
        .eq('user_id', user.id)
        .eq('etude_cas_id', etudeCasData.id)
        .maybeSingle();
      
      etudeCasSoumise = !!soumissionData;
    }

    // Calculer la progression réelle
    // Formule simple : (Chapitres lus + Quiz faits + Études de cas faites) / Total
    const totalChapitres = chapitres.length;
    const chapitresLusCount = chapitresLus.length;

    const totalQuiz = quizIds.length;
    const quizCompletesCount = quizCompletes.length;

    const totalEtudeCas = etudeCasData ? 1 : 0;
    const etudeCasFaites = etudeCasSoumise ? 1 : 0;

    // Total des éléments à compléter
    const totalElements = totalChapitres + totalQuiz + totalEtudeCas;
    const elementsCompletes = chapitresLusCount + quizCompletesCount + etudeCasFaites;

    // Calcul simple : éléments complétés / total éléments
    const progressionPourcentage = totalElements > 0 
      ? Math.round((elementsCompletes / totalElements) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      chapitresLus: chapitresAvecStatut.filter(c => c.estLu).map(c => ({
        id: c.id,
        ordre: c.ordre,
        titre: c.titre,
        dateLecture: c.dateLecture
      })),
      chapitresSautes: chapitresSautes,
      chapitresNonLus: chapitresAvecStatut.filter(c => !c.estLu).map(c => ({
        id: c.id,
        ordre: c.ordre,
        titre: c.titre
      })),
      quizCompletes: quizCompletes,
      etudeCasSoumise: etudeCasSoumise,
      progressionPourcentage: Math.round(progressionPourcentage),
      totalChapitres: totalChapitres,
      chapitresLusCount: chapitresLusCount,
      totalQuiz: totalQuiz,
      quizCompletesCount: quizCompletesCount,
      details: {
        chapitresLus: chapitresLusCount,
        chapitresTotal: totalChapitres,
        quizCompletes: quizCompletesCount,
        quizTotal: totalQuiz,
        etudeCasFaites: etudeCasFaites,
        etudeCasTotal: totalEtudeCas,
        elementsCompletes: elementsCompletes,
        elementsTotal: totalElements
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/progression/real-progress:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

