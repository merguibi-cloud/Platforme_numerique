import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * POST - Mettre à jour la photo de profil de l'administrateur
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const supabase = getSupabaseServerClient();
    const formData = await request.formData();
    const photoFile = formData.get('photo') as File | null;
    const removePhoto = formData.get('removePhoto') === 'true';

    // Récupérer l'administrateur
    const { data: admin, error: adminError } = await supabase
      .from('administrateurs')
      .select('id, user_id, photo_profil')
      .eq('user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, error: 'Administrateur non trouvé' },
        { status: 404 }
      );
    }

    let photoUrl: string | null = null;

    // Si on supprime la photo
    if (removePhoto) {
      // Supprimer l'ancienne photo du storage si elle existe
      if (admin.photo_profil) {
        try {
          // Extraire le chemin du fichier depuis l'URL
          const urlParts = admin.photo_profil.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `admin/${fileName}`;
          await supabase.storage.from('photo_profil').remove([filePath]);
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
        }
      }
      photoUrl = null;
    } 
    // Si on upload une nouvelle photo
    else if (photoFile) {
      // Supprimer l'ancienne photo si elle existe
      if (admin.photo_profil) {
        try {
          const urlParts = admin.photo_profil.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `admin/${fileName}`;
          await supabase.storage.from('photo_profil').remove([filePath]);
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
        }
      }

      // Générer un nom de fichier unique
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `admin/${fileName}`;

      // Convertir le File en ArrayBuffer pour l'upload
      const arrayBuffer = await photoFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Uploader la nouvelle photo dans le bucket photo_profil
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photo_profil')
        .upload(filePath, fileBuffer, {
          contentType: photoFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de l\'upload de la photo' },
          { status: 500 }
        );
      }

      // Obtenir l'URL publique de la photo
      const { data: urlData } = supabase.storage
        .from('photo_profil')
        .getPublicUrl(filePath);

      photoUrl = urlData.publicUrl;
    } else {
      // Aucun changement
      photoUrl = admin.photo_profil;
    }

    // Mettre à jour la base de données
    const { error: updateError } = await supabase
      .from('administrateurs')
      .update({ photo_profil: photoUrl })
      .eq('id', admin.id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo_profil: photoUrl,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/admin/compte/photo-profil:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

