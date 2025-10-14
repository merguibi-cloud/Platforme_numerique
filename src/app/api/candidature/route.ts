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
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer la candidature de l'utilisateur
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (candidatureError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la candidature' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: candidature
    });

  } catch (error) {
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
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, data: stepData } = body;

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
        return NextResponse.json(
          { success: false, error: 'Impossible de créer le profil utilisateur' },
          { status: 500 }
        );
      }

      profile.data = newProfile;
      // Profil créé
    }

    const formationId = profile.data?.formation_id || stepData?.formation_id || null;

    // Vérifier si une candidature existe déjà
    const { data: existingCandidature, error: checkError } = await supabase
      .from('candidatures')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
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
    } else if (step === 'documents') {
      updateData = {
        ...updateData,
        cv_path: stepData.cvPath || null,
        diplome_path: stepData.diplomePath || null,
        releves_paths: stepData.relevesPaths || [],
        piece_identite_paths: stepData.pieceIdentitePaths || [],
        entreprise_accueil: stepData.entrepriseAccueil || '',
        motivation_formation: stepData.motivationFormation || '',
      };
    }

    if (existingCandidature) {
      // Mettre à jour la candidature existante
      const { data, error } = await supabase
        .from('candidatures')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour de la candidature' },
          { status: 500 }
        );
      }

      result = data;
    } else {
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
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
