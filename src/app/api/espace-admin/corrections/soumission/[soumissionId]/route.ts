import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET - Récupérer les détails d'une soumission d'étude de cas pour correction
 * Inclut : questions, réponses de l'étudiant, contexte, fichiers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ soumissionId: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const { soumissionId } = await params;
    const soumissionIdNum = parseInt(soumissionId, 10);

    if (isNaN(soumissionIdNum)) {
      return NextResponse.json({ error: 'ID de soumission invalide' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est admin
    const { data: admin, error: adminError } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer la soumission avec toutes les informations
    const { data: soumission, error: soumissionError } = await supabase
      .from('soumissions_etude_cas')
      .select(`
        id,
        etude_cas_id,
        user_id,
        fichier_soumis,
        fichiers_globaux,
        commentaire_etudiant,
        reponses_json,
        statut,
        date_soumission,
        note,
        commentaire_correcteur,
        date_correction,
        correcteur_id,
        etudes_cas (
          id,
          cours_id,
          titre,
          description,
          consigne,
          fichier_consigne,
          nom_fichier_consigne,
          date_limite,
          points_max,
          cours_apprentissage (
            id,
            titre,
            bloc_id,
            blocs_competences (
              id,
              numero_bloc,
              titre,
              formation_id,
              formations (
                id,
                titre,
                ecole
              )
            )
          )
        )
      `)
      .eq('id', soumissionIdNum)
      .maybeSingle();

    if (soumissionError || !soumission) {
      return NextResponse.json(
        { error: 'Soumission non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les informations de l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id, user_id')
      .eq('user_id', soumission.user_id)
      .maybeSingle();

    // Récupérer les informations utilisateur depuis auth.users et candidatures
    let nom = '';
    let prenom = '';
    let email = '';
    
    if (etudiant) {
      // Récupérer l'email depuis auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(soumission.user_id);
      
      // Récupérer les informations depuis candidatures
      const { data: candidature } = await supabase
        .from('candidatures')
        .select('nom, prenom, email')
        .eq('user_id', soumission.user_id)
        .maybeSingle();

      nom = candidature?.nom || '';
      prenom = candidature?.prenom || '';
      email = authUser?.user?.email || candidature?.email || '';
    }

    // Récupérer toutes les questions de l'étude de cas
    const { data: questions, error: questionsError } = await supabase
      .from('questions_etude_cas')
      .select(`
        id,
        etude_cas_id,
        question,
        type_question,
        contenu_question,
        image_url,
        video_url,
        fichier_question,
        points,
        ordre_affichage,
        actif,
        reponses_possibles_etude_cas (
          id,
          question_id,
          reponse,
          est_correcte,
          ordre_affichage
        )
      `)
      .eq('etude_cas_id', soumission.etude_cas_id)
      .eq('actif', true)
      .order('ordre_affichage', { ascending: true });

    if (questionsError) {
      console.error('Erreur lors de la récupération des questions:', questionsError);
    }

    // Récupérer les réponses détaillées de l'étudiant (si elles existent dans reponses_etude_cas)
    const { data: reponsesDetaillees, error: reponsesError } = await supabase
      .from('reponses_etude_cas')
      .select('*')
      .eq('soumission_id', soumissionIdNum);

    // Récupérer les corrections existantes
    const { data: corrections, error: correctionsError } = await supabase
      .from('corrections_etude_cas')
      .select('*')
      .eq('soumission_id', soumissionIdNum);

    // Parser les réponses JSON si elles existent
    let reponsesParsed: Record<string, any> = {};
    let metadataCorrection: { note_document_externe?: number; commentaire_document_externe?: string } | null = null;
    if (soumission.reponses_json) {
      try {
        const parsed = typeof soumission.reponses_json === 'string' 
          ? JSON.parse(soumission.reponses_json) 
          : soumission.reponses_json;
        
        // Extraire les métadonnées de correction du document externe si elles existent
        if (parsed.metadata_correction) {
          metadataCorrection = {
            note_document_externe: parsed.metadata_correction.note_document_externe,
            commentaire_document_externe: parsed.metadata_correction.commentaire_document_externe
          };
          // Ne pas inclure metadata_correction dans reponsesParsed pour éviter les conflits
          reponsesParsed = { ...parsed };
          delete reponsesParsed.metadata_correction;
        } else {
          reponsesParsed = parsed;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des réponses JSON:', e);
      }
    }

    // Organiser les corrections par question_id
    const correctionsByQuestion = (corrections || []).reduce((acc: any, corr: any) => {
      acc[corr.question_id] = corr;
      return acc;
    }, {});

    // Organiser les réponses détaillées par question_id
    const reponsesByQuestion = (reponsesDetaillees || []).reduce((acc: any, rep: any) => {
      acc[rep.question_id] = rep;
      return acc;
    }, {});

    // Construire les questions avec leurs réponses et corrections
    const questionsAvecReponses = await Promise.all((questions || []).map(async (q: any) => {
      const reponseEtudiant = reponsesByQuestion[q.id];
      const correction = correctionsByQuestion[q.id] || null;

      let reponseAffichee = null;
      
      // Priorité : reponses_etude_cas > reponses_json
      if (reponseEtudiant) {
        if (q.type_question === 'ouverte') {
          reponseAffichee = reponseEtudiant.reponse_texte || '';
        } else if (q.type_question === 'piece_jointe') {
          // Générer l'URL signée pour le fichier
          if (reponseEtudiant.fichier_reponse) {
            const { data: fichierData } = await supabase.storage
              .from('etudes_cas')
              .createSignedUrl(reponseEtudiant.fichier_reponse, 3600);
            reponseAffichee = fichierData?.signedUrl || null;
          } else {
            // Fallback sur fichier_soumis si pas de fichier spécifique
            reponseAffichee = null;
          }
        } else if (q.type_question === 'choix_unique' || q.type_question === 'vrai_faux') {
          reponseAffichee = reponseEtudiant.reponse_choix_id || null;
        } else if (q.type_question === 'choix_multiple') {
          reponseAffichee = reponseEtudiant.reponse_choix_ids || [];
        }
      } else if (reponsesParsed[q.id] !== undefined && reponsesParsed[q.id] !== null) {
        // Fallback sur reponses_json
        reponseAffichee = reponsesParsed[q.id];
        
        // Pour les pièces jointes, essayer de générer l'URL depuis fichier_soumis
        if (q.type_question === 'piece_jointe' && soumission.fichier_soumis) {
          try {
            // Si fichier_soumis est un JSON (plusieurs fichiers), parser
            let fichierPath = soumission.fichier_soumis;
            try {
              const parsed = JSON.parse(fichierPath);
              if (Array.isArray(parsed) && parsed.length > 0) {
                fichierPath = parsed[0]; // Prendre le premier fichier
              }
            } catch {
              // Ce n'est pas un JSON, utiliser tel quel
            }
            
            const { data: fichierData } = await supabase.storage
              .from('etudes_cas')
              .createSignedUrl(fichierPath, 3600);
            reponseAffichee = fichierData?.signedUrl || null;
          } catch (e) {
            console.error('Erreur lors de la génération de l\'URL du fichier:', e);
          }
        }
      }

      return {
        ...q,
        reponse_etudiant: reponseAffichee,
        correction: correction ? {
          note_attribuee: correction.note_attribuee,
          note_max: correction.note_max,
          commentaire_correction: correction.commentaire_correction
        } : null
      };
    }));

    const etudeCas = soumission.etudes_cas as any;
    const cours = etudeCas?.cours_apprentissage as any;
    const bloc = cours?.blocs_competences as any;
    const formation = bloc?.formations as any;

    // Générer les URLs signées pour les fichiers
    let fichierConsigneUrl = null;
    if (etudeCas?.fichier_consigne) {
      try {
        // Essayer d'abord avec le bucket 'etudes-cas-consignes' (bucket standard pour les consignes)
        let consigneData = await supabase.storage
          .from('etudes-cas-consignes')
          .createSignedUrl(etudeCas.fichier_consigne, 3600);
        
        if (consigneData.error) {
          // Si ça échoue, essayer avec 'etudes_cas'
          consigneData = await supabase.storage
            .from('etudes_cas')
            .createSignedUrl(etudeCas.fichier_consigne, 3600);
        }
        
        fichierConsigneUrl = consigneData.data?.signedUrl || null;
        
        if (!fichierConsigneUrl) {
          console.error('Impossible de générer l\'URL signée pour le fichier consigne:', etudeCas.fichier_consigne);
        }
      } catch (error) {
        console.error('Erreur lors de la génération de l\'URL du fichier consigne:', error);
        fichierConsigneUrl = null;
      }
    }

    let fichierSoumisUrl = null;
    if (soumission.fichier_soumis) {
      const { data: soumisData } = await supabase.storage
        .from('etudes_cas')
        .createSignedUrl(soumission.fichier_soumis, 3600);
      fichierSoumisUrl = soumisData?.signedUrl || null;
    }

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
        etudiant: {
          nom,
          prenom,
          email
        },
        date_soumission: soumission.date_soumission,
        commentaire_etudiant: soumission.commentaire_etudiant,
        fichier_soumis: fichierSoumisUrl,
        fichiers_globaux: fichiersGlobauxUrls, // URLs des fichiers globaux
        statut: soumission.statut,
        note: soumission.note,
        commentaire_correcteur: soumission.commentaire_correcteur,
        note_document_externe: metadataCorrection?.note_document_externe ?? null,
        commentaire_document_externe: metadataCorrection?.commentaire_document_externe ?? null
      },
      etude_cas: {
        id: etudeCas?.id,
        titre: etudeCas?.titre,
        description: etudeCas?.description,
        consigne: etudeCas?.consigne || null, // S'assurer que consigne est bien retourné même si null
        fichier_consigne: fichierConsigneUrl, // URL signée générée ou null
        nom_fichier_consigne: etudeCas?.nom_fichier_consigne || null,
        date_limite: etudeCas?.date_limite || null,
        points_max: etudeCas?.points_max || 20
      },
      cours: {
        id: cours?.id,
        titre: cours?.titre
      },
      bloc: {
        id: bloc?.id,
        numero_bloc: bloc?.numero_bloc,
        titre: bloc?.titre
      },
      formation: {
        id: formation?.id,
        titre: formation?.titre,
        ecole: formation?.ecole
      },
      questions: questionsAvecReponses
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-admin/corrections/soumission/[soumissionId]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

