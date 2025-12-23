import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * POST - S'inscrire à un événement
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

    // Vérifier si l'utilisateur est déjà inscrit
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
      return NextResponse.json(
        { success: false, error: 'Vous êtes déjà inscrit à cet événement' },
        { status: 400 }
      );
    }

    // Créer la participation
    const { error: insertError } = await supabase
      .from('agenda_participants')
      .insert({
        agenda_id: eventId,
        user_id: user.id,
        statut: 'inscrit',
      });

    if (insertError) {
      console.error('Erreur lors de l\'insertion:', insertError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-admin/agenda/[eventId]/inscrire:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

