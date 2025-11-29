'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidature } from '@/contexts/CandidatureContext';
import { ProgressHeader } from './ProgressHeader';
import { Modal } from './Modal';
import { useModal } from './useModal';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { validatePreviousSteps } from '../utils/stepValidation';

// Initialiser Stripe avec votre clé publique
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaiementFraisScolariteProps {
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const FRAIS_INSCRIPTION = 290; // En euros

// Composant interne pour le formulaire de paiement avec Stripe
// Mémorisé pour éviter les re-renders inutiles qui causent le rechargement des Stripe Elements
const PaymentForm = memo(({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { candidatureData, refreshCandidature, updateLocalData } = useCandidature();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [isThirdPartyPayer, setIsThirdPartyPayer] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Ne plus créer automatiquement le Payment Intent au chargement
  // Il sera créé uniquement lors de la soumission du formulaire

  const createPaymentIntent = async (): Promise<string | null> => {
    if (!candidatureData?.id) {
      console.error('candidatureData.id manquant:', candidatureData);
      setErrorMessage('Candidature non trouvée. Veuillez rafraîchir la page.');
      return null;
    }

    try {
      const requestBody = {
        candidature_id: candidatureData.id,
        // Le montant est défini côté serveur pour la sécurité
        currency: 'eur',
        type_paiement: 'frais_inscription',
        payment_method: 'card'
      };


      const response = await fetch('/api/paiement/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      // Vérifier le statut HTTP avant de parser
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        
          setErrorMessage(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
          return null;
        }

      const data = await response.json();
      if (data.success) {
        // Si le paiement est déjà effectué, ne pas créer de Payment Intent
        if (data.alreadyPaid) {
          return null;
        }
        
        // Retourner le clientSecret
        if (data.clientSecret) {
          setErrorMessage(''); // Effacer les erreurs précédentes
          return data.clientSecret;
        } else {
          setErrorMessage(data.error || 'Erreur lors de la création du paiement');
          return null;
        }
      } else {
        setErrorMessage(data.error || 'Erreur lors de la création du paiement');
        return null;
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la création du paiement. Veuillez réessayer.');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'transfer') {
      // Pour le virement bancaire
      setIsProcessing(true);
      try {
        const response = await fetch('/api/paiement/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            candidature_id: candidatureData?.id,
            // Le montant est défini côté serveur pour la sécurité
            currency: 'eur',
            type_paiement: 'frais_inscription',
            payment_method: 'transfer'
          }),
        });

        // Vérifier le statut HTTP avant de parser
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
          
          // Si le paiement est déjà effectué, rafraîchir et passer à l'étape suivante
          if (errorData.error === 'Le paiement a déjà été effectué') {
            // Mettre à jour localement pour éviter les problèmes de timing
            updateLocalData({ paid_at: new Date().toISOString() });
            await refreshCandidature();
            onSuccess();
            return;
          }
          
          setErrorMessage(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
          setIsProcessing(false);
          return;
        }

        const data = await response.json();
        if (data.success) {
          // Si le paiement est déjà effectué ou vient d'être créé, rafraîchir et passer à l'étape suivante
          setErrorMessage(''); // Effacer les erreurs
          // Mettre à jour localement pour éviter les problèmes de timing avec le webhook
          updateLocalData({ paid_at: new Date().toISOString() });
          await refreshCandidature();
          onSuccess();
        } else {
          setErrorMessage(data.error || 'Erreur lors de la création du paiement');
          setIsProcessing(false);
        }
      } catch (error) {
        setErrorMessage('Une erreur est survenue lors du paiement. Veuillez réessayer.');
        setIsProcessing(false);
      }
      return;
    }

    // Pour la carte de crédit avec Stripe
    if (!stripe || !elements) {
      setErrorMessage('Stripe n\'est pas encore chargé. Veuillez patienter...');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(''); // Effacer les erreurs précédentes

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setIsProcessing(false);
      setErrorMessage('Éléments de carte non trouvés');
      return;
    }

    try {
      // Créer le Payment Intent via le backend (uniquement lors de la soumission)
      const paymentSecret = await createPaymentIntent();
      
      if (!paymentSecret) {
        setIsProcessing(false);
        return; // L'erreur a déjà été affichée dans createPaymentIntent
      }

      // Maintenant confirmer le paiement avec Stripe
      // Le webhook Stripe mettra à jour la base de données automatiquement
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: cardholderName || `${candidatureData?.prenom} ${candidatureData?.nom}`,
            email: candidatureData?.email,
          },
        },
      });

      if (error) {
        // Ne pas afficher d'erreur pour les erreurs 402 (Payment Required) si c'est dû à une carte de test en production
        if (error.code === 'card_declined' && error.message?.includes('test')) {
          setErrorMessage('Votre carte a été refusée. Veuillez utiliser une vraie carte de crédit ou vérifier vos clés Stripe.');
        } else {
          setErrorMessage(error.message || 'Erreur lors du paiement');
        }
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setErrorMessage(''); // Effacer les erreurs en cas de succès
        // Mettre à jour localement immédiatement pour éviter les problèmes de timing avec le webhook
        updateLocalData({ paid_at: new Date().toISOString() });
        // Attendre un peu pour que le webhook mette à jour la base de données
        await refreshCandidature();
        // Attendre encore un peu pour s'assurer que la base de données est à jour
        setTimeout(() => {
          refreshCandidature();
        }, 1000);
        onSuccess();
      } else {
        // Si le statut n'est pas succeeded, afficher une erreur
        setErrorMessage('Le paiement n\'a pas pu être complété. Veuillez réessayer.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      setErrorMessage('Une erreur est survenue lors du paiement. Veuillez réessayer.');
      setIsProcessing(false);
    }
  };

  // Mémoriser les options des éléments de carte pour éviter les re-renders
  // Note: Les messages d'avertissement Link sont normaux en mode test Stripe
  // Ils n'apparaîtront pas en production
  const cardElementOptions = useMemo(() => ({
    style: {
      base: {
        fontSize: '16px',
        color: '#032622',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }), []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Options de paiement */}
      <div className="space-y-3 sm:space-y-4">
        {/* Carte de crédit */}
        <div className="border border-[#032622] bg-[#F8F5E4]">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className="w-full p-3 sm:p-4 flex items-center justify-between bg-[#F8F5E4] hover:bg-[#eae5cf] active:bg-[#eae5cf]/80 transition-colors"
          >
            <span className="font-bold text-xs sm:text-sm md:text-base text-[#032622]">CARTE DE CRÉDIT</span>
            <span className="text-[#032622] text-sm sm:text-base">{paymentMethod === 'card' ? '▼' : '▲'}</span>
          </button>
          {paymentMethod === 'card' && (
            <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 border-t border-[#032622]">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#032622] mb-2">NOM SUR LA CARTE</label>
                <input
                  type="text"
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  placeholder="Nom complet"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#032622] mb-2">NUMÉRO DE CARTE</label>
                <div className="p-2.5 sm:p-3 border border-[#032622] bg-[#F8F5E4]">
                  <CardNumberElement options={cardElementOptions} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#032622] mb-2">MM/YY</label>
                  <div className="p-2.5 sm:p-3 border border-[#032622] bg-[#F8F5E4]">
                    <CardExpiryElement options={cardElementOptions} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#032622] mb-2">CVC</label>
                  <div className="p-2.5 sm:p-3 border border-[#032622] bg-[#F8F5E4]">
                    <CardCvcElement options={cardElementOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Virement bancaire */}
        <div className="border border-[#032622] bg-[#F8F5E4]">
          <button
            type="button"
            onClick={() => setPaymentMethod('transfer')}
            className="w-full p-3 sm:p-4 flex items-center justify-between bg-[#F8F5E4] hover:bg-[#eae5cf] active:bg-[#eae5cf]/80 transition-colors"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <input
                type="checkbox"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              />
              <span className="font-bold text-xs sm:text-sm md:text-base text-[#032622]">VIREMENT BANCAIRE</span>
            </div>
            <span className="text-[#032622] text-sm sm:text-base">{paymentMethod === 'transfer' ? '▼' : '▲'}</span>
          </button>
          {paymentMethod === 'transfer' && (
            <div className="p-4 sm:p-5 md:p-6 border-t border-[#032622]">
              <p className="text-xs sm:text-sm text-[#032622]">
                Pas disponible pour l'instant, utilise plutôt la carte de crédit ou <span className="font-bold">contacte l'école</span> pour effectuer le paiement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checkbox tiers payeur */}
      <div className="flex items-start gap-2 sm:gap-3">
        <input
          type="checkbox"
          id="third-party-payer"
          checked={isThirdPartyPayer}
          onChange={(e) => setIsThirdPartyPayer(e.target.checked)}
          className="mt-1 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 cursor-pointer"
        />
        <label htmlFor="third-party-payer" className="text-xs sm:text-sm text-[#032622] cursor-pointer">
          JE NE SUIS PAS LE TITULAIRE DU MOYEN DE PAIEMENT UTILISÉ POUR CETTE TRANSACTION
        </label>
      </div>

      {/* Affichage des erreurs juste au-dessus du bouton */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded">
          <p className="font-bold text-xs sm:text-sm break-words">{errorMessage}</p>
        </div>
      )}

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isProcessing || (paymentMethod === 'card' && !stripe)}
        className={`w-full py-3 sm:py-4 px-6 sm:px-8 font-bold text-white transition-colors text-sm sm:text-base ${
          isProcessing || (paymentMethod === 'card' && !stripe)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#6B7280] hover:bg-[#4B5563] active:bg-[#374151]'
        }`}
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        {isProcessing ? 'TRAITEMENT EN COURS...' : 'PAYER'}
      </button>
    </form>
  );
}, (prevProps, nextProps) => {
  // Ne re-render que si onSuccess change (ce qui ne devrait jamais arriver)
  return prevProps.onSuccess === nextProps.onSuccess;
});

export default function PaiementFraisScolarite({ onNext, onPrev, onClose }: PaiementFraisScolariteProps) {
  const router = useRouter();
  const { candidatureData, isLoading, refreshCandidature } = useCandidature();
  const { modalState, showError, showSuccess, hideModal, showWarning } = useModal();
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Vérifier si le paiement a déjà été effectué (seulement si paid_at existe vraiment)
    // On vérifie aussi que paid_at n'est pas une chaîne vide ou null
    const paidAt = candidatureData?.paid_at;
    if (paidAt && paidAt !== null && paidAt !== '') {
      setHasPaid(true);
    } else {
      // Réinitialiser hasPaid si paid_at n'existe pas ou est vide
      setHasPaid(false);
    }
  }, [candidatureData?.paid_at]); // Utiliser seulement paid_at pour éviter les re-renders inutiles

  // Ne plus rafraîchir automatiquement pour éviter les rechargements constants des Stripe Elements
  // Le rafraîchissement se fera uniquement après la soumission du formulaire de paiement

  // Vérifier les étapes précédentes au chargement
  useEffect(() => {
    if (!candidatureData) return;
    
    // Ne pas vérifier si le paiement est déjà effectué
    const paidAt = candidatureData?.paid_at;
    if (paidAt && paidAt !== null && paidAt !== '') {
      return; // Paiement déjà effectué, pas besoin de vérifier
    }
    
    const validation = validatePreviousSteps('inscription', candidatureData);
    if (!validation.isValid && validation.missingStep && validation.message) {
      // Utiliser setTimeout pour éviter la boucle infinie
      const timer = setTimeout(() => {
        showWarning(
          validation.message + '\n\nCliquez sur OK pour être redirigé vers l\'étape manquante.',
          'Étape manquante',
          () => {
            router.push(`/validation?step=${validation.missingStep}`);
          }
        );
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatureData?.id]); // Utiliser seulement l'ID pour éviter les re-renders

  const handlePaymentSuccess = () => {
    setHasPaid(true);
    showSuccess('Paiement effectué avec succès');
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  // Mémoriser les options Stripe pour éviter les re-renders qui causent le rechargement des éléments
  const stripeOptions: StripeElementsOptions = useMemo(() => ({
    appearance: {
      theme: 'stripe',
    },
  }), []);

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <main className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 sm:py-6 md:py-8">
        <ProgressHeader currentStep="INSCRIPTION" onClose={onClose} />

        <div className="space-y-6 sm:space-y-7 md:space-y-8">
          {/* Titre */}
          <div className="text-left mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] mb-3 sm:mb-4 md:mb-6" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              CONFIRME TA PLACE SUR LE CAMPUS NUMÉRIQUE
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#032622] max-w-2xl" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              Les frais techniques permettent de confirmer ton dossier et de créer ton espace étudiant.
            </p>
          </div>

          {/* Résumé des frais */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-200 p-3 sm:p-4 flex justify-between items-center">
              <span className="font-bold text-sm sm:text-base text-[#032622]">FRAIS D'INSCRIPTION:</span>
              <span className="font-bold text-sm sm:text-base text-[#032622]">{FRAIS_INSCRIPTION}€</span>
            </div>
            <div className="bg-gray-400 p-3 sm:p-4 flex justify-between items-center">
              <span className="font-bold text-sm sm:text-base text-[#032622]">TOTAL:</span>
              <span className="font-bold text-sm sm:text-base text-[#032622]">{FRAIS_INSCRIPTION}€</span>
            </div>
          </div>

          {/* Boîte d'information */}
          <div className="bg-[#032622] p-4 sm:p-5 md:p-6 flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#032622] font-bold text-base sm:text-lg md:text-xl">i</span>
            </div>
            <div className="text-white text-xs sm:text-sm flex-1">
              <p>
                CES FRAIS VALIDENT TON INSCRIPTION ET CRÉE UN ACCÈS À LA PLATEFORME. Ils couvrent les coûts de création de son compte, de vérification de dossier. 
                <span className="font-bold"> ATTENTION : ces frais ne sont pas remboursables</span>
              </p>
            </div>
          </div>

          {/* Section paiement */}
          {isLoading ? (
            <div className="bg-gray-100 border border-gray-300 p-4 sm:p-5 md:p-6 text-center">
              <p className="text-gray-700 font-bold text-base sm:text-lg mb-2">Chargement des informations...</p>
              <p className="text-gray-600 text-xs sm:text-sm">Veuillez patienter.</p>
            </div>
          ) : hasPaid ? (
            <div className="bg-green-100 border border-green-500 p-4 sm:p-5 md:p-6 text-center">
              <p className="text-green-800 font-bold text-base sm:text-lg mb-2">✅ Paiement effectué avec succès</p>
              <p className="text-green-700 text-xs sm:text-sm">Vous pouvez passer à l'étape suivante.</p>
            </div>
          ) : !candidatureData?.id ? (
            <div className="bg-yellow-100 border border-yellow-500 p-4 sm:p-5 md:p-6 text-center">
              <p className="text-yellow-800 font-bold text-base sm:text-lg mb-2">⚠️ Candidature non trouvée</p>
              <p className="text-yellow-700 text-xs sm:text-sm">Veuillez compléter les étapes précédentes avant de procéder au paiement.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                MOYENS DE PAIEMENTS
              </h2>
              <Elements key={`elements-${candidatureData?.id || 'default'}`} stripe={stripePromise} options={stripeOptions}>
                <PaymentForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
            <button
              onClick={onPrev}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border border-[#032622] text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors font-bold text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              RETOUR
            </button>
            
            {hasPaid && (
              <button
                onClick={onNext}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6B7280] text-white hover:bg-[#4B5563] active:bg-[#374151] transition-colors font-bold text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                SUIVANT
              </button>
            )}
          </div>
        </div>
      </main>

      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
}
