import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { logCreate, logUpdate } from '@/lib/audit-logger';

// GET - Récupérer une étude de cas par chapitre
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const chapitreId = searchParams.get('chapitreId');
    const etudeCasId = searchParams.get('etudeCasId');

    if (!chapitreId && !etudeCasId) {
      return NextResponse.json({ error: 'chapitreId ou etudeCasId requis' }, { status: 400 });
    }

    let query = supabase
      .from('etudes_cas')
      .select('*')
      .eq('actif', true);

    if (etudeCasId) {
      query = query.eq('id', etudeCasId);
    } else {
      query = query.eq('chapitre_id', chapitreId);
    }

    const { data: etudeCas, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucune étude de cas trouvée
        return NextResponse.json({ etudeCas: null, questions: [], supportsAnnexes: [] });
      }
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Récupérer les questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions_etude_cas')
      .select(`
        *,
        reponses_possibles:reponses_possibles_etude_cas(*)
      `)
      .eq('etude_cas_id', etudeCas.id)
      .eq('actif', true)
      .order('ordre_affichage');

    if (questionsError) {
      console.error('Erreur lors de la récupération des questions:', questionsError);
    }

    return NextResponse.json({
      etudeCas,
      questions: questions || [],
    });
  } catch (error) {
    console.error('Erreur dans GET /api/etude-cas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle étude de cas
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { chapitre_id, titre, description, consigne, fichier_consigne, date_limite, points_max, criteres_evaluation } = body;

    if (!chapitre_id || !consigne) {
      return NextResponse.json({ error: 'chapitre_id et consigne requis' }, { status: 400 });
    }

    const { data: etudeCas, error } = await supabase
      .from('etudes_cas')
      .insert({
        chapitre_id,
        titre: titre || `Étude de cas - Chapitre ${chapitre_id}`,
        description,
        consigne,
        fichier_consigne,
        date_limite,
        points_max: points_max || 100,
        criteres_evaluation,
        actif: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'étude de cas:', error);
      await logCreate(request, 'etudes_cas', 'unknown', { chapitre_id, titre, description }, `Échec de création d'étude de cas: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    await logCreate(request, 'etudes_cas', etudeCas.id, etudeCas, `Création de l'étude de cas "${etudeCas.titre}"`).catch(() => {});

    return NextResponse.json({ etudeCas });
  } catch (error) {
    console.error('Erreur dans POST /api/etude-cas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Mettre à jour une étude de cas
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { etudeCasId, titre, description, consigne, fichier_consigne, date_limite, points_max, criteres_evaluation } = body;

    if (!etudeCasId) {
      return NextResponse.json({ error: 'etudeCasId requis' }, { status: 400 });
    }

    // Récupérer l'ancienne étude de cas pour le log
    const { data: oldEtudeCas } = await supabase
      .from('etudes_cas')
      .select('*')
      .eq('id', etudeCasId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description;
    if (consigne !== undefined) updateData.consigne = consigne;
    if (fichier_consigne !== undefined) updateData.fichier_consigne = fichier_consigne;
    if (date_limite !== undefined) updateData.date_limite = date_limite;
    if (points_max !== undefined) updateData.points_max = points_max;
    if (criteres_evaluation !== undefined) updateData.criteres_evaluation = criteres_evaluation;

    const { data: etudeCas, error } = await supabase
      .from('etudes_cas')
      .update(updateData)
      .eq('id', etudeCasId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'étude de cas:', error);
      await logUpdate(request, 'etudes_cas', etudeCasId, oldEtudeCas || {}, updateData, Object.keys(updateData), `Échec de mise à jour d'étude de cas: ${error.message}`).catch(() => {});
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    await logUpdate(request, 'etudes_cas', etudeCasId, oldEtudeCas || {}, etudeCas, Object.keys(updateData), `Mise à jour de l'étude de cas "${etudeCas.titre || etudeCasId}"`).catch(() => {});

    return NextResponse.json({ etudeCas });
  } catch (error) {
    console.error('Erreur dans PUT /api/etude-cas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

