import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer les détails d'un étudiant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou superadmin requis)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant par id
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations utilisateur depuis auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(etudiant.user_id);

    // Récupérer les informations depuis candidatures
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', etudiant.user_id)
      .maybeSingle();

    // Récupérer la formation si elle existe
    let formationData = null;
    if (etudiant.formation_id) {
      const { data: formation, error: formationError } = await supabase
        .from('formations')
        .select('id, titre, ecole, type_formation, description')
        .eq('id', etudiant.formation_id)
        .maybeSingle();

      if (!formationError && formation) {
        formationData = formation;
      }
    }

    // Construire la réponse avec toutes les informations
    const result = {
      id: etudiant.id,
      user_id: etudiant.user_id,
      statut: etudiant.statut,
      date_inscription: etudiant.date_inscription,
      created_at: etudiant.created_at,
      updated_at: etudiant.updated_at,
      email: authUser?.user?.email || candidature?.email || '',
      telephone: candidature?.telephone || '',
      formation_id: etudiant.formation_id,
      formation: formationData,
      candidature: candidature ? {
        id: candidature.id,
        civilite: candidature.civilite || '',
        nom: candidature.nom || '',
        prenom: candidature.prenom || '',
        adresse: candidature.adresse || '',
        code_postal: candidature.code_postal || '',
        ville: candidature.ville || '',
        pays: candidature.pays || '',
        date_naissance: candidature.date_naissance || '',
        type_formation: candidature.type_formation || '',
        etudiant_etranger: candidature.etudiant_etranger || 'non',
        a_une_entreprise: candidature.a_une_entreprise || 'non',
        email: candidature.email || '',
        telephone: candidature.telephone || '',
        // Documents
        photo_identite_path: candidature.photo_identite_path,
        cv_path: candidature.cv_path,
        diplome_path: candidature.diplome_path,
        releves_paths: candidature.releves_paths || [],
        piece_identite_paths: candidature.piece_identite_paths || [],
        lettre_motivation_path: candidature.lettre_motivation_path,
        created_at: candidature.created_at,
        paid_at: candidature.paid_at,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

