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

    const { data: courses, error: coursesError } = await supabase
      .from('tuteur_cours')
      .select(
        `
        id,
        tuteur_id,
        cours_id,
        created_at,
        cours:cours_id (
          id,
          titre,
          description
        )
      `
      )
      .eq('tuteur_id', tuteur.id)
      .order('created_at', { ascending: false });

    if (coursesError) {
      throw coursesError;
    }

    return NextResponse.json(courses || []);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
