import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logAuditAction } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérifier que l'utilisateur est admin
    const supabase = getSupabaseServerClient();
    const { data: admin } = await supabase
      .from('administrateurs')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Seuls les administrateurs peuvent importer des fichiers.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      titre,
      nom_fichier_original,
      type_fichier,
      taille_fichier,
      chemin_fichier,
      bucket_name,
      description,
      sujet,
      ecole,
      visibilite,
      activer_telechargement,
      tags
    } = body;

    // Validation des champs requis
    // Pour les vidéos YouTube, taille_fichier peut être 0 ou null
    const isYoutube = bucket_name === 'youtube';
    if (!titre || !type_fichier || !chemin_fichier || !bucket_name) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }
    
    // Pour les fichiers normaux, taille_fichier est requis (sauf YouTube)
    if (!isYoutube && (!taille_fichier || taille_fichier === 0)) {
      return NextResponse.json(
        { error: 'Champs requis manquants: taille_fichier est requis pour les fichiers normaux' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    // Pour YouTube, on accepte MP4 et les autres types standards
    const validTypes = ['Masterclass', 'Ebook', 'Présentation', 'Podcast', 'PDF', 'MP4', 'MP3', 'DOCX', 'PPTX', 'XLSX'];
    if (!validTypes.includes(type_fichier)) {
      return NextResponse.json(
        { error: `Type de fichier invalide: ${type_fichier}. Types acceptés: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Vérifier que le fichier existe dans le bucket avant de sauvegarder (sauf pour YouTube)
    if (bucket_name !== 'youtube') {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucket_name)
        .createSignedUrl(chemin_fichier, 60);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        const isNotFoundError = (signedUrlError as any)?.status === 404 ||
                                (signedUrlError as any)?.statusCode === 404 ||
                                signedUrlError?.message?.includes('not found') ||
                                signedUrlError?.message?.includes('Object not found') ||
                                signedUrlError?.message?.includes('404');
        
        console.error('Fichier non trouvé dans le bucket avant sauvegarde:', {
          chemin_fichier,
          bucket_name,
          error: signedUrlError?.message
        });

        return NextResponse.json(
          { 
            error: isNotFoundError 
              ? 'Le fichier n\'existe pas dans le bucket de stockage'
              : 'Erreur lors de la vérification du fichier',
            details: isNotFoundError
              ? 'Le fichier référencé n\'existe pas dans le storage. Il n\'a peut-être pas été uploadé correctement.'
              : signedUrlError?.message || 'Impossible de vérifier l\'existence du fichier'
          },
          { status: 404 }
        );
      }
    }

    // Pour les vidéos YouTube, stocker l'URL directement dans chemin_fichier
    // et utiliser un bucket_name spécial pour indiquer que c'est une URL externe
    const finalCheminFichier = isYoutube ? chemin_fichier : chemin_fichier;
    const finalBucketName = isYoutube ? 'youtube' : bucket_name;

    // Insérer le fichier dans la base de données
    const { data: fichier, error: insertError } = await supabase
      .from('bibliotheque_fichiers')
      .insert({
        titre,
        nom_fichier_original: nom_fichier_original || titre,
        type_fichier: type_fichier, // Utiliser le type choisi par l'utilisateur
        taille_fichier: isYoutube ? 0 : parseInt(taille_fichier || '0'),
        chemin_fichier: finalCheminFichier, // URL YouTube pour les vidéos YouTube
        bucket_name: finalBucketName,
        description: description || null,
        sujet: sujet || null,
        ecole: ecole || null,
        visibilite: visibilite || 'plateforme',
        activer_telechargement: activer_telechargement !== undefined ? activer_telechargement : true,
        importe_par: user.id,
        tags: tags && Array.isArray(tags) ? tags : [],
        actif: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur insertion bibliothèque:', insertError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'enregistrement du fichier',
          details: insertError.message 
        },
        { status: 500 }
      );
    }

    // Logger l'action
    await logAuditAction(request, {
      action_type: 'CREATE',
      table_name: 'bibliotheque_fichiers',
      resource_id: fichier.id,
      status: 'success',
      metadata: {
        titre,
        type_fichier,
        bucket_name,
        chemin_fichier
      },
      description: `Importation du fichier "${titre}" dans la bibliothèque numérique`
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      fichier: fichier
    });

  } catch (error) {
    console.error('Erreur sauvegarde bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

