import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const { data: tuteur, error } = await supabase
      .from('tuteurs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !tuteur) {
      return NextResponse.json({ error: 'Tuteur non trouvé' }, { status: 404 });
    }

    // Compléter avec les infos de user_metadata si nom/prenom manquants
    const metadata = user.user_metadata || {};

    return NextResponse.json({
      ...tuteur,
      nom: tuteur.nom || metadata.nom || '',
      prenom: tuteur.prenom || metadata.prenom || '',
      email: user.email || '',
    });
  } catch (error) {
    console.error('Erreur profile GET:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { bio, specialites } = body;

    const supabase = getSupabaseServerClient();

    const { data: tuteur, error } = await supabase
      .from('tuteurs')
      .update({
        bio: bio ?? undefined,
        specialites: specialites ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error || !tuteur) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    const metadata = user.user_metadata || {};

    return NextResponse.json({
      ...tuteur,
      nom: tuteur.nom || metadata.nom || '',
      prenom: tuteur.prenom || metadata.prenom || '',
      email: user.email || '',
    });
  } catch (error) {
    console.error('Erreur profile PUT:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
