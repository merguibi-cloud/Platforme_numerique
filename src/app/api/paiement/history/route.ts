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

    // Récupérer l'ID de la candidature depuis les paramètres (optionnel)
    const { searchParams } = new URL(request.url);
    const candidatureId = searchParams.get('candidature_id');

    // Si pas de candidature_id, récupérer la candidature de l'utilisateur
    let targetCandidatureId = candidatureId;
    
    if (!targetCandidatureId) {
      const { data: candidature, error: candError } = await supabase
        .from('candidatures')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (candError || !candidature) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      targetCandidatureId = candidature.id;
    } else {
      // Vérifier que l'utilisateur a accès à cette candidature
      const { data: candidature, error: candError } = await supabase
        .from('candidatures')
        .select('id, user_id')
        .eq('id', targetCandidatureId)
        .maybeSingle();

      if (candError || !candidature || candidature.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }
    }

    // Récupérer tous les paiements de la candidature
    const { data: paiements, error: paiementError } = await supabase
      .from('paiements')
      .select(`
        id,
        amount,
        currency,
        status,
        payment_method,
        stripe_payment_intent_id,
        paid_at,
        failed_at,
        failure_reason,
        created_at
      `)
      .eq('candidature_id', targetCandidatureId)
      .order('created_at', { ascending: false });

    if (paiementError) {
      console.error('Erreur lors de la récupération des paiements:', paiementError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des paiements' },
        { status: 500 }
      );
    }

    // Récupérer les URLs des reçus Stripe pour les paiements réussis
    const paymentsWithReceipts = await Promise.all(
      (paiements || []).map(async (paiement) => {
        let stripeReceiptUrl = null;

        if (paiement.status === 'succeeded' && paiement.stripe_payment_intent_id && process.env.STRIPE_SECRET_KEY) {
          try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
              apiVersion: '2025-11-17.clover',
            });

            const paymentIntent = await stripe.paymentIntents.retrieve(paiement.stripe_payment_intent_id);

            if (paymentIntent.latest_charge) {
              const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
              stripeReceiptUrl = charge.receipt_url;
            }
          } catch (stripeError) {
            console.error('Erreur Stripe pour paiement', paiement.id, ':', stripeError);
          }
        }

        return {
          ...paiement,
          stripe_receipt_url: stripeReceiptUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: paymentsWithReceipts,
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
