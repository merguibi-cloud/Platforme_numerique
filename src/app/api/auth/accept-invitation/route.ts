import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    console.log('=== VÉRIFICATION DU TOKEN ===');
    console.log('Token reçu (premiers 20 caractères):', token.substring(0, 20) + '...');
    console.log('Longueur du token:', token.length);
    
    let data, error;
    
    // Essayer avec recovery (magic link) - durée 24h
    console.log('Tentative de vérification avec type "recovery"...');
    const recoveryResult = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });
    
    if (recoveryResult.error) {
      console.error('❌ Erreur avec type "recovery":', {
        code: recoveryResult.error.code,
        message: recoveryResult.error.message,
        status: recoveryResult.error.status
      });
      
      // Si recovery échoue, essayer avec invite
      console.log('Tentative de vérification avec type "invite"...');
      const inviteResult = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      });
      
      if (inviteResult.error) {
        console.error('❌ Erreur avec type "invite":', {
          code: inviteResult.error.code,
          message: inviteResult.error.message,
          status: inviteResult.error.status
        });
      } else {
        console.log('✓ Token "invite" vérifié avec succès');
      }
      
      data = inviteResult.data;
      error = inviteResult.error;
    } else {
      console.log('✓ Token "recovery" vérifié avec succès');
      data = recoveryResult.data;
      error = recoveryResult.error;
    }

    if (error) {
      console.error('❌ ERREUR FINALE - Token invalide ou expiré:', {
        code: error.code,
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // Si le token est expiré, retourner un code spécifique pour permettre le renvoi
      const isExpired = error.code === 'otp_expired' || error.message?.includes('expired') || error.message?.includes('invalid');
      
      console.log('Token expiré?', isExpired);
      console.log('Code d\'erreur:', error.code);
      
      return NextResponse.json(
        { 
          error: isExpired 
            ? 'Token expiré. Veuillez demander un nouveau lien d\'invitation.' 
            : 'Token invalide. Veuillez utiliser le lien reçu par email.',
          expired: isExpired,
          code: error.code,
          details: {
            message: error.message,
            status: error.status
          }
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
    });

    if (updateError) {
      console.error('Erreur mise à jour mot de passe:', updateError);
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

    // Retourner la session pour que le client puisse se connecter
    return NextResponse.json({
      success: true,
      message: 'Mot de passe créé avec succès',
      session: sessionData.session,
    });

  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

