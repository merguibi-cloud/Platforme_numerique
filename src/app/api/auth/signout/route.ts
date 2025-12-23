import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { logAuditAction } from '@/lib/audit-logger';

// Route pour la déconnexion
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avant de supprimer les cookies
    let userId: string | null = null;
    if (accessToken) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } }
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) userId = user.id;
      } catch (e) {
        // Ignorer les erreurs
      }
    }

    // Supprimer les cookies de session
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');

    // Logger la déconnexion
    if (userId) {
      await logAuditAction(request, {
        action_type: 'LOGOUT',
        table_name: 'auth.users',
        resource_id: userId,
        status: 'success',
        description: 'Déconnexion réussie'
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Déconnexion réussie'
      },
      {
        headers: {
          // Invalider tous les caches lors de la déconnexion
          'Clear-Site-Data': '"cache", "cookies", "storage"',
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
