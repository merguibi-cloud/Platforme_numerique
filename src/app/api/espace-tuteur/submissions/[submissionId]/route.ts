import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(
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

    const { data: submission, error: submissionError } = await supabase
      .from('soumissions_etude_cas')
      .select(
        `
        id,
        etude_cas_id,
        etudiant_id,
        reponse_json,
        fichiers_joints,
        note,
        commentaires,
        statut,
        corrige_par,
        date_correction,
        created_at,
        updated_at,
        etudiant:etudiant_id (
          id,
          user_id,
          users:user_id (
            prenom,
            nom,
            email
          )
        ),
        etude_cas:etude_cas_id (
          id,
          titre,
          description,
          note_maximale,
          bloc_id,
          bloc:bloc_id (
            chapitre:chapitre_id (
              cours_id
            )
          )
        ),
        correcteur:corrige_par (
          prenom,
          nom
        )
      `
      )
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Extract joined data (Supabase types joins as arrays)
    const etudeCas = Array.isArray(submission.etude_cas) ? submission.etude_cas[0] : submission.etude_cas;
    const etudiant = Array.isArray(submission.etudiant) ? submission.etudiant[0] : submission.etudiant;
    const correcteur = Array.isArray(submission.correcteur) ? submission.correcteur[0] : submission.correcteur;
    const bloc = etudeCas?.bloc ? (Array.isArray(etudeCas.bloc) ? etudeCas.bloc[0] : etudeCas.bloc) : null;
    const chapitre = bloc?.chapitre ? (Array.isArray(bloc.chapitre) ? bloc.chapitre[0] : bloc.chapitre) : null;

    // Verify tutor has access to this submission's course
    const coursId = chapitre?.cours_id;
    if (!coursId) {
      return NextResponse.json(
        { error: 'Cours non trouvé' },
        { status: 404 }
      );
    }

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

    // Transform the data
    const etudiantUsers = etudiant?.users ? (Array.isArray(etudiant.users) ? etudiant.users[0] : etudiant.users) : null;
    const transformedSubmission = {
      id: submission.id,
      etude_cas_id: submission.etude_cas_id,
      etudiant_id: submission.etudiant_id,
      reponse_json: submission.reponse_json,
      fichiers_joints: submission.fichiers_joints,
      note: submission.note,
      commentaires: submission.commentaires,
      statut: submission.statut,
      corrige_par: submission.corrige_par,
      date_correction: submission.date_correction,
      created_at: submission.created_at,
      updated_at: submission.updated_at,
      etudiant: etudiantUsers
        ? {
            id: etudiant.id,
            prenom: etudiantUsers.prenom,
            nom: etudiantUsers.nom,
            email: etudiantUsers.email,
          }
        : null,
      etude_cas: etudeCas ? {
        id: etudeCas.id,
        titre: etudeCas.titre,
        description: etudeCas.description,
        note_maximale: etudeCas.note_maximale,
        bloc_id: etudeCas.bloc_id,
      } : null,
      correcteur: correcteur,
    };

    return NextResponse.json(transformedSubmission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
