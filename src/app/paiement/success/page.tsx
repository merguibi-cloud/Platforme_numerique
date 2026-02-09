'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, FileText, ArrowRight, CreditCard, Calendar, Receipt } from 'lucide-react';
import { Navbar } from '@/app/Navbar';
import { Footer } from '@/app/Footer';

interface PaymentDetails {
  paiement: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    paid_at: string;
    created_at: string;
    stripe_receipt_url: string | null;
  };
  candidature: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  formation: {
    id: number;
    nom: string;
  } | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let url = '/api/paiement/details';
        const candidatureId = searchParams.get('candidature_id');
        const paiementId = searchParams.get('paiement_id');

        if (candidatureId) {
          url += `?candidature_id=${candidatureId}`;
        } else if (paiementId) {
          url += `?paiement_id=${paiementId}`;
        }

        const response = await fetch(url, {
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success) {
          setPaymentDetails(result.data);
        } else {
          setError(result.error || 'Impossible de récupérer les détails du paiement');
        }
      } catch (err) {
        setError('Une erreur est survenue lors de la récupération des détails');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleDownloadReceipt = async () => {
    if (!paymentDetails) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/paiement/receipt?paiement_id=${paymentDetails.paiement.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-paiement-${paymentDetails.paiement.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'transfer':
        return 'Virement bancaire';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
            <p className="text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              Chargement des détails du paiement...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1
              className="text-2xl font-bold text-[#032622] mb-4"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              PAIEMENT NON TROUVÉ
            </h1>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              {error || 'Nous ne pouvons pas trouver les détails de votre paiement.'}
            </p>
            <Link
              href="/validation"
              className="inline-block bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              RETOUR À LA CANDIDATURE
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with success icon */}
            <div className="bg-green-50 p-6 md:p-8 text-center border-b border-green-100">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold text-[#032622] mb-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                PAIEMENT RÉUSSI !
              </h1>
              <p
                className="text-gray-600"
                style={{ fontFamily: 'var(--font-termina-medium)' }}
              >
                Votre paiement a été confirmé avec succès
              </p>
            </div>

            {/* Payment Details */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Amount */}
              <div className="text-center py-4 bg-[#F8F5E4] rounded-lg">
                <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  Montant payé
                </p>
                <p
                  className="text-4xl font-bold text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formatCurrency(paymentDetails.paiement.amount, paymentDetails.paiement.currency)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#032622] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      Date du paiement
                    </p>
                    <p className="text-sm font-medium text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      {formatDate(paymentDetails.paiement.paid_at)}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-[#032622] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      Moyen de paiement
                    </p>
                    <p className="text-sm font-medium text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      {getPaymentMethodLabel(paymentDetails.paiement.payment_method)}
                    </p>
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Receipt className="w-5 h-5 text-[#032622] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      Référence
                    </p>
                    <p className="text-sm font-medium text-[#032622] font-mono" style={{ fontFamily: 'monospace' }}>
                      {paymentDetails.paiement.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Formation */}
                {paymentDetails.formation && (
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-[#032622] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                        Formation
                      </p>
                      <p className="text-sm font-medium text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                        {paymentDetails.formation.nom}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Info */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  Candidat
                </p>
                <p className="font-medium text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  {paymentDetails.candidature.prenom} {paymentDetails.candidature.nom}
                </p>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  {paymentDetails.candidature.email}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {/* Download Receipt Button */}
                <button
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center space-x-2 bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <Download className="w-5 h-5" />
                  <span>{isDownloading ? 'TÉLÉCHARGEMENT...' : 'TÉLÉCHARGER LE REÇU PDF'}</span>
                </button>

                {/* Stripe Receipt Link */}
                {paymentDetails.paiement.stripe_receipt_url && (
                  <a
                    href={paymentDetails.paiement.stripe_receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-[#032622] border-2 border-[#032622] py-3 px-6 font-bold transition-colors"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    <Receipt className="w-5 h-5" />
                    <span>VOIR LE REÇU STRIPE</span>
                  </a>
                )}

                {/* Continue to Next Step */}
                <Link
                  href="/validation?step=recap"
                  className="w-full flex items-center justify-center space-x-2 bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] border-2 border-[#032622] py-3 px-6 font-bold transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <span>CONTINUER MA CANDIDATURE</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                  <strong>Information :</strong> Un email de confirmation avec votre reçu a été envoyé à votre adresse email.
                  Veuillez vérifier également vos spams si vous ne le trouvez pas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]" style={{ fontFamily: 'var(--font-termina-medium)' }}>
            Chargement...
          </p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
