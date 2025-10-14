import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Route pour l'upload de fichiers
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Fichier et type requis' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload fichier

    // Utiliser le bucket 'photo_profil' pour les photos d'identité
    let bucketName = 'photo_profil';
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    // Si ça ne marche pas, essayer 'user_documents'
    if (uploadError) {
      // Bucket alternatif
      bucketName = 'user_documents';
      uploadError = null;
      const result = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      uploadError = result.error;
      
      // Erreur bucket alternatif
    }

    if (uploadError) {
      console.error('Erreur upload');
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'upload du fichier',
          details: uploadError.message
        },
        { status: 500 }
      );
    }

    // Fichier uploadé

    // Pour les buckets privés, générer une URL signée
    let signedUrl = '';
    if (bucketName === 'photo_profil' || bucketName === 'user_documents') {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL valide 1 an

      if (signedUrlError) {
        console.error('Erreur génération URL signée');
      } else {
        signedUrl = signedUrlData.signedUrl;
      }
    }

    // Retourner le chemin pour la sauvegarde en base
    return NextResponse.json({
      success: true,
      path: filePath,
      bucket: bucketName,
      signedUrl: signedUrl || null
    });

  } catch (error) {
    console.error('Erreur upload');
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
