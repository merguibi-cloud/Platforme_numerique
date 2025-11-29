import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAuditAction } from '@/lib/audit-logger';

// PUT - Mettre à jour un fichier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérifier que l'utilisateur est admin
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const { id } = await params;
    const body = await request.json();
    const {
      titre,
      description,
      sujet,
      ecole,
      visibilite,
      activer_telechargement,
      tags
    } = body;

    // Validation
    if (!titre || !titre.trim()) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Vérifier que le fichier existe
    const { data: fichier, error: fichierError } = await supabase
      .from('bibliotheque_fichiers')
      .select('id, titre')
      .eq('id', id)
      .eq('actif', true)
      .maybeSingle();

    if (fichierError || !fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Construire l'objet de mise à jour
    const updateData: any = {};
    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description || null;
    if (sujet !== undefined) updateData.sujet = sujet || null;
    if (ecole !== undefined) updateData.ecole = ecole || null;
    if (visibilite !== undefined) updateData.visibilite = visibilite;
    if (activer_telechargement !== undefined) updateData.activer_telechargement = activer_telechargement;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    updateData.updated_at = new Date().toISOString();

    // Mettre à jour le fichier
    const { data: updatedFichier, error: updateError } = await supabase
      .from('bibliotheque_fichiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour fichier:', updateError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la mise à jour du fichier',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    // Logger l'action
    await logAuditAction(request, {
      action_type: 'UPDATE',
      table_name: 'bibliotheque_fichiers',
      resource_id: id,
      status: 'success',
      metadata: {
        titre: updateData.titre || fichier.titre,
        modifications: Object.keys(updateData).filter(k => k !== 'updated_at')
      },
      description: `Modification du fichier "${updateData.titre || fichier.titre}" dans la bibliothèque numérique`
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      fichier: updatedFichier
    });

  } catch (error: any) {
    console.error('Erreur mise à jour bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un fichier (soft delete en mettant actif à false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérifier que l'utilisateur est admin
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Vérifier que le fichier existe
    const { data: fichier, error: fichierError } = await supabase
      .from('bibliotheque_fichiers')
      .select('id, titre, bucket_name, chemin_fichier')
      .eq('id', id)
      .eq('actif', true)
      .maybeSingle();

    if (fichierError || !fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Soft delete : mettre actif à false
    const { error: deleteError } = await supabase
      .from('bibliotheque_fichiers')
      .update({ 
        actif: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Erreur suppression fichier:', deleteError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la suppression du fichier',
          details: deleteError.message 
        },
        { status: 500 }
      );
    }

    // Optionnel : Supprimer le fichier du storage si ce n'est pas YouTube
    // (on peut le faire en arrière-plan, ne pas bloquer la réponse)
    if (fichier.bucket_name !== 'youtube') {
      supabase.storage
        .from(fichier.bucket_name)
        .remove([fichier.chemin_fichier])
        .catch((error) => {
          console.warn('Erreur suppression fichier du storage:', error);
          // On continue même si la suppression du storage échoue
        });
    }

    // Logger l'action
    await logAuditAction(request, {
      action_type: 'DELETE',
      table_name: 'bibliotheque_fichiers',
      resource_id: id,
      status: 'success',
      metadata: {
        titre: fichier.titre,
        bucket_name: fichier.bucket_name
      },
      description: `Suppression du fichier "${fichier.titre}" de la bibliothèque numérique`
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur suppression bibliothèque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

