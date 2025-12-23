import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * DELETE - Supprimer un événement
 */
export async function DELETE(
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

    // Vérifier que l'événement appartient à l'utilisateur ou que l'utilisateur est admin
    const { data: event, error: eventError } = await supabase
      .from('agenda')
      .select('created_by')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    if (event.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'avez pas la permission de supprimer cet événement' },
        { status: 403 }
      );
    }

    // Supprimer l'événement (cascade supprimera les intervenants et fichiers)
    const { error: deleteError } = await supabase
      .from('agenda')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Erreur dans DELETE /api/espace-admin/agenda/[eventId]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

