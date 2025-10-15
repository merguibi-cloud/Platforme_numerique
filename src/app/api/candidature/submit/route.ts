import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// POST - Soumettre la candidature (changer le statut de draft à submitted)
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

    // Récupérer la candidature de l'utilisateur
    const { data: candidature, error: getCandidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (getCandidatureError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la candidature' },
        { status: 500 }
      );
    }

    if (!candidature) {
      return NextResponse.json(
        { success: false, error: 'Aucune candidature trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que toutes les données requises sont présentes
    const hasInfos = candidature.nom && candidature.prenom && candidature.email && candidature.telephone;
    const hasDocs = candidature.cv_path && candidature.diplome_path && 
                   (candidature.releves_paths && candidature.releves_paths.length > 0) &&
                   (candidature.piece_identite_paths && candidature.piece_identite_paths.length > 0) &&
                   candidature.entreprise_accueil;
    const hasRecap = candidature.accept_conditions && candidature.attest_correct;

    if (!hasInfos || !hasDocs || !hasRecap) {
      return NextResponse.json(
        { success: false, error: 'La candidature est incomplète. Veuillez compléter toutes les étapes.' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut à 'submitted' et enregistrer la date de soumission
    const now = new Date().toISOString();
    const { data: updatedCandidature, error: updateError } = await supabase
      .from('candidatures')
      .update({
        status: 'submitted',
        submitted_at: now,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la soumission de la candidature' },
        { status: 500 }
      );
    }

    // TODO: Envoyer un email de confirmation
    // await sendConfirmationEmail(user.email, updatedCandidature);

    return NextResponse.json({
      success: true,
      data: updatedCandidature,
      message: 'Candidature soumise avec succès'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

