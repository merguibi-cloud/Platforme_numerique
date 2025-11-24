import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer tous les étudiants
export async function GET(request: NextRequest) {
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

    const supabase = getSupabaseServerClient();

    // Récupérer tous les étudiants
    const { data: etudiants, error: etudiantsError } = await supabase
      .from('etudiants')
      .select(`
        id,
        user_id,
        formation_id,
        statut,
        date_inscription,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (etudiantsError) {
      console.error('Erreur récupération étudiants:', etudiantsError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des étudiants' },
        { status: 500 }
      );
    }

    // Récupérer les formations pour tous les étudiants
    const formationIds = (etudiants || [])
      .map(e => e.formation_id)
      .filter(Boolean) as number[];

    let formationsMap: Record<number, { titre: string; ecole: string }> = {};
    if (formationIds.length > 0) {
      const { data: formations, error: formationsError } = await supabase
        .from('formations')
        .select('id, titre, ecole')
        .in('id', formationIds);

      if (!formationsError && formations) {
        formationsMap = formations.reduce((acc, f) => {
          acc[f.id] = { titre: f.titre, ecole: f.ecole };
          return acc;
        }, {} as Record<number, { titre: string; ecole: string }>);
      }
    }

    // Récupérer les informations utilisateur depuis auth.users et candidatures pour chaque étudiant
    const etudiantsWithDetails = await Promise.all(
      (etudiants || []).map(async (etudiant: any) => {
        try {
          // Récupérer l'email depuis auth.users via user_id
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(etudiant.user_id);
          
          // Récupérer les informations depuis candidatures via user_id
          const { data: candidature } = await supabase
            .from('candidatures')
            .select('nom, prenom, email')
            .eq('user_id', etudiant.user_id)
            .maybeSingle();

          const nom = candidature?.nom || '';
          const prenom = candidature?.prenom || '';
          const email = authUser?.user?.email || candidature?.email || '';
          const name = nom && prenom ? `${prenom} ${nom}` : email.split('@')[0] || 'Utilisateur';

          const formationData = etudiant.formation_id ? formationsMap[etudiant.formation_id] : null;

          return {
            id: etudiant.id,
            user_id: etudiant.user_id,
            name,
            email,
            nom: nom || null,
            prenom: prenom || null,
            statut: etudiant.statut || 'inscrit',
            formation_id: etudiant.formation_id,
            formation: formationData?.titre || null,
            ecole: formationData?.ecole || null,
            date_inscription: etudiant.date_inscription 
              ? new Date(etudiant.date_inscription).toISOString().split('T')[0] 
              : null,
            created_at: etudiant.created_at,
          };
        } catch (error) {
          console.error('Erreur récupération détails étudiant:', error);
          const formationData = etudiant.formation_id ? formationsMap[etudiant.formation_id] : null;
          return {
            id: etudiant.id,
            user_id: etudiant.user_id,
            name: 'Utilisateur',
            email: '',
            nom: null,
            prenom: null,
            statut: etudiant.statut || 'inscrit',
            formation_id: etudiant.formation_id,
            formation: formationData?.titre || null,
            ecole: formationData?.ecole || null,
            date_inscription: etudiant.date_inscription 
              ? new Date(etudiant.date_inscription).toISOString().split('T')[0] 
              : null,
            created_at: etudiant.created_at,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      etudiants: etudiantsWithDetails,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

