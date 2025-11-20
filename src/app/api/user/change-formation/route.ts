import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logUpdate, logDelete } from '@/lib/audit-logger';

// POST - Changer la formation de l'utilisateur et supprimer la candidature existante
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const body = await request.json();
    const { formation_id } = body;

    if (!formation_id) {
      return NextResponse.json(
        { success: false, error: 'ID de formation requis' },
        { status: 400 }
      );
    }

    // 1. Supprimer la candidature existante (avec tous les fichiers associés)
    const { data: existingCandidature } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingCandidature) {
      // Supprimer tous les fichiers du storage liés à cette candidature
      const filesToDelete: string[] = [];

      if (existingCandidature.photo_identite_path) filesToDelete.push(existingCandidature.photo_identite_path);
      if (existingCandidature.cv_path) filesToDelete.push(existingCandidature.cv_path);
      if (existingCandidature.diplome_path) filesToDelete.push(existingCandidature.diplome_path);
      if (existingCandidature.releves_paths) filesToDelete.push(...existingCandidature.releves_paths);
      if (existingCandidature.piece_identite_paths) filesToDelete.push(...existingCandidature.piece_identite_paths);

      // Supprimer les fichiers des buckets
      for (const filePath of filesToDelete) {
        try {
          // Essayer user_documents
          await supabase.storage
            .from('user_documents')
            .remove([filePath]);
          
          // Essayer photo_profil
          await supabase.storage
            .from('photo_profil')
            .remove([filePath]);
        } catch (error) {
          // Continuer même si la suppression échoue
        }
      }

      // Supprimer la candidature de la base de données
      const { error: deleteError } = await supabase
        .from('candidatures')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        // Continuer même si la suppression échoue
      } else {
        // Logger la suppression de la candidature
        await logDelete(request, 'candidatures', existingCandidature.id, existingCandidature, `Suppression de la candidature lors du changement de formation`).catch(() => {});
      }
    }

    // Récupérer l'ancien profil pour le log
    const { data: oldProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 2. Mettre à jour la formation dans user_profiles
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        formation_id: formation_id,
        profile_completed: false // Réinitialiser le profil
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      await logUpdate(request, 'user_profiles', user.id, oldProfile || {}, { formation_id }, ['formation_id'], `Échec de changement de formation: ${updateError.message}`).catch(() => {});
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la mise à jour de la formation'
        },
        { status: 500 }
      );
    }

    // Logger le changement de formation
    await logUpdate(request, 'user_profiles', user.id, oldProfile || {}, profile, ['formation_id', 'profile_completed'], `Changement de formation de ${oldProfile?.formation_id || 'aucune'} vers ${formation_id}`).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Formation changée avec succès. Votre candidature précédente a été supprimée.',
      data: profile
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

