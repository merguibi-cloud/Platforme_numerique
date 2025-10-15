import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// PUT - Mettre à jour le rôle d'un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier que l'utilisateur est admin/superadmin
    const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le rôle de l'utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    const { userId } = params;
    const body = await request.json();
    const { role } = body;

    // Valider le rôle
    if (!role || !['etudiant', 'animateur', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Empêcher un admin de promouvoir quelqu'un en superadmin
    if (profile.role === 'admin' && role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Seuls les super-administrateurs peuvent promouvoir en super-admin' },
        { status: 403 }
      );
    }

    // Empêcher de modifier son propre rôle
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 400 }
      );
    }

    // Mettre à jour le rôle
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('user_id', userId)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour du rôle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Rôle mis à jour avec succès'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
