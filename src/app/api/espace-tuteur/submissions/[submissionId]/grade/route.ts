import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateGrade, sanitizeComments } from '@/lib/grade-validator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

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

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        *,
        etude_cas:etude_cas_id (
          id,
          note_maximale,
          bloc:bloc_id (
            chapitre:chapitre_id (
              cours_id
            )
          )
        )
      `
      )
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { error: 'Soumission non trouvée' },
        { status: 404 }
      );
    }

    // Verify tutor has access
    const coursId = submission.etude_cas?.bloc?.chapitre?.cours_id;
    const { data: courseAccess } = await supabase
      .from('tuteur_cours')
      .select('id')
      .eq('tuteur_id', tuteur.id)
      .eq('cours_id', coursId)
      .maybeSingle();

    if (!courseAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { note, commentaires, statut } = body;

    const validation = validateGrade(
      note,
      submission.etude_cas.note_maximale,
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

    // Update submission
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('soumissions_etude_cas')
      .update({
        note,
        commentaires: sanitizedComments,
        statut: statut || 'corrige',
        corrige_par: user.id,
        date_correction: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the grading action
    await supabase.from('audit_logs').insert({
      action: 'grade_submission',
      user_id: user.id,
      details: {
        submission_id: submissionId,
        note,
        statut: statut || 'corrige',
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
