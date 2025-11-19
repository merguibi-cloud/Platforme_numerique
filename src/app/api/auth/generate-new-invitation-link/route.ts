import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// POST - Générer un nouveau lien d'invitation (API publique, pas besoin d'authentification)
// Cette API est sécurisée car elle vérifie que l'utilisateur existe et est un administrateur invité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = getSupabaseServerClient();

    // Vérifier que l'administrateur existe
    const { data: admin, error: adminError } = await supabase
      .from('administrateurs')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (adminError) {
      console.error('Erreur vérification admin:', adminError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Aucun administrateur trouvé avec cet email' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur existe dans auth.users
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(admin.user_id);

    if (userError || !authUser.user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà actif (a déjà un mot de passe)
    // Si l'utilisateur a déjà un last_sign_in_at, c'est qu'il s'est déjà connecté
    if (authUser.user.last_sign_in_at) {
      return NextResponse.json(
        { success: false, error: 'Cet utilisateur a déjà activé son compte. Veuillez vous connecter.' },
        { status: 400 }
      );
    }

    // Générer un nouveau lien d'invitation
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/accept-invitation`;
    
    console.log('Génération d\'un nouveau lien d\'invitation pour:', email.toLowerCase());
    
    // Utiliser inviteUserByEmail pour générer un nouveau lien et envoyer l'email
    // Même si l'utilisateur existe déjà, cela générera un nouveau token
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: redirectTo,
      }
    );

    if (inviteError) {
      console.error('Erreur génération nouveau lien:', inviteError);
      
      // Si l'utilisateur existe déjà, utiliser generateLink pour créer un nouveau lien
      if (inviteError.message?.includes('already registered') || inviteError.message?.includes('already exists')) {
        console.log('Utilisateur existe déjà, génération d\'un nouveau lien...');
        
        // Utiliser 'recovery' au lieu de 'invite' pour une durée plus longue (24h au lieu de 1h)
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'recovery', // Type recovery pour une durée de validité plus longue
          email: email.toLowerCase(),
          options: {
            redirectTo: redirectTo,
          },
        });

        if (linkError) {
          console.error('Erreur génération lien:', linkError);
          return NextResponse.json(
            { 
              success: false, 
              error: `Erreur lors de la génération du lien: ${linkError.message}` 
            },
            { status: 500 }
          );
        }

        console.log('✓ Nouveau lien généré');
        return NextResponse.json({
          success: true,
          message: 'Nouveau lien généré avec succès',
          link: linkData?.properties?.action_link,
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors de la génération du nouveau lien: ${inviteError.message}` 
        },
        { status: 500 }
      );
    }

    console.log('✓ Nouveau lien généré et email envoyé');
    return NextResponse.json({
      success: true,
      message: 'Nouveau lien généré et email envoyé avec succès',
      // inviteUserByEmail envoie l'email automatiquement, pas besoin de retourner le lien
    });

  } catch (error) {
    console.error('Erreur lors de la génération du nouveau lien:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? {
          message: error.message,
          name: error.name
        } : null
      },
      { status: 500 }
    );
  }
}

