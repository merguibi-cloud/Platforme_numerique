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

    const { data: tutees, error: tuteesError } = await supabase
      .from('tuteur_etudiants')
      .select(
        `
        id,
        tuteur_id,
        etudiant_id,
        date_debut,
        date_fin,
        statut,
        created_at,
        etudiant:etudiant_id (
          id,
          user_id,
          users:user_id (
            prenom,
            nom,
            email
          )
        )
      `
      )
      .eq('tuteur_id', tuteur.id)
      .order('created_at', { ascending: false });

    if (tuteesError) {
      throw tuteesError;
    }

    // Transform the data to flatten the structure
    const transformedTutees = tutees?.map((tutee: any) => ({
      id: tutee.id,
      tuteur_id: tutee.tuteur_id,
      etudiant_id: tutee.etudiant_id,
      date_debut: tutee.date_debut,
      date_fin: tutee.date_fin,
      statut: tutee.statut,
      created_at: tutee.created_at,
      etudiant: tutee.etudiant?.users
        ? {
            id: tutee.etudiant.id,
            prenom: tutee.etudiant.users.prenom,
            nom: tutee.etudiant.users.nom,
            email: tutee.etudiant.users.email,
          }
        : null,
    }));

    return NextResponse.json(transformedTutees || []);
  } catch (error) {
    console.error('Error fetching tutees:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
