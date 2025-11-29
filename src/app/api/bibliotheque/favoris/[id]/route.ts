import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';
import { logAuditAction } from '@/lib/audit-logger';

// PUT - Toggle le statut favori d'un document
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
    const { est_favori } = body;

    if (typeof est_favori !== 'boolean') {
      return NextResponse.json(
        { error: 'est_favori doit être un booléen' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Vérifier que le fichier existe
    const { data: fichier, error: fichierError } = await supabase
      .from('bibliotheque_fichiers')
      .select('id, titre, est_favori')
      .eq('id', id)
      .eq('actif', true)
      .maybeSingle();

    if (fichierError || !fichier) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut favori
    const { data: updatedFichier, error: updateError } = await supabase
      .from('bibliotheque_fichiers')
      .update({ est_favori })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour favori:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du favori' },
        { status: 500 }
      );
    }

    // Logger l'action
    await logAuditAction(request, {
      action_type: 'UPDATE',
      table_name: 'bibliotheque_fichiers',
      resource_id: id,
      status: 'success',
      changed_fields: ['est_favori'],
      old_data: { est_favori: fichier.est_favori },
      new_data: { est_favori },
      description: `${est_favori ? 'Ajout' : 'Retrait'} du document "${fichier.titre}" des favoris`
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      fichier: updatedFichier
    });

  } catch (error) {
    console.error('Erreur toggle favori:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

