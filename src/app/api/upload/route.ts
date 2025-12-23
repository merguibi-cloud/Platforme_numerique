import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logAuditAction } from '@/lib/audit-logger';

// Route pour l'upload de fichiers
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Fichier et type requis' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Déterminer le bucket selon le type de fichier
    let bucketName: string;
    
    if (type === 'photo-identite') {
      // Photos d'identité vont dans photo_profil
      bucketName = 'photo_profil';
    } else if (['cv', 'diplome', 'releves', 'pieceIdentite'].includes(type)) {
      // Documents administratifs vont dans user_documents
      bucketName = 'user_documents';
    } else {
      // Par défaut, utiliser user_documents
      bucketName = 'user_documents';
    }

    // Upload fichier dans le bucket approprié
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      await logAuditAction(request, {
        action_type: 'UPLOAD',
        table_name: 'storage',
        resource_id: filePath,
        status: 'error',
        error_message: uploadError.message,
        metadata: { bucket: bucketName, fileName: file.name, type },
        description: `Échec d'upload du fichier ${file.name}`
      }).catch(() => {});
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'upload du fichier',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Logger l'upload réussi
    await logAuditAction(request, {
      action_type: 'UPLOAD',
      table_name: 'storage',
      resource_id: filePath,
      status: 'success',
      metadata: { bucket: bucketName, fileName: file.name, type, fileSize: file.size },
      description: `Upload du fichier ${file.name} dans ${bucketName}`
    }).catch(() => {});

    // Fichier uploadé

    // Pour les buckets privés, générer une URL signée
    let signedUrl = '';
    if (bucketName === 'photo_profil' || bucketName === 'user_documents') {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL valide 1 an

      if (!signedUrlError) {
        signedUrl = signedUrlData.signedUrl;
      }
    }

    // Retourner le chemin pour la sauvegarde en base
    return NextResponse.json({
      success: true,
      path: filePath,
      bucket: bucketName,
      signedUrl: signedUrl || null
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
