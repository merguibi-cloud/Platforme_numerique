import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer le profil de l'étudiant connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant par user_id
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError) {
      console.error('Erreur lors de la récupération de l\'étudiant:', etudiantError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      );
    }

    if (!etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations depuis candidatures pour avoir nom et prénom
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('nom, prenom, photo_identite_path')
      .eq('user_id', user.id)
      .maybeSingle();

    // Générer l'URL signée pour la photo si elle existe
    let photoProfilUrl = null;
    if (candidature?.photo_identite_path) {
      // Vérifier si c'est déjà une URL complète
      const isFullUrl = candidature.photo_identite_path.startsWith('http://') || 
                        candidature.photo_identite_path.startsWith('https://');
      
      if (isFullUrl) {
        photoProfilUrl = candidature.photo_identite_path;
      } else {
        // C'est un chemin relatif, générer une URL signée
        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('photo_profil')
            .createSignedUrl(candidature.photo_identite_path, 60 * 60 * 24); // Valide 24 heures
          
          if (!signedUrlError && signedUrlData?.signedUrl) {
            photoProfilUrl = signedUrlData.signedUrl;
          }
        } catch (error) {
          console.error('Erreur lors de la génération de l\'URL signée pour la photo:', error);
          // En cas d'erreur, on laisse photoProfilUrl à null
        }
      }
    }

    // Récupérer la formation si elle existe
    let formationData = null;
    if (etudiant.formation_id) {
      const { data: formation, error: formationError } = await supabase
        .from('formations')
        .select('id, titre, ecole')
        .eq('id', etudiant.formation_id)
        .maybeSingle();

      if (!formationError && formation) {
        formationData = formation;
      }
    }

    // Formater les données
    const result = {
      id: etudiant.id,
      user_id: etudiant.user_id,
      formation_id: etudiant.formation_id,
      nom: candidature?.nom || '',
      prenom: candidature?.prenom || '',
      photo_profil_url: photoProfilUrl,
      formation: formationData,
      created_at: etudiant.created_at,
      updated_at: etudiant.updated_at,
    };

    return NextResponse.json({
      success: true,
      profile: result,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/profile:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

