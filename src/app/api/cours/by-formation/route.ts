import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou rôles pédagogie)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin', 'pedagogie']);
    if ('error' in permissionResult) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const formationId = searchParams.get('formationId');

    if (!formationId) {
      return NextResponse.json({ error: 'formationId requis' }, { status: 400 });
    }

    // Récupérer tous les cours de la formation via les blocs et modules
    const { data: blocs, error: blocsError } = await supabase
      .from('blocs_competences')
      .select('id')
      .eq('formation_id', parseInt(formationId))
      .eq('actif', true);

    if (blocsError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des blocs' }, { status: 500 });
    }

    const blocIds = blocs?.map(b => b.id) || [];
    
    if (blocIds.length === 0) {
      return NextResponse.json({ cours: [] });
    }

    // Récupérer tous les cours des blocs (même inactifs pour le dashboard admin)
    const { data: coursWithBlocs, error: coursWithBlocsError } = await supabase
      .from('cours_apprentissage')
      .select(`
        id,
        titre,
        bloc_id,
        statut,
        actif,
        created_at,
        updated_at,
        blocs_competences (
          id,
          titre,
          formation_id
        )
      `)
      .in('bloc_id', blocIds)
      // Pas de filtre actif pour le dashboard admin - on veut voir tous les cours
      .order('created_at', { ascending: false });

    if (coursWithBlocsError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des cours' }, { status: 500 });
    }

    // Formater les cours avec les informations nécessaires pour le dashboard
    const formattedCours = coursWithBlocs?.map(c => {
      const bloc = c.blocs_competences as any;
      
      // Déterminer le statut du cours
      // La table cours_apprentissage a: 'brouillon', 'en_ligne', 'manquant'
      // Pour le dashboard, on considère:
      // - 'en_ligne' → 'en_ligne' (affiché dans "EN LIGNE")
      // - 'brouillon' ou 'manquant' ou actif=false → 'en_cours_examen' (affiché dans "À VALIDER")
      let statut: 'brouillon' | 'en_cours_examen' | 'en_ligne' = 'en_cours_examen';
      if (c.statut === 'en_ligne' && c.actif === true) {
        statut = 'en_ligne';
      } else {
        // Tous les autres cas (brouillon, manquant, inactif) → en_cours_examen pour "À VALIDER"
        statut = 'en_cours_examen';
      }
      
      return {
        id: c.id,
        titre: c.titre || 'Cours sans titre',
        module: c.titre || 'Cours sans titre', // Le "module" est maintenant le cours lui-même
        bloc: bloc?.titre || 'Bloc inconnu',
        statut: statut,
        formation_id: bloc?.formation_id || parseInt(formationId),
        bloc_id: c.bloc_id || null,
        module_id: c.id, // Pour la compatibilité avec l'ancien format
        created_at: c.created_at,
        updated_at: c.updated_at,
      };
    }) || [];

    return NextResponse.json({ cours: formattedCours });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

