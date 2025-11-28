import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Vérifier que Stripe est configuré avec une clé valide
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY non configuré dans les variables d\'environnement');
    return NextResponse.json(
      { error: 'Configuration Stripe manquante' },
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET non configuré dans les variables d\'environnement');
    return NextResponse.json(
      { error: 'Configuration webhook Stripe manquante' },
      { status: 500 }
    );
  }

  // Initialiser Stripe avec la clé secrète
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });

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

  // Frais d'inscription attendus (doit correspondre au montant côté serveur)
  const FRAIS_INSCRIPTION_ATTENDUS = 290; // En euros

  // Gérer les événements de paiement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // S'assurer que candidature_id est une string (Stripe peut parfois convertir les valeurs)
    const candidatureId = String(paymentIntent.metadata?.candidature_id || '').trim();
    
    if (!candidatureId || candidatureId === '') {
      console.error('candidature_id manquant dans les metadata du Payment Intent:', paymentIntent.id);
      return NextResponse.json({ received: true });
    }

    // SÉCURITÉ 1: Vérifier l'idempotence - éviter les doublons
    const { data: existingPayment } = await supabase
      .from('paiements')
      .select('id, status')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle();

    if (existingPayment) {
      // Le paiement existe déjà, retourner un succès (idempotence)
      return NextResponse.json({ received: true });
    }

    // SÉCURITÉ 2: Valider le montant reçu
    const amountReceived = paymentIntent.amount / 100; // Convertir de centimes en euros
    if (amountReceived !== FRAIS_INSCRIPTION_ATTENDUS) {
      console.error(
        `Montant invalide reçu: ${amountReceived}€ (attendu: ${FRAIS_INSCRIPTION_ATTENDUS}€) pour Payment Intent ${paymentIntent.id}`
      );
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // SÉCURITÉ 3: Valider la candidature
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('id, user_id, paid_at, status')
      .eq('id', candidatureId)
      .maybeSingle();

    if (candidatureError) {
      console.error('Erreur lors de la récupération de la candidature:', candidatureError);
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      );
    }

    if (!candidature) {
      console.error(`Candidature ${candidatureId} introuvable pour Payment Intent ${paymentIntent.id}`);
      return NextResponse.json(
        { error: 'Candidature introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que la candidature n'a pas déjà été payée
    if (candidature.paid_at) {
      // Ne pas créer de doublon, mais retourner un succès
      return NextResponse.json({ received: true });
    }

    // SÉCURITÉ 4: Créer l'entrée dans la table paiements (c'est le webhook qui crée l'entrée)
    const { data: paiement, error: insertError } = await supabase
      .from('paiements')
      .insert({
        candidature_id: candidatureId,
        amount: amountReceived,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'succeeded',
        payment_method: 'card',
        stripe_payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
        stripe_webhook_data: paymentIntent as any,
      })
      .select()
      .single();

    if (insertError) {
      // Si l'erreur est due à une contrainte UNIQUE (doublon), c'est OK
      if (insertError.code === '23505') { // Code d'erreur PostgreSQL pour violation UNIQUE
        return NextResponse.json({ received: true });
      }
      
      console.error('Erreur lors de la création du paiement:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 }
      );
    }

    // SÉCURITÉ 5: Mettre à jour la candidature seulement si l'insertion a réussi
    const paidAtDate = new Date().toISOString();
    const { data: updatedCandidature, error: updateError } = await supabase
      .from('candidatures')
      .update({
        paid_at: paidAtDate,
        status: 'paid',
        current_step: 'inscription',
        updated_at: paidAtDate
      })
      .eq('id', candidatureId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la candidature:', updateError);
      // Retourner une erreur pour que Stripe réessaie le webhook
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour de la candidature: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!updatedCandidature) {
      console.error('La candidature n\'a pas été mise à jour (aucune donnée retournée)');
      return NextResponse.json(
        { error: 'La candidature n\'a pas été mise à jour' },
        { status: 500 }
      );
    }

    // Changer le rôle de 'lead' à 'candidat' si l'utilisateur a le rôle 'lead'
    if (candidature.user_id) {
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
          // Ne pas bloquer le webhook pour cette erreur, c'est secondaire
        }
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // S'assurer que candidature_id est une string
    const candidatureId = String(paymentIntent.metadata?.candidature_id || '').trim();
    
    if (!candidatureId || candidatureId === '') {
      console.error('candidature_id manquant dans les metadata du Payment Intent pour paiement échoué');
      return NextResponse.json({ received: true });
    }

    // Vérifier l'idempotence pour les paiements échoués aussi
    const { data: existingPayment } = await supabase
      .from('paiements')
      .select('id, status')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle();

    if (existingPayment) {
      // Le paiement existe déjà, retourner un succès (idempotence)
      return NextResponse.json({ received: true });
    }

    // Créer l'entrée dans la table paiements avec le statut failed
    const { error: insertError } = await supabase
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

    if (insertError) {
      // Si l'erreur est due à une contrainte UNIQUE (doublon), c'est OK
      if (insertError.code === '23505') {
        return NextResponse.json({ received: true });
      }
      
      console.error('Erreur lors de la création du paiement échoué:', insertError);
    }
  }

  return NextResponse.json({ received: true });
}
