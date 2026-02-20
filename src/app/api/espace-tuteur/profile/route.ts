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
      .select(
        `
        id,
        user_id,
        bio,
        specialites,
        disponibilite,
        statut,
        created_at,
        updated_at
      `
      )
      .eq('user_id', user.id)
      .single();

    if (tuteurError || !tuteur) {
      return NextResponse.json(
        { error: 'Profil tuteur non trouvé' },
        { status: 404 }
      );
    }

    // Get user info from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    const metadata = authUser?.user?.user_metadata || {};

    const transformedTuteur = {
      id: tuteur.id,
      user_id: tuteur.user_id,
      bio: tuteur.bio,
      specialites: tuteur.specialites,
      created_at: tuteur.created_at,
      updated_at: tuteur.updated_at,
      prenom: metadata.prenom || '',
      nom: metadata.nom || '',
      email: authUser?.user?.email || '',
    };

    return NextResponse.json(transformedTuteur);
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { bio, specialites } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (bio !== undefined) updateData.bio = bio;
    if (specialites !== undefined) updateData.specialites = specialites;

    const { data: updatedTuteur, error: updateError } = await supabase
      .from('tuteurs')
      .update(updateData)
      .eq('id', tuteur.id)
      .select(
        `
        id,
        user_id,
        bio,
        specialites,
        disponibilite,
        statut,
        created_at,
        updated_at
      `
      )
      .single();

    if (updateError) {
      throw updateError;
    }

    // Get user info from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
    const metadata = authUser?.user?.user_metadata || {};

    const transformedTuteur = {
      id: updatedTuteur.id,
      user_id: updatedTuteur.user_id,
      bio: updatedTuteur.bio,
      specialites: updatedTuteur.specialites,
      created_at: updatedTuteur.created_at,
      updated_at: updatedTuteur.updated_at,
      prenom: metadata.prenom || '',
      nom: metadata.nom || '',
      email: authUser?.user?.email || '',
    };

    return NextResponse.json(transformedTuteur);
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
