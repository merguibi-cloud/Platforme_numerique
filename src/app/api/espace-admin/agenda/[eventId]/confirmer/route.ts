import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * POST - Confirmer un rappel
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

    // Vérifier que c'est un rappel
    const { data: event, error: eventError } = await supabase
      .from('agenda')
      .select('type_event')
      .eq('id', eventId)
      .single();

    if (eventError || !event || event.type_event !== 'rappel') {
      return NextResponse.json(
        { success: false, error: 'Cet événement n\'est pas un rappel' },
        { status: 400 }
      );
    }

    // Créer ou mettre à jour la participation
    const { data: existing, error: checkError } = await supabase
      .from('agenda_participants')
      .select('id')
      .eq('agenda_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification:', checkError);
    }

    if (existing) {
      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('agenda_participants')
        .update({ statut: 'confirme' })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la confirmation' },
          { status: 500 }
        );
      }
    } else {
      // Créer la participation
      const { error: insertError } = await supabase
        .from('agenda_participants')
        .insert({
          agenda_id: eventId,
          user_id: user.id,
          statut: 'confirme',
        });

      if (insertError) {
        console.error('Erreur lors de l\'insertion:', insertError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la confirmation' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-admin/agenda/[eventId]/confirmer:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

