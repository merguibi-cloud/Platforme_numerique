import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// Route pour récupérer l'URL signée d'une photo
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const photoPath = searchParams.get('path');
    const bucket = searchParams.get('bucket') || 'photo_profil';

    if (!photoPath) {
      return NextResponse.json(
        { error: 'Chemin de la photo requis' },
        { status: 400 }
      );
    }

    // Décoder le path pour l'utiliser avec Supabase Storage
    const decodedPath = decodeURIComponent(photoPath);
    
    // Pour les admins, on autorise l'accès à tous les documents
    // Vérifier si l'utilisateur est admin
    const { data: adminCheck } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si ce n'est pas un admin, vérifier que l'utilisateur a accès à cette photo
    if (!adminCheck) {
      // Extraire le userId depuis le path décodé
      const pathParts = decodedPath.split('/');
      // Le format peut être: profiles/user_id/photo.jpg ou user_id/photo.jpg
      const userId = pathParts[0] === 'profiles' ? pathParts[1] : pathParts[0];
      
      if (userId && userId !== user.id) {
        return NextResponse.json(
          { error: 'Accès non autorisé à cette photo' },
          { status: 403 }
        );
      }
    }
    
    // Essayer de générer l'URL signée avec le bucket spécifié
    let signedUrlData = null;
    let signedUrlError = null;
    
    // Générer l'URL signée (valide 1 heure)
    const result = await supabase.storage
      .from(bucket)
      .createSignedUrl(decodedPath, 60 * 60); // 1 heure
    
    signedUrlData = result.data;
    signedUrlError = result.error;

    // Si le fichier n'est pas trouvé dans le bucket spécifié, essayer l'autre bucket
    if (signedUrlError && (signedUrlError.message?.includes('not found') || signedUrlError.message?.includes('does not exist'))) {
      const alternateBucket = bucket === 'user_documents' ? 'photo_profil' : 'user_documents';
      console.log(`Fichier non trouvé dans ${bucket}, tentative avec ${alternateBucket}`);
      
      const alternateResult = await supabase.storage
        .from(alternateBucket)
        .createSignedUrl(decodedPath, 60 * 60);
      
      if (!alternateResult.error && alternateResult.data) {
        signedUrlData = alternateResult.data;
        signedUrlError = null;
      } else {
        signedUrlError = alternateResult.error;
      }
    }

    if (signedUrlError) {
      console.error('Erreur lors de la génération de l\'URL signée:', signedUrlError);
      console.error('Bucket:', bucket, 'Path:', decodedPath);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la génération de l\'URL',
          details: signedUrlError.message || 'Fichier introuvable ou bucket incorrect'
        },
        { status: 500 }
      );
    }

    if (!signedUrlData || !signedUrlData.signedUrl) {
      return NextResponse.json(
        { success: false, error: 'Impossible de générer l\'URL signée' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl
    });

  } catch (error: any) {
    console.error('Erreur dans /api/photo-url:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
