import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getUserProfileServer } from '../../../../lib/cours-api';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier l'authentification
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions
    const profileResult = await getUserProfileServer(user.id);
    if (!profileResult.success || !profileResult.role) {
      return NextResponse.json({ error: 'Profil utilisateur non trouvé' }, { status: 403 });
    }

    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profileResult.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Créer le client Supabase avec service role pour l'upload
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const coursId = formData.get('coursId') as string;

    if (!file || !coursId) {
      return NextResponse.json(
        { error: 'Fichier et coursId requis' },
        { status: 400 }
      );
    }

    // Types de fichiers autorisés pour les supports complémentaires
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, TXT, XLS, XLSX' },
        { status: 400 }
      );
    }

    // Limiter la taille des fichiers complémentaires
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Bucket pour les fichiers complémentaires
    const bucketName = 'cours-fichiers-complementaires';

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${coursId}/${timestamp}_${randomId}.${fileExt}`;
    const filePath = fileName;

    // Convertir le File en Buffer pour l'upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload du fichier dans Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
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

    // Déterminer le type de fichier
    const typeFichier = fileExt?.toLowerCase() || '';

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
        type_fichier: typeFichier,
        bucket: bucketName
      }
    });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

