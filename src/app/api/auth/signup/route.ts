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
        { error: 'Email, mot de passe et numéro de téléphone requis' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
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
    
    // Créer l'utilisateur dans auth.users avec l'API client normale
    // Cela enverra automatiquement l'email de confirmation
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/exchange-code`
      }
    });
    
    if (signUpError) {
      // Si l'erreur est due à un email déjà existant, retourner un message clair
      const errorMessage = signUpError.message || '';
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
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
          error: 'Erreur lors de la création du compte'
        },
        { status: 400 }
      );
    }
    
    if (!signUpData.user) {
      await logCreate(request, 'auth.users', 'unknown', { email }, 'Échec d\'inscription: utilisateur non créé').catch(() => {});
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500 }
      );
    }
    
    // Récupérer les données de l'utilisateur créé
    const data = { user: signUpData.user };

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

    return NextResponse.json({
      success: true,
      user: data.user,
      profile: profileData,
      message: 'Inscription réussie. Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail pour confirmer votre compte.'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
