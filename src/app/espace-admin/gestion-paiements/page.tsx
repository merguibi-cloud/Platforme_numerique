"use client";

import { useState, useEffect, useMemo } from 'react';
import AdminTopBar from '../components/AdminTopBar';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Download,
  ExternalLink,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface PaiementItem {
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
  candidat_nom: string | null;
  candidat_email: string | null;
  formation_titre: string | null;
  ecole: string | null;
}

interface PaymentStats {
  totalRevenue: number;
  periodRevenue: number;
  totalPayments: number;
  periodPayments: number;
  byStatus: { succeeded: number; pending: number; failed: number };
  periodByStatus: { succeeded: number; pending: number; failed: number };
  revenueByMonth: { month: string; revenue: number; count: number }[];
  byFormation: { name: string; revenue: number; count: number }[];
  byEcole: { name: string; revenue: number; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  succeeded: '#4CAF50',
  pending: '#F0C75E',
  failed: '#D96B6B',
};

const PIE_COLORS = ['#4CAF50', '#F0C75E', '#D96B6B'];

export default function GestionPaiements() {
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEcole, setFilterEcole] = useState('all');
  const [filterFormation, setFilterFormation] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');

  // Load paiements
  useEffect(() => {
    const loadPaiements = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.set('status', filterStatus);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (searchTerm) params.set('search', searchTerm);
        if (filterEcole !== 'all') params.set('ecole', filterEcole);
        if (filterFormation !== 'all') params.set('formation', filterFormation);

        const response = await fetch(`/api/admin/paiements?${params.toString()}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPaiements(data.paiements || []);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaiements();
  }, [filterStatus, dateFrom, dateTo, searchTerm, filterEcole, filterFormation]);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await fetch('/api/admin/paiements/stats?period=365', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Unique écoles and formations from paiements
  const ecoles = useMemo(() => {
    return [...new Set(paiements.map(p => p.ecole).filter(Boolean))] as string[];
  }, [paiements]);

  const formations = useMemo(() => {
    return [...new Set(paiements.map(p => p.formation_titre).filter(Boolean))] as string[];
  }, [paiements]);

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

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Carte';
      case 'transfer': return 'Virement';
      default: return method || '-';
    }
  };

  const formatAmount = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const response = await fetch(`/api/admin/paiements/export?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paiements_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Pie data for status chart
  const statusPieData = stats
    ? [
        { name: 'Réussi', value: stats.byStatus.succeeded },
        { name: 'En attente', value: stats.byStatus.pending },
        { name: 'Échoué', value: stats.byStatus.failed },
      ].filter(d => d.value > 0)
    : [];

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
      <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] mb-1 sm:mb-2"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              GESTION DES PAIEMENTS
            </h1>
            <p className="text-[#032622]/70 text-xs sm:text-sm md:text-base">
              Suivi et gestion de tous les paiements de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#032622] bg-[#032622] text-[#F8F5E4] hover:bg-[#01302C] transition-colors text-xs sm:text-sm font-semibold disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isExporting ? 'Export...' : 'Exporter CSV'}</span>
            </button>
            <a
              href="https://dashboard.stripe.com/payments"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf] transition-colors text-xs sm:text-sm font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Stripe</span>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#032622]/20">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'list'
                ? 'text-[#032622] border-b-2 border-[#032622]'
                : 'text-[#032622]/50 hover:text-[#032622]/80'
            }`}
          >
            Liste des paiements
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'stats'
                ? 'text-[#032622] border-b-2 border-[#032622]'
                : 'text-[#032622]/50 hover:text-[#032622]/80'
            }`}
          >
            Statistiques
          </button>
        </div>

        {/* Stat Cards (always visible) */}
        {!isStatsLoading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#032622]" />
                <span className="text-[10px] sm:text-xs text-[#032622]/70 uppercase font-semibold">Revenu total</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622]">
                {formatAmount(stats.totalRevenue)}
              </p>
            </div>
            <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-[10px] sm:text-xs text-[#032622]/70 uppercase font-semibold">Réussis</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#4CAF50]">
                {stats.byStatus.succeeded}
              </p>
            </div>
            <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#F0C75E]" />
                <span className="text-[10px] sm:text-xs text-[#032622]/70 uppercase font-semibold">En attente</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#F0C75E]">
                {stats.byStatus.pending}
              </p>
            </div>
            <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-[#D96B6B]" />
                <span className="text-[10px] sm:text-xs text-[#032622]/70 uppercase font-semibold">Échoués</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#D96B6B]">
                {stats.byStatus.failed}
              </p>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-4 sm:space-y-6">
            {isStatsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#032622] mx-auto mb-4"></div>
                <p className="text-sm text-[#032622]">Chargement des statistiques...</p>
              </div>
            ) : stats ? (
              <>
                {/* Revenue by month */}
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-[#032622] mb-4">
                    Revenu par mois (12 derniers mois)
                  </h3>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#032622" opacity={0.1} />
                        <XAxis dataKey="month" fontSize={11} tick={{ fill: '#032622' }} />
                        <YAxis fontSize={11} tick={{ fill: '#032622' }} tickFormatter={(v) => `${v}€`} />
                        <Tooltip
                          formatter={(value: number) => [formatAmount(value), 'Revenu']}
                          labelStyle={{ color: '#032622' }}
                          contentStyle={{ backgroundColor: '#F8F5E4', border: '1px solid #032622' }}
                        />
                        <Bar dataKey="revenue" fill="#032622" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Status pie chart */}
                  <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-bold text-[#032622] mb-4">
                      Répartition par statut
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {statusPieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* By école */}
                  <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-bold text-[#032622] mb-4">
                      Revenu par école
                    </h3>
                    {stats.byEcole.length > 0 ? (
                      <div className="space-y-3">
                        {stats.byEcole.map((item) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-[#032622] truncate max-w-[60%]">
                              {item.name}
                            </span>
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-bold text-[#032622]">
                                {formatAmount(item.revenue)}
                              </span>
                              <span className="text-[10px] sm:text-xs text-[#032622]/50 ml-2">
                                ({item.count})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#032622]/50 text-center py-8">Aucune donnée</p>
                    )}
                  </div>
                </div>

                {/* By formation */}
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-6">
                  <h3 className="text-sm sm:text-base font-bold text-[#032622] mb-4">
                    Revenu par formation
                  </h3>
                  {stats.byFormation.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[400px]">
                        <thead>
                          <tr className="border-b border-[#032622]/20">
                            <th className="text-left text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Formation</th>
                            <th className="text-right text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Revenu</th>
                            <th className="text-right text-[10px] sm:text-xs font-semibold text-[#032622] uppercase py-2 px-2">Paiements</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.byFormation.map((item) => (
                            <tr key={item.name} className="border-b border-[#032622]/10">
                              <td className="text-xs sm:text-sm text-[#032622] py-2 px-2">{item.name}</td>
                              <td className="text-xs sm:text-sm font-bold text-[#032622] py-2 px-2 text-right">
                                {formatAmount(item.revenue)}
                              </td>
                              <td className="text-xs sm:text-sm text-[#032622]/70 py-2 px-2 text-right">
                                {item.count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-[#032622]/50 text-center py-8">Aucune donnée</p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#032622]/50" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email du candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
              />
            </div>

            {/* Filters toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf] transition-colors"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold">Filtres</span>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <div className="text-xs sm:text-sm text-[#032622]/70">
                {paiements.length} paiement{paiements.length > 1 ? 's' : ''} trouvé{paiements.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 border border-[#032622] bg-[#F8F5E4]">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5">
                    Statut
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="all">Tous</option>
                    <option value="succeeded">Réussi</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5">
                    École
                  </label>
                  <select
                    value={filterEcole}
                    onChange={(e) => setFilterEcole(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="all">Toutes</option>
                    {ecoles.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  />
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-[#032622]">Chargement des paiements...</p>
              </div>
            ) : paiements.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border border-[#032622] bg-[#F8F5E4] px-4">
                <CreditCard className="w-10 h-10 text-[#032622]/30 mx-auto mb-3" />
                <p className="text-base sm:text-lg text-[#032622] mb-1">Aucun paiement trouvé</p>
                <p className="text-xs sm:text-sm text-[#032622]/70">
                  {searchTerm || filterStatus !== 'all' || filterEcole !== 'all' || dateFrom || dateTo
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Aucun paiement enregistré pour le moment'}
                </p>
              </div>
            ) : (
              <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#032622] text-[#F8F5E4]">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Candidat</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Formation</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Montant</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Statut</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Méthode</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map((paiement) => (
                      <tr
                        key={paiement.id}
                        className="border-b border-[#032622]/20 hover:bg-[#eae5cf] transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-[#032622] block">
                              {paiement.candidat_nom || '-'}
                            </span>
                            <span className="text-[10px] sm:text-xs text-[#032622]/60">
                              {paiement.candidat_email || ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <div>
                            <span className="text-xs sm:text-sm text-[#032622] block">
                              {paiement.formation_titre || '-'}
                            </span>
                            <span className="text-[10px] sm:text-xs text-[#032622]/60">
                              {paiement.ecole || ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                          <span className="text-xs sm:text-sm font-bold text-[#032622]">
                            {formatAmount(paiement.amount, paiement.currency)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white ${getStatusColor(paiement.status)} whitespace-nowrap`}>
                            {getStatusLabel(paiement.status)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] whitespace-nowrap">
                          {paiement.paid_at
                            ? new Date(paiement.paid_at).toLocaleDateString('fr-FR')
                            : paiement.created_at
                            ? new Date(paiement.created_at).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-[#032622]">
                          {getMethodLabel(paiement.payment_method)}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                          <Link
                            href={`/espace-admin/gestion-paiements/${paiement.id}`}
                            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-[#032622] hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Voir</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}