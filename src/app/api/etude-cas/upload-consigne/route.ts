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
    const etudeCasId = formData.get('etudeCasId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      );
    }

    // Types de fichiers autorisés pour les consignes d'étude de cas
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, PPT, PPTX' },
        { status: 400 }
      );
    }

    // Limiter la taille des fichiers
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Bucket pour les fichiers d'étude de cas
    const bucketName = 'etudes-cas-consignes';

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = etudeCasId 
      ? `${etudeCasId}/${timestamp}_${randomId}.${fileExt}`
      : `temp/${timestamp}_${randomId}.${fileExt}`;
    const filePath = fileName;

    // Upload du fichier directement dans Supabase Storage
    // Utiliser le File directement (plus rapide, évite la conversion ArrayBuffer → Buffer)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      return NextResponse.json(
        {
          error: 'Erreur lors de l\'upload du fichier',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Obtenir l'URL publique du fichier
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Générer une URL signée (valide 1 an)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const publicUrl = urlData.publicUrl;
    const signedUrl = signedUrlData?.signedUrl || publicUrl;

    // Retourner les informations du fichier uploadé
    return NextResponse.json({
      success: true,
      fichier: {
        url: signedUrl,
        publicUrl: publicUrl,
        chemin_fichier: filePath,
        nom_fichier: file.name,
        taille_fichier: file.size,
        mime_type: file.type,
        bucket: bucketName
      }
    });
  } catch (error) {
    console.error('Erreur upload fichier consigne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

