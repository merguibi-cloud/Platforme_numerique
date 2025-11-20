import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    if ('error' in permissionResult) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const coursId = formData.get('coursId') as string;
    const typeMedia = formData.get('typeMedia') as string; // 'image' ou 'video'

    if (!file || !coursId || !typeMedia) {
      return NextResponse.json(
        { error: 'Fichier, coursId et typeMedia requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const isImage = typeMedia === 'image';
    const isVideo = typeMedia === 'video';

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'typeMedia doit être "image" ou "video"' },
        { status: 400 }
      );
    }

    // Vérifier les types MIME
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];

    if (isImage && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier image non autorisé' },
        { status: 400 }
      );
    }

    if (isVideo && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier vidéo non autorisé' },
        { status: 400 }
      );
    }

    // Limiter la taille des fichiers
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `La taille de l'image ne doit pas dépasser ${MAX_IMAGE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `La taille de la vidéo ne doit pas dépasser ${MAX_VIDEO_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Déterminer le bucket selon le type
    const bucketName = isVideo ? 'cours-videos' : 'cours-images';

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${coursId}/${timestamp}_${randomId}.${fileExt}`;
    const filePath = fileName;

    // Convertir le File en ArrayBuffer pour l'upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload du fichier dans Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false // Ne pas écraser si le fichier existe
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      
      // Message d'erreur plus explicite pour les buckets manquants
      let errorMessage = 'Erreur lors de l\'upload du fichier';
      const errorMessageLower = uploadError.message.toLowerCase();
      if (errorMessageLower.includes('bucket not found') || errorMessageLower.includes('bucket')) {
        errorMessage = `Le bucket "${bucketName}" n'existe pas dans Supabase Storage. Veuillez créer ce bucket dans votre dashboard Supabase (Storage > New bucket).`;
      } else {
        errorMessage = `Erreur lors de l'upload: ${uploadError.message}`;
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Obtenir l'URL publique du fichier
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Pour les buckets privés, générer une URL signée (valide 1 an)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 an

    const publicUrl = urlData.publicUrl;
    const signedUrl = signedUrlData?.signedUrl || publicUrl;

    // Obtenir les dimensions pour les images (si nécessaire)
    let largeur: number | undefined;
    let hauteur: number | undefined;
    let dureeVideo: number | undefined;

    if (isImage) {
      // Pour les images, on peut obtenir les dimensions côté client ou via une API
      // Pour l'instant, on laisse undefined, à compléter si nécessaire
    }

    // Retourner les informations du fichier uploadé
    return NextResponse.json({
      success: true,
      media: {
        url: signedUrl,
        publicUrl: publicUrl,
        chemin_fichier: filePath,
        nom_fichier: file.name,
        taille_fichier: file.size,
        mime_type: file.type,
        largeur: largeur,
        hauteur: hauteur,
        duree_video: dureeVideo,
        bucket: bucketName
      }
    });
  } catch (error) {
    console.error('Erreur upload média:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

