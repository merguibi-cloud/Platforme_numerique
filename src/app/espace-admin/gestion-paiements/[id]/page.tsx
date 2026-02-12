"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminTopBar from '../../components/AdminTopBar';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  CreditCard,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';

interface PaiementDetail {
  id: string;
  candidature_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
  stripe_dashboard_url: string | null;
  stripe_webhook_data: any;
}

interface CandidatureDetail {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  formation_id: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface FormationDetail {
  id: number;
  titre: string;
  ecole: string;
  prix: number;
}

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export default function PaiementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paiementId = params.id as string;

  const [paiement, setPaiement] = useState<PaiementDetail | null>(null);
  const [candidature, setCandidature] = useState<CandidatureDetail | null>(null);
  const [formation, setFormation] = useState<FormationDetail | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadPaiement = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/paiements/${paiementId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPaiement(data.paiement);
            setCandidature(data.candidature);
            setFormation(data.formation);
            setPaymentHistory(data.paymentHistory || []);
          }
        } else if (response.status === 404) {
          router.push('/espace-admin/gestion-paiements');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du paiement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (paiementId) {
      loadPaiement();
    }
  }, [paiementId, router]);

  const handleResendReceipt = async () => {
    if (!paiement) return;
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch(`/api/admin/paiements/${paiement.id}/resend-receipt`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setResendMessage({ type: 'success', text: data.message || 'Reçu renvoyé avec succès' });
      } else {
        setResendMessage({ type: 'error', text: data.error || 'Erreur lors du renvoi' });
      }
    } catch (error) {
      setResendMessage({ type: 'error', text: 'Erreur réseau lors du renvoi' });
    } finally {
      setIsResending(false);
    }
  };

  const formatAmount = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'succeeded': return 'Réussi';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-[#4CAF50]';
      case 'pending': return 'bg-[#F0C75E]';
      case 'failed': return 'bg-[#D96B6B]';
      default: return 'bg-[#C9C6B4]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="w-5 h-5 text-[#4CAF50]" />;
      case 'pending': return <Clock className="w-5 h-5 text-[#F0C75E]" />;
      case 'failed': return <XCircle className="w-5 h-5 text-[#D96B6B]" />;
      default: return null;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Carte bancaire';
      case 'transfer': return 'Virement bancaire';
      default: return method || '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
        <AdminTopBar notificationCount={0} className="mb-4 sm:mb-6" />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-sm text-[#032622]">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (!paiement) {
    return (
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
        <AdminTopBar notificationCount={0} className="mb-4 sm:mb-6" />
        <div className="text-center py-12">
          <p className="text-base text-[#032622]">Paiement non trouvé</p>
          <Link href="/espace-admin/gestion-paiements" className="text-sm text-[#032622] underline mt-2 inline-block">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
      <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Back + Title */}
        <div>
          <Link
            href="/espace-admin/gestion-paiements"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm text-[#032622]/70 hover:text-[#032622] mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la liste</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(paiement.status)}
              <div>
                <h1
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {formatAmount(paiement.amount, paiement.currency)}
                </h1>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-white ${getStatusColor(paiement.status)}`}>
                  {getStatusLabel(paiement.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {paiement.status === 'succeeded' && (
                <button
                  onClick={handleResendReceipt}
                  disabled={isResending}
                  className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf] transition-colors text-xs sm:text-sm font-semibold disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isResending ? 'Envoi...' : 'Renvoyer reçu'}</span>
                </button>
              )}
              {paiement.stripe_dashboard_url && (
                <a
                  href={paiement.stripe_dashboard_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 border border-[#032622] bg-[#032622] text-[#F8F5E4] hover:bg-[#01302C] transition-colors text-xs sm:text-sm font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Voir sur Stripe</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Resend message */}
        {resendMessage && (
          <div className={`p-3 border text-sm ${
            resendMessage.type === 'success'
              ? 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]'
              : 'border-[#D96B6B] bg-[#D96B6B]/10 text-[#D96B6B]'
          }`}>
            {resendMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment Info */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#032622] mb-4">
              <CreditCard className="w-4 h-4" />
              Informations du paiement
            </h2>
            <div className="space-y-3">
              <InfoRow label="ID Paiement" value={paiement.id} mono />
              <InfoRow label="Montant" value={formatAmount(paiement.amount, paiement.currency)} />
              <InfoRow label="Statut" value={getStatusLabel(paiement.status)} />
              <InfoRow label="Méthode" value={getMethodLabel(paiement.payment_method)} />
              <InfoRow label="Date de paiement" value={formatDate(paiement.paid_at)} />
              <InfoRow label="Date de création" value={formatDate(paiement.created_at)} />
              {paiement.stripe_payment_intent_id && (
                <InfoRow label="Stripe ID" value={paiement.stripe_payment_intent_id} mono />
              )}
              {paiement.failure_reason && (
                <InfoRow label="Raison de l'échec" value={paiement.failure_reason} error />
              )}
              {paiement.failed_at && (
                <InfoRow label="Date d'échec" value={formatDate(paiement.failed_at)} />
              )}
            </div>
          </div>

          {/* Candidature Info */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#032622] mb-4">
              <User className="w-4 h-4" />
              Candidature associée
            </h2>
            {candidature ? (
              <div className="space-y-3">
                <InfoRow label="Nom" value={`${candidature.prenom || ''} ${candidature.nom || ''}`.trim() || '-'} />
                <InfoRow label="Email" value={candidature.email || '-'} />
                <InfoRow label="Téléphone" value={candidature.telephone || '-'} />
                <InfoRow label="Statut candidature" value={candidature.status || '-'} />
                <InfoRow label="Date candidature" value={formatDate(candidature.created_at)} />
                {candidature.id && (
                  <div className="pt-2">
                    <Link
                      href={`/espace-admin/gestion-inscriptions`}
                      className="text-xs sm:text-sm font-semibold text-[#032622] underline hover:no-underline"
                    >
                      Voir la candidature
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#032622]/50">Candidature non trouvée</p>
            )}

            {formation && (
              <div className="mt-4 pt-4 border-t border-[#032622]/20">
                <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#032622] mb-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  Formation
                </h3>
                <div className="space-y-2">
                  <InfoRow label="Formation" value={formation.titre || '-'} />
                  <InfoRow label="École" value={formation.ecole || '-'} />
                  <InfoRow label="Prix" value={formation.prix ? formatAmount(formation.prix) : '-'} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#032622] mb-4">
              <Clock className="w-4 h-4" />
              Historique des paiements du candidat
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#032622]/20">
                    <th className="text-left text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Date</th>
                    <th className="text-right text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Montant</th>
                    <th className="text-center text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Statut</th>
                    <th className="text-center text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Méthode</th>
                    <th className="text-center text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-[#032622]/10 ${item.id === paiement.id ? 'bg-[#032622]/5' : ''}`}
                    >
                      <td className="text-xs sm:text-sm text-[#032622] py-2 px-2 whitespace-nowrap">
                        {item.paid_at
                          ? new Date(item.paid_at).toLocaleDateString('fr-FR')
                          : new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-xs sm:text-sm font-bold text-[#032622] py-2 px-2 text-right">
                        {formatAmount(item.amount, item.currency)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-white ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm text-[#032622] py-2 px-2 text-center">
                        {getMethodLabel(item.payment_method)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {item.id !== paiement.id ? (
                          <Link
                            href={`/espace-admin/gestion-paiements/${item.id}`}
                            className="text-xs font-semibold text-[#032622] hover:underline"
                          >
                            Voir
                          </Link>
                        ) : (
                          <span className="text-xs text-[#032622]/40">Actuel</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  error,
}: {
  label: string;
  value: string;
  mono?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-4">
      <span className="text-xs sm:text-sm text-[#032622]/60 shrink-0">{label}</span>
      <span
        className={`text-xs sm:text-sm text-right break-all ${
          error ? 'text-[#D96B6B]' : 'text-[#032622] font-semibold'
        } ${mono ? 'font-mono text-[10px] sm:text-xs' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}