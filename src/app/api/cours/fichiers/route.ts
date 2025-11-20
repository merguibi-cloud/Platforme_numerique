import { NextRequest, NextResponse } from 'next/server';
import {
  createCoursFichierServer,
  getCoursFichiersByCoursIdServer,
  updateCoursFichierServer,
  deleteCoursFichierServer
} from '../../../../lib/cours-fichiers-api';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coursId = searchParams.get('coursId');
    const fichierId = searchParams.get('fichierId');

    if (!coursId && !fichierId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    if (fichierId) {
      // Récupérer un fichier spécifique (à implémenter si nécessaire)
      return NextResponse.json({ error: 'Non implémenté' }, { status: 501 });
    }

    // Récupérer tous les fichiers d'un cours
    if (coursId) {
      const result = await getCoursFichiersByCoursIdServer(parseInt(coursId));
      if (result.success) {
        return NextResponse.json({ fichiers: result.fichiers });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
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
    const result = await createCoursFichierServer(body);
    
    if (result.success) {
      return NextResponse.json({ fichier: result.fichier });
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
    const { fichierId, ...updates } = body;
    const result = await updateCoursFichierServer(fichierId, updates);
    
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
    const fichierId = searchParams.get('fichierId');
    if (!fichierId) {
      return NextResponse.json({ error: 'ID du fichier manquant' }, { status: 400 });
    }

    const result = await deleteCoursFichierServer(parseInt(fichierId));
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

