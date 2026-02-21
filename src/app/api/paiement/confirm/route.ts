import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import { sendPaymentConfirmationEmailWithResend } from '@/lib/email-service';
import Stripe from 'stripe';
 
const FRAIS_INSCRIPTION = 290; // En euros — doit correspondre à create-intent et webhook
 
/**
 * POST /api/paiement/confirm
 *
 * Appelé par le client immédiatement après que stripe.confirmCardPayment() retourne
 * status === 'succeeded'. Vérifie le paiement côté serveur via l'API Stripe, puis
 * écrit paid_at dans la base de données de façon synchrone, avant que le client
 * ne passe à l'étape suivante.
 *
 * Le webhook Stripe peut toujours arriver ultérieurement ; la vérification d'idempotence
 * sur stripe_payment_intent_id empêche tout doublon.
 */
export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }
 
    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;
 
    const body = await request.json();
    const { payment_intent_id, candidature_id } = body;
 
    if (!payment_intent_id || !candidature_id) {
      return NextResponse.json(
        { success: false, error: 'payment_intent_id et candidature_id requis' },
        { status: 400 }
      );
    }
 
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });
 
    // 1. Vérifier le paiement directement auprès de Stripe
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    } catch (err: any) {
      console.error('Erreur lors de la récupération du PaymentIntent:', err.message);
      return NextResponse.json(
        { success: false, error: 'Impossible de vérifier le paiement auprès de Stripe' },
        { status: 502 }
      );
    }
 
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: `Le paiement n'est pas encore confirmé (statut : ${paymentIntent.status})` },
        { status: 402 }
      );
    }
 
    // 2. Valider le montant
    const amountReceived = paymentIntent.amount / 100;
    if (amountReceived !== FRAIS_INSCRIPTION) {
      console.error(`Montant invalide : ${amountReceived}€ (attendu : ${FRAIS_INSCRIPTION}€)`);
      return NextResponse.json(
        { success: false, error: 'Montant du paiement invalide' },
        { status: 400 }
      );
    }
 
    const supabase = getSupabaseServerClient();
 
    // 3. Vérifier que la candidature appartient à l'utilisateur
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('id, user_id, paid_at, email, prenom, nom, formation_id')
      .eq('id', candidature_id)
      .eq('user_id', user.id)
      .maybeSingle();
 
    if (candidatureError || !candidature) {
      return NextResponse.json(
        { success: false, error: 'Candidature introuvable ou ne vous appartient pas' },
        { status: 404 }
      );
    }
 
    // 4. Idempotence : déjà traité ?
    if (candidature.paid_at) {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }
 
    const { data: existingPayment } = await supabase
      .from('paiements')
      .select('id')
      .eq('stripe_payment_intent_id', payment_intent_id)
      .maybeSingle();
 
    if (existingPayment) {
      // Le webhook a déjà traité ce paiement — s'assurer que paid_at est bien mis à jour
      await supabase
        .from('candidatures')
        .update({ paid_at: new Date().toISOString(), status: 'paid', current_step: 'inscription' })
        .eq('id', candidature_id)
        .is('paid_at', null);
 
      return NextResponse.json({ success: true });
    }
 
    // 5. Créer l'entrée dans la table paiements
    const paidAtDate = new Date().toISOString();
    const { data: paiement, error: insertError } = await supabase
      .from('paiements')
      .insert({
        candidature_id,
        amount: amountReceived,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        payment_method: 'card',
        stripe_payment_intent_id: payment_intent_id,
        paid_at: paidAtDate,
        stripe_webhook_data: paymentIntent as any,
      })
      .select()
      .single();
 
    if (insertError) {
      // Violation UNIQUE : le webhook a frappé en parallèle, pas un problème
      if (insertError.code === '23505') {
        return NextResponse.json({ success: true });
      }
      console.error('Erreur insertion paiement:', insertError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'enregistrement du paiement' },
        { status: 500 }
      );
    }
 
    // 6. Mettre à jour la candidature
    const { error: updateError } = await supabase
      .from('candidatures')
      .update({
        paid_at: paidAtDate,
        status: 'paid',
        current_step: 'inscription',
        updated_at: paidAtDate,
      })
      .eq('id', candidature_id);
 
    if (updateError) {
      console.error('Erreur mise à jour candidature:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour de la candidature' },
        { status: 500 }
      );
    }
 
    // 7. Mettre à jour le rôle utilisateur : lead → candidat
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
 
    if (profile?.role === 'lead') {
      await supabase
        .from('user_profiles')
        .update({ role: 'candidat' })
        .eq('user_id', user.id);
    }
 
    // 8. Envoyer l'email de confirmation (non bloquant)
    try {
      let formationName: string | undefined;
      if (candidature.formation_id) {
        const { data: formation } = await supabase
          .from('formations')
          .select('nom')
          .eq('id', candidature.formation_id)
          .maybeSingle();
        formationName = formation?.nom;
      }
 
      await sendPaymentConfirmationEmailWithResend({
        to: candidature.email || '',
        candidateName: `${candidature.prenom || ''} ${candidature.nom || ''}`.trim() || 'Candidat',
        amount: amountReceived,
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: paidAtDate,
        paymentMethod: 'card',
        formationName,
        paiementId: paiement.id,
      });
    } catch (emailError) {
      console.error('Erreur envoi email confirmation paiement:', emailError);
    }
 
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur dans POST /api/paiement/confirm:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}