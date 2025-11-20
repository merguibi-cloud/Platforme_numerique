import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// GET - Récupérer les données de l'administrateur connecté
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    
    // Récupérer les données de l'administrateur depuis la table administrateurs
    const { data: admin, error: adminError } = await supabase
      .from('administrateurs')
      .select('id, nom, prenom, email, role_secondaire, niveau, service')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Erreur récupération admin:', adminError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des données' },
        { status: 500 }
      );
    }

    // Si l'utilisateur n'est pas dans la table administrateurs, retourner null
    if (!admin) {
      return NextResponse.json({
        success: true,
        admin: null
      });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        role_secondaire: admin.role_secondaire,
        niveau: admin.niveau,
        service: admin.service
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'administrateur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

