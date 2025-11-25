import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { logCreate, logUpdate } from '@/lib/audit-logger';

// GET - Récupérer une étude de cas par cours ou ID
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const etudeCasId = searchParams.get('etudeCasId');
    const coursId = searchParams.get('coursId');

    if (!coursId && !etudeCasId) {
      return NextResponse.json({ error: 'coursId ou etudeCasId requis' }, { status: 400 });
    }

    let query = supabase
      .from('etudes_cas')
      .select('*')
      .eq('actif', true);

    if (etudeCasId) {
      query = query.eq('id', etudeCasId);
    } else if (coursId) {
      // Pour un cours, chercher l'étude de cas associée au cours
      query = query.eq('cours_id', parseInt(coursId));
    }

    const { data: etudeCas, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucune étude de cas trouvée
        return NextResponse.json({ etudeCas: null, questions: [], supportsAnnexes: [] });
      }
      console.error('Erreur lors de la récupération de l\'étude de cas:', error);
      return NextResponse.json({ 
        error: 'Erreur serveur',
        details: error.message 
      }, { status: 500 });
    }

    // Si un fichier consigne existe, générer une URL signée si nécessaire
    let fichierConsigneUrl = etudeCas.fichier_consigne;
    if (etudeCas.fichier_consigne) {
      const bucketName = 'etudes-cas-consignes';
      
      // Vérifier si c'est une URL complète ou un chemin relatif
      const isFullUrl = etudeCas.fichier_consigne.startsWith('http://') || etudeCas.fichier_consigne.startsWith('https://');
      
      if (!isFullUrl) {
        // C'est un chemin relatif, générer une URL signée
        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(etudeCas.fichier_consigne, 60 * 60 * 24 * 365); // Valide 1 an
          
          if (!signedUrlError && signedUrlData?.signedUrl) {
            fichierConsigneUrl = signedUrlData.signedUrl;
          } else {
            // Si la génération de l'URL signée échoue, essayer l'URL publique
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(etudeCas.fichier_consigne);
            fichierConsigneUrl = urlData.publicUrl;
          }
        } catch (e) {
          console.error('Erreur lors de la génération de l\'URL signée:', e);
          // En cas d'erreur, utiliser l'URL originale
        }
      }
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

    // Retourner l'étude de cas avec l'URL du fichier mise à jour
    return NextResponse.json({
      etudeCas: {
        ...etudeCas,
        fichier_consigne: fichierConsigneUrl
      },
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

    const { cours_id, titre, description, consigne, fichier_consigne, date_limite, points_max, criteres_evaluation } = body;

    console.log('[POST /api/etude-cas] Données reçues:', { 
      cours_id,
      hasConsigne: !!consigne && consigne.trim().length > 0,
      hasFichierConsigne: !!fichier_consigne && fichier_consigne.trim().length > 0,
      consigneLength: consigne?.length || 0,
      fichierConsigneLength: fichier_consigne?.length || 0
    });

    if (!cours_id) {
      return NextResponse.json({ error: 'cours_id requis' }, { status: 400 });
    }

    // Vérifier s'il existe déjà une étude de cas pour ce cours
    // Il ne peut y avoir qu'une seule étude de cas par cours
    const { data: existingEtudeCas, error: checkError } = await supabase
      .from('etudes_cas')
      .select('id, titre, actif')
      .eq('cours_id', cours_id)
      .eq('actif', true)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'étude de cas existante:', checkError);
    }

    // Si une étude de cas existe déjà pour ce cours, la mettre à jour au lieu d'en créer une nouvelle
    if (existingEtudeCas) {
      console.log('[POST /api/etude-cas] Étude de cas existante trouvée, mise à jour au lieu de création:', existingEtudeCas.id);
      
      // Utiliser PUT pour mettre à jour l'étude de cas existante
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (titre !== undefined) updateData.titre = titre;
      if (description !== undefined) updateData.description = description;
      if (consigne !== undefined) updateData.consigne = consigne || '';
      if (fichier_consigne !== undefined) updateData.fichier_consigne = fichier_consigne;
      if (date_limite !== undefined) updateData.date_limite = date_limite;
      if (points_max !== undefined) updateData.points_max = points_max;
      if (criteres_evaluation !== undefined) updateData.criteres_evaluation = criteres_evaluation;

      const { data: updatedEtudeCas, error: updateError } = await supabase
        .from('etudes_cas')
        .update(updateData)
        .eq('id', existingEtudeCas.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'étude de cas:', updateError);
        await logUpdate(request, 'etudes_cas', existingEtudeCas.id, existingEtudeCas, updateData, Object.keys(updateData), `Échec de mise à jour d'étude de cas: ${updateError.message}`).catch(() => {});
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
      }

      await logUpdate(request, 'etudes_cas', existingEtudeCas.id, existingEtudeCas, updatedEtudeCas, Object.keys(updateData), `Mise à jour de l'étude de cas "${updatedEtudeCas.titre || existingEtudeCas.id}"`).catch(() => {});

      return NextResponse.json({ etudeCas: updatedEtudeCas });
    }

    // Permettre la création d'une étude de cas sans consigne ni fichier (peut être ajouté plus tard)
    // La validation n'est plus stricte car les questions peuvent être directement dans la consigne

    // consigne est NOT NULL dans la base de données, donc utiliser '' au lieu de null
    const finalConsigne = consigne || '';
    
    const { data: etudeCas, error } = await supabase
      .from('etudes_cas')
      .insert({
        cours_id: cours_id,
        titre: titre || `Étude de cas - Cours`,
        description,
        consigne: finalConsigne,
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
      await logCreate(request, 'etudes_cas', 'unknown', { cours_id, titre, description }, `Échec de création d'étude de cas: ${error.message}`).catch(() => {});
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

    // Vérifier si l'étude de cas est vide (sans questions) et la supprimer automatiquement
    const { data: questions } = await supabase
      .from('questions_etude_cas')
      .select('id')
      .eq('etude_cas_id', etudeCasId)
      .limit(1);

    if (!questions || questions.length === 0) {
      // L'étude de cas est vide, la désactiver
      await supabase
        .from('etudes_cas')
        .update({ actif: false })
        .eq('id', etudeCasId);

      const { logDelete } = await import('@/lib/audit-logger');
      await logDelete(request, 'etudes_cas', etudeCasId, etudeCas, `Suppression automatique de l'étude de cas vide "${etudeCas.titre || etudeCasId}" (aucune question)`).catch(() => {});
      
      return NextResponse.json({ 
        etudeCas: { ...etudeCas, actif: false },
        message: 'Étude de cas désactivée automatiquement car vide'
      });
    }

    return NextResponse.json({ etudeCas });
  } catch (error) {
    console.error('Erreur dans PUT /api/etude-cas:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

