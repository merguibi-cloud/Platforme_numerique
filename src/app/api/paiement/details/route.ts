import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Récupérer le token d'accès depuis les cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier l'utilisateur avec le token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      );
    }

    // Récupérer l'ID du paiement ou de la candidature depuis les paramètres
    const { searchParams } = new URL(request.url);
    const paiementId = searchParams.get('paiement_id');
    const candidatureId = searchParams.get('candidature_id');

    // Construire la requête en fonction des paramètres
    let query = supabase
      .from('paiements')
      .select(`
        id,
        candidature_id,
        amount,
        currency,
        status,
        payment_method,
        stripe_payment_intent_id,
        paid_at,
        failed_at,
        failure_reason,
        created_at
      `);

    if (paiementId) {
      query = query.eq('id', paiementId);
    } else if (candidatureId) {
      query = query.eq('candidature_id', candidatureId);
    } else {
      // Si aucun paramètre, récupérer via la candidature de l'utilisateur
      const { data: candidature, error: candError } = await supabase
        .from('candidatures')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (candError || !candidature) {
        return NextResponse.json(
          { success: false, error: 'Aucune candidature trouvée' },
          { status: 404 }
        );
      }

      query = query.eq('candidature_id', candidature.id);
    }

    // Récupérer le paiement le plus récent avec succès
    const { data: paiements, error: paiementError } = await query
      .eq('status', 'succeeded')
      .order('paid_at', { ascending: false });

    if (paiementError) {
      console.error('Erreur lors de la récupération du paiement:', paiementError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération du paiement' },
        { status: 500 }
      );
    }

    if (!paiements || paiements.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun paiement trouvé' },
        { status: 404 }
      );
    }

    const paiement = paiements[0];

    // Vérifier que l'utilisateur a accès à ce paiement
    const { data: candidature, error: candVerifyError } = await supabase
      .from('candidatures')
      .select('id, user_id, formation_id, nom, prenom, email')
      .eq('id', paiement.candidature_id)
      .maybeSingle();

    if (candVerifyError || !candidature) {
      return NextResponse.json(
        { success: false, error: 'Candidature non trouvée' },
        { status: 404 }
      );
    }

    if (candidature.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer les informations de la formation
    const { data: formation } = await supabase
      .from('formations')
      .select('id, nom')
      .eq('id', candidature.formation_id)
      .maybeSingle();

    // Récupérer l'URL du reçu Stripe si disponible
    let stripeReceiptUrl = null;
    if (paiement.stripe_payment_intent_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-11-17.clover',
        });

        const paymentIntent = await stripe.paymentIntents.retrieve(paiement.stripe_payment_intent_id);

        // Récupérer la charge associée pour avoir l'URL du reçu
        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
          stripeReceiptUrl = charge.receipt_url;
        }
      } catch (stripeError) {
        console.error('Erreur lors de la récupération du reçu Stripe:', stripeError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paiement: {
          id: paiement.id,
          amount: paiement.amount,
          currency: paiement.currency,
          status: paiement.status,
          payment_method: paiement.payment_method,
          paid_at: paiement.paid_at,
          created_at: paiement.created_at,
          stripe_receipt_url: stripeReceiptUrl,
        },
        candidature: {
          id: candidature.id,
          nom: candidature.nom,
          prenom: candidature.prenom,
          email: candidature.email,
        },
        formation: formation ? {
          id: formation.id,
          nom: formation.nom,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
