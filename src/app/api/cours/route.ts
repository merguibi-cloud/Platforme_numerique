import { NextRequest, NextResponse } from 'next/server';
import {
  createCoursServer,
  getCoursByModuleIdServer,
  getCoursByIdServer,
  getCoursWithDetailsServer,
  updateCoursServer,
  deleteCoursServer,
  validateCoursServer
} from '../../../lib/cours-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { logCreate, logUpdate, logDelete, logAuditAction } from '@/lib/audit-logger';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const coursId = searchParams.get('coursId');
    if (coursId) {
      // Récupérer un cours spécifique avec ses détails (fichiers complémentaires)
      const withDetails = searchParams.get('withDetails') === 'true';
      
      if (withDetails) {
        const result = await getCoursWithDetailsServer(parseInt(coursId));
        if (result.success) {
          return NextResponse.json({ 
            cours: result.cours,
            fichiers: result.fichiers
          });
        } else {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } else {
        const result = await getCoursByIdServer(parseInt(coursId));
        if (result.success) {
          return NextResponse.json({ cours: result.cours });
        } else {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
    } else if (moduleId) {
      // Récupérer tous les cours d'un module
      const result = await getCoursByModuleIdServer(parseInt(moduleId));
      if (result.success) {
        return NextResponse.json({ cours: result.cours });
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
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const result = await createCoursServer(body, user.id);
    if (result.success && result.cours) {
      await logCreate(
        request,
        'cours_contenu',
        result.cours.id,
        result.cours,
        `Création d'un nouveau cours: ${result.cours.titre}`
      ).catch(() => {});
      return NextResponse.json({ cours: result.cours });
    } else {
      await logCreate(
        request,
        'cours_contenu',
        'unknown',
        body,
        `Échec de création de cours: ${result.error}`
      ).catch(() => {});
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
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
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const body = await request.json();
    const { coursId, ...updates } = body;
    
    // Récupérer l'ancien cours pour le log
    const oldCoursResult = await getCoursByIdServer(coursId);
    const oldCours = oldCoursResult.success ? oldCoursResult.cours : null;
    
    const result = await updateCoursServer(coursId, updates, user.id);
    if (result.success) {
      // Récupérer le cours mis à jour
      const updatedCoursResult = await getCoursByIdServer(coursId);
      const updatedCours = updatedCoursResult.success ? updatedCoursResult.cours : null;
      
      const changedFields = Object.keys(updates);
      await logUpdate(
        request,
        'cours_contenu',
        coursId,
        oldCours || {},
        updatedCours || updates,
        changedFields,
        `Mise à jour du cours: ${oldCours?.titre || coursId}`
      ).catch(() => {});
      
      return NextResponse.json({ success: true });
    } else {
      await logUpdate(
        request,
        'cours_contenu',
        coursId,
        oldCours || {},
        updates,
        Object.keys(updates),
        `Échec de mise à jour du cours: ${result.error}`
      ).catch(() => {});
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
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
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    if (!coursId) {
      return NextResponse.json({ error: 'ID du cours manquant' }, { status: 400 });
    }
    
    // Récupérer le cours avant suppression pour le log
    const oldCoursResult = await getCoursByIdServer(parseInt(coursId));
    const oldCours = oldCoursResult.success ? oldCoursResult.cours : null;
    
    const result = await deleteCoursServer(parseInt(coursId));
    if (result.success) {
      await logDelete(
        request,
        'cours_contenu',
        coursId,
        oldCours || { id: coursId },
        `Suppression du cours: ${oldCours?.titre || coursId}`
      ).catch(() => {});
      return NextResponse.json({ success: true });
    } else {
      await logDelete(
        request,
        'cours_contenu',
        coursId,
        oldCours || { id: coursId },
        `Échec de suppression du cours: ${result.error}`
      ).catch(() => {});
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}