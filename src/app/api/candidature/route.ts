import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// GET - Récupérer la candidature de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Créer le client avec le token d'authentification dans les headers
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Obtenir l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
            console.error('Erreur authentification GET');
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

            // Utilisateur authentifié

    // Récupérer la candidature de l'utilisateur
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (candidatureError) {
      console.error('Erreur récupération candidature');
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la candidature' },
        { status: 500 }
      );
    }

    console.log('📄 Candidature récupérée:', candidature ? 'existante' : 'aucune');

    return NextResponse.json({
      success: true,
      data: candidature
    });

  } catch (error) {
    console.error('Erreur GET candidature');
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour la candidature
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Créer le client avec le token d'authentification dans les headers
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // Obtenir l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
            console.error('Erreur authentification POST');
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

            // Utilisateur authentifié

    // Récupérer les données du body
    const body = await request.json();
    const { step, data: stepData } = body;

    console.log('📝 Étape:', step, 'Données:', stepData);

    // Récupérer le formation_id depuis user_profiles
    let profile = await supabase
      .from('user_profiles')
      .select('formation_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si le profil n'existe pas, le créer
    if (!profile.data) {
      // Création profil automatique
      
      // Utiliser le client Supabase authentifié (les politiques RLS doivent permettre la création)
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          formation_id: null,
          profile_completed: false
        })
        .select('formation_id')
        .single();

      if (createError) {
        console.error('Erreur création profil');
        return NextResponse.json(
          { success: false, error: 'Impossible de créer le profil utilisateur' },
          { status: 500 }
        );
      }

      profile.data = newProfile;
      // Profil créé
    }

    // Si pas de formation_id dans le profil, utiliser celui du body ou null
    const formationId = profile.data?.formation_id || stepData?.formation_id || null;
    
    if (!formationId) {
      console.warn('⚠️ Aucune formation associée à cet utilisateur');
      // On peut continuer sans formation_id pour le moment
    } else {
      console.log('🎓 Formation ID:', formationId);
    }

    // Vérifier si une candidature existe déjà
    const { data: existingCandidature, error: checkError } = await supabase
      .from('candidatures')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification candidature');
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification de la candidature' },
        { status: 500 }
      );
    }

    let result;
    const now = new Date().toISOString();

    // Préparer les données à sauvegarder selon l'étape
    let updateData: any = {
      updated_at: now,
      current_step: step
    };

    // Ajouter les données spécifiques à l'étape
    if (step === 'informations') {
      updateData = {
        ...updateData,
        civilite: stepData.civilite,
        nom: stepData.nom,
        prenom: stepData.prenom,
        email: stepData.email,
        telephone: stepData.telephone,
        adresse: stepData.adresse,
        code_postal: stepData.codePostal,
        ville: stepData.ville,
        pays: stepData.pays,
        situation_actuelle: stepData.situationActuelle,
        ...(stepData.photoIdentitePath && { photo_identite_path: stepData.photoIdentitePath }),
      };
    }

    if (existingCandidature) {
      // Mise à jour candidature
      
      // Mettre à jour la candidature existante
      const { data, error } = await supabase
        .from('candidatures')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour candidature');
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour de la candidature' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      console.log('✨ Création d\'une nouvelle candidature');
      
      // Créer une nouvelle candidature
      const createData = {
        user_id: user.id,
        formation_id: formationId,
        status: 'draft',
        ...updateData,
        created_at: now
      };

      const { data, error } = await supabase
        .from('candidatures')
        .insert(createData)
        .select()
        .single();

      if (error) {
        console.error('Erreur création candidature');
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de la candidature' },
          { status: 500 }
        );
      }

      result = data;
    }

    // Candidature sauvegardée

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur POST candidature');
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
