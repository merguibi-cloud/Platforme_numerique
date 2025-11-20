import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { resolveRoleForUser } from '@/lib/auth-role';

// Route pour échanger un code contre une session
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Récupérer le code depuis l'URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/?error=code_missing', request.url));
    }
    
    // Échanger le code contre une session
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
      
      // Confirmer l'email si ce n'est pas déjà fait
      if (!sessionData.user.email_confirmed_at) {
        const supabaseService = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        await supabaseService.auth.admin.updateUserById(sessionData.user.id, {
          email_confirm: true,
        });
      }
      
      // Déterminer la redirection selon le rôle
      const roleResolution = await resolveRoleForUser(sessionData.user.id);
      const redirectTo = roleResolution.redirectTo || '/';
      
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    return NextResponse.redirect(new URL('/?error=session_error', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/?error=callback_error', request.url));
  }
}

