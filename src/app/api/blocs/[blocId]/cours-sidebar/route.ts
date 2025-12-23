import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Endpoint optimisé pour charger les cours d'un bloc pour la sidebar
 * Charge seulement les informations nécessaires : cours, chapitres (titres), quiz (titres), études de cas (titres)
 * SANS les questions, réponses, fichiers complémentaires, etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blocId: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { blocId } = await params;
    const blocIdNum = parseInt(blocId, 10);

    if (isNaN(blocIdNum)) {
      return NextResponse.json({ error: 'ID de bloc invalide' }, { status: 400 });
    }

    // Vérifier si c'est une requête de prévisualisation admin (paramètre preview=true)
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // 1. Charger les cours du bloc
    let query = supabase
      .from('cours_apprentissage')
      .select('id, numero_cours, titre, ordre_affichage')
      .eq('bloc_id', blocIdNum)
      .eq('actif', true);

    if (!isPreview) {
      query = query.eq('statut', 'en_ligne');
    }

    const { data: cours, error: coursError } = await query.order('ordre_affichage', { ascending: true });

    if (coursError) {
      console.error('Erreur lors de la récupération des cours:', coursError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!cours || cours.length === 0) {
      return NextResponse.json({ cours: [] });
    }

    const coursIds = cours.map(c => c.id);

    // 2. Charger seulement les titres des chapitres actifs (pour la sidebar, on n'a besoin que des chapitres actifs)
    const { data: chapitres, error: chapitresError } = await supabase
      .from('chapitres_cours')
      .select('id, cours_id, titre, ordre_affichage')
      .in('cours_id', coursIds)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (chapitresError) {
      console.error('Erreur lors de la récupération des chapitres:', chapitresError);
    }

    const chapitresList = chapitres || [];
    const chapitreIds = chapitresList.map(c => c.id);

    // 3. Organiser les chapitres par cours_id
    const chapitresByCours = new Map<number, any[]>();
    chapitresList.forEach((chapitre: any) => {
      if (!chapitresByCours.has(chapitre.cours_id)) {
        chapitresByCours.set(chapitre.cours_id, []);
      }
      chapitresByCours.get(chapitre.cours_id)!.push(chapitre);
    });

    // 4. Charger seulement les titres des quiz (sans questions ni réponses)
    let quizzesMap = new Map<number, any>();
    if (chapitreIds.length > 0) {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quiz_evaluations')
        .select('id, chapitre_id, titre')
        .in('chapitre_id', chapitreIds)
        .eq('actif', true);

      if (!quizzesError && quizzes) {
        quizzes.forEach((quiz: any) => {
          if (quiz.chapitre_id != null) {
            quizzesMap.set(quiz.chapitre_id, {
              id: quiz.id,
              chapitre_id: quiz.chapitre_id,
              titre: quiz.titre || 'Quiz'
            });
          }
        });
      }
    }

    // 5. Charger seulement les titres des études de cas (sans questions ni réponses)
    const { data: etudesCas, error: etudesCasError } = await supabase
      .from('etudes_cas')
      .select('id, cours_id, titre')
      .in('cours_id', coursIds)
      .eq('actif', true);

    if (etudesCasError) {
      console.error('Erreur lors de la récupération des études de cas:', etudesCasError);
    }

    const etudesCasList = etudesCas || [];
    const etudeCasByCours = new Map<number, any>();
    etudesCasList.forEach((etudeCas: any) => {
      if (etudeCas.cours_id) {
        etudeCasByCours.set(etudeCas.cours_id, {
          id: etudeCas.id,
          titre: etudeCas.titre || 'Étude de cas'
        });
      }
    });

    // 6. Construire la réponse optimisée
    const coursWithData = cours.map((c: any) => {
      const chapitres = chapitresByCours.get(c.id) || [];
      
      // Ajouter les quiz aux chapitres
      const chapitresWithQuiz = chapitres.map((chapitre: any) => {
        const quiz = quizzesMap.get(chapitre.id);
        return {
          ...chapitre,
          quiz: quiz || null
        };
      });

      // Récupérer l'étude de cas au niveau cours
      const etudeCas = etudeCasByCours.get(c.id);

      return {
        ...c,
        chapitres: chapitresWithQuiz,
        etude_cas: etudeCas || null
      };
    });

    return NextResponse.json({ cours: coursWithData });
  } catch (error) {
    console.error('Erreur dans l\'API blocs cours-sidebar:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
