import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Erreur de signature webhook:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();

  // Gérer les événements de paiement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const candidatureId = paymentIntent.metadata?.candidature_id;
    
    if (!candidatureId) {
      console.error('candidature_id manquant dans les metadata du Payment Intent');
      return NextResponse.json({ received: true });
    }

    // Créer l'entrée dans la table paiements (c'est le webhook qui crée l'entrée)
    const { error: insertError } = await supabase
      .from('paiements')
      .insert({
        candidature_id: candidatureId,
        amount: paymentIntent.amount / 100, // Convertir de centimes en euros
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        payment_method: 'card',
        stripe_payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
        stripe_webhook_data: paymentIntent as any,
      });

    if (insertError) {
      console.error('Erreur lors de la création du paiement:', insertError);
    } else {
      // Récupérer la candidature pour obtenir le user_id
      const { data: candidature, error: candidatureError } = await supabase
        .from('candidatures')
        .select('user_id')
        .eq('id', candidatureId)
        .single();

      if (candidatureError) {
        console.error('Erreur lors de la récupération de la candidature:', candidatureError);
      } else if (candidature?.user_id) {
        // Changer le rôle de 'lead' à 'candidat' si l'utilisateur a le rôle 'lead'
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', candidature.user_id)
          .maybeSingle();

        if (profile && profile.role === 'lead') {
          const { error: roleUpdateError } = await supabase
            .from('user_profiles')
            .update({ role: 'candidat' })
            .eq('user_id', candidature.user_id);

          if (roleUpdateError) {
            console.error('Erreur lors du changement de rôle:', roleUpdateError);
          } else {
          }
        }
      }

      // Mettre à jour la candidature
      await supabase
        .from('candidatures')
        .update({
          paid_at: new Date().toISOString(),
          status: 'paid',
          current_step: 'inscription'
        })
        .eq('id', candidatureId);
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const candidatureId = paymentIntent.metadata?.candidature_id;
    
    if (!candidatureId) {
      console.error('candidature_id manquant dans les metadata du Payment Intent');
      return NextResponse.json({ received: true });
    }

    // Créer l'entrée dans la table paiements avec le statut failed
    await supabase
      .from('paiements')
      .insert({
        candidature_id: candidatureId,
        amount: paymentIntent.amount / 100, // Convertir de centimes en euros
        currency: paymentIntent.currency.toUpperCase(),
        status: 'failed',
        payment_method: 'card',
        stripe_payment_intent_id: paymentIntent.id,
        failed_at: new Date().toISOString(),
        failure_reason: paymentIntent.last_payment_error?.message || 'Échec du paiement',
        stripe_webhook_data: paymentIntent as any,
      });
  }

  return NextResponse.json({ received: true });
}
