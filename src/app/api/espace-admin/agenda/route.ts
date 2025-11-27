import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/auth-helpers';

/**
 * GET - Récupérer les événements de l'agenda
 */
export async function GET(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin requis)
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const supabase = getSupabaseServerClient();

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    // Construire la requête
    let query = supabase
      .from('agenda')
      .select(`
        id,
        type_event,
        titre,
        date_event,
        heure_debut,
        heure_fin,
        lieu,
        ecole,
        visibilite,
        photo_couverture,
        description_event,
        lien_visio_event,
        participants_event,
        motif_rendez_vous,
        couleur_rendez_vous,
        lien_visio_rendez_vous,
        participants_rendez_vous,
        titre_rappel,
        recurrence,
        description_rappel,
        lien_visio_rappel,
        importance,
        couleur_rappel,
        created_by,
        created_at,
        updated_at,
        agenda_intervenants (
          id,
          nom,
          prenom,
          poste,
          photo_path,
          ordre_affichage
        ),
        agenda_fichiers (
          id,
          nom_fichier,
          chemin_fichier,
          taille_fichier,
          type_mime,
          ordre_affichage
        )
      `)
      .order('date_event', { ascending: true })
      .order('heure_debut', { ascending: true });

    // Filtrer par date si fourni
    if (dateStart) {
      query = query.gte('date_event', dateStart);
    }
    if (dateEnd) {
      query = query.lte('date_event', dateEnd);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }

    // Formater les événements pour le frontend
    const formattedEvents = events?.map((event) => ({
      id: event.id,
      title: event.titre,
      type: event.type_event,
      date: event.date_event,
      time: event.heure_debut,
      endTime: event.heure_fin,
      ecole: event.ecole,
      lieu: event.lieu,
      visibilite: event.visibilite,
      created_by: event.created_by,
      // Champs spécifiques selon le type
      ...(event.type_event === 'evenement' && {
        photoCouverture: event.photo_couverture,
        description: event.description_event,
        lienVisio: event.lien_visio_event,
        participants: event.participants_event,
        intervenants: event.agenda_intervenants || [],
      }),
      ...(event.type_event === 'rendezvous' && {
        motif: event.motif_rendez_vous,
        couleur: event.couleur_rendez_vous,
        lienVisio: event.lien_visio_rendez_vous,
        participants: event.participants_rendez_vous,
        fichiers: event.agenda_fichiers || [],
      }),
      ...(event.type_event === 'rappel' && {
        titreRappel: event.titre_rappel,
        recurrence: event.recurrence,
        description: event.description_rappel,
        lienVisio: event.lien_visio_rappel,
        importance: event.importance,
        couleur: event.couleur_rappel,
      }),
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/espace-admin/agenda:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un nouvel événement dans l'agenda
 */
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin requis)
    const adminResult = await requireAdmin(user.id);
    if ('error' in adminResult) {
      return adminResult.error;
    }

    const body = await request.json();
    const {
      type,
      titre,
      date_event,
      heure_debut,
      heure_fin,
      lieu,
      ecole,
      visibilite,
      // Champs événement
      photo_couverture,
      description_event,
      lien_visio_event,
      participants_event,
      intervenants,
      // Champs rendez-vous
      motif_rendez_vous,
      couleur_rendez_vous,
      lien_visio_rendez_vous,
      participants_rendez_vous,
      fichiers,
      // Champs rappel
      titre_rappel,
      recurrence,
      description_rappel,
      lien_visio_rappel,
      importance,
      couleur_rappel,
    } = body;

    const supabase = getSupabaseServerClient();

    // Préparer les données de l'événement principal
    const eventData: any = {
      type_event: type,
      titre,
      date_event,
      heure_debut,
      heure_fin,
      lieu: lieu || null,
      ecole,
      visibilite,
      created_by: user.id,
    };

    // Ajouter les champs spécifiques selon le type
    if (type === 'evenement') {
      eventData.photo_couverture = photo_couverture || null;
      eventData.description_event = description_event || null;
      eventData.lien_visio_event = lien_visio_event || null;
      eventData.participants_event = participants_event || null;
    } else if (type === 'rendezvous') {
      eventData.motif_rendez_vous = motif_rendez_vous || null;
      eventData.couleur_rendez_vous = couleur_rendez_vous || '#9370DB';
      eventData.lien_visio_rendez_vous = lien_visio_rendez_vous || null;
      eventData.participants_rendez_vous = participants_rendez_vous || null;
    } else if (type === 'rappel') {
      eventData.titre_rappel = titre_rappel || null;
      eventData.recurrence = recurrence || null;
      eventData.description_rappel = description_rappel || null;
      eventData.lien_visio_rappel = lien_visio_rappel || null;
      eventData.importance = importance || null;
      eventData.couleur_rappel = couleur_rappel || '#808080';
    }

    // Créer l'événement principal
    const { data: newEvent, error: eventError } = await supabase
      .from('agenda')
      .insert(eventData)
      .select()
      .single();

    if (eventError || !newEvent) {
      console.error('Erreur lors de la création de l\'événement:', eventError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de l\'événement' },
        { status: 500 }
      );
    }

    // Créer les intervenants si c'est un événement
    if (type === 'evenement' && intervenants && Array.isArray(intervenants) && intervenants.length > 0) {
      const intervenantsData = intervenants
        .filter((inter: any) => inter.nom && inter.prenom) // Filtrer les intervenants valides
        .map((inter: any, index: number) => ({
          agenda_id: newEvent.id,
          nom: inter.nom,
          prenom: inter.prenom,
          poste: inter.poste || null,
          photo_path: inter.photo || null,
          ordre_affichage: index,
        }));

      if (intervenantsData.length > 0) {
        const { error: intervenantsError } = await supabase
          .from('agenda_intervenants')
          .insert(intervenantsData);

        if (intervenantsError) {
          console.error('Erreur lors de la création des intervenants:', intervenantsError);
          // Ne pas échouer la requête, juste logger l'erreur
        }
      }
    }

    // Créer les fichiers si c'est un rendez-vous
    if (type === 'rendezvous' && fichiers && Array.isArray(fichiers) && fichiers.length > 0) {
      const fichiersData = fichiers
        .filter((fichier: any) => fichier.chemin_fichier) // Filtrer les fichiers valides
        .map((fichier: any, index: number) => ({
          agenda_id: newEvent.id,
          nom_fichier: fichier.nom_fichier || 'Fichier',
          chemin_fichier: fichier.chemin_fichier,
          taille_fichier: fichier.taille_fichier || null,
          type_mime: fichier.type_mime || null,
          ordre_affichage: index,
        }));

      if (fichiersData.length > 0) {
        const { error: fichiersError } = await supabase
          .from('agenda_fichiers')
          .insert(fichiersData);

        if (fichiersError) {
          console.error('Erreur lors de la création des fichiers:', fichiersError);
          // Ne pas échouer la requête, juste logger l'erreur
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/espace-admin/agenda:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

