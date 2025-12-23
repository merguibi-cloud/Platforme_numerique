import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST - Enregistrer la progression d'un étudiant (temps passé, chapitres lus, changements de page)
 */
export async function POST(request: NextRequest) {
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
      .select('id, formation_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le body existe et n'est pas vide
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Body de la requête vide' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (error) {
      console.error('Erreur lors du parsing du body:', error);
      return NextResponse.json(
        { success: false, error: 'Body JSON invalide' },
        { status: 400 }
      );
    }

    const { 
      bloc_id, 
      cours_id, 
      chapitre_id, 
      action, // 'view_chapitre', 'start_cours', 'complete_chapitre', 'change_page', 'time_update'
      temps_passe_minutes,
      date_jour
    } = body;

    if (!bloc_id) {
      return NextResponse.json(
        { success: false, error: 'bloc_id est requis' },
        { status: 400 }
      );
    }

    // Mettre à jour ou créer l'entrée dans temps_passe_blocs
    if (temps_passe_minutes !== undefined) {
      const today = date_jour || new Date().toISOString().split('T')[0];
      
      // Vérifier si une entrée existe déjà pour aujourd'hui
      const { data: existingEntry } = await supabase
        .from('temps_passe_blocs')
        .select('id, temps_total_minutes')
        .eq('etudiant_id', etudiant.id)
        .eq('bloc_id', bloc_id)
        .eq('date_jour', today)
        .maybeSingle();

      if (existingEntry) {
        // Mettre à jour le temps total
        const { error: updateError } = await supabase
          .from('temps_passe_blocs')
          .update({
            temps_total_minutes: temps_passe_minutes,
            derniere_activite: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour du temps:', updateError);
        }
      } else {
        // Créer une nouvelle entrée
        const { error: insertError } = await supabase
          .from('temps_passe_blocs')
          .insert({
            etudiant_id: etudiant.id,
            bloc_id: bloc_id,
            temps_total_minutes: temps_passe_minutes,
            date_jour: today,
            derniere_activite: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erreur lors de l\'insertion du temps:', insertError);
        }
      }
    }

    // Enregistrer l'événement dans notes_etudiants si c'est un chapitre consulté ou complété
    // On enregistre pour 'view_chapitre' (pour la reprise automatique) et 'complete_chapitre'
    if ((action === 'view_chapitre' || action === 'complete_chapitre') && chapitre_id) {
      // Vérifier si une note existe déjà pour ce chapitre
      const { data: existingNote } = await supabase
        .from('notes_etudiants')
        .select('id')
        .eq('etudiant_id', etudiant.id)
        .eq('evaluation_id', chapitre_id)
        .eq('type_evaluation', 'cours')
        .maybeSingle();

      if (existingNote) {
        // Mettre à jour la date de dernière activité
        await supabase
          .from('notes_etudiants')
          .update({
            updated_at: new Date().toISOString(),
            date_evaluation: new Date().toISOString()
          })
          .eq('id', existingNote.id);
      } else {
        // Créer une note pour indiquer que le chapitre a été consulté
        await supabase
          .from('notes_etudiants')
          .insert({
            etudiant_id: etudiant.id,
            bloc_id: bloc_id,
            type_evaluation: 'cours',
            evaluation_id: chapitre_id,
            note: 0, // Pas de note pour un chapitre consulté
            note_max: 0,
            temps_passe: temps_passe_minutes || 0,
            date_evaluation: new Date().toISOString()
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Progression enregistrée'
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-etudiant/progression:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

