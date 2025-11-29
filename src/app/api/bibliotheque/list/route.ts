import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    
    // Paramètres de filtrage
    const type = searchParams.get('type');
    const ecole = searchParams.get('ecole');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'date_importation';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construire la requête
    let query = supabase
      .from('bibliotheque_fichiers')
      .select('*')
      .eq('actif', true)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Appliquer les filtres
    if (type) {
      query = query.eq('type_fichier', type);
    }
    
    if (ecole) {
      query = query.eq('ecole', ecole);
    }

    if (search) {
      query = query.or(`titre.ilike.%${search}%,description.ilike.%${search}%,sujet.ilike.%${search}%`);
    }

    const { data: fichiers, error } = await query;

    if (error) {
      console.error('Erreur récupération fichiers:', error);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la récupération des fichiers',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fichiers: fichiers || []
    });

  } catch (error) {
    console.error('Erreur list bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

