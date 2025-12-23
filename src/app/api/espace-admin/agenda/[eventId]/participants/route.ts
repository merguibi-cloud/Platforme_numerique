import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * GET - Récupérer les participants d'un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const supabase = getSupabaseServerClient();
    const { eventId } = await params;

    // Récupérer les participants
    const { data: participants, error } = await supabase
      .from('agenda_participants')
      .select('id, user_id, statut, created_at')
      .eq('agenda_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des participants' },
        { status: 500 }
      );
    }

    // Récupérer les informations des utilisateurs depuis la table administrateurs
    const userIds = participants?.map(p => p.user_id) || [];
    
    // Essayer de récupérer avec photo_profil, sinon sans
    let users: any[] = [];
    let usersWithPhoto = users;
    
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('administrateurs')
        .select('user_id, nom, prenom, photo_profil')
        .in('user_id', userIds);
      
      if (!usersError && usersData) {
        usersWithPhoto = usersData;
      }
    } catch (error: any) {
      // Si la colonne photo_profil n'existe pas, récupérer sans
      if (error?.code === '42703' || error?.message?.includes('photo_profil')) {
        const { data: usersData, error: usersError } = await supabase
          .from('administrateurs')
          .select('user_id, nom, prenom')
          .in('user_id', userIds);
        
        if (!usersError && usersData) {
          usersWithPhoto = usersData.map(u => ({ ...u, photo_profil: null }));
        }
      } else {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    }

    // Formater les participants avec les informations utilisateur
    const userMap = new Map(usersWithPhoto.map(u => [u.user_id, u]));
    const formattedParticipants = participants?.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      statut: p.statut,
      user: userMap.get(p.user_id) ? {
        nom: userMap.get(p.user_id)?.nom,
        prenom: userMap.get(p.user_id)?.prenom,
        photo_profil: userMap.get(p.user_id)?.photo_profil || null,
      } : null,
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedParticipants,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-admin/agenda/[eventId]/participants:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

