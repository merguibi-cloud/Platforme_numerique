import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateBulkGrade, sanitizeComments } from '@/lib/grade-validator';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const { data: tuteur, error: tuteurError } = await supabase
      .from('tuteurs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tuteurError || !tuteur) {
      return NextResponse.json(
        { error: 'Profil tuteur non trouvé' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { submission_ids, note, commentaires, statut } = body;

    // Get the first submission to check note_maximale
    const { data: firstSubmission } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        etude_cas:etude_cas_id (
          note_maximale
        )
      `
      )
      .eq('id', submission_ids[0])
      .single();

    const etudeCasFirst = firstSubmission?.etude_cas ? (Array.isArray(firstSubmission.etude_cas) ? firstSubmission.etude_cas[0] : firstSubmission.etude_cas) : null;
    const noteMaximale = etudeCasFirst?.note_maximale || 100;

    // Validate bulk grade request
    const validation = validateBulkGrade(
      submission_ids,
      note,
      noteMaximale,
      commentaires
    );

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize comments
    const sanitizedComments = sanitizeComments(commentaires);

    // Verify tutor has access to all submissions
    const { data: submissions } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        id,
        etude_cas:etude_cas_id (
          bloc:bloc_id (
            chapitre:chapitre_id (
              cours_id
            )
          )
        )
      `
      )
      .in('id', submission_ids);

    // Get tutor's course IDs
    const { data: tuteurCours } = await supabase
      .from('tuteur_cours')
      .select('cours_id')
      .eq('tuteur_id', tuteur.id);

    const coursIds = tuteurCours?.map((tc) => tc.cours_id) || [];

    // Verify all submissions belong to tutor's courses
    const unauthorizedSubmissions = submissions?.filter((sub: any) => {
      const ec = Array.isArray(sub.etude_cas) ? sub.etude_cas[0] : sub.etude_cas;
      const bl = ec?.bloc ? (Array.isArray(ec.bloc) ? ec.bloc[0] : ec.bloc) : null;
      const ch = bl?.chapitre ? (Array.isArray(bl.chapitre) ? bl.chapitre[0] : bl.chapitre) : null;
      const coursId = ch?.cours_id;
      return !coursId || !coursIds.includes(coursId);
    });

    if (unauthorizedSubmissions && unauthorizedSubmissions.length > 0) {
      return NextResponse.json(
        { error: 'Accès non autorisé à certaines soumissions' },
        { status: 403 }
      );
    }

    // Update all submissions
    const { error: updateError } = await supabase
      .from('soumissions_etude_cas')
      .update({
        note,
        commentaires: sanitizedComments,
        statut: statut || 'corrige',
        corrige_par: user.id,
        date_correction: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', submission_ids);

    if (updateError) {
      throw updateError;
    }

    // Log the bulk grading action
    await supabase.from('audit_logs').insert({
      action: 'bulk_grade_submissions',
      user_id: user.id,
      details: {
        submission_ids,
        count: submission_ids.length,
        note,
        statut: statut || 'corrige',
      },
    });

    return NextResponse.json({
      success: true,
      count: submission_ids.length,
    });
  } catch (error) {
    console.error('Error bulk grading submissions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
