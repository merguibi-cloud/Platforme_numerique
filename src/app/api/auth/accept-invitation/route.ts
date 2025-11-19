import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// POST - Accepter l'invitation et définir le mot de passe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Utiliser le client anonyme pour l'acceptation d'invitation
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Vérifier le token d'invitation/réinitialisation
    // Essayer d'abord avec 'recovery', puis 'invite'
    let data, error;
    
    // Essayer avec recovery (magic link) - durée 24h
    const recoveryResult = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });
    
    if (recoveryResult.error) {
      // Si recovery échoue, essayer avec invite
      const inviteResult = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      });
      
      data = inviteResult.data;
      error = inviteResult.error;
    } else {
      data = recoveryResult.data;
      error = recoveryResult.error;
    }

    if (error) {
      // Si le token est expiré, retourner un code spécifique pour permettre le renvoi
      const isExpired = error.code === 'otp_expired' || error.message?.includes('expired') || error.message?.includes('invalid');
      
      return NextResponse.json(
        { 
          error: isExpired 
            ? 'Token expiré. Veuillez demander un nouveau lien d\'invitation.' 
            : 'Token invalide. Veuillez utiliser le lien reçu par email.',
          expired: isExpired,
        },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe avec la session obtenue
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
      data: {
        requires_password_change: false,
        temp_password: null,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'Erreur lors de la définition du mot de passe' },
        { status: 500 }
      );
    }

    // Récupérer la session mise à jour
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de la session' },
        { status: 500 }
      );
    }
    
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

    // Retourner la session pour que le client puisse se connecter
    return NextResponse.json({
      success: true,
      message: 'Mot de passe créé avec succès',
      session: sessionData.session,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
