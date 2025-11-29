import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

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
      .select('id, activer_telechargement')
      .eq('id', fichier_id)
      .eq('actif', true)
      .maybeSingle();

    if (!fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Toujours enregistrer le téléchargement dans la table, même si activer_telechargement est false
    // (les admins peuvent toujours télécharger)
    await supabase
      .from('bibliotheque_telechargements')
      .insert({
        fichier_id: fichier_id,
        user_id: user.id
      });
    // Le trigger SQL incrémentera automatiquement nombre_telechargements

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Erreur enregistrement téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

