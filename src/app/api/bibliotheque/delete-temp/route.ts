import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// Route pour supprimer un fichier temporaire si l'utilisateur abandonne l'import
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const body = await request.json();
    const { filePath, bucketName } = body;

    if (!filePath || !bucketName) {
      return NextResponse.json(
        { error: 'Chemin du fichier et nom du bucket requis' },
        { status: 400 }
      );
    }

    // Vérifier que le fichier appartient à l'utilisateur (sécurité)
    if (!filePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Supprimer le fichier du storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error('Erreur suppression fichier:', deleteError);
      // Ne pas échouer si le fichier n'existe pas déjà
      if (!deleteError.message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Erreur lors de la suppression du fichier',
            details: deleteError.message 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Fichier temporaire supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression temporaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

