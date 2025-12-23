import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { logUpdate, logAuditAction } from '@/lib/audit-logger';

// POST - Soumettre la candidature (changer le statut de draft à submitted)
export async function POST(request: NextRequest) {
  try {
    // Authentification
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();

    // Récupérer la candidature de l'utilisateur
    const { data: candidature, error: getCandidatureError } = await supabase
      .from('candidatures')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (getCandidatureError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la candidature' },
        { status: 500 }
      );
    }

    if (!candidature) {
      return NextResponse.json(
        { success: false, error: 'Aucune candidature trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que toutes les données requises sont présentes
    const hasInfos = candidature.nom && candidature.prenom && candidature.email && candidature.telephone;
    const hasDocs = candidature.cv_path && candidature.diplome_path && 
                   (candidature.releves_paths && candidature.releves_paths.length > 0) &&
                   (candidature.piece_identite_paths && candidature.piece_identite_paths.length > 0) &&
                   candidature.lettre_motivation_path;
    const hasRecap = candidature.accept_conditions && candidature.attest_correct;
    // Vérifier que le paiement a été effectué
    const paidAt = candidature.paid_at;
    const hasPaid = !!(paidAt && paidAt !== null && paidAt !== '');

    if (!hasInfos || !hasDocs || !hasRecap || !hasPaid) {
      return NextResponse.json(
        { success: false, error: 'La candidature est incomplète. Veuillez compléter toutes les étapes, y compris le paiement des frais d\'inscription.' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut à 'submitted' et enregistrer la date de soumission
    const now = new Date().toISOString();
    const { data: updatedCandidature, error: updateError } = await supabase
      .from('candidatures')
      .update({
        status: 'submitted',
        submitted_at: now,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la candidature:', updateError);
      await logUpdate(request, 'candidatures', candidature.id, candidature, { status: 'submitted' }, ['status'], `Échec de soumission de candidature: ${updateError.message}`).catch(() => {});
      return NextResponse.json(
        { success: false, error: `Erreur lors de la soumission de la candidature: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Logger la soumission de candidature
    await logUpdate(request, 'candidatures', candidature.id, candidature, updatedCandidature, ['status', 'submitted_at'], `Soumission de la candidature pour ${candidature.nom} ${candidature.prenom}`).catch(() => {});

    // TODO: Envoyer un email de confirmation
    // await sendConfirmationEmail(user.email, updatedCandidature);

    return NextResponse.json({
      success: true,
      data: updatedCandidature,
      message: 'Candidature soumise avec succès'
    });

  } catch (error) {
    console.error('Erreur serveur lors de la soumission:', error);
    return NextResponse.json(
      { success: false, error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

