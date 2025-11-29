import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: any = null;
  let id: string = '';
  
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    id = (await params).id;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';
    user = authResult.user;

    const supabase = getSupabaseServerClient();

    // Récupérer le fichier
    const { data: fichier, error: fichierError } = await supabase
      .from('bibliotheque_fichiers')
      .select('chemin_fichier, bucket_name, activer_telechargement')
      .eq('id', id)
      .eq('actif', true)
      .maybeSingle();

    if (fichierError || !fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Pour l'espace admin, permettre toujours le téléchargement
    // Vérifier si l'utilisateur est admin pour permettre le téléchargement même si activer_telechargement est false
    const forceDownload = searchParams.get('force') === 'true';
    
    if (isDownload && !fichier.activer_telechargement && !forceDownload) {
      // Vérifier si l'utilisateur est admin seulement si force=false
      try {
        const adminResult = await requireAdmin(user.id);
        if ('error' in adminResult) {
          // Si ce n'est pas un admin, refuser le téléchargement
          return adminResult.error;
        }
        // Si c'est un admin, on continue et on permet le téléchargement
      } catch (adminError: any) {
        console.error('Erreur lors de la vérification admin:', adminError);
        return NextResponse.json(
          { error: 'Erreur lors de la vérification des permissions' },
          { status: 500 }
        );
      }
    }

    // Pour les vidéos YouTube, retourner l'URL directement depuis chemin_fichier
    if (fichier.bucket_name === 'youtube') {
      // Convertir l'URL YouTube en URL embed si nécessaire
      let youtubeUrl = fichier.chemin_fichier;
      
      // Si c'est une URL watch, la convertir en embed
      if (youtubeUrl.includes('youtube.com/watch?v=')) {
        const videoIdMatch = youtubeUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          youtubeUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      } else if (youtubeUrl.includes('youtu.be/')) {
        const videoIdMatch = youtubeUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          youtubeUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      }
      
      return NextResponse.json({
        success: true,
        url: youtubeUrl,
        isYoutube: true
      });
    }

    // Vérifier que le bucket et le chemin existent
    if (!fichier.bucket_name || !fichier.chemin_fichier) {
      console.error('Données manquantes:', { 
        bucket_name: fichier.bucket_name, 
        chemin_fichier: fichier.chemin_fichier,
        file_id: id 
      });
      return NextResponse.json(
        { 
          error: 'Données du fichier incomplètes',
          details: 'Le bucket ou le chemin du fichier est manquant'
        },
        { status: 500 }
      );
    }

    // Vérifier que le fichier existe dans le storage avant de générer l'URL
    const { data: fileList, error: listError } = await supabase.storage
      .from(fichier.bucket_name)
      .list(fichier.chemin_fichier.split('/').slice(0, -1).join('/'), {
        limit: 1,
        search: fichier.chemin_fichier.split('/').pop()
      });

    // Si le fichier n'est pas trouvé dans la liste, essayer quand même de générer l'URL
    // (parfois la liste ne fonctionne pas bien, mais l'URL peut être générée)
    
    // Générer une URL signée (valide 1 heure, ou 1 an si c'est pour un téléchargement)
    // Note: Supabase limite la durée max à 7 jours (604800 secondes) pour les URLs signées
    const expiresIn = isDownload ? Math.min(60 * 60 * 24 * 7, 604800) : 60 * 60; // Max 7 jours pour téléchargement, 1h pour visualisation
    
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(fichier.bucket_name)
      .createSignedUrl(fichier.chemin_fichier, expiresIn);

    if (signedUrlError) {
      console.error('Erreur génération URL signée:', {
        error: signedUrlError,
        bucket_name: fichier.bucket_name,
        chemin_fichier: fichier.chemin_fichier,
        file_id: id
      });
      
      // Vérifier si c'est une erreur 404 (fichier non trouvé dans le storage)
      const isNotFoundError = signedUrlError.statusCode === '404' || 
                              (signedUrlError as any).status === 404 ||
                              signedUrlError.message?.includes('not found') ||
                              signedUrlError.message?.includes('Object not found');
      
      if (isNotFoundError) {
        return NextResponse.json(
          { 
            error: 'Fichier non trouvé dans le storage',
            details: 'Le fichier référencé dans la base de données n\'existe pas dans le storage. Il a peut-être été supprimé ou n\'a jamais été uploadé correctement.',
            file_path: fichier.chemin_fichier
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de la génération de l\'URL',
          details: signedUrlError.message || 'Le fichier pourrait ne pas exister dans le storage'
        },
        { status: 500 }
      );
    }

    if (!signedUrlData || !signedUrlData.signedUrl) {
      console.error('URL signée non générée:', { signedUrlData, file_id: id });
      return NextResponse.json(
        { 
          error: 'Erreur lors de la génération de l\'URL',
          details: 'L\'URL signée n\'a pas pu être générée'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl
    });

  } catch (error: any) {
    console.error('Erreur génération URL:', {
      error: error?.message || error,
      stack: error?.stack,
      file_id: id,
      user_id: user?.id
    });
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error?.message || 'Une erreur inattendue est survenue'
      },
      { status: 500 }
    );
  }
}

