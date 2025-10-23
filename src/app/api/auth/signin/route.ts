import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Route pour la connexion
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Tentative de connexion...');
    const { email, password } = await request.json();
    console.log('📧 Email reçu:', email);

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    console.log('🔧 Initialisation du client d\'authentification...');
    const supabase = getAuth();
    
    console.log('🔑 Tentative d\'authentification Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('❌ Erreur d\'authentification:', error.message);
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

    console.log('✅ Authentification réussie pour:', data.user?.email);

    // Définir les cookies de session
    const response = NextResponse.json({
      success: true,
      user: data.user,
      message: 'Connexion réussie'
    });

    // Stocker la session dans les cookies
    if (data.session) {
      console.log('🍪 Configuration des cookies de session...');
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
        console.log('✅ Cookies configurés avec succès');
      } catch (cookieError) {
        console.log('❌ Erreur lors de la configuration des cookies:', cookieError);
      }
    } else {
      console.log('⚠️ Aucune session trouvée');
    }

    console.log('🎉 Connexion terminée avec succès');
    return response;

  } catch (error) {
    console.log('💥 Erreur de traitement:', error);
    console.log('📋 Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Erreur de traitement' },
      { status: 500 }
    );
  }
}
