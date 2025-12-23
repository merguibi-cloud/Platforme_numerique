import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const supabase = getSupabaseServerClient();

    const body = await request.json();
    const { filePath, bucketName } = body;

    if (!filePath || !bucketName) {
      return NextResponse.json(
        { error: 'Chemin et bucket requis' },
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

    // Vérifier que le fichier existe avec retry (car Supabase peut avoir un délai de propagation)
    let signedUrlData = null;
    let signedUrlError = null;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 seconde

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60); // URL valide 1 minute juste pour vérifier

      signedUrlData = data;
      signedUrlError = error;

      if (!error && data?.signedUrl) {
        // Succès, le fichier existe
        console.log(`Fichier vérifié avec succès (tentative ${attempt}/${maxRetries}):`, {
          filePath,
          bucketName
        });
        return NextResponse.json({
          success: true,
          verified: true,
          message: 'Le fichier existe dans le bucket',
          attempt
        });
      }

      // Si c'est une erreur 404 et qu'on n'est pas à la dernière tentative, réessayer
      const isNotFoundError = (error as any)?.status === 404 ||
                              (error as any)?.statusCode === 404 ||
                              error?.message?.includes('not found') ||
                              error?.message?.includes('Object not found') ||
                              error?.message?.includes('404');

      if (isNotFoundError && attempt < maxRetries) {
        console.log(`Fichier non trouvé (tentative ${attempt}/${maxRetries}), nouvelle tentative dans ${retryDelay}ms...`, {
          filePath,
          bucketName,
          error: error?.message
        });
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Si ce n'est pas une erreur 404 ou qu'on est à la dernière tentative
      break;
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    const isNotFoundError = (signedUrlError as any)?.status === 404 ||
                            (signedUrlError as any)?.statusCode === 404 ||
                            signedUrlError?.message?.includes('not found') ||
                            signedUrlError?.message?.includes('Object not found') ||
                            signedUrlError?.message?.includes('404');
    
    if (isNotFoundError) {
      console.error('Fichier non trouvé après toutes les tentatives:', {
        filePath,
        bucketName,
        attempts: maxRetries,
        error: signedUrlError?.message
      });
      return NextResponse.json(
        { 
          error: 'Fichier non trouvé dans le bucket',
          details: 'Le fichier n\'existe pas dans le storage après plusieurs tentatives. Il n\'a peut-être pas été uploadé correctement.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification du fichier',
        details: signedUrlError?.message || 'Impossible de vérifier l\'existence du fichier'
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Erreur vérification fichier:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error?.message || 'Une erreur inattendue est survenue'
      },
      { status: 500 }
    );
  }
}

