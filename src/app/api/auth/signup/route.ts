import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreate } from '@/lib/audit-logger';

// Route pour l'inscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, formation_id, telephone } = body;

    console.log('Données reçues pour inscription:', { email, formation_id, telephone: telephone ? 'présent' : 'absent' });

    if (!email || !password || !telephone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email, mot de passe et numéro de téléphone requis' 
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement Supabase manquantes');
      return NextResponse.json(
        { 
          success: false,
          error: 'Configuration serveur incorrecte' 
        },
        { status: 500 }
      );
    }
    
    // Utiliser le service role key pour créer l'utilisateur et le profil
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier si l'email existe déjà dans user_profiles AVANT de créer l'utilisateur
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, user_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (existingProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter avec votre compte existant.'
        },
        { status: 400 }
      );
    }
    
    // Créer l'utilisateur dans auth.users avec l'API admin pour garantir la création immédiate
    // Cela permet d'éviter les problèmes de timing avec la contrainte de clé étrangère
    console.log('Tentative de création de l\'utilisateur avec l\'API admin...');
    const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: false, // L'email sera confirmé via le lien de confirmation
      user_metadata: {
        email_redirect_to: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/exchange-code`
      }
    });
    
    if (createUserError) {
      console.error('Erreur lors de la création de l\'utilisateur:', createUserError);
      // Si l'erreur est due à un email déjà existant, retourner un message clair
      const errorMessage = createUserError.message || '';
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('User already registered')) {
        await logCreate(request, 'auth.users', 'unknown', { email }, `Tentative d'inscription avec email existant: ${errorMessage}`).catch(() => {});
        return NextResponse.json(
          { 
            success: false,
            error: 'Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter avec votre compte existant.'
          },
          { status: 400 }
        );
      }
      
      await logCreate(request, 'auth.users', 'unknown', { email }, `Échec d'inscription: ${errorMessage}`).catch(() => {});
      return NextResponse.json(
        { 
          success: false,
          error: `Erreur lors de la création du compte: ${errorMessage}`,
          details: createUserError
        },
        { status: 400 }
      );
    }
    
    if (!createUserData?.user) {
      await logCreate(request, 'auth.users', 'unknown', { email }, 'Échec d\'inscription: utilisateur non créé').catch(() => {});
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }
    
    // Récupérer les données de l'utilisateur créé
    const data = { user: createUserData.user };
    
    // Vérifier que l'utilisateur existe bien dans auth.users avant de créer le profil
    // Attendre un court instant pour s'assurer que la transaction est complète
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Vérifier que l'utilisateur existe vraiment
    const { data: verifyUser, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(data.user.id);
    if (verifyError || !verifyUser) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', verifyError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erreur lors de la vérification de l\'utilisateur créé'
        },
        { status: 500 }
      );
    }

    if (!data.user) {
      await logCreate(request, 'auth.users', 'unknown', { email }, 'Échec d\'inscription: utilisateur non créé').catch(() => {});
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Logger la création de l'utilisateur
    await logCreate(request, 'auth.users', data.user.id, {
      id: data.user.id,
      email: data.user.email,
    }, `Inscription d'un nouvel utilisateur: ${email}`).catch(() => {});

    // Convertir formation_id en nombre si fourni
    const formationIdNumber: number | null = formation_id ? Number(formation_id) : null;
    
    // Vérifier que formation_id est un nombre valide si fourni
    if (formation_id && formationIdNumber !== null && (isNaN(formationIdNumber) || formationIdNumber <= 0)) {
      console.error('formation_id invalide:', formation_id, 'type:', typeof formation_id);
    }
    
    // Vérifier si un profil existe déjà (peut être créé par un trigger Supabase après la création de l'utilisateur)
    const { data: existingProfileAfterCreation } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, formation_id, telephone, role')
      .eq('user_id', data.user.id)
      .maybeSingle();
    
    let profileData;
    let profileError;

    if (existingProfileAfterCreation) {
      // Le profil existe déjà (créé par un trigger), on le met à jour avec les informations d'inscription
      const updateData: {
        email: string;
        formation_id: number | null;
        telephone: string;
        role: 'lead';
      } = {
        email: email.toLowerCase(),
        formation_id: formationIdNumber,
        telephone: telephone.trim(),
        role: 'lead'
      };
      
      console.log('Mise à jour du profil existant (créé par trigger) avec:', updateData);
      
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', data.user.id)
        .select()
        .single();
      
      profileData = updatedProfile;
      profileError = updateError;
    } else {
      // Créer un nouveau profil
      const profileInsertData: {
        user_id: string;
        email: string;
        formation_id: number | null;
        telephone: string;
        profile_completed: boolean;
        role: 'lead';
      } = {
        user_id: data.user.id,
        email: email.toLowerCase(),
        formation_id: formationIdNumber,
        telephone: telephone.trim(),
        profile_completed: false,
        role: 'lead'
      };
      
      console.log('Création d\'un nouveau profil avec:', profileInsertData);
      
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert(profileInsertData)
        .select()
        .single();
      
      profileData = newProfile;
      profileError = insertError;
    }

    if (profileError) {
      console.error('Erreur création/mise à jour profil:', profileError);
      console.error('Données tentées:', existingProfile ? 'mise à jour' : 'création', {
        user_id: data.user.id,
        email: email.toLowerCase(),
        formation_id: formationIdNumber,
        telephone: telephone.trim(),
        role: 'lead'
      });
      await logCreate(request, 'user_profiles', data.user.id, {
        user_id: data.user.id,
        email: email.toLowerCase(),
        formation_id: formationIdNumber,
        telephone: telephone.trim(),
      }, `Échec de création/mise à jour du profil: ${profileError.message}`).catch(() => {});
      
      // Retourner l'erreur au client pour qu'il puisse la voir
      return NextResponse.json(
        { 
          success: false,
          error: `Erreur lors de la création du profil: ${profileError.message}`,
          details: profileError
        },
        { status: 500 }
      );
    }
    
    if (profileData) {
      console.log('Profil créé avec succès:', profileData);
      await logCreate(request, 'user_profiles', profileData.id, profileData, `Création du profil utilisateur pour ${email}`).catch(() => {});
    } else {
      console.error('Aucune donnée retournée après insertion du profil');
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la création du profil: aucune donnée retournée'
        },
        { status: 500 }
      );
    }

    // Envoyer l'email de confirmation (magic link) car admin.createUser() ne l'envoie pas automatiquement
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (otpError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', otpError);
      // On ne bloque pas l'inscription, l'utilisateur peut renvoyer l'email depuis la page de confirmation
    } else {
      console.log('Email de confirmation envoyé à:', email);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      profile: profileData,
      message: 'Inscription réussie. Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail pour confirmer votre compte.'
    });

  } catch (error: any) {
    console.error('Erreur dans la route signup:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
