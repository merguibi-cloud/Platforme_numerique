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

    // Pour les admins, on autorise l'accès à tous les documents
    // Vérifier si l'utilisateur est admin
    const { data: adminCheck } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si ce n'est pas un admin, vérifier que l'utilisateur a accès à cette photo
    if (!adminCheck) {
      const userId = (photoPath.split('/'))[1]; // profiles/user_id/photo.jpg
      if (userId !== user.id) {
        return NextResponse.json(
          { error: 'Accès non autorisé à cette photo' },
          { status: 403 }
        );
      }
    }

    // Générer l'URL signée (valide 1 heure)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(photoPath, 60 * 60); // 1 heure

    if (signedUrlError) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération de l\'URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
