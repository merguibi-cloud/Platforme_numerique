import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';
import { sendPaymentConfirmationEmailWithResend } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const permissionResult = await requireAdminOrRole(user.id, ['admin', 'superadmin']);
    if ('error' in permissionResult) {
      return permissionResult.error;
    }

    const supabase = getSupabaseServerClient();

    // Fetch paiement
    const { data: paiement, error: paiementError } = await supabase
      .from('paiements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (paiementError || !paiement) {
      return NextResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }

    if (paiement.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Impossible de renvoyer un reçu pour un paiement non réussi' },
        { status: 400 }
      );
    }

    // Fetch candidature
    const { data: candidature } = await supabase
      .from('candidatures')
      .select('id, nom, prenom, email, formation_id')
      .eq('id', paiement.candidature_id)
      .maybeSingle();

    if (!candidature || !candidature.email) {
      return NextResponse.json(
        { success: false, error: 'Candidature ou email non trouvé' },
        { status: 404 }
      );
    }

    // Fetch formation name
    let formationName: string | undefined;
    if (candidature.formation_id) {
      const { data: formation } = await supabase
        .from('formations')
        .select('nom, titre')
        .eq('id', candidature.formation_id)
        .maybeSingle();
      formationName = formation?.titre || formation?.nom;
    }

    const result = await sendPaymentConfirmationEmailWithResend({
      to: candidature.email,
      candidateName: `${candidature.prenom || ''} ${candidature.nom || ''}`.trim() || 'Candidat',
      amount: paiement.amount,
      currency: paiement.currency || 'EUR',
      paidAt: paiement.paid_at || paiement.created_at,
      paymentMethod: paiement.payment_method || 'card',
      formationName,
      paiementId: paiement.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Reçu renvoyé à ${candidature.email}`,
    });
  } catch (error) {
    console.error('Erreur dans POST /api/admin/paiements/[id]/resend-receipt:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}