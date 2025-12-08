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
        const chapitreIdsArray = chapitres?.map(c => c.id) || [];
        
        // Récupérer les chapitres lus (sans filtrer par bloc_id car il peut être NULL ou différent selon le contexte)
        // On filtre seulement par etudiant_id, type_evaluation et les chapitre IDs qui appartiennent au bloc
        // Cela permet de récupérer tous les chapitres lus même si le bloc_id dans notes_etudiants n'est pas cohérent
        let chapitresLusData: any[] = [];
        if (chapitreIdsArray.length > 0) {
          const { data, error } = await supabase
            .from('notes_etudiants')
            .select('evaluation_id, bloc_id')
            .eq('etudiant_id', etudiant.id)
            .eq('type_evaluation', 'cours')
            .in('evaluation_id', chapitreIdsArray);
          
          if (error) {
            console.error(`[Bloc ${bloc.numero_bloc}] Erreur récupération chapitres lus:`, error);
          } else {
            chapitresLusData = data || [];
          }
        }

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
        // Les quiz peuvent être associés à un cours_id OU à un chapitre_id
        // Récupérer d'abord les quiz par cours_id
        const { data: quizByCours, error: quizError1 } = await supabase
          .from('quiz_evaluations')
          .select('id')
          .in('cours_id', coursIds)
          .eq('actif', true);

        // Récupérer les quiz par chapitre_id (les chapitres des cours du bloc)
        const { data: quizByChapitre, error: quizError2 } = chapitreIdsArray.length > 0 ? await supabase
          .from('quiz_evaluations')
          .select('id')
          .in('chapitre_id', chapitreIdsArray)
          .eq('actif', true) : { data: null, error: null };

        // Combiner les deux listes et dédupliquer
        const quizIdsSet = new Set<number>();
        quizByCours?.forEach(q => quizIdsSet.add(q.id));
        quizByChapitre?.forEach(q => quizIdsSet.add(q.id));
        const quizIds = Array.from(quizIdsSet);

        // Compter les quiz complétés (utiliser notes_etudiants comme source de vérité)
        // car c'est là que les notes sont créées lors de la soumission du quiz
        let quizCompletes = 0;
        if (quizIds.length > 0) {
          const { data: notesQuiz } = await supabase
            .from('notes_etudiants')
            .select('evaluation_id')
            .eq('etudiant_id', etudiant.id)
            .eq('type_evaluation', 'quiz')
            .in('evaluation_id', quizIds)
            .not('note', 'is', null);
          
          quizCompletes = new Set(notesQuiz?.map(n => n.evaluation_id) || []).size;
        }

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
        // IMPORTANT: Compter tous les chapitres texte/presentation de TOUS les cours du bloc
        const chapitresTextePresentation = chapitres?.filter(c => 
          c.type_contenu === 'texte' || c.type_contenu === 'presentation'
        ) || [];
        const totalChapitres = chapitresTextePresentation.length;
        
        // Compter les chapitres texte/presentation qui ont été lus
        const chapitresLusCount = chapitresTextePresentation.filter(c => 
          chapitresLusIds.has(c.id)
        ).length;
        
        const totalQuiz = quizIds.length;
        const totalEtudeCas = etudeCasIds.length;
        
        // Total des éléments à compléter
        const totalElements = totalChapitres + totalQuiz + totalEtudeCas;
        const elementsCompletes = chapitresLusCount + quizCompletes + etudeCasSoumises;
        
        // Calcul simple : éléments complétés / total éléments
        const progression = totalElements > 0 
          ? Math.round((elementsCompletes / totalElements) * 100) 
          : 0;

        // Trouver le premier cours non complété
        // Récupérer tous les cours du bloc (triés par ordre d'affichage) avec leurs IDs
        const { data: tousCours } = await supabase
          .from('cours_apprentissage')
          .select('id, ordre_affichage')
          .eq('bloc_id', bloc.id)
          .eq('actif', true)
          .eq('statut', 'en_ligne')
          .order('ordre_affichage', { ascending: true });

        let premierCoursNonComplete: { id: number } | null = null;
        
        if (tousCours && tousCours.length > 0) {
          for (const cours of tousCours) {
            // Vérifier si ce cours est complété
            const chapitresDuCours = chapitres?.filter(c => c.cours_id === cours.id) || [];
            if (chapitresDuCours.length > 0) {
              const chapitresTexte = chapitresDuCours.filter(c => 
                c.type_contenu === 'texte' || c.type_contenu === 'presentation'
              );
              
              // Un cours est complété si tous ses chapitres texte sont lus
              const tousChapitresTexteLus = chapitresTexte.length > 0 && 
                chapitresTexte.every(ch => chapitresLusIds.has(ch.id));
              
              if (!tousChapitresTexteLus) {
                // Ce cours n'est pas complété, c'est celui qu'on cherche
                premierCoursNonComplete = cours;
                break;
              }
            } else {
              // Pas de chapitres texte, considérer comme non complété
              premierCoursNonComplete = cours;
              break;
            }
          }
        }
        
        // Si tous les cours sont complétés, retourner le premier cours (pour "revoir")
        const premierCours = tousCours && tousCours.length > 0 ? tousCours[0] : null;
        const coursIdPourNavigation = premierCoursNonComplete?.id || premierCours?.id || null;

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
          etudeCasTotal: totalEtudeCas,
          premier_cours_id: coursIdPourNavigation
        };
      })
    );

    // Filtrer les blocs null (sans cours en ligne)
    const blocsFiltres = blocsAvecProgression.filter(bloc => bloc !== null) as any[];

    // Déterminer quels blocs sont verrouillés
    // Le bloc 1 doit être à 100% pour débloquer le bloc 2, etc.
    const blocsAvecVerrouillage = blocsFiltres.map((bloc, index) => {
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

      return {
        ...bloc,
        locked: locked,
        formation_id: etudiant.formation_id
      };
    });

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

