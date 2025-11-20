import { NextRequest, NextResponse } from 'next/server';
import { getAuth, getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { resolveRoleForUser } from '@/lib/auth-role';
import { createClient } from '@supabase/supabase-js';
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
      // Si l'email n'est pas confirmé, on le confirme automatiquement après la première connexion
      if (error.message.includes('Email not confirmed')) {
        // Utiliser le service role key pour confirmer l'email
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        // Récupérer l'utilisateur par email
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const user = userList?.users?.find(u => u.email === email.toLowerCase());
        
        if (user && !user.email_confirmed_at) {
          // Confirmer l'email
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email_confirm: true,
          });
          
          // Réessayer la connexion
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) {
            return NextResponse.json(
              { error: 'Email ou mot de passe incorrect.' },
              { status: 400 }
            );
          }
          
          // Utiliser les données de la nouvelle tentative
          if (retryData) {
            Object.assign(data, retryData);
          }
        } else {
          return NextResponse.json(
            { error: 'Veuillez confirmer votre email avant de vous connecter.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect.' },
          { status: 400 }
        );
      }
    }
    
    // Si l'email n'est pas encore confirmé, le confirmer maintenant
    if (data.user && !data.user.email_confirmed_at) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    }

    // Vérifier si l'utilisateur a un mot de passe temporaire
    if (!data.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la connexion' },
        { status: 500 }
      );
    }

    const userMetadata = data.user.user_metadata;
    const tempPasswordBase64 = userMetadata?.temp_password;

    // Si un mot de passe temporaire est stocké, vérifier si le mot de passe utilisé correspond
    if (tempPasswordBase64) {
      const tempPassword = Buffer.from(tempPasswordBase64, 'base64').toString('utf-8');
      if (password === tempPassword) {
        // L'utilisateur utilise le mot de passe temporaire, définir le flag et forcer le changement
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        // Mettre à jour les metadata pour forcer le changement de mot de passe
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          user_metadata: {
            ...userMetadata,
            requires_password_change: true,
          },
        });
        
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