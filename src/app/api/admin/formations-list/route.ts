import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

// GET - Récupérer la liste de toutes les formations (pour l'attribution aux formateurs)
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) return authResult.error;
    const { user } = authResult;

    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) return adminResult.error;

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('formations')
      .select('id, titre, ecole, niveau')
      .order('ecole', { ascending: true })
      .order('titre', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des formations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, formations: data || [] });
  } catch {
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
