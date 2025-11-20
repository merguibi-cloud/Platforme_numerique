import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logCreate } from '@/lib/audit-logger';

/**
 * Route pour s'assurer que l'utilisateur a un profil
 * Crée le profil s'il n'existe pas
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Utilisateur authentifié

    // Vérifier si le profil existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification du profil' },
        { status: 500 }
      );
    }

    if (existingProfile) {
      // Profil existe
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        message: 'Profil existant'
      });
    }

    // Créer le profil s'il n'existe pas
    // Création profil
    
    // Utiliser le client Supabase authentifié (les politiques RLS doivent permettre la création)
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        formation_id: null,
        profile_completed: false
      })
      .select()
      .single();

    if (createError) {
      // Si l'erreur est due à un profil déjà existant, essayer de le récupérer à nouveau
      if (createError.code === '23505') {
        const { data: retryProfile, error: retryError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (retryError || !retryProfile) {
          return NextResponse.json(
            { success: false, error: 'Profil introuvable après création', details: retryError },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          profile: retryProfile,
          message: 'Profil existant récupéré'
        });
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Impossible de créer le profil', 
          details: createError,
          errorCode: createError.code,
          errorMessage: createError.message
        },
        { status: 500 }
      );
    }

    // Profil créé
    await logCreate(request, 'user_profiles', newProfile.id, newProfile, `Création automatique du profil utilisateur pour ${user.email}`).catch(() => {});

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Profil créé avec succès'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

