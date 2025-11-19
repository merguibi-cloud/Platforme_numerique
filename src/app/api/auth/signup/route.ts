import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Route pour l'inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, formation_id } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Utiliser le service role key pour créer l'utilisateur et le profil
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirmer l'email pour éviter la vérification
    });

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Créer le profil utilisateur avec formation_id et rôle par défaut
    await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        email: email.toLowerCase(), // Ajouter l'email car le trigger l'attend
        formation_id: formation_id || null,
        profile_completed: false,
        role: 'etudiant' // Rôle par défaut pour les nouveaux utilisateurs
      });

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Inscription réussie. Vous pouvez vous connecter.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
