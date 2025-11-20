import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logCreate, logUpdate } from '@/lib/audit-logger';

// GET - Récupérer la candidature de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

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

    return NextResponse.json(
      {
        success: true,
        data: candidature
      },
      {
        headers: {
          // Cache privé pour l'utilisateur
          // max-age=30 : le cache est valide pendant 30 secondes (réduit pour éviter les problèmes de changement d'user)
          // must-revalidate : force la revalidation quand le cache expire
          // Vary: Cookie pour s'assurer que le cache est par utilisateur
          'Cache-Control': 'private, max-age=30, must-revalidate',
          'Vary': 'Cookie',
        },
      }
    );

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
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

     const body = await request.json();
     const { step, data: stepData } = body;

    // Récupérer le formation_id, le téléphone et le rôle depuis user_profiles
    let profile = await supabase
      .from('user_profiles')
      .select('formation_id, telephone, role, email')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si le profil n'existe pas, le créer avec rôle 'lead'
    if (!profile.data) {
      // Vérifier d'abord si l'utilisateur est un admin ou étudiant (ne doit pas avoir de user_profile)
      const { data: adminCheck } = await supabase
        .from('administrateurs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const { data: studentCheck } = await supabase
        .from('etudiants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Si l'utilisateur est admin ou étudiant, ne pas créer de user_profile
      if (adminCheck || studentCheck) {
        return NextResponse.json(
          { success: false, error: 'Les administrateurs et étudiants ne peuvent pas créer de candidature via user_profiles' },
          { status: 403 }
        );
      }
      
      // Utiliser le client Supabase authentifié (les politiques RLS doivent permettre la création)
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          formation_id: null,
          profile_completed: false,
          role: 'lead' // Rôle par défaut pour les nouveaux profils
        })
        .select('formation_id, telephone, role, email')
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
       // Utiliser le téléphone depuis stepData s'il est fourni, sinon depuis user_profiles
       const telephone = stepData.telephone || profile.data?.telephone || null;
       // Utiliser l'email depuis stepData s'il est fourni, sinon depuis user_profiles
       const email = stepData.email || profile.data?.email || user.email || null;
       
       updateData = {
         ...updateData,
         civilite: stepData.civilite,
         nom: stepData.nom,
         prenom: stepData.prenom,
         email: email,
         telephone: telephone,
         adresse: stepData.adresse,
         code_postal: stepData.codePostal,
         ville: stepData.ville,
         pays: stepData.pays,
         situation_actuelle: stepData.situationActuelle,
         type_formation: stepData.typeFormation,
         // Mettre "non" par défaut si alternance et vide, sinon utiliser la valeur fournie
         a_une_entreprise: stepData.typeFormation === 'alternance' 
           ? (stepData.aUneEntreprise || 'non')
           : 'non',
         etudiant_etranger: stepData.etudiantEtranger,
         accepte_donnees: stepData.accepteDonnees,
         ...(stepData.photoIdentitePath && { photo_identite_path: stepData.photoIdentitePath }),
         piece_identite_paths: stepData.pieceIdentitePaths || [],
       };

       // Si c'est la première fois qu'on crée la candidature et que l'utilisateur a le rôle 'lead',
       // changer son rôle en 'candidat'
       if (!existingCandidature && profile.data?.role === 'lead') {
         await supabase
           .from('user_profiles')
           .update({ role: 'candidat' })
           .eq('user_id', user.id);
       }
    } else if (step === 'documents') {
      updateData = {
        ...updateData,
        cv_path: stepData.cvPath || null,
        diplome_path: stepData.diplomePath || null,
        releves_paths: stepData.relevesPaths || [],
        lettre_motivation_path: stepData.lettreMotivationPath || null,
      };
    } else if (step === 'recap') {
      updateData = {
        ...updateData,
        accept_conditions: stepData.acceptConditions || false,
        attest_correct: stepData.attestCorrect || false,
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
         await logUpdate(request, 'candidatures', existingCandidature.id, existingCandidature, updateData, Object.keys(updateData), `Échec de mise à jour de candidature: ${error.message}`).catch(() => {});
         return NextResponse.json(
           { 
             success: false, 
             error: 'Erreur lors de la mise à jour de la candidature'
           },
           { status: 500 }
         );
       }

      // Logger la mise à jour
      await logUpdate(request, 'candidatures', existingCandidature.id, existingCandidature, data, Object.keys(updateData), `Mise à jour de la candidature - étape ${step}`).catch(() => {});
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
         await logCreate(request, 'candidatures', 'unknown', createData, `Échec de création de candidature: ${error.message}`).catch(() => {});
         return NextResponse.json(
           { 
             success: false, 
             error: 'Erreur lors de la création de la candidature'
           },
           { status: 500 }
         );
       }

      // Logger la création
      await logCreate(request, 'candidatures', data.id, data, `Création d'une nouvelle candidature - étape ${step}`).catch(() => {});
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
