import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer le relevé de notes complet de l'étudiant avec les moyennes de la promo
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
      .select('id, formation_id, user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer tous les blocs de la formation
    const { data: blocs, error: blocsError } = await supabase
      .from('blocs_competences')
      .select('id, numero_bloc, titre')
      .eq('formation_id', etudiant.formation_id)
      .order('numero_bloc', { ascending: true });

    if (blocsError || !blocs) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des blocs' },
        { status: 500 }
      );
    }

    // Pour chaque bloc, calculer les moyennes
    const releveNotes = await Promise.all(
      blocs.map(async (bloc) => {
        // Récupérer toutes les notes de l'étudiant pour ce bloc avec les détails
        const { data: notesEtudiant, error: notesError } = await supabase
          .from('notes_etudiants')
          .select('id, note, note_max, type_evaluation, evaluation_id, date_evaluation')
          .eq('etudiant_id', etudiant.id)
          .eq('bloc_id', bloc.id)
          .not('note', 'is', null)
          .order('date_evaluation', { ascending: false });

        // Calculer la moyenne de l'étudiant pour ce bloc
        let moyenneEtudiant = 0;
        if (notesEtudiant && notesEtudiant.length > 0) {
          const sommeNotes = notesEtudiant.reduce((sum, n) => {
            // Convertir en note sur 20 si nécessaire
            const noteSur20 = n.note_max && n.note_max !== 20 
              ? (n.note / n.note_max) * 20 
              : n.note;
            return sum + noteSur20;
          }, 0);
          moyenneEtudiant = sommeNotes / notesEtudiant.length;
        }

        // Récupérer toutes les notes de tous les étudiants de la formation pour ce bloc
        const { data: tousEtudiants, error: tousEtudiantsError } = await supabase
          .from('etudiants')
          .select('id')
          .eq('formation_id', etudiant.formation_id);

        if (tousEtudiantsError || !tousEtudiants) {
          return {
            bloc_id: bloc.id,
            numero_bloc: bloc.numero_bloc,
            titre: bloc.titre,
            moyenne_etudiant: moyenneEtudiant,
            moyenne_promo: 0,
            meilleure_moyenne_promo: 0
          };
        }

        const etudiantIds = tousEtudiants.map(e => e.id);

        // Récupérer toutes les notes de tous les étudiants pour ce bloc
        const { data: toutesNotes, error: toutesNotesError } = await supabase
          .from('notes_etudiants')
          .select('etudiant_id, note, note_max')
          .eq('bloc_id', bloc.id)
          .in('etudiant_id', etudiantIds)
          .not('note', 'is', null);

        // Calculer les moyennes par étudiant
        const moyennesParEtudiant: { [etudiantId: number]: number[] } = {};
        
        if (toutesNotes && toutesNotes.length > 0) {
          toutesNotes.forEach((note) => {
            if (!moyennesParEtudiant[note.etudiant_id]) {
              moyennesParEtudiant[note.etudiant_id] = [];
            }
            // Convertir en note sur 20 si nécessaire
            const noteSur20 = note.note_max && note.note_max !== 20 
              ? (note.note / note.note_max) * 20 
              : note.note;
            moyennesParEtudiant[note.etudiant_id].push(noteSur20);
          });
        }

        // Calculer la moyenne de chaque étudiant
        const moyennesEtudiants: number[] = Object.values(moyennesParEtudiant).map(notes => {
          if (notes.length === 0) return 0;
          return notes.reduce((sum, n) => sum + n, 0) / notes.length;
        });

        // Calculer la moyenne de la promo (moyenne de toutes les moyennes des étudiants)
        const moyennePromo = moyennesEtudiants.length > 0
          ? moyennesEtudiants.reduce((sum, m) => sum + m, 0) / moyennesEtudiants.length
          : 0;

        // Calculer la meilleure moyenne de la promo
        const meilleureMoyennePromo = moyennesEtudiants.length > 0
          ? Math.max(...moyennesEtudiants)
          : 0;

        // Récupérer les détails des notes (quiz et études de cas) pour ce bloc
        const notesDetaillees: Array<{
          type: 'quiz' | 'etude_cas';
          titre: string;
          note: number;
          note_max: number;
          date: string;
        }> = [];

        if (notesEtudiant && notesEtudiant.length > 0) {
          // Récupérer les quiz
          const quizIds = notesEtudiant
            .filter(n => n.type_evaluation === 'quiz')
            .map(n => n.evaluation_id);
          
          if (quizIds.length > 0) {
            const { data: quizData } = await supabase
              .from('quiz_evaluations')
              .select('id, titre, cours_id, cours_apprentissage(bloc_id, titre)')
              .in('id', quizIds);
            
            // Filtrer les quiz qui appartiennent à ce bloc
            const quizDuBloc = quizData?.filter(quiz => {
              const cours = quiz.cours_apprentissage as any;
              return cours && cours.bloc_id === bloc.id;
            }) || [];

            quizDuBloc.forEach(quiz => {
              const note = notesEtudiant.find(n => n.type_evaluation === 'quiz' && n.evaluation_id === quiz.id);
              if (note) {
                const noteSur20 = note.note_max && note.note_max !== 20 
                  ? (note.note / note.note_max) * 20 
                  : note.note;
                const cours = quiz.cours_apprentissage as any;
                const titreCours = cours?.titre || 'Cours';
                notesDetaillees.push({
                  type: 'quiz',
                  titre: `Quiz - ${titreCours}`,
                  note: noteSur20,
                  note_max: 20,
                  date: note.date_evaluation || ''
                });
              }
            });
          }

          // Récupérer les études de cas
          const etudeCasIds = notesEtudiant
            .filter(n => n.type_evaluation === 'etude_cas')
            .map(n => n.evaluation_id);
          
          if (etudeCasIds.length > 0) {
            const { data: etudeCasData } = await supabase
              .from('etudes_cas')
              .select('id, titre, cours_id, cours_apprentissage(bloc_id, titre)')
              .in('id', etudeCasIds);
            
            // Filtrer les études de cas qui appartiennent à ce bloc
            const etudeCasDuBloc = etudeCasData?.filter(etudeCas => {
              const cours = etudeCas.cours_apprentissage as any;
              return cours && cours.bloc_id === bloc.id;
            }) || [];

            etudeCasDuBloc.forEach(etudeCas => {
              const note = notesEtudiant.find(n => n.type_evaluation === 'etude_cas' && n.evaluation_id === etudeCas.id);
              if (note && note.note > 0) { // Seulement les études de cas corrigées
                const noteSur20 = note.note_max && note.note_max !== 20 
                  ? (note.note / note.note_max) * 20 
                  : note.note;
                const cours = etudeCas.cours_apprentissage as any;
                const titreCours = cours?.titre || 'Cours';
                notesDetaillees.push({
                  type: 'etude_cas',
                  titre: `Étude de cas - ${titreCours}`,
                  note: noteSur20,
                  note_max: 20,
                  date: note.date_evaluation || ''
                });
              }
            });
          }
        }

        return {
          bloc_id: bloc.id,
          numero_bloc: bloc.numero_bloc,
          titre: bloc.titre,
          moyenne_etudiant: moyenneEtudiant,
          moyenne_promo: moyennePromo,
          meilleure_moyenne_promo: meilleureMoyennePromo,
          notes_detaillees: notesDetaillees
        };
      })
    );

    // Calculer les moyennes générales
    const moyennesEtudiant = releveNotes.map(r => r.moyenne_etudiant).filter(m => m > 0);
    const moyennesPromo = releveNotes.map(r => r.moyenne_promo).filter(m => m > 0);
    const meilleuresMoyennesPromo = releveNotes.map(r => r.meilleure_moyenne_promo).filter(m => m > 0);

    const moyenneGeneraleEtudiant = moyennesEtudiant.length > 0
      ? moyennesEtudiant.reduce((sum, m) => sum + m, 0) / moyennesEtudiant.length
      : 0;

    const moyenneGeneralePromo = moyennesPromo.length > 0
      ? moyennesPromo.reduce((sum, m) => sum + m, 0) / moyennesPromo.length
      : 0;

    const meilleureMoyenneGeneralePromo = meilleuresMoyennesPromo.length > 0
      ? meilleuresMoyennesPromo.reduce((sum, m) => sum + m, 0) / meilleuresMoyennesPromo.length
      : 0;

    return NextResponse.json({
      success: true,
      releve: releveNotes,
      moyennes_generales: {
        moyenne_etudiant: moyenneGeneraleEtudiant,
        moyenne_promo: moyenneGeneralePromo,
        meilleure_moyenne_promo: meilleureMoyenneGeneralePromo
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du relevé de notes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

