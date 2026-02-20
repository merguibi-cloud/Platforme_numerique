import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    // Get tutor's course IDs
    const { data: tuteurCours } = await supabase
      .from('tuteur_cours')
      .select('cours_id')
      .eq('tuteur_id', tuteur.id);

    const coursIds = tuteurCours?.map((tc) => tc.cours_id) || [];

    if (coursIds.length === 0) {
      return NextResponse.json([]);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');
    const etudeCasId = searchParams.get('etude_cas_id');
    const limit = searchParams.get('limit');

    // Get all submissions with relations
    let query = supabase
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
        )
      `
      )
      .order('created_at', { ascending: false });

    if (statut) {
      query = query.eq('statut', statut);
    }

    if (etudeCasId) {
      query = query.eq('etude_cas_id', etudeCasId);
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      throw submissionsError;
    }

    // Filter to only submissions for tutor's courses and transform
    const filtered = [];
    for (const sub of submissions || []) {
      const etudeCas: any = Array.isArray(sub.etude_cas) ? sub.etude_cas[0] : sub.etude_cas;
      const bloc: any = etudeCas?.bloc ? (Array.isArray(etudeCas.bloc) ? etudeCas.bloc[0] : etudeCas.bloc) : null;
      const chapitre: any = bloc?.chapitre ? (Array.isArray(bloc.chapitre) ? bloc.chapitre[0] : bloc.chapitre) : null;
      const coursId = chapitre?.cours_id;

      if (!coursId || !coursIds.includes(coursId)) continue;

      // Get student info from auth
      const { data: etudiant } = await supabase
        .from('etudiants')
        .select('id, user_id')
        .eq('id', sub.etudiant_id)
        .single();

      let etudiantInfo = null;
      if (etudiant) {
        const { data: authUser } = await supabase.auth.admin.getUserById(etudiant.user_id);
        const metadata = authUser?.user?.user_metadata || {};
        etudiantInfo = {
          id: etudiant.id,
          prenom: metadata.prenom || '',
          nom: metadata.nom || '',
          email: authUser?.user?.email || '',
        };
      }

      filtered.push({
        id: sub.id,
        etude_cas_id: sub.etude_cas_id,
        etudiant_id: sub.etudiant_id,
        reponse_json: sub.reponse_json,
        fichiers_joints: sub.fichiers_joints,
        note: sub.note,
        commentaires: sub.commentaires,
        statut: sub.statut,
        corrige_par: sub.corrige_par,
        date_correction: sub.date_correction,
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        etudiant: etudiantInfo,
        etude_cas: etudeCas ? {
          id: etudeCas.id,
          titre: etudeCas.titre,
          description: etudeCas.description,
          note_maximale: etudeCas.note_maximale,
          bloc_id: etudeCas.bloc_id,
        } : null,
      });
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
