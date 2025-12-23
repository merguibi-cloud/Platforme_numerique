import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer les réponses d'un étudiant pour une étude de cas déjà soumise
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ etudeCasId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { etudeCasId } = await params;
    const etudeCasIdNum = parseInt(etudeCasId, 10);

    if (isNaN(etudeCasIdNum)) {
      return NextResponse.json(
        { success: false, error: 'ID d\'étude de cas invalide' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Récupérer la soumission de l'étudiant pour cette étude de cas
    const { data: soumission, error: soumissionError } = await supabase
      .from('soumissions_etude_cas')
      .select('*, fichiers_globaux')
      .eq('etude_cas_id', etudeCasIdNum)
      .eq('user_id', user.id)
      .order('date_soumission', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (soumissionError || !soumission) {
      return NextResponse.json(
        { success: false, error: 'Aucune soumission trouvée pour cette étude de cas' },
        { status: 404 }
      );
    }

    // Récupérer les questions de l'étude de cas
    const { data: questions, error: questionsError } = await supabase
      .from('questions_etude_cas')
      .select(`
        *,
        reponses_possibles_etude_cas (*)
      `)
      .eq('etude_cas_id', etudeCasIdNum)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (questionsError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des questions' },
        { status: 500 }
      );
    }

    // Récupérer les réponses détaillées
    const { data: reponsesDetaillees, error: reponsesError } = await supabase
      .from('reponses_etude_cas')
      .select('*')
      .eq('soumission_id', soumission.id);

    // Parser les réponses JSON si elles existent
    let reponsesParsed: Record<string, any> = {};
    if (soumission.reponses_json) {
      try {
        // Si c'est déjà un objet, l'utiliser directement, sinon parser
        if (typeof soumission.reponses_json === 'string') {
          reponsesParsed = JSON.parse(soumission.reponses_json);
        } else {
          reponsesParsed = soumission.reponses_json;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des réponses JSON:', e);
      }
    }

    // Construire les questions avec leurs réponses
    const questionsAvecReponses = (questions || []).map((q: any) => {
      const reponseEtudiant = reponsesDetaillees?.find((r: any) => r.question_id === q.id);
      let reponseAffichee = null;

      if (reponseEtudiant) {
        if (q.type_question === 'ouverte') {
          reponseAffichee = reponseEtudiant.reponse_texte || '';
        } else if (q.type_question === 'piece_jointe') {
          reponseAffichee = reponseEtudiant.fichier_reponse || null;
        } else if (q.type_question === 'choix_unique' || q.type_question === 'vrai_faux') {
          reponseAffichee = reponseEtudiant.reponse_choix_id || null;
        } else if (q.type_question === 'choix_multiple') {
          reponseAffichee = reponseEtudiant.reponse_choix_ids || [];
        }
      } else if (reponsesParsed[q.id] !== undefined && reponsesParsed[q.id] !== null) {
        reponseAffichee = reponsesParsed[q.id];
      }

      return {
        ...q,
        reponse_etudiant: reponseAffichee ? {
          reponse_texte: q.type_question === 'ouverte' ? reponseAffichee : null,
          fichier_reponse: q.type_question === 'piece_jointe' ? reponseAffichee : null,
          reponse_choix_id: (q.type_question === 'choix_unique' || q.type_question === 'vrai_faux') ? reponseAffichee : null,
          reponse_choix_ids: q.type_question === 'choix_multiple' ? reponseAffichee : null
        } : null
      };
    });

    // Générer les URLs signées pour les fichiers globaux
    let fichiersGlobauxUrls: string[] = [];
    if (soumission.fichiers_globaux) {
      try {
        let fichiersPaths: string[] = [];
        
        // Parser si c'est un JSON, sinon utiliser directement
        if (typeof soumission.fichiers_globaux === 'string') {
          try {
            const parsed = JSON.parse(soumission.fichiers_globaux);
            fichiersPaths = Array.isArray(parsed) ? parsed : [soumission.fichiers_globaux];
          } catch {
            fichiersPaths = [soumission.fichiers_globaux];
          }
        } else if (Array.isArray(soumission.fichiers_globaux)) {
          fichiersPaths = soumission.fichiers_globaux;
        }
        
        // Générer les URLs signées pour chaque fichier
        for (const filePath of fichiersPaths) {
          const { data: urlData } = await supabase.storage
            .from('etudes_cas')
            .createSignedUrl(filePath, 3600);
          
          if (urlData?.signedUrl) {
            fichiersGlobauxUrls.push(urlData.signedUrl);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la génération des URLs des fichiers globaux:', error);
      }
    }

    return NextResponse.json({
      success: true,
      soumission: {
        id: soumission.id,
        note: soumission.note,
        statut: soumission.statut,
        date_soumission: soumission.date_soumission,
        commentaire_etudiant: soumission.commentaire_etudiant,
        fichiers_globaux: fichiersGlobauxUrls // URLs des fichiers globaux
      },
      questions: questionsAvecReponses
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/etude-cas/[etudeCasId]/reponses:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

