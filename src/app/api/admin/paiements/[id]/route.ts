import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requireAdminOrRole } from '@/lib/auth-helpers';

export async function GET(
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

    if (paiementError) {
      console.error('Erreur récupération paiement:', paiementError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du paiement' },
        { status: 500 }
      );
    }

    if (!paiement) {
      return NextResponse.json(
        { success: false, error: 'Paiement non trouvé' },
        { status: 404 }
      );
    }

    // Fetch candidature
    let candidature = null;
    if (paiement.candidature_id) {
      const { data: cand } = await supabase
        .from('candidatures')
        .select('id, user_id, nom, prenom, email, telephone, formation_id, status, paid_at, created_at')
        .eq('id', paiement.candidature_id)
        .maybeSingle();
      candidature = cand;
    }

    // Fetch formation
    let formation = null;
    if (candidature?.formation_id) {
      const { data: form } = await supabase
        .from('formations')
        .select('id, titre, ecole, prix')
        .eq('id', candidature.formation_id)
        .maybeSingle();
      formation = form;
    }

    // Fetch payment history for the same candidat (all paiements linked to same user's candidatures)
    let paymentHistory: any[] = [];
    if (candidature?.user_id) {
      const { data: userCandidatures } = await supabase
        .from('candidatures')
        .select('id')
        .eq('user_id', candidature.user_id);

      if (userCandidatures && userCandidatures.length > 0) {
        const candidatureIds = userCandidatures.map((c: any) => c.id);
        const { data: history } = await supabase
          .from('paiements')
          .select('id, amount, currency, status, payment_method, paid_at, failed_at, created_at')
          .in('candidature_id', candidatureIds)
          .order('created_at', { ascending: false });

        paymentHistory = history || [];
      }
    }

    // Build Stripe dashboard link
    const stripeDashboardUrl = paiement.stripe_payment_intent_id
      ? `https://dashboard.stripe.com/payments/${paiement.stripe_payment_intent_id}`
      : null;

    return NextResponse.json({
      success: true,
      paiement: {
        ...paiement,
        stripe_dashboard_url: stripeDashboardUrl,
      },
      candidature,
      formation,
      paymentHistory,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/admin/paiements/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}