import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Route pour s'assurer que l'utilisateur a un profil
 * Crée le profil s'il n'existe pas
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Créer le client avec le token d'authentification dans les headers
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Obtenir l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

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

