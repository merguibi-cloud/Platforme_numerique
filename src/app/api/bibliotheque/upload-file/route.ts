import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// Route pour l'upload réel du fichier avec progression
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérifier que l'utilisateur est admin
    const supabase = getSupabaseServerClient();
    const { data: admin } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Seuls les administrateurs peuvent importer des fichiers.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('path') as string;
    const bucketName = formData.get('bucket') as string;

    if (!file || !filePath || !bucketName) {
      return NextResponse.json(
        { error: 'Fichier, chemin et bucket requis' },
        { status: 400 }
      );
    }

    // Vérifier que le chemin appartient à l'utilisateur (sécurité)
    if (!filePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'Chemin de fichier invalide' },
        { status: 403 }
      );
    }

    // Limiter la taille des fichiers (ex: 500 MB)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE / (1024 * 1024)} MB` },
        { status: 400 }
      );
    }

    // Vérifier que le bucket existe en listant les buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Erreur lors de la vérification des buckets:', bucketsError);
    } else {
      const bucketExists = buckets?.some(b => b.name === bucketName);
      if (!bucketExists) {
        console.error('Bucket non trouvé:', {
          bucketName,
          availableBuckets: buckets?.map(b => b.name) || []
        });
        return NextResponse.json(
          { 
            error: `Le bucket "${bucketName}" n'existe pas`,
            details: `Veuillez créer le bucket "${bucketName}" dans votre dashboard Supabase (Storage > New bucket). Buckets disponibles: ${buckets?.map(b => b.name).join(', ') || 'aucun'}`
          },
          { status: 404 }
        );
      }
    }

    // Upload du fichier dans Supabase Storage
    console.log('Début upload fichier:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath,
      bucketName
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erreur upload fichier:', {
        error: uploadError,
        message: uploadError.message,
        statusCode: (uploadError as any)?.statusCode,
        status: (uploadError as any)?.status,
        name: (uploadError as any)?.name,
        filePath,
        bucketName
      });

      // Messages d'erreur plus explicites
      let errorMessage = 'Erreur lors de l\'upload du fichier';
      let errorDetails = uploadError.message || 'Le fichier n\'a pas pu être uploadé dans le bucket';
      
      const errorMessageLower = uploadError.message?.toLowerCase() || '';
      if (errorMessageLower.includes('bucket not found') || errorMessageLower.includes('bucket')) {
        errorMessage = `Le bucket "${bucketName}" n'existe pas ou n'est pas accessible`;
        errorDetails = `Veuillez créer le bucket "${bucketName}" dans votre dashboard Supabase (Storage > New bucket) et vérifier les permissions.`;
      } else if (errorMessageLower.includes('permission') || errorMessageLower.includes('forbidden')) {
        errorMessage = 'Permissions insuffisantes pour uploader dans ce bucket';
        errorDetails = `Veuillez vérifier les politiques RLS (Row Level Security) du bucket "${bucketName}" dans Supabase.`;
      } else if (errorMessageLower.includes('duplicate') || errorMessageLower.includes('already exists')) {
        errorMessage = 'Un fichier avec ce nom existe déjà';
        errorDetails = 'Veuillez renommer le fichier ou supprimer l\'ancien fichier.';
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        },
        { status: 500 }
      );
    }

    // Vérifier que uploadData contient bien le path
    if (!uploadData || !uploadData.path) {
      console.error('Upload réussi mais pas de données retournées:', {
        uploadData,
        filePath,
        bucketName
      });
      return NextResponse.json(
        { 
          error: 'Upload réussi mais données invalides',
          details: 'Le fichier a été uploadé mais aucune information n\'a été retournée. Veuillez réessayer.'
        },
        { status: 500 }
      );
    }

    console.log('Fichier uploadé avec succès:', {
      filePath,
      bucketName,
      uploadDataPath: uploadData.path,
      uploadDataId: uploadData.id
    });

    // Vérifier que le fichier existe vraiment dans le bucket avec retry
    // (Supabase peut avoir un délai de propagation)
    let fileVerified = false;
    let lastError: any = null;
    const maxRetries = 10; // Augmenter le nombre de tentatives
    const retryDelay = 1000; // 1 seconde entre chaque tentative

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Essayer d'abord avec list() pour vérifier l'existence
      const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
      const fileName = filePath.split('/').pop();
      const { data: fileList, error: listError } = await supabase.storage
        .from(bucketName)
        .list(folderPath || '', {
          limit: 1000,
          search: fileName
        });

      if (!listError && fileList && fileList.some(f => f.name === fileName)) {
        fileVerified = true;
        console.log(`Fichier vérifié avec succès via list() (tentative ${attempt}/${maxRetries})`);
        break;
      }

      // Si list() ne fonctionne pas, essayer avec createSignedUrl
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60);

      if (!signedUrlError && signedUrlData?.signedUrl) {
        fileVerified = true;
        console.log(`Fichier vérifié avec succès via createSignedUrl() (tentative ${attempt}/${maxRetries})`);
        break;
      }

      lastError = signedUrlError || listError;

      if (attempt < maxRetries) {
        console.log(`Vérification fichier (tentative ${attempt}/${maxRetries}), attente ${retryDelay}ms...`, {
          listError: listError?.message,
          signedUrlError: signedUrlError?.message
        });
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (!fileVerified) {
      console.error('Fichier uploadé mais non vérifié après toutes les tentatives:', {
        filePath,
        bucketName,
        attempts: maxRetries,
        lastError: lastError?.message,
        uploadDataPath: uploadData.path
      });
      
      // Ne pas supprimer le fichier - il peut exister mais ne pas être accessible immédiatement
      // L'utilisateur pourra réessayer plus tard
      
      return NextResponse.json(
        { 
          error: 'Le fichier a été uploadé mais n\'a pas pu être vérifié dans le bucket',
          details: `Après ${maxRetries} tentatives, le fichier n'a pas pu être vérifié. Cela peut être dû à un délai de propagation de Supabase Storage. Erreur: ${lastError?.message || 'Inconnue'}. Le fichier peut exister mais n'est pas encore accessible.`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      path: filePath,
      bucket: bucketName,
      verified: true
    });

  } catch (error) {
    console.error('Erreur upload bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

