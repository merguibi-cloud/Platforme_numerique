import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/api-helpers';
import Stripe from 'stripe';

// Frais d'inscription définis côté serveur
const FRAIS_INSCRIPTION = 290; // En euros

/**
 * POST - Créer un Payment Intent pour les frais d'inscription
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que Stripe est configuré avec une clé valide
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY non configuré dans les variables d\'environnement');
      return NextResponse.json(
        { success: false, error: 'Configuration Stripe manquante. Veuillez vérifier votre fichier .env.local' },
        { status: 500 }
      );
    }

    // Vérifier que c'est bien une clé secrète Stripe (commence par sk_)
    if (!stripeSecretKey.startsWith('sk_')) {
      console.error('STRIPE_SECRET_KEY invalide. La clé doit commencer par "sk_"');
      console.error('Clé fournie commence par:', stripeSecretKey.substring(0, 10));
      return NextResponse.json(
        { success: false, error: 'Clé API Stripe invalide. Vérifiez que vous utilisez la clé secrète (sk_...) et non la clé webhook (whsec_...)' },
        { status: 500 }
      );
    }

    // Initialiser Stripe avec la clé secrète
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    const authResult = await getAuthenticatedUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { user } = authResult;

    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { candidature_id, currency, type_paiement, payment_method } = body;

    // Le montant est défini côté serveur pour la sécurité (pas de confiance dans le client)
    const amount = FRAIS_INSCRIPTION * 100; // Convertir en centimes

    // Log pour déboguer
    if (process.env.NODE_ENV === 'development') {
    }

    if (!candidature_id) {
      console.error('candidature_id manquant');
      return NextResponse.json(
        { success: false, error: 'Candidature ID requis' },
        { status: 400 }
      );
    }

    // Vérifier que la candidature appartient à l'utilisateur
    const { data: candidature, error: candidatureError } = await supabase
      .from('candidatures')
      .select('id, user_id, paid_at, email, nom, prenom')
      .eq('id', candidature_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (candidatureError) {
      console.error('Erreur Supabase:', candidatureError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération de la candidature' },
        { status: 500 }
      );
    }

    if (!candidature) {
      return NextResponse.json(
        { success: false, error: 'Candidature non trouvée ou ne vous appartient pas' },
        { status: 404 }
      );
    }

    // Vérifier si le paiement a déjà été effectué
    if (candidature.paid_at) {
      // Retourner un succès silencieux plutôt qu'une erreur
      // Le frontend gérera l'affichage du statut "déjà payé"
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: 'Le paiement a déjà été effectué'
      });
    }

    if (payment_method === 'transfer') {
      // Pour le virement bancaire, créer un paiement en attente
      const { data: paiement, error: paiementError } = await supabase
        .from('paiements')
        .insert({
          candidature_id: candidature_id,
          amount: amount / 100,
          currency: currency || 'EUR',
          status: 'pending',
          payment_method: 'transfer',
        })
        .select()
        .single();

      if (paiementError) {
        console.error('Erreur lors de la création du paiement:', paiementError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création du paiement' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        payment_id: paiement.id,
        message: 'Paiement par virement créé. Les instructions seront envoyées par email.'
      });
    } else {
      // Pour la carte de crédit, créer un Payment Intent Stripe
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount, // Montant en centimes
          currency: currency || 'eur',
          metadata: {
            candidature_id: candidature_id,
            user_id: user.id,
            type_paiement: type_paiement || 'frais_inscription',
          },
          description: `Frais d'inscription - ${candidature.nom} ${candidature.prenom}`,
        });

        // Ne PAS créer d'entrée dans la BDD ici
        // Le webhook Stripe créera l'entrée dans la table paiements après confirmation du paiement

        return NextResponse.json({
          success: true,
          clientSecret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        });
      } catch (stripeError: any) {
        return NextResponse.json(
          { 
            success: false, 
            error: stripeError.message || 'Erreur lors de la création du paiement Stripe' 
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Erreur dans POST /api/paiement/create-intent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erreur interne du serveur' 
      },
      { status: 500 }
    );
  }
}

