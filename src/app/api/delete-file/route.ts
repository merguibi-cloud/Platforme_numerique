import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// Route pour la suppression de fichiers du storage
export async function DELETE(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const bucket = searchParams.get('bucket');

    if (!filePath || !bucket) {
      return NextResponse.json(
        { error: 'Chemin du fichier et bucket requis' },
        { status: 400 }
      );
    }

    // Vérifier les permissions
    // Pour les fichiers utilisateur (user_documents, photo_profil), vérifier que le fichier appartient à l'utilisateur
    // Pour les fichiers admin (cours, etudes-cas), vérifier que l'utilisateur est admin/pedagogie
    const isUserFile = bucket === 'user_documents' || bucket === 'photo_profil';
    const isAdminFile = bucket === 'cours-media' || bucket === 'cours-fichiers-complementaires' || bucket === 'etudes-cas-consignes';
    
    if (isUserFile && !filePath.includes(user.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce fichier' },
        { status: 403 }
      );
    }
    
    if (isAdminFile) {
      // Vérifier que l'utilisateur est admin/pedagogie
      const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
      if ('error' in permissionResult) {
        return NextResponse.json(
          { error: 'Permissions insuffisantes' },
          { status: 403 }
        );
      }
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

