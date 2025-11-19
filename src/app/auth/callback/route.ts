import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Route de callback pour gérer la confirmation d'email et les tokens d'invitation
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Récupérer le code depuis l'URL (Supabase envoie le token dans le hash ou en paramètre)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || searchParams.get('token_hash');
    const type = searchParams.get('type');
    const code = searchParams.get('code');
    
    // Si c'est un code d'échange (code exchange)
    if (code) {
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) {
        return NextResponse.redirect(new URL('/?error=token_invalid', request.url));
      }
      
      if (sessionData.session) {
        // Définir les cookies de session
        const cookieStore = await cookies();
        cookieStore.set('sb-access-token', sessionData.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        cookieStore.set('sb-refresh-token', sessionData.session.refresh_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        
        // Vérifier si l'utilisateur doit changer son mot de passe
        const userMetadata = sessionData.user.user_metadata;
        if (userMetadata?.requires_password_change) {
          return NextResponse.redirect(new URL('/espace-admin/change-password', request.url));
        }
        
        // Rediriger vers le dashboard admin
        return NextResponse.redirect(new URL('/espace-admin/dashboard', request.url));
      }
    }
    
    // Si c'est un token dans l'URL (format hash)
    if (token && type) {
      // Vérifier le token
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as 'invite' | 'recovery',
      });
      
      if (verifyError) {
        return NextResponse.redirect(new URL('/?error=token_invalid', request.url));
      }
      
      if (verifyData.session) {
        // Définir les cookies de session
        const cookieStore = await cookies();
        cookieStore.set('sb-access-token', verifyData.session.access_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        cookieStore.set('sb-refresh-token', verifyData.session.refresh_token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        
        // Vérifier si l'utilisateur doit changer son mot de passe
        const userMetadata = verifyData.user.user_metadata;
        if (userMetadata?.requires_password_change) {
          return NextResponse.redirect(new URL('/espace-admin/change-password', request.url));
        }
        
        // Rediriger vers le dashboard admin
        return NextResponse.redirect(new URL('/espace-admin/dashboard', request.url));
      }
    }
    
    // Si aucun token/code n'est trouvé, rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/', request.url));
    
  } catch (error) {
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
}
