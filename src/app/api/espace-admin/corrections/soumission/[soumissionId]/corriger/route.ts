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
    const { corrections, note_globale, commentaire_global } = body;

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

      if (toutesCorrections && toutesCorrections.length > 0) {
        const totalPoints = toutesCorrections.reduce((sum, c) => sum + parseFloat(c.note_attribuee), 0);
        const totalMax = toutesCorrections.reduce((sum, c) => sum + parseFloat(c.note_max || 20), 0);
        
        // Récupérer le points_max de l'étude de cas
        const { data: soumission } = await supabase
          .from('soumissions_etude_cas')
          .select('etudes_cas (points_max)')
          .eq('id', soumissionIdNum)
          .maybeSingle();

        const pointsMaxEtudeCas = (soumission?.etudes_cas as any)?.points_max || 20;
        
        // Calculer la note sur points_max de l'étude de cas
        noteGlobaleCalculee = totalMax > 0 ? (totalPoints / totalMax) * pointsMaxEtudeCas : 0;
      } else {
        noteGlobaleCalculee = 0;
      }
    }

    // Mettre à jour la soumission avec la note globale et le commentaire
    const { error: updateSoumissionError } = await supabase
      .from('soumissions_etude_cas')
      .update({
        note: parseFloat(noteGlobaleCalculee),
        commentaire_correcteur: commentaire_global || null,
        statut: 'corrige',
        date_correction: new Date().toISOString(),
        correcteur_id: user.id
      })
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
          .select('id')
          .eq('etudiant_id', etudiant.id)
          .eq('type_evaluation', 'etude_cas')
          .eq('evaluation_id', soumission.etude_cas_id)
          .maybeSingle();

        if (noteExistante) {
          // Mettre à jour la note existante
          await supabase
            .from('notes_etudiants')
            .update({
              note: parseFloat(noteGlobaleCalculee),
              note_max: (etudeCas as any)?.points_max || 20,
              date_evaluation: new Date().toISOString()
            })
            .eq('id', noteExistante.id);
        } else {
          // Créer une nouvelle note
          await supabase
            .from('notes_etudiants')
            .insert({
              etudiant_id: etudiant.id,
              bloc_id: blocId,
              type_evaluation: 'etude_cas',
              evaluation_id: soumission.etude_cas_id,
              note: parseFloat(noteGlobaleCalculee),
              note_max: (etudeCas as any)?.points_max || 20,
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

