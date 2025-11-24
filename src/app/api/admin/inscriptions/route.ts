import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer les leads et candidats depuis user_profiles
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

    // Récupérer les leads (role = 'lead')
    const { data: leads, error: leadsError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        email,
        telephone,
        role,
        formation_id,
        created_at,
        updated_at
      `)
      .eq('role', 'lead')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Erreur récupération leads:', leadsError);
    }

    // Récupérer les candidats (role = 'candidat')
    const { data: candidats, error: candidatsError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        email,
        telephone,
        role,
        formation_id,
        created_at,
        updated_at
      `)
      .eq('role', 'candidat')
      .order('created_at', { ascending: false });

    if (candidatsError) {
      console.error('Erreur récupération candidats:', candidatsError);
    }

    // Récupérer les noms et prénoms depuis la table candidatures pour les user_id
    const allUserIds = [
      ...(leads || []).map(l => l.user_id),
      ...(candidats || []).map(c => c.user_id)
    ].filter(Boolean) as string[];

    let candidaturesMap: Record<string, { nom: string; prenom: string }> = {};
    if (allUserIds.length > 0) {
      const { data: candidatures, error: candidaturesError } = await supabase
        .from('candidatures')
        .select('user_id, nom, prenom')
        .in('user_id', allUserIds);

      if (!candidaturesError && candidatures) {
        candidaturesMap = candidatures.reduce((acc, c) => {
          if (c.user_id && c.nom && c.prenom) {
            acc[c.user_id] = { nom: c.nom, prenom: c.prenom };
          }
          return acc;
        }, {} as Record<string, { nom: string; prenom: string }>);
      }
    }

    // Récupérer les formations pour les leads et candidats
    const formationIds = [
      ...(leads || []).map(l => l.formation_id).filter(Boolean),
      ...(candidats || []).map(c => c.formation_id).filter(Boolean)
    ].filter((id, index, self) => self.indexOf(id) === index) as number[];

    let formationsMap: Record<number, string> = {};
    if (formationIds.length > 0) {
      const { data: formations, error: formationsError } = await supabase
        .from('formations')
        .select('id, titre')
        .in('id', formationIds);

      if (!formationsError && formations) {
        formationsMap = formations.reduce((acc, f) => {
          acc[f.id] = f.titre;
          return acc;
        }, {} as Record<number, string>);
      }
    }

    // Formater les données pour le frontend
    const formattedLeads = (leads || []).map(lead => {
      const candidature = lead.user_id ? candidaturesMap[lead.user_id] : null;
      const name = candidature 
        ? `${candidature.prenom} ${candidature.nom}` 
        : lead.email?.split('@')[0] || 'Utilisateur';
      
      return {
        id: lead.id,
        user_id: lead.user_id,
        name,
        email: lead.email || '',
        status: 'nouveau', // Par défaut pour les leads
        formation: lead.formation_id ? (formationsMap[lead.formation_id] || `Formation #${lead.formation_id}`) : '-',
        date: lead.created_at ? new Date(lead.created_at).toISOString().split('T')[0] : '',
      };
    });

    const formattedCandidats = (candidats || []).map(candidat => {
      const candidature = candidat.user_id ? candidaturesMap[candidat.user_id] : null;
      const name = candidature 
        ? `${candidature.prenom} ${candidature.nom}` 
        : candidat.email?.split('@')[0] || 'Utilisateur';
      
      return {
        id: candidat.id,
        user_id: candidat.user_id,
        name,
        email: candidat.email || '',
        status: 'en_attente', // Par défaut pour les candidats (peut être amélioré avec un champ status dans la table)
        formation: candidat.formation_id ? (formationsMap[candidat.formation_id] || `Formation #${candidat.formation_id}`) : '-',
        date: candidat.created_at ? new Date(candidat.created_at).toISOString().split('T')[0] : '',
      };
    });

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      candidats: formattedCandidats,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

