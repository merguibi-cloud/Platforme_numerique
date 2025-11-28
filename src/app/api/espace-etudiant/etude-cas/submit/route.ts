import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST - Soumettre une étude de cas (créer une soumission avec fichiers)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    const formData = await request.formData();
    const etude_cas_id = formData.get('etude_cas_id');
    const reponses = formData.get('reponses'); // JSON string
    const commentaire_etudiant = formData.get('commentaire_etudiant') as string | null;

    if (!etude_cas_id) {
      return NextResponse.json(
        { success: false, error: 'etude_cas_id est requis' },
        { status: 400 }
      );
    }

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

    // Vérifier si une soumission existe déjà
    const { data: soumissionExistante } = await supabase
      .from('soumissions_etude_cas')
      .select('id')
      .eq('etude_cas_id', parseInt(etude_cas_id as string))
      .eq('user_id', user.id)
      .maybeSingle();

    if (soumissionExistante) {
      return NextResponse.json(
        { success: false, error: 'Une soumission existe déjà pour cette étude de cas' },
        { status: 400 }
      );
    }

    // Uploader les fichiers si présents et les associer aux questions
    let fichierSoumisPath = null;
    let validPaths: string[] = [];
    const files = formData.getAll('files') as File[];
    const fileQuestionMap: { [questionId: string]: string[] } = {}; // questionId -> filePaths
    
    // Récupérer le mapping questionId -> index de fichier
    let fileQuestionMapping: { [index: number]: number } = {};
    const mappingStr = formData.get('file_question_mapping') as string | null;
    if (mappingStr) {
      try {
        fileQuestionMapping = JSON.parse(mappingStr);
      } catch (e) {
        console.error('Erreur lors du parsing du mapping fichier-question:', e);
      }
    }
    
    if (files && files.length > 0) {
      // Créer un dossier pour cette soumission
      const timestamp = Date.now();
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${etude_cas_id}_${user.id}_${timestamp}_${index}.${fileExt}`;
        const filePath = `soumissions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('etudes_cas')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erreur lors de l\'upload du fichier:', uploadError);
          return { path: null, questionId: null };
        }

        // Récupérer la questionId associée à ce fichier depuis le mapping
        const questionId = fileQuestionMapping[index] || null;
        
        return { path: filePath, questionId: questionId ? questionId.toString() : null };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      
      // Organiser les fichiers par questionId
      uploadedResults.forEach((result) => {
        if (result.path && result.questionId) {
          if (!fileQuestionMap[result.questionId]) {
            fileQuestionMap[result.questionId] = [];
          }
          fileQuestionMap[result.questionId].push(result.path);
          validPaths.push(result.path);
        } else if (result.path) {
          // Fichier sans questionId (fallback)
          validPaths.push(result.path);
        }
      });
      
      if (validPaths.length > 0) {
        // Si plusieurs fichiers, on peut les stocker dans un tableau ou prendre le premier
        fichierSoumisPath = validPaths.length === 1 ? validPaths[0] : JSON.stringify(validPaths);
      }
    }

    // Parser les réponses
    let reponsesParsed: Record<string, any> = {};
    if (reponses) {
      try {
        reponsesParsed = typeof reponses === 'string' ? JSON.parse(reponses) : reponses;
      } catch (e) {
        console.error('Erreur lors du parsing des réponses:', e);
      }
    }

    // Créer la soumission
    const { data: soumission, error: soumissionError } = await supabase
      .from('soumissions_etude_cas')
      .insert({
        etude_cas_id: parseInt(etude_cas_id as string),
        user_id: user.id,
        fichier_soumis: fichierSoumisPath,
        commentaire_etudiant: commentaire_etudiant,
        reponses_json: reponsesParsed, // Stocker les réponses en JSON
        statut: 'en_attente',
        date_soumission: new Date().toISOString()
      })
      .select()
      .single();

    if (soumissionError) {
      console.error('Erreur lors de la création de la soumission:', soumissionError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la soumission de l\'étude de cas' },
        { status: 500 }
      );
    }

    // Récupérer les questions de l'étude de cas pour enregistrer les réponses
    const { data: questions, error: questionsError } = await supabase
      .from('questions_etude_cas')
      .select('id, type_question')
      .eq('etude_cas_id', parseInt(etude_cas_id as string))
      .eq('actif', true);

    // Enregistrer les réponses dans reponses_etude_cas
    if (questions && questions.length > 0 && Object.keys(reponsesParsed).length > 0) {
      const reponsesToInsert = [];
      
      for (const question of questions) {
        const reponse = reponsesParsed[question.id];
        if (reponse === undefined || reponse === null) continue;

        const reponseData: any = {
          soumission_id: soumission.id,
          question_id: question.id
        };

        if (question.type_question === 'ouverte') {
          reponseData.reponse_texte = typeof reponse === 'string' ? reponse : '';
        } else if (question.type_question === 'piece_jointe') {
          // Pour les pièces jointes, on utilise le fichier_soumis de la soumission
          // ou on peut stocker le chemin du fichier si plusieurs fichiers par question
          // Pour l'instant, on laisse vide car les fichiers sont dans fichier_soumis
          continue; // Les fichiers sont gérés via fichier_soumis dans soumissions_etude_cas
        } else if (question.type_question === 'choix_unique' || question.type_question === 'vrai_faux') {
          reponseData.reponse_choix_id = typeof reponse === 'number' ? reponse : parseInt(reponse);
        } else if (question.type_question === 'choix_multiple') {
          const reponseIds = Array.isArray(reponse) ? reponse : [reponse];
          reponseData.reponse_choix_ids = reponseIds.map((id: any) => typeof id === 'number' ? id : parseInt(id));
        }

        reponsesToInsert.push(reponseData);
      }

      // Insérer toutes les réponses en une seule fois
      if (reponsesToInsert.length > 0) {
        const { error: reponsesError } = await supabase
          .from('reponses_etude_cas')
          .insert(reponsesToInsert);

        if (reponsesError) {
          console.error('Erreur lors de l\'enregistrement des réponses:', reponsesError);
          // Ne pas échouer la soumission si les réponses ne peuvent pas être enregistrées
          // car elles sont déjà dans reponses_json
        }
      }
    }

    // Gérer les fichiers uploadés pour les questions de type piece_jointe
    // Associer les fichiers aux questions en utilisant fileQuestionMap
    if (Object.keys(fileQuestionMap).length > 0 && questions) {
      const reponsesFichiers: any[] = [];
      
      // Pour chaque questionId dans fileQuestionMap, créer une entrée dans reponses_etude_cas
      Object.entries(fileQuestionMap).forEach(([questionIdStr, filePaths]) => {
        const questionId = parseInt(questionIdStr);
        const question = questions.find(q => q.id === questionId);
        
        if (question && question.type_question === 'piece_jointe' && filePaths.length > 0) {
          // Prendre le premier fichier (ou tous si besoin)
          const fichierPath = filePaths.length === 1 ? filePaths[0] : JSON.stringify(filePaths);
          
          reponsesFichiers.push({
            soumission_id: soumission.id,
            question_id: questionId,
            fichier_reponse: fichierPath
          });
        }
      });

      if (reponsesFichiers.length > 0) {
        const { error: fichiersError } = await supabase
          .from('reponses_etude_cas')
          .upsert(reponsesFichiers, { onConflict: 'soumission_id,question_id' });

        if (fichiersError) {
          console.error('Erreur lors de l\'enregistrement des fichiers:', fichiersError);
        }
      }
    }

    // Récupérer le cours et le bloc pour créer une note
    const { data: etudeCas } = await supabase
      .from('etudes_cas')
      .select('cours_id')
      .eq('id', parseInt(etude_cas_id as string))
      .single();

    if (etudeCas) {
      const { data: cours } = await supabase
        .from('cours_apprentissage')
        .select('bloc_id')
        .eq('id', etudeCas.cours_id)
        .single();

      if (cours) {
        // Créer ou mettre à jour une note en attente de correction (une seule note par étude de cas)
        // Vérifier si une note existe déjà
        const { data: noteExistante } = await supabase
          .from('notes_etudiants')
          .select('id')
          .eq('etudiant_id', etudiant.id)
          .eq('type_evaluation', 'etude_cas')
          .eq('evaluation_id', parseInt(etude_cas_id as string))
          .maybeSingle();

        if (noteExistante) {
          // Mettre à jour la note existante (écrase l'ancienne)
          await supabase
            .from('notes_etudiants')
            .update({
              note: 0, // Note à définir par le correcteur
              note_max: 20,
              numero_tentative: 1,
              date_evaluation: new Date().toISOString()
            })
            .eq('id', noteExistante.id);
        } else {
          // Créer une nouvelle note
          await supabase
            .from('notes_etudiants')
            .insert({
              etudiant_id: etudiant.id,
              bloc_id: cours.bloc_id,
              type_evaluation: 'etude_cas',
              evaluation_id: parseInt(etude_cas_id as string),
              note: 0, // Note à définir par le correcteur
              note_max: 20,
              numero_tentative: 1,
              date_evaluation: new Date().toISOString()
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      soumission: {
        id: soumission.id,
        statut: soumission.statut,
        date_soumission: soumission.date_soumission
      }
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-etudiant/etude-cas/submit:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

