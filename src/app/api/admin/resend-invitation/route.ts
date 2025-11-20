import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

// POST - Renvoyer l'invitation à un administrateur
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou superadmin requis)
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email requis' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Administrateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur existe dans auth.users
    const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(admin.user_id);

    if (userError || !authUser.user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé dans auth.users' },
        { status: 404 }
      );
    }

    // Générer un nouveau lien d'invitation
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/accept-invitation`;
    
    console.log('Renvoyement de l\'invitation pour:', email.toLowerCase());
    
    // Utiliser inviteUserByEmail pour renvoyer l'invitation
    // Cela générera un nouveau token et enverra l'email
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        redirectTo: redirectTo,
      }
    );

    if (inviteError) {
      console.error('Erreur renvoi invitation:', inviteError);
      
      // Si l'utilisateur existe déjà, utiliser generateLink pour créer un nouveau lien
      if (inviteError.message?.includes('already registered') || inviteError.message?.includes('already exists')) {
        console.log('Utilisateur existe déjà, génération d\'un nouveau lien...');
        
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'invite',
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

        console.log('✓ Nouveau lien généré (mais email non envoyé automatiquement)');
        return NextResponse.json({
          success: true,
          message: 'Nouveau lien généré. Note: L\'email doit être envoyé manuellement depuis le dashboard Supabase.',
          link: linkData?.properties?.action_link,
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Erreur lors du renvoi de l'invitation: ${inviteError.message}` 
        },
        { status: 500 }
      );
    }

    console.log('✓ Invitation renvoyée avec succès');
    return NextResponse.json({
      success: true,
      message: 'Invitation renvoyée avec succès. L\'email a été envoyé.',
    });

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'invitation:', error);
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

