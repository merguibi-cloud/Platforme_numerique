import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { fichier_id } = body;

    if (!fichier_id) {
      return NextResponse.json(
        { error: 'fichier_id requis' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Vérifier que le fichier existe et est actif
    const { data: fichier } = await supabase
      .from('bibliotheque_fichiers')
      .select('id')
      .eq('id', fichier_id)
      .eq('actif', true)
      .maybeSingle();

    if (!fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà vu ce fichier aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const { data: existingView } = await supabase
      .from('bibliotheque_vues')
      .select('id')
      .eq('fichier_id', fichier_id)
      .eq('user_id', user.id)
      .gte('date_vue', `${today}T00:00:00`)
      .lt('date_vue', `${today}T23:59:59`)
      .maybeSingle();

    // Si pas encore vu aujourd'hui, enregistrer la vue
    if (!existingView) {
      await supabase
        .from('bibliotheque_vues')
        .insert({
          fichier_id: fichier_id,
          user_id: user.id
        });
      // Le trigger SQL incrémentera automatiquement nombre_vues
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Erreur enregistrement vue:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

