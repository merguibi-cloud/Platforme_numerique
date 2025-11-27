import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer la dernière position de lecture d'un étudiant pour un cours
 * Retourne le dernier chapitre_id consulté pour ce cours
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const blocId = searchParams.get('blocId');

    if (!coursId || !blocId) {
      return NextResponse.json(
        { success: false, error: 'coursId et blocId sont requis' },
        { status: 400 }
      );
    }

    // Récupérer tous les chapitres du cours pour filtrer
    const { data: chapitresCours, error: chapitresError } = await supabase
      .from('chapitres_cours')
      .select('id')
      .eq('cours_id', parseInt(coursId))
      .eq('actif', true);

    if (chapitresError || !chapitresCours || chapitresCours.length === 0) {
      return NextResponse.json({
        success: true,
        chapitre_id: null,
        last_activity: null
      });
    }

    const chapitreIds = chapitresCours.map(c => c.id);

    // Récupérer la dernière progression enregistrée pour ce cours
    // On cherche dans notes_etudiants où evaluation_id correspond à un chapitre_id du cours
    const { data: lastProgression, error: progressionError } = await supabase
      .from('notes_etudiants')
      .select('evaluation_id, updated_at, date_evaluation')
      .eq('etudiant_id', etudiant.id)
      .eq('bloc_id', parseInt(blocId))
      .eq('type_evaluation', 'cours')
      .in('evaluation_id', chapitreIds)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Si on trouve une progression, retourner le chapitre_id
    if (lastProgression && lastProgression.evaluation_id) {
      return NextResponse.json({
        success: true,
        chapitre_id: lastProgression.evaluation_id,
        last_activity: lastProgression.updated_at || lastProgression.date_evaluation
      });
    }

    // Si pas de progression trouvée, retourner null
    return NextResponse.json({
      success: true,
      chapitre_id: null,
      last_activity: null
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/progression/last-position:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

