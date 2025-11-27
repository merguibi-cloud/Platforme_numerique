import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * POST - Se désinscrire d'un événement
 */
export async function POST(
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

    // Vérifier que c'est un événement
    const { data: event, error: eventError } = await supabase
      .from('agenda')
      .select('type_event')
      .eq('id', eventId)
      .single();

    if (eventError || !event || event.type_event !== 'evenement') {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'est pas un événement' },
        { status: 400 }
      );
    }

    // Supprimer la participation
    const { error: deleteError } = await supabase
      .from('agenda_participants')
      .delete()
      .eq('agenda_id', eventId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la désinscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-admin/agenda/[eventId]/desinscrire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

