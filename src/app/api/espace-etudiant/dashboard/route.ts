import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les statistiques du dashboard pour l'étudiant connecté
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

    // Récupérer la formation
    let formation = null;
    if (etudiant.formation_id) {
      const { data: formationData, error: formationError } = await supabase
        .from('formations')
        .select('id, titre, ecole')
        .eq('id', etudiant.formation_id)
        .maybeSingle();

      if (!formationError && formationData) {
        formation = formationData;
      }
    }

    // Récupérer tous les blocs de la formation
    const { data: blocs, error: blocsError } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('formation_id', etudiant.formation_id)
      .eq('actif', true);

    const blocsIds = blocs?.map(b => b.id) || [];

    // Récupérer tous les cours de la formation (seulement ceux en ligne)
    const { data: cours, error: coursError } = await supabase
      .from('cours_apprentissage')
      .select('id')
      .in('bloc_id', blocsIds)
      .eq('actif', true)
      .eq('statut', 'en_ligne');

    const coursIds = cours?.map(c => c.id) || [];

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
      .eq('type_evaluation', 'cours')
      .in('evaluation_id', chapitreIds);

    const chapitresLusIds = new Set(chapitresLusData?.map(c => c.evaluation_id) || []);

    // Compter les chapitres texte/presentation réellement lus
    const chapitresTexte = chapitres?.filter(c => 
      c.type_contenu === 'texte' || c.type_contenu === 'presentation'
    ) || [];
    const chapitresLus = chapitresTexte.filter(c => chapitresLusIds.has(c.id)).length;
    const chapitresTotal = chapitresTexte.length;

    // Récupérer les quiz de la formation
    const { data: quiz, error: quizError } = await supabase
      .from('quiz_evaluations')
      .select('id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    const quizIds = quiz?.map(q => q.id) || [];

    // Compter les quiz complétés (tentatives terminées)
    const { data: tentativesQuiz, error: tentativesError } = await supabase
      .from('tentatives_quiz')
      .select('quiz_id')
      .in('quiz_id', quizIds)
      .eq('user_id', user.id)
      .eq('termine', true);

    const quizCompletes = new Set(tentativesQuiz?.map(t => t.quiz_id) || []).size;

    // Récupérer les études de cas
    const { data: etudesCasData } = await supabase
      .from('etudes_cas')
      .select('id')
      .in('cours_id', coursIds)
      .eq('actif', true);

    const etudeCasIdsProgression = etudesCasData?.map(ec => ec.id) || [];
    const { data: soumissionsEtudeCas } = await supabase
      .from('soumissions_etude_cas')
      .select('etude_cas_id')
      .eq('user_id', user.id)
      .in('etude_cas_id', etudeCasIdsProgression);

    const etudeCasSoumises = new Set(soumissionsEtudeCas?.map(s => s.etude_cas_id) || []).size;

    // Calculer le pourcentage de progression global
    // Formule simple : (Chapitres lus + Quiz faits + Études de cas faites) / Total
    // Les vidéos ne comptent plus
    const totalElements = chapitresTotal + quizIds.length + etudeCasIdsProgression.length;
    const elementsCompletes = chapitresLus + quizCompletes + etudeCasSoumises;
    const progressionPourcentage = totalElements > 0 
      ? Math.round((elementsCompletes / totalElements) * 100) 
      : 0;

    // Calculer le temps total passé sur les cours/quiz/études de cas
    // 1. Temps depuis notes_etudiants (temps_passe en minutes)
    const { data: notesAvecTemps, error: notesTempsError } = await supabase
      .from('notes_etudiants')
      .select('temps_passe')
      .eq('etudiant_id', etudiant.id)
      .not('temps_passe', 'is', null);

    // 2. Temps depuis tentatives_quiz (temps_passe en minutes)
    const { data: tentativesAvecTemps, error: tentativesTempsError } = await supabase
      .from('tentatives_quiz')
      .select('temps_passe')
      .in('quiz_id', quizIds)
      .eq('user_id', user.id)
      .not('temps_passe', 'is', null);

    // Calculer le temps total passé sur les activités pédagogiques
    const tempsNotes = notesAvecTemps?.reduce((acc, n) => acc + (n.temps_passe || 0), 0) || 0;
    const tempsQuiz = tentativesAvecTemps?.reduce((acc, t) => acc + (t.temps_passe || 0), 0) || 0;
    const tempsTotalActivitesMinutes = tempsNotes + tempsQuiz;
    const tempsTotalActivitesHeures = Math.round(tempsTotalActivitesMinutes / 60 * 10) / 10;

    // Récupérer les sessions de connexion des 7 derniers jours pour l'activité hebdomadaire
    const aujourdhui = new Date();
    const ilYASemaine = new Date(aujourdhui);
    ilYASemaine.setDate(aujourdhui.getDate() - 7);

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions_connexion')
      .select('date_connexion, duree_minutes')
      .eq('user_id', user.id)
      .gte('date_connexion', ilYASemaine.toISOString().split('T')[0])
      .lte('date_connexion', aujourdhui.toISOString().split('T')[0])
      .order('date_connexion', { ascending: true });

    // Calculer le temps total de session pour l'activité hebdomadaire
    const tempsTotalSessionsMinutes = sessions?.reduce((acc, s) => acc + (s.duree_minutes || 0), 0) || 0;
    const tempsTotalSessionsHeures = Math.round(tempsTotalSessionsMinutes / 60 * 10) / 10;

    // Déterminer si l'étudiant a commencé (a au moins un cours lu, un quiz complété ou une vidéo vue)
    const aCommence = chapitresLus > 0 || quizCompletes > 0 || etudeCasSoumises > 0;

    // Préparer les données pour le graphique (7 derniers jours)
    const joursSemaineLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const activiteHebdomadaire = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(aujourdhui);
      date.setDate(aujourdhui.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const jourIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const jourSemaine = joursSemaineLabels[jourIndex];
      
      const session = sessions?.find(s => s.date_connexion === dateStr);
      const dureeMinutes = session ? (session.duree_minutes || 0) : 0;
      const heures = Math.round((dureeMinutes / 60) * 10) / 10;
      
      activiteHebdomadaire.push({
        jour: jourSemaine,
        heures: heures,
        minutes: dureeMinutes // Garder les minutes pour le tooltip exact
      });
    }

    // Récupérer les dernières notes
    // 1. Notes depuis notes_etudiants
    const { data: notesManuelles, error: notesError } = await supabase
      .from('notes_etudiants')
      .select('id, note, note_max, type_evaluation, date_evaluation, bloc_id')
      .eq('etudiant_id', etudiant.id)
      .order('date_evaluation', { ascending: false })
      .limit(5);

    // Récupérer les blocs pour les notes manuelles
    const blocIdsNotes = notesManuelles?.map(n => n.bloc_id).filter(Boolean) || [];
    const { data: blocsNotes } = blocIdsNotes.length > 0 ? await supabase
      .from('blocs_competences')
      .select('id, titre')
      .in('id', blocIdsNotes) : { data: null };

    const blocsMap = new Map(blocsNotes?.map(b => [b.id, b]) || []);

    // 2. Notes depuis tentatives_quiz
    const { data: notesQuiz, error: notesQuizError } = await supabase
      .from('tentatives_quiz')
      .select('id, score, date_fin, quiz_id')
      .in('quiz_id', quizIds)
      .eq('user_id', user.id)
      .eq('termine', true)
      .order('date_fin', { ascending: false })
      .limit(5);

    // Récupérer les quiz et cours pour les notes quiz
    const quizIdsNotes = notesQuiz?.map(t => t.quiz_id).filter(Boolean) || [];
    const { data: quizDetails } = quizIdsNotes.length > 0 ? await supabase
      .from('quiz_evaluations')
      .select('id, titre, cours_id')
      .in('id', quizIdsNotes) : { data: null };

    const coursIdsQuiz = quizDetails?.map(q => q.cours_id).filter(Boolean) || [];
    const { data: coursDetails } = coursIdsQuiz.length > 0 ? await supabase
      .from('cours_apprentissage')
      .select('id, titre, bloc_id')
      .in('id', coursIdsQuiz) : { data: null };

    const blocIdsQuiz = coursDetails?.map(c => c.bloc_id).filter(Boolean) || [];
    const { data: blocsQuiz } = blocIdsQuiz.length > 0 ? await supabase
      .from('blocs_competences')
      .select('id, titre')
      .in('id', blocIdsQuiz) : { data: null };

    const quizMap = new Map(quizDetails?.map(q => [q.id, q]) || []);
    const coursMap = new Map(coursDetails?.map(c => [c.id, c]) || []);
    const blocsQuizMap = new Map(blocsQuiz?.map(b => [b.id, b]) || []);

    // 3. Notes depuis soumissions_etude_cas
    const { data: notesEtudeCas, error: notesEtudeCasError } = await supabase
      .from('soumissions_etude_cas')
      .select('id, note, date_correction, etude_cas_id')
      .eq('user_id', user.id)
      .not('note', 'is', null)
      .order('date_correction', { ascending: false })
      .limit(5);

    // Récupérer les études de cas et cours pour les notes étude de cas
    const etudeCasIds = notesEtudeCas?.map(s => s.etude_cas_id).filter(Boolean) || [];
    const { data: etudeCasDetails } = etudeCasIds.length > 0 ? await supabase
      .from('etudes_cas')
      .select('id, titre, cours_id')
      .in('id', etudeCasIds) : { data: null };

    const coursIdsEtudeCas = etudeCasDetails?.map(e => e.cours_id).filter(Boolean) || [];
    const { data: coursEtudeCasDetails } = coursIdsEtudeCas.length > 0 ? await supabase
      .from('cours_apprentissage')
      .select('id, titre, bloc_id')
      .in('id', coursIdsEtudeCas) : { data: null };

    const blocIdsEtudeCas = coursEtudeCasDetails?.map(c => c.bloc_id).filter(Boolean) || [];
    const { data: blocsEtudeCas } = blocIdsEtudeCas.length > 0 ? await supabase
      .from('blocs_competences')
      .select('id, titre')
      .in('id', blocIdsEtudeCas) : { data: null };

    const etudeCasMap = new Map(etudeCasDetails?.map(e => [e.id, e]) || []);
    const coursEtudeCasMap = new Map(coursEtudeCasDetails?.map(c => [c.id, c]) || []);
    const blocsEtudeCasMap = new Map(blocsEtudeCas?.map(b => [b.id, b]) || []);

    // Formater les notes pour l'affichage
    interface NoteItem {
      id: string;
      note: number;
      noteMax: number;
      type: string;
      date: string | null;
      titre: string;
      bloc: string;
      cours: string | null;
    }
    const dernieresNotes: NoteItem[] = [];

    // Notes manuelles
    notesManuelles?.forEach(note => {
      const bloc = note.bloc_id ? blocsMap.get(note.bloc_id) : null;
      dernieresNotes.push({
        id: `note-${note.id}`,
        note: parseFloat(note.note.toString()),
        noteMax: parseFloat(note.note_max?.toString() || '20'),
        type: note.type_evaluation,
        date: note.date_evaluation,
        titre: note.type_evaluation === 'quiz' ? 'Quiz' : 
               note.type_evaluation === 'etude_cas' ? 'Étude de cas' :
               note.type_evaluation === 'projet' ? 'Projet' :
               note.type_evaluation === 'devoir' ? 'Devoir' :
               note.type_evaluation === 'examen' ? 'Examen' : 'Autre',
        bloc: bloc?.titre || 'Bloc',
        cours: null
      });
    });

    // Notes quiz
    notesQuiz?.forEach(tentative => {
      const quiz = quizMap.get(tentative.quiz_id);
      const cours = quiz ? coursMap.get(quiz.cours_id) : null;
      const bloc = cours ? blocsQuizMap.get(cours.bloc_id) : null;
      dernieresNotes.push({
        id: `quiz-${tentative.id}`,
        note: tentative.score || 0,
        noteMax: 20,
        type: 'quiz',
        date: tentative.date_fin,
        titre: quiz?.titre || 'Quiz',
        bloc: bloc?.titre || 'Bloc',
        cours: cours?.titre || null
      });
    });

    // Notes étude de cas
    notesEtudeCas?.forEach(soumission => {
      const etudeCas = etudeCasMap.get(soumission.etude_cas_id);
      const cours = etudeCas ? coursEtudeCasMap.get(etudeCas.cours_id) : null;
      const bloc = cours ? blocsEtudeCasMap.get(cours.bloc_id) : null;
      dernieresNotes.push({
        id: `etude-cas-${soumission.id}`,
        note: parseFloat(soumission.note?.toString() || '0'),
        noteMax: 20,
        type: 'etude_cas',
        date: soumission.date_correction,
        titre: etudeCas?.titre || 'Étude de cas',
        bloc: bloc?.titre || 'Bloc',
        cours: cours?.titre || null
      });
    });

    // Trier par date (plus récentes en premier) et limiter à 5
    dernieresNotes.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    const dernieresNotesLimitees = dernieresNotes.slice(0, 5);

    // Calculer les statistiques pour le diagramme circulaire
    // Pourcentages pour le diagramme (basés sur les totaux)
    const pourcentageChapitres = chapitresTotal > 0 
      ? Math.round((chapitresLus / chapitresTotal) * 100) 
      : 0;
    const pourcentageQuiz = quizIds.length > 0 
      ? Math.round((quizCompletes / quizIds.length) * 100) 
      : 0;
    const pourcentageEtudeCas = etudeCasIdsProgression.length > 0 
      ? Math.round((etudeCasSoumises / etudeCasIdsProgression.length) * 100) 
      : (etudeCasIdsProgression.length === 0 ? 100 : 0);

    return NextResponse.json({
      success: true,
      dashboard: {
        formation: formation,
        progression: {
          pourcentage: progressionPourcentage,
          chapitresLus: chapitresLus,
          chapitresTotal: chapitresTotal,
          quizCompletes: quizCompletes,
          quizTotal: quizIds.length,
          etudeCasSoumises: etudeCasSoumises,
          etudeCasTotal: etudeCasIdsProgression.length,
          elementsCompletes: elementsCompletes,
          elementsTotal: totalElements
        },
        statistiques: {
          chapitresLus: chapitresLus,
          quizCompletes: quizCompletes,
          etudeCasSoumises: etudeCasSoumises,
          chapitresRestants: chapitresTotal - chapitresLus,
          quizRestants: quizIds.length - quizCompletes,
          etudeCasRestantes: etudeCasIdsProgression.length - etudeCasSoumises,
          pourcentageChapitres: pourcentageChapitres,
          pourcentageQuiz: pourcentageQuiz,
          pourcentageEtudeCas: pourcentageEtudeCas
        },
        activite: {
          tempsTotalHeures: tempsTotalActivitesHeures, // Temps passé sur cours/quiz/études de cas
          tempsTotalSessionsHeures: tempsTotalSessionsHeures, // Temps de session total
          activiteHebdomadaire: activiteHebdomadaire.map(a => ({
            jour: a.jour,
            heures: a.heures,
            minutes: a.minutes
          }))
        },
        aCommence: aCommence,
        dernieresNotes: dernieresNotesLimitees,
        competences: {
          current: 0, // À calculer selon les blocs complétés
          total: blocsIds.length
        }
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

