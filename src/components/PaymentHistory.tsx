'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  payment_method: string;
  paid_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
  stripe_receipt_url?: string | null;
}

interface PaymentHistoryProps {
  candidatureId?: string;
}

export function PaymentHistory({ candidatureId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let url = '/api/paiement/history';
        if (candidatureId) {
          url += `?candidature_id=${candidatureId}`;
        }

        const response = await fetch(url, {
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success) {
          setPayments(result.data);
        } else {
          setError(result.error || 'Erreur lors de la récupération des paiements');
        }
      } catch (err) {
        setError('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [candidatureId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Réussi';
      case 'failed':
        return 'Échoué';
      default:
        return 'En attente';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownloadReceipt = async (paiementId: string) => {
    try {
      const response = await fetch(`/api/paiement/receipt?paiement_id=${paiementId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-paiement-${paiementId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-[#032622] mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          Historique des paiements
        </h3>
        <div className="text-center py-8 text-gray-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun paiement enregistré</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          Historique des paiements
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <div key={payment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left: Status and amount */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusClass(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(payment.paid_at || payment.created_at)}</span>
                  </div>
                  {payment.failure_reason && (
                    <p className="text-sm text-red-600 mt-1">{payment.failure_reason}</p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              {payment.status === 'succeeded' && (
                <div className="flex items-center space-x-2 sm:ml-auto">
                  <button
                    onClick={() => handleDownloadReceipt(payment.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[#032622] text-white rounded hover:bg-[#032622]/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Reçu PDF</span>
                  </button>
                  {payment.stripe_receipt_url && (
                    <a
                      href={payment.stripe_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-[#032622] text-[#032622] rounded hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Stripe</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentHistory;
