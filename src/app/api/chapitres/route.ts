import { NextRequest, NextResponse } from 'next/server';
import {
  createChapitreServer,
  getChapitresByCoursIdServer,
  getChapitreByIdServer,
  getChapitreWithDetailsServer,
  updateChapitreServer,
  deleteChapitreServer,
  validateChapitreServer
} from '../../../lib/chapitres-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { logCreate, logUpdate, logDelete, logAuditAction } from '@/lib/audit-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const chapitreId = searchParams.get('chapitreId');
    
    if (chapitreId) {
      // Récupérer un chapitre spécifique avec ses détails (fichiers complémentaires)
      const withDetails = searchParams.get('withDetails') === 'true';
      
      if (withDetails) {
        const result = await getChapitreWithDetailsServer(parseInt(chapitreId));
        if (result.success) {
          return NextResponse.json({ 
            chapitre: result.chapitre,
            fichiers: result.fichiers
          });
        } else {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } else {
        const result = await getChapitreByIdServer(parseInt(chapitreId));
        if (result.success) {
          return NextResponse.json({ chapitre: result.chapitre });
        } else {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
    } else if (coursId) {
      // Récupérer tous les chapitres d'un cours
      const result = await getChapitresByCoursIdServer(parseInt(coursId));
      if (result.success) {
        return NextResponse.json({ chapitres: result.chapitres });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      // Si l'erreur est liée à la taille du body (413)
      if (error.message?.includes('413') || error.message?.includes('Payload Too Large')) {
        return NextResponse.json({ 
          error: 'Le contenu est trop volumineux. La taille maximale autorisée est de 4 MB. Veuillez réduire la taille du contenu ou le diviser en plusieurs chapitres.',
          code: 'PAYLOAD_TOO_LARGE'
        }, { status: 413 });
      }
      throw error;
    }
    
    const { cours_id, titre, contenu } = body;

    if (!cours_id || !titre) {
      return NextResponse.json({ error: 'cours_id et titre requis' }, { status: 400 });
    }

    const result = await createChapitreServer({ cours_id, titre, contenu }, user.id);
    
    if (result.success && result.chapitre) {
      await logCreate(request, 'chapitres_cours', result.chapitre.id, result.chapitre, `Création du chapitre "${result.chapitre.titre}"`).catch(() => {});
      return NextResponse.json({ chapitre: result.chapitre });
    } else {
      return NextResponse.json({ error: result.error || 'Erreur lors de la création du chapitre' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur dans l\'API chapitres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      // Si l'erreur est liée à la taille du body (413)
      if (error.message?.includes('413') || error.message?.includes('Payload Too Large')) {
        return NextResponse.json({ 
          error: 'Le contenu est trop volumineux. La taille maximale autorisée est de 4 MB. Veuillez réduire la taille du contenu ou le diviser en plusieurs chapitres.',
          code: 'PAYLOAD_TOO_LARGE'
        }, { status: 413 });
      }
      throw error;
    }
    
    const { chapitreId, titre, contenu, statut, _changedFields } = body;
    
    // Construire l'objet de mise à jour avec seulement les champs modifiés
    const updates: any = {};
    
    // Si _changedFields est fourni, utiliser seulement les champs modifiés
    if (_changedFields) {
      if (_changedFields.contenu && contenu !== undefined) {
        updates.contenu = contenu;
      }
      if (_changedFields.titre && titre !== undefined) {
        updates.titre = titre;
      }
      if (_changedFields.statut && statut !== undefined) {
        updates.statut = statut;
      }
    } else {
      // Fallback : inclure tous les champs fournis (compatibilité)
      if (titre !== undefined) updates.titre = titre;
      if (contenu !== undefined) updates.contenu = contenu;
      if (statut !== undefined) updates.statut = statut;
    }

    if (!chapitreId) {
      return NextResponse.json({ error: 'chapitreId requis' }, { status: 400 });
    }

    // Convertir chapitreId en nombre si c'est une string
    const chapitreIdNum = typeof chapitreId === 'string' ? parseInt(chapitreId, 10) : chapitreId;
    if (isNaN(chapitreIdNum)) {
      return NextResponse.json({ error: 'chapitreId invalide' }, { status: 400 });
    }

    // Ne pas mettre à jour si aucun champ n'a changé
    if (Object.keys(updates).length === 0) {
      // Retourner le chapitre actuel
      const currentChapitreResult = await getChapitreByIdServer(chapitreIdNum);
      if (currentChapitreResult.success && currentChapitreResult.chapitre) {
        return NextResponse.json({ success: true, chapitre: currentChapitreResult.chapitre });
      }
      return NextResponse.json({ success: true });
    }

    const result = await updateChapitreServer(chapitreIdNum, updates, user.id);
    
    if (result.success) {
      // Récupérer le chapitre mis à jour pour le retourner
      const updatedChapitreResult = await getChapitreByIdServer(chapitreIdNum);
      
      // Logger seulement les champs modifiés (en arrière-plan, sans bloquer)
      logUpdate(request, 'chapitres_cours', chapitreIdNum, updates, `Mise à jour du chapitre ${chapitreIdNum}`).catch(() => {});
      
      if (updatedChapitreResult.success && updatedChapitreResult.chapitre) {
        return NextResponse.json({ success: true, chapitre: updatedChapitreResult.chapitre });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || 'Erreur lors de la mise à jour du chapitre' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const chapitreId = searchParams.get('chapitreId');

    if (!chapitreId) {
      return NextResponse.json({ error: 'chapitreId requis' }, { status: 400 });
    }

    const result = await deleteChapitreServer(parseInt(chapitreId));
    
    if (result.success) {
      await logDelete(request, 'chapitres_cours', parseInt(chapitreId), { id: parseInt(chapitreId) }, `Suppression du chapitre ${chapitreId}`).catch(() => {});
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || 'Erreur lors de la suppression du chapitre' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur dans l\'API chapitres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

