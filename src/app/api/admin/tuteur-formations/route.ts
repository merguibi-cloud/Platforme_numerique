import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Récupérer les formations assignées à un tuteur (pour préremplir l'édition)
// Query param: id=tuteur_{tuteurId}
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) return adminResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !id.startsWith('tuteur_')) {
      return NextResponse.json({ success: true, formation_ids: [] });
    }

    const tuteurId = id.replace('tuteur_', '');
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('tuteur_formations')
      .select('formation_id')
      .eq('tuteur_id', tuteurId);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      formation_ids: (data || []).map((row) => row.formation_id),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
