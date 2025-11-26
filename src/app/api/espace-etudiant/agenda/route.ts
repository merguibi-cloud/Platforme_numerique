import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';

/**
 * GET - Récupérer les événements de l'agenda pour l'étudiant connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les événements du mois en cours et du mois suivant
    const maintenant = new Date();
    const premierJourMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const dernierJourMoisSuivant = new Date(maintenant.getFullYear(), maintenant.getMonth() + 2, 0);

    const { data: evenements, error: evenementsError } = await supabase
      .from('agenda_etudiants')
      .select('id, date_event, type_event, description')
      .eq('etudiant_id', etudiant.id)
      .gte('date_event', premierJourMois.toISOString().split('T')[0])
      .lte('date_event', dernierJourMoisSuivant.toISOString().split('T')[0])
      .order('date_event', { ascending: true });

    if (evenementsError) {
      console.error('Erreur lors de la récupération des événements:', evenementsError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }

    // Formater les événements par jour (clé = jour du mois)
    const evenementsParJour: Record<number, any[]> = {};
    
    evenements?.forEach((event) => {
      const dateEvent = new Date(event.date_event);
      const jour = dateEvent.getDate();
      
      if (!evenementsParJour[jour]) {
        evenementsParJour[jour] = [];
      }

      // Déterminer le type d'événement pour le style
      let typeStyle = 'normal';
      if (event.type_event === 'rendez_vous' || event.type_event === 'evenement') {
        typeStyle = 'important';
      } else if (event.type_event === 'jour_entreprise') {
        typeStyle = 'normal';
      }

      evenementsParJour[jour].push({
        id: event.id,
        title: event.description || event.type_event,
        type: typeStyle,
        date: event.date_event,
        time: '09h00', // Par défaut, on pourrait ajouter un champ heure dans la table
        type_event: event.type_event
      });
    });

    return NextResponse.json({
      success: true,
      evenements: evenementsParJour,
      evenementsListe: evenements || []
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-etudiant/agenda:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

