import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

/**
 * Endpoint optimisé pour charger uniquement les informations de base des cours d'un bloc
 * Utilisé pour la page de sélection des cours (pas besoin de chapitres, quiz, etc.)
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

    // Charger seulement les informations de base des cours (sans chapitres, quiz, etc.)
    let query = supabase
      .from('cours_apprentissage')
      .select('id, titre, description, ordre_affichage, updated_at')
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
      return NextResponse.json({ cours: [] });
    }

    return NextResponse.json({ cours });
  } catch (error) {
    console.error('Erreur dans l\'API blocs cours-list:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
