import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  createCoursServer,
  getCoursByModuleIdServer,
  getCoursByIdServer,
  updateCoursServer,
  deleteCoursServer,
  validateCoursServer,
  getUserProfileServer
} from '../../../lib/cours-api';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const coursId = searchParams.get('coursId');
    if (coursId) {
      // Récupérer un cours spécifique
      const result = await getCoursByIdServer(parseInt(coursId));
      if (result.success) {
        return NextResponse.json({ cours: result.cours });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const body = await request.json();
    // Vérifier les permissions (admin, superadmin, pedagogie peuvent créer des cours)
    const profileResult = await getUserProfileServer(user.id);
    if (!profileResult.success || !profileResult.role) {
      return NextResponse.json({ error: 'Profil utilisateur non trouvé' }, { status: 403 });
    }
    const allowedRoles = ['admin', 'superadmin', 'pedagogie'];
    if (!allowedRoles.includes(profileResult.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }
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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
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
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
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