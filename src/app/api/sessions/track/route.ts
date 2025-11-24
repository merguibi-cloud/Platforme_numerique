import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

// POST - Enregistrer ou mettre à jour une session de connexion
export async function POST(request: NextRequest) {
  try {
    // Authentification requise
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const { duree_minutes } = await request.json();
    
    if (typeof duree_minutes !== 'number' || duree_minutes < 0) {
      return NextResponse.json(
        { success: false, error: 'Durée invalide' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const aujourdhui = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Vérifier si une session existe déjà pour aujourd'hui
    const { data: existingSession } = await supabase
      .from('sessions_connexion')
      .select('id, duree_minutes')
      .eq('user_id', user.id)
      .eq('date_connexion', aujourdhui)
      .maybeSingle();

    if (existingSession) {
      // Mettre à jour la durée existante (additionner)
      const nouvelleDuree = (existingSession.duree_minutes || 0) + duree_minutes;
      
      const { error: updateError } = await supabase
        .from('sessions_connexion')
        .update({ duree_minutes: nouvelleDuree })
        .eq('id', existingSession.id);

      if (updateError) {
        console.error('Erreur mise à jour session:', updateError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour de la session' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Session mise à jour',
        duree_totale: nouvelleDuree
      });
    } else {
      // Créer une nouvelle session
      const { error: insertError } = await supabase
        .from('sessions_connexion')
        .insert({
          user_id: user.id,
          date_connexion: aujourdhui,
          duree_minutes: duree_minutes
        });

      if (insertError) {
        console.error('Erreur création session:', insertError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de la session' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Session créée',
        duree_totale: duree_minutes
      });
    }
  } catch (error) {
    console.error('Erreur lors du suivi de session:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

