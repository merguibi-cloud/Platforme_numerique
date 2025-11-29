import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer le fichier
    const { data: fichier, error: fichierError } = await supabase
      .from('bibliotheque_fichiers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fichierError || !fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le nom du propriétaire
    let proprietaire = 'Utilisateur inconnu';
    try {
      // Essayer de récupérer depuis administrateurs
      const { data: admin } = await supabase
        .from('administrateurs')
        .select('nom, prenom')
        .eq('user_id', fichier.importe_par)
        .maybeSingle();

      if (admin && (admin.nom || admin.prenom)) {
        proprietaire = `${admin.prenom || ''} ${admin.nom || ''}`.trim();
      } else {
        // Essayer depuis auth.users
        const { data: { user } } = await supabase.auth.admin.getUserById(fichier.importe_par);
        if (user?.email) {
          proprietaire = user.email.split('@')[0] || 'Utilisateur';
        }
      }
    } catch (error) {
      console.error('Erreur récupération propriétaire:', error);
    }

    return NextResponse.json({
      success: true,
      fichier: fichier,
      proprietaire: proprietaire
    });

  } catch (error) {
    console.error('Erreur récupération document:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

