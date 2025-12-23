import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Endpoint léger pour vérifier les IDs des cours d'un bloc
 * Utilisé pour vérifier s'il y a de nouveaux cours sans charger toutes les données
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blocId: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { blocId } = await params;
    const blocIdNum = parseInt(blocId, 10);

    if (isNaN(blocIdNum)) {
      return NextResponse.json({ error: 'ID de bloc invalide' }, { status: 400 });
    }

    // Vérifier si c'est une requête de prévisualisation admin (paramètre preview=true)
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // Charger seulement les IDs et timestamps des cours
    let query = supabase
      .from('cours_apprentissage')
      .select('id, updated_at')
      .eq('bloc_id', blocIdNum)
      .eq('actif', true);

    if (!isPreview) {
      // Pour les étudiants, filtrer par statut 'en_ligne'
      query = query.eq('statut', 'en_ligne');
    }

    const { data: cours, error: coursError } = await query.order('ordre_affichage', { ascending: true });

    if (coursError) {
      console.error('Erreur lors de la récupération des cours:', coursError);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    if (!cours || cours.length === 0) {
      return NextResponse.json({ coursIds: [], cours: [] });
    }

    // Retourner seulement les IDs et timestamps
    const coursIds = cours.map(c => ({
      id: c.id,
      updated_at: c.updated_at
    }));

    return NextResponse.json({ 
      coursIds: cours.map(c => c.id),
      cours: coursIds
    });
  } catch (error) {
    console.error('Erreur dans l\'API blocs cours-ids:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
