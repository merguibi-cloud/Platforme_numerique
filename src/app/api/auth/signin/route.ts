import { NextRequest, NextResponse } from 'next/server';
import { getAuth, getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { resolveRoleForUser } from '@/lib/auth-role';
// Route pour la connexion
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }
    const supabase = getAuth();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Veuillez confirmer votre email avant de vous connecter.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect.' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a un mot de passe temporaire
    const userMetadata = data.user.user_metadata;
    const requiresPasswordChange = userMetadata?.requires_password_change === true;
    const tempPasswordBase64 = userMetadata?.temp_password;

    // Si un mot de passe temporaire est stocké, vérifier si le mot de passe utilisé correspond
    if (requiresPasswordChange && tempPasswordBase64) {
      const tempPassword = Buffer.from(tempPasswordBase64, 'base64').toString('utf-8');
      if (password === tempPassword) {
        // L'utilisateur utilise le mot de passe temporaire, il doit le changer
        // Définir les cookies de session pour qu'il puisse changer son mot de passe
        const response = NextResponse.json({
          success: false,
          requiresPasswordChange: true,
          message: 'Vous devez changer votre mot de passe temporaire',
          redirectTo: '/espace-admin/change-password',
        });
        
        if (data.session) {
          try {
            const cookieStore = await cookies();
            cookieStore.set('sb-access-token', data.session.access_token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 jours
            });
            cookieStore.set('sb-refresh-token', data.session.refresh_token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 jours
            });
          } catch (cookieError) {
          }
        }
        
        return response;
      }
    }

    const roleResolution = await resolveRoleForUser(data.user.id);

    if (!roleResolution.role || !roleResolution.redirectTo) {
      return NextResponse.json(
        { success: false, error: 'Aucun rôle associé à cet utilisateur.' },
        { status: 403 }
      );
    }

    // Définir les cookies de session
    const response = NextResponse.json({
      success: true,
      user: data.user,
      role: roleResolution.role,
      redirectTo: roleResolution.redirectTo,
      message: 'Connexion réussie'
    });
    // Stocker la session dans les cookies
    if (data.session) {
      try {
        const cookieStore = await cookies();
        cookieStore.set('sb-access-token', data.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        cookieStore.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
      } catch (cookieError) {
      }
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur de traitement' },
      { status: 500 }
    );
  }
}