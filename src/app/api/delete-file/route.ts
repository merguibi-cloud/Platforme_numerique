import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Route pour la suppression de fichiers du storage
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Créer le client avec le service role key pour les opérations de stockage
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Créer un client temporaire pour vérifier l'authentification
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const bucket = searchParams.get('bucket');

    if (!filePath || !bucket) {
      return NextResponse.json(
        { error: 'Chemin du fichier et bucket requis' },
        { status: 400 }
      );
    }

    // Vérifier que le fichier appartient bien à l'utilisateur
    if (!filePath.includes(user.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce fichier' },
        { status: 403 }
      );
    }

    // Supprimer le fichier du storage
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      // Si le fichier n'existe pas, on considère que c'est un succès
      if (deleteError.message.includes('not found') || deleteError.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          message: 'Fichier déjà supprimé ou inexistant'
        });
      }

      return NextResponse.json(
        { 
          error: 'Erreur lors de la suppression du fichier',
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

