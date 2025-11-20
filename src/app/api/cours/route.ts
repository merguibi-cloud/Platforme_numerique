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
    if (result.success) {
      return NextResponse.json({ cours: result.cours });
    } else {
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
    const result = await updateCoursServer(coursId, updates, user.id);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
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
    const result = await deleteCoursServer(parseInt(coursId));
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}