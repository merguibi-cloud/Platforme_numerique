import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Route pour récupérer l'URL signée d'une photo
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Créer le client avec le service role key pour les opérations de stockage
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Créer un client temporaire pour vérifier l'authentification
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const photoPath = searchParams.get('path');
    const bucket = searchParams.get('bucket') || 'photo_profil';

    if (!photoPath) {
      return NextResponse.json(
        { error: 'Chemin de la photo requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a accès à cette photo
    const userId = (photoPath.split('/'))[1]; // profiles/user_id/photo.jpg
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette photo' },
        { status: 403 }
      );
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
