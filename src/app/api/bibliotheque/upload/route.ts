import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// Cette route génère juste le chemin et le bucket pour l'upload
// Le vrai upload se fera via /api/bibliotheque/upload-file avec progression
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

    const body = await request.json();
    const { fileName, fileSize } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json(
        { error: 'Nom et taille du fichier requis' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const fileExt = fileName.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = `${user.id}/${timestamp}_${randomId}.${fileExt}`;
    const bucketName = 'bibliotheque-numerique';

    return NextResponse.json({
      success: true,
      path: filePath,
      bucket: bucketName
    });

  } catch (error) {
    console.error('Erreur upload bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

