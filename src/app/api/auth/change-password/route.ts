import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { logPasswordChange } from '@/lib/audit-logger';

// POST - Changer le mot de passe (pour les utilisateurs avec mot de passe temporaire)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: 'Nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = getAuth();
    
    // Définir la session avec les tokens des cookies
    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (sessionError) {
        return NextResponse.json(
          { error: 'Erreur de session. Veuillez vous reconnecter.' },
          { status: 401 }
        );
      }
    }
    
    // Vérifier la session actuelle
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur a bien le flag requires_password_change
    const userMetadata = user.user_metadata;
    
    if (!userMetadata?.requires_password_change) {
      return NextResponse.json(
        { error: 'Le changement de mot de passe n\'est pas requis pour cet utilisateur' },
        { status: 400 }
      );
    }

    // Pas besoin de vérifier le mot de passe temporaire car l'utilisateur est déjà authentifié
    // et on sait qu'il utilise un mot de passe temporaire grâce au flag requires_password_change

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        requires_password_change: false,
        temp_password: null,
      },
    });

    if (updateError) {
      await logPasswordChange(request, user.id, 'error', updateError.message).catch(() => {});
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      );
    }

    // Logger le changement de mot de passe réussi
    await logPasswordChange(request, user.id, 'success').catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès',
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
