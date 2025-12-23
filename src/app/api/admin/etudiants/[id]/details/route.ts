import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

// GET - Récupérer tous les détails d'un étudiant (notes, temps connexion, signalements, agenda)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    // Vérification des permissions (admin ou superadmin requis)
    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // Récupérer l'étudiant
    const { data: etudiant, error: etudiantError } = await supabase
      .from('etudiants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (etudiantError || !etudiant) {
      return NextResponse.json(
        { success: false, error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations utilisateur
    const { data: authUser } = await supabase.auth.admin.getUserById(etudiant.user_id);
    const { data: candidature } = await supabase
      .from('candidatures')
      .select('nom, prenom, email, photo_identite_path')
      .eq('user_id', etudiant.user_id)
      .maybeSingle();

    // Récupérer la formation
    let formationData = null;
    if (etudiant.formation_id) {
      const { data: formation } = await supabase
        .from('formations')
        .select('id, titre, ecole')
        .eq('id', etudiant.formation_id)
        .maybeSingle();
      formationData = formation;
    }

    // Récupérer toutes les notes depuis différentes sources
    // 1. Notes depuis la table notes_etudiants (notes manuelles, projets, devoirs, etc.)
    const { data: notesManuelles } = await supabase
      .from('notes_etudiants')
      .select('*')
      .eq('etudiant_id', id);

    // 2. Notes depuis les tentatives de quiz (tentatives_quiz)
    const { data: tentativesQuiz } = await supabase
      .from('tentatives_quiz')
      .select(`
        id,
        quiz_id,
        score,
        temps_passe,
        numero_tentative,
        date_fin,
        quiz_evaluations!inner(
          id,
          titre,
          cours_id,
          cours_apprentissage!inner(
            id,
            bloc_id,
            blocs_competences!inner(
              id,
              numero_bloc,
              titre
            )
          )
        )
      `)
      .eq('user_id', etudiant.user_id)
      .eq('termine', true)
      .order('date_fin', { ascending: false });

    // 3. Notes depuis les soumissions d'études de cas
    const { data: soumissionsEtudeCas } = await supabase
      .from('soumissions_etude_cas')
      .select(`
        id,
        etude_cas_id,
        note,
        date_correction,
        etudes_cas!inner(
          id,
          titre,
          chapitre_id,
          chapitres_cours!inner(
            id,
            cours_id,
            cours_apprentissage!inner(
              id,
              bloc_id,
              blocs_competences!inner(
                id,
                numero_bloc,
                titre
              )
            )
          )
        )
      `)
      .eq('user_id', etudiant.user_id)
      .not('note', 'is', null)
      .order('date_correction', { ascending: false });

    // Regrouper toutes les notes par bloc
    const notesParBloc = new Map<number, {
      bloc_id: number;
      numero_bloc: number;
      titre_bloc: string;
      notes: Array<{
        type: string;
        evaluation_id: number;
        evaluation_titre: string;
        note: number;
        note_max: number;
        temps_passe?: number;
        date: string;
      }>;
    }>();

    // Ajouter les notes manuelles
    if (notesManuelles && notesManuelles.length > 0) {
      const blocIds = notesManuelles.map(n => n.bloc_id).filter(Boolean);
      if (blocIds.length > 0) {
        const { data: blocs } = await supabase
          .from('blocs_competences')
          .select('id, numero_bloc, titre')
          .in('id', blocIds);

        const blocsMap = new Map(blocs?.map(b => [b.id, b]) || []);

        notesManuelles.forEach(note => {
          if (note.bloc_id) {
            const bloc = blocsMap.get(note.bloc_id);
            if (bloc) {
              if (!notesParBloc.has(note.bloc_id)) {
                notesParBloc.set(note.bloc_id, {
                  bloc_id: note.bloc_id,
                  numero_bloc: bloc.numero_bloc,
                  titre_bloc: bloc.titre,
                  notes: []
                });
              }
              notesParBloc.get(note.bloc_id)!.notes.push({
                type: note.type_evaluation,
                evaluation_id: note.evaluation_id || 0,
                evaluation_titre: `${note.type_evaluation} #${note.evaluation_id || ''}`,
                note: Number(note.note),
                note_max: Number(note.note_max || 20),
                temps_passe: note.temps_passe,
                date: note.date_evaluation
              });
            }
          }
        });
      }
    }

    // Ajouter les notes de quiz
    if (tentativesQuiz && Array.isArray(tentativesQuiz)) {
      tentativesQuiz.forEach((tentative: any) => {
        const blocId = (tentative.quiz_evaluations as any)?.cours_apprentissage?.blocs_competences?.id;
        if (blocId) {
          const bloc = (tentative.quiz_evaluations as any).cours_apprentissage.blocs_competences;
          if (!notesParBloc.has(blocId)) {
            notesParBloc.set(blocId, {
              bloc_id: blocId,
              numero_bloc: bloc.numero_bloc,
              titre_bloc: bloc.titre,
              notes: []
            });
          }
          notesParBloc.get(blocId)!.notes.push({
            type: 'quiz',
            evaluation_id: tentative.quiz_id,
            evaluation_titre: (tentative.quiz_evaluations as any).titre,
            note: Number(tentative.score || 0),
            note_max: 100, // Les quiz sont généralement sur 100
            temps_passe: tentative.temps_passe || 0,
            date: tentative.date_fin || new Date().toISOString()
          });
        }
      });
    }

    // Ajouter les notes d'études de cas
    if (soumissionsEtudeCas && Array.isArray(soumissionsEtudeCas)) {
      soumissionsEtudeCas.forEach((soumission: any) => {
        const blocId = (soumission.etudes_cas as any)?.chapitres_cours?.cours_apprentissage?.blocs_competences?.id;
        if (blocId && soumission.note !== null) {
          const bloc = (soumission.etudes_cas as any).chapitres_cours.cours_apprentissage.blocs_competences;
          if (!notesParBloc.has(blocId)) {
            notesParBloc.set(blocId, {
              bloc_id: blocId,
              numero_bloc: bloc.numero_bloc,
              titre_bloc: bloc.titre,
              notes: []
            });
          }
          notesParBloc.get(blocId)!.notes.push({
            type: 'etude_cas',
            evaluation_id: soumission.etude_cas_id,
            evaluation_titre: (soumission.etudes_cas as any).titre,
            note: Number(soumission.note),
            note_max: 20, // Par défaut sur 20
            date: soumission.date_correction || new Date().toISOString()
          });
        }
      });
    }

    // Formater les notes pour l'affichage (grouper par bloc, prendre les 2 meilleures notes)
    let dernieresNotes = Array.from(notesParBloc.values())
      .sort((a, b) => a.numero_bloc - b.numero_bloc)
      .slice(0, 5)
      .map(blocData => {
        // Trier les notes par date (plus récentes en premier) et prendre les 2 meilleures
        const notesTriees = blocData.notes
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 2);

        // Calculer le temps total pour ce bloc
        const tempsTotal = blocData.notes.reduce((acc, n) => acc + (n.temps_passe || 0), 0);
        const tempsHeures = Math.round(tempsTotal / 60);

        return {
          bloc: `BLOC ${blocData.numero_bloc}`,
          bloc_id: blocData.bloc_id,
          note1: notesTriees[0] ? Number(notesTriees[0].note).toFixed(1).replace('.', ',') : '-',
          note2: notesTriees[1] ? Number(notesTriees[1].note).toFixed(1).replace('.', ',') : '-',
          temps: tempsHeures > 0 ? `${tempsHeures}H` : 'OH'
        };
      });

    // Récupérer les blocs de la formation pour calculer la progression
    let blocsCompletes = 0;
    let blocsTotaux = 0;
    if (etudiant.formation_id) {
      const { data: blocs } = await supabase
        .from('blocs_competences')
        .select('id')
        .eq('formation_id', etudiant.formation_id)
        .eq('actif', true);
      
      blocsTotaux = blocs?.length || 0;
      // Un bloc est complété s'il a au moins une note
      blocsCompletes = notesParBloc.size;
    }

    // Récupérer le temps de connexion pour la semaine dernière
    const aujourdhui = new Date();
    const ilYASemaine = new Date(aujourdhui);
    ilYASemaine.setDate(aujourdhui.getDate() - 7);
    
    const { data: sessions } = await supabase
      .from('sessions_connexion')
      .select('date_connexion, duree_minutes')
      .eq('user_id', etudiant.user_id)
      .gte('date_connexion', ilYASemaine.toISOString().split('T')[0])
      .lte('date_connexion', aujourdhui.toISOString().split('T')[0])
      .order('date_connexion', { ascending: true });

    // Calculer le temps total
    const tempsTotalMinutes = sessions?.reduce((acc, s) => acc + (s.duree_minutes || 0), 0) || 0;
    const tempsTotalHeures = Math.round(tempsTotalMinutes / 60 * 10) / 10; // Arrondi à 1 décimale

    // Préparer les données pour le graphique (7 derniers jours)
    const joursSemaineLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // L, M, M, J, V, S, D
    const tempsConnexionData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(aujourdhui);
      date.setDate(aujourdhui.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const jourIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const jourSemaine = joursSemaineLabels[jourIndex];
      
      const session = sessions?.find(s => s.date_connexion === dateStr);
      const heures = session ? Math.round((session.duree_minutes || 0) / 60 * 10) / 10 : 0;
      
      tempsConnexionData.push({
        jour: jourSemaine,
        temps: heures
      });
    }

    // Compter les quiz passés (déjà récupérés plus haut)
    const quizPasses = tentativesQuiz?.length || 0;

    // Récupérer la progression (pourcentage)
    let progression = 0;
    if (blocsTotaux > 0) {
      progression = Math.round((blocsCompletes / blocsTotaux) * 100);
    }

    // Récupérer la dernière connexion
    const derniereConnexion = sessions && sessions.length > 0
      ? sessions[sessions.length - 1].date_connexion
      : null;

    // Récupérer les signalements
    const { data: signalements } = await supabase
      .from('signalements')
      .select('*')
      .eq('etudiant_id', id)
      .order('created_at', { ascending: false });

    // Récupérer l'agenda (jours en entreprise pour le mois en cours)
    const moisActuel = new Date();
    const premierJourMois = new Date(moisActuel.getFullYear(), moisActuel.getMonth(), 1);
    const dernierJourMois = new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 0);
    
    const { data: agenda } = await supabase
      .from('agenda_etudiants')
      .select('date_event, type_event')
      .eq('etudiant_id', id)
      .gte('date_event', premierJourMois.toISOString().split('T')[0])
      .lte('date_event', dernierJourMois.toISOString().split('T')[0]);

    // Si pas assez de notes, compléter avec des blocs vides
    if (formationData && blocsTotaux > dernieresNotes.length) {
      const { data: tousLesBlocs } = await supabase
        .from('blocs_competences')
        .select('id, numero_bloc')
        .eq('formation_id', etudiant.formation_id)
        .eq('actif', true)
        .order('numero_bloc', { ascending: true });

      const blocsAvecNotes = new Set(dernieresNotes.map(n => n.bloc_id));
      const blocsManquants = tousLesBlocs
        ?.filter(b => !blocsAvecNotes.has(b.id))
        .slice(0, 5 - dernieresNotes.length)
        .map(b => ({
          bloc: `BLOC ${b.numero_bloc}`,
          bloc_id: b.id,
          note1: '-',
          note2: '-',
          temps: 'OH'
        })) || [];

      dernieresNotes.push(...blocsManquants);
    }

    // Formater les jours en entreprise pour le calendrier
    const joursEntreprise = agenda
      ?.filter(a => a.type_event === 'jour_entreprise')
      .map(a => {
        const date = new Date(a.date_event);
        return date.getDate();
      }) || [];

    // Récupérer la photo de profil
    let photoUrl = '';
    if (candidature?.photo_identite_path) {
      try {
        const { data: signedUrlData } = await supabase.storage
          .from('photo_profil')
          .createSignedUrl(candidature.photo_identite_path, 3600);
        photoUrl = signedUrlData?.signedUrl || '';
      } catch (error) {
        console.error('Erreur génération URL photo:', error);
      }
    }

    const nom = candidature?.nom || '';
    const prenom = candidature?.prenom || '';
    const email = authUser?.user?.email || candidature?.email || '';
    const name = nom && prenom ? `${prenom} ${nom}` : email.split('@')[0] || 'Utilisateur';

    // Générer un ID étudiant (format ELSA + année + numéro)
    const annee = new Date(etudiant.date_inscription || etudiant.created_at).getFullYear();
    const idEtudiant = `ELSA${annee.toString().slice(-2)}${etudiant.id.slice(0, 3).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      data: {
        id: etudiant.id,
        user_id: etudiant.user_id,
        id_etudiant: idEtudiant,
        nom,
        prenom,
        name,
        email,
        photo_url: photoUrl,
        statut: etudiant.statut,
        formation: formationData,
        formation_titre: formationData?.titre || '',
        progression,
        temps_total: `${tempsTotalHeures}H`,
        blocs_completes: blocsCompletes,
        blocs_totaux: blocsTotaux,
        quiz_passes: quizPasses,
        derniere_connexion: derniereConnexion
          ? new Date(derniereConnexion).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', ' À').replace(':', 'H')
          : null,
        membre_depuis: etudiant.date_inscription
          ? new Date(etudiant.date_inscription).toLocaleDateString('fr-FR')
          : new Date(etudiant.created_at).toLocaleDateString('fr-FR'),
        derniere_connexion_globale: authUser?.user?.last_sign_in_at
          ? new Date(authUser.user.last_sign_in_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', ' À').replace(':', 'H')
          : null,
        temps_global: `${Math.round((tempsTotalMinutes || 0) / 60)}H`,
        dernieresNotes: dernieresNotes,
        tempsConnexionData,
        joursEntreprise,
        signalements: signalements || [],
      },
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

