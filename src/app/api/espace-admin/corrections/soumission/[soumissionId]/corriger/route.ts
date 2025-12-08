import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST - Sauvegarder les corrections d'une soumission d'étude de cas
 * Reçoit les notes et commentaires pour chaque question, puis calcule la note globale
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ soumissionId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { soumissionId } = await params;
    const soumissionIdNum = parseInt(soumissionId, 10);

    if (isNaN(soumissionIdNum)) {
      return NextResponse.json({ error: 'ID de soumission invalide' }, { status: 400 });
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

    const body = await request.json();
    const { corrections, note_globale, commentaire_global, justification, note_document_externe, commentaire_document_externe } = body;

    if (!corrections || !Array.isArray(corrections)) {
      return NextResponse.json(
        { error: 'Les corrections sont requises' },
        { status: 400 }
      );
    }

    // Vérifier que toutes les questions ont une note
    for (const correction of corrections) {
      if (!correction.question_id || correction.note_attribuee === undefined || correction.note_attribuee === null) {
        return NextResponse.json(
          { error: 'Toutes les questions doivent avoir une note' },
          { status: 400 }
        );
      }
    }

    // Sauvegarder ou mettre à jour les corrections pour chaque question
    for (const correction of corrections) {
      const { question_id, note_attribuee, note_max, commentaire_correction } = correction;

      // Vérifier si une correction existe déjà
      const { data: correctionExistante } = await supabase
        .from('corrections_etude_cas')
        .select('id')
        .eq('soumission_id', soumissionIdNum)
        .eq('question_id', question_id)
        .maybeSingle();

      if (correctionExistante) {
        // Mettre à jour la correction existante
        const { error: updateError } = await supabase
          .from('corrections_etude_cas')
          .update({
            note_attribuee: parseFloat(note_attribuee),
            note_max: parseFloat(note_max || 20),
            commentaire_correction: commentaire_correction || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', correctionExistante.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour de la correction:', updateError);
          return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde des corrections' },
            { status: 500 }
          );
        }
      } else {
        // Créer une nouvelle correction
        const { error: insertError } = await supabase
          .from('corrections_etude_cas')
          .insert({
            soumission_id: soumissionIdNum,
            question_id: question_id,
            correcteur_id: user.id,
            note_attribuee: parseFloat(note_attribuee),
            note_max: parseFloat(note_max || 20),
            commentaire_correction: commentaire_correction || null,
            date_correction: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erreur lors de la création de la correction:', insertError);
          return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde des corrections' },
            { status: 500 }
          );
        }
      }
    }

    // Calculer la note globale si elle n'est pas fournie
    let noteGlobaleCalculee = note_globale;
    if (note_globale === undefined || note_globale === null) {
      // Récupérer toutes les corrections pour calculer la somme
      const { data: toutesCorrections } = await supabase
        .from('corrections_etude_cas')
        .select('note_attribuee, note_max')
        .eq('soumission_id', soumissionIdNum);

      let totalPoints = 0;
      let totalMax = 0;

      if (toutesCorrections && toutesCorrections.length > 0) {
        totalPoints = toutesCorrections.reduce((sum, c) => sum + parseFloat(c.note_attribuee), 0);
        totalMax = toutesCorrections.reduce((sum, c) => sum + parseFloat(c.note_max || 20), 0);
      }
      
      // Calculer la note des questions sur 20
      let noteQuestions = 0;
      if (totalMax > 0 && toutesCorrections && toutesCorrections.length > 0) {
        noteQuestions = (totalPoints / totalMax) * 20;
      }
      
      // Ajouter la note du document externe si elle existe
      if (note_document_externe !== undefined && note_document_externe !== null) {
        const noteDocExterne = Math.min(Math.max(parseFloat(note_document_externe) || 0, 0), 20);
        // Si on a des questions, on fait une moyenne simple entre questions et document externe
        // Si on n'a pas de questions, la note globale est simplement la note du document externe
        if (toutesCorrections && toutesCorrections.length > 0) {
          // Moyenne simple : (note questions + note document externe) / 2
          noteGlobaleCalculee = (noteQuestions + noteDocExterne) / 2;
        } else {
          // Pas de questions, la note globale est simplement la note du document externe
          noteGlobaleCalculee = noteDocExterne;
        }
      } else {
        // Pas de note de document externe, utiliser uniquement la note des questions
        noteGlobaleCalculee = noteQuestions;
      }
      
      // S'assurer que la note ne dépasse pas 20
      if (noteGlobaleCalculee > 20) {
        noteGlobaleCalculee = 20;
      }
    }

    // Construire le commentaire global en incluant le commentaire du document externe si présent
    let commentaireFinal = commentaire_global || null;
    let commentaireDocExterneFinal = null;
    if (commentaire_document_externe && commentaire_document_externe.trim()) {
      commentaireDocExterneFinal = commentaire_document_externe.trim();
      const commentaireDocExterne = `\n\n--- COMMENTAIRE SUR LE DOCUMENT EXTERNE ---\n${commentaireDocExterneFinal}`;
      commentaireFinal = commentaireFinal 
        ? `${commentaireFinal}${commentaireDocExterne}` 
        : commentaireDocExterne;
    }

    // Construire un objet JSON pour stocker les métadonnées de correction du document externe
    // On va utiliser reponses_json ou créer un nouveau champ metadata_correction
    // Pour l'instant, on stocke dans commentaire_correcteur avec un format structuré
    // Mais on peut aussi utiliser un champ JSONB si disponible
    
    // Préparer les données de mise à jour
    const updateData: any = {
      note: Math.min(parseFloat(noteGlobaleCalculee), 20), // S'assurer que la note ne dépasse pas 20
      commentaire_correcteur: commentaireFinal,
      statut: 'corrige',
      date_correction: new Date().toISOString(),
      correcteur_id: user.id
    };

    // Stocker la note du document externe dans reponses_json si elle existe
    // (ou créer un champ séparé si possible)
    if (note_document_externe !== undefined && note_document_externe !== null) {
      // Récupérer les reponses_json existantes pour ne pas les écraser
      const { data: soumissionExistante } = await supabase
        .from('soumissions_etude_cas')
        .select('reponses_json')
        .eq('id', soumissionIdNum)
        .maybeSingle();
      
      let reponsesJson = soumissionExistante?.reponses_json || {};
      if (typeof reponsesJson === 'string') {
        try {
          reponsesJson = JSON.parse(reponsesJson);
        } catch {
          reponsesJson = {};
        }
      }
      
      // Ajouter les métadonnées de correction du document externe
      if (!reponsesJson.metadata_correction) {
        reponsesJson.metadata_correction = {};
      }
      reponsesJson.metadata_correction.note_document_externe = parseFloat(note_document_externe);
      reponsesJson.metadata_correction.commentaire_document_externe = commentaireDocExterneFinal;
      
      updateData.reponses_json = reponsesJson;
    }

    // Mettre à jour la soumission avec la note globale et le commentaire
    const { error: updateSoumissionError } = await supabase
      .from('soumissions_etude_cas')
      .update(updateData)
      .eq('id', soumissionIdNum);

    if (updateSoumissionError) {
      console.error('Erreur lors de la mise à jour de la soumission:', updateSoumissionError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la soumission' },
        { status: 500 }
      );
    }

    // Mettre à jour la note dans notes_etudiants
    const { data: soumission } = await supabase
      .from('soumissions_etude_cas')
      .select('etude_cas_id, user_id, etudes_cas (cours_id, cours_apprentissage (bloc_id))')
      .eq('id', soumissionIdNum)
      .maybeSingle();

    if (soumission) {
      const etudeCas = soumission.etudes_cas as any;
      const cours = etudeCas?.cours_apprentissage as any;
      const blocId = cours?.bloc_id;

      // Récupérer l'étudiant
      const { data: etudiant } = await supabase
        .from('etudiants')
        .select('id')
        .eq('user_id', soumission.user_id)
        .maybeSingle();

      if (etudiant && blocId) {
        // Vérifier si une note existe déjà
        const { data: noteExistante } = await supabase
          .from('notes_etudiants')
          .select('id, note')
          .eq('etudiant_id', etudiant.id)
          .eq('type_evaluation', 'etude_cas')
          .eq('evaluation_id', soumission.etude_cas_id)
          .maybeSingle();

        // S'assurer que la note ne dépasse pas 20
        const noteFinale = Math.min(parseFloat(noteGlobaleCalculee), 20);
        
        if (noteExistante) {
          // Récupérer la note avant modification
          const noteAvant = noteExistante.note;
          
          // Mettre à jour la note existante
          await supabase
            .from('notes_etudiants')
            .update({
              note: noteFinale,
              note_max: 20, // Toujours sur 20
              date_evaluation: new Date().toISOString()
            })
            .eq('id', noteExistante.id);

          // Enregistrer la modification dans modifications_notes si une justification est fournie
          if (justification && justification.trim()) {
            await supabase
              .from('modifications_notes')
              .insert({
                type_evaluation: 'etude_cas',
                evaluation_id: soumission.etude_cas_id,
                soumission_id: soumissionIdNum,
                correcteur_id: user.id,
                note_avant: noteAvant,
                note_apres: noteFinale,
                justification: justification.trim(),
                date_modification: new Date().toISOString()
              });
          }
        } else {
          // Créer une nouvelle note
          await supabase
            .from('notes_etudiants')
            .insert({
              etudiant_id: etudiant.id,
              bloc_id: blocId,
              type_evaluation: 'etude_cas',
              evaluation_id: soumission.etude_cas_id,
              note: noteFinale,
              note_max: 20, // Toujours sur 20
              date_evaluation: new Date().toISOString()
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Corrections sauvegardées avec succès',
      note_globale: noteGlobaleCalculee
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-admin/corrections/soumission/[soumissionId]/corriger:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

