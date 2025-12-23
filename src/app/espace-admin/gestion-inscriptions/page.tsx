"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, UserCog, ChevronDown } from 'lucide-react';

interface InscriptionItem {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  formation?: string;
  date?: string;
}

export default function GestionInscriptionsPage() {
  const [inscriptions, setInscriptions] = useState<{
    leads: InscriptionItem[];
    candidats: InscriptionItem[];
  }>({
    leads: [],
    candidats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lead' | 'candidat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'nouveau' | 'contacte' | 'en_attente' | 'accepte' | 'refuse'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Charger les inscriptions
  useEffect(() => {
    const loadInscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/inscriptions', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInscriptions({
              leads: data.leads || [],
              candidats: data.candidats || [],
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des inscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInscriptions();
  }, []);

  // Combiner et filtrer les inscriptions
  const filteredInscriptions = useMemo(() => {
    let allInscriptions: (InscriptionItem & { type: 'lead' | 'candidat' })[] = [
      ...inscriptions.leads.map(item => ({ ...item, type: 'lead' as const })),
      ...inscriptions.candidats.map(item => ({ ...item, type: 'candidat' as const })),
    ];

    // Filtre par type
    if (filterType !== 'all') {
      allInscriptions = allInscriptions.filter(item => item.type === filterType);
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      allInscriptions = allInscriptions.filter(item => item.status === filterStatus);
    }

    // Recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      allInscriptions = allInscriptions.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        (item.formation && item.formation.toLowerCase().includes(searchLower))
      );
    }

    // Trier par date (plus récent en premier)
    return allInscriptions.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [inscriptions, filterType, filterStatus, searchTerm]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nouveau':
        return 'Nouveau';
      case 'contacte':
        return 'Contacté';
      case 'en_attente':
        return 'En attente';
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nouveau':
        return 'bg-[#F0C75E]';
      case 'contacte':
        return 'bg-[#4CAF50]';
      case 'en_attente':
        return 'bg-[#F0C75E]';
      case 'accepte':
        return 'bg-[#4CAF50]';
      case 'refuse':
        return 'bg-[#D96B6B]';
      default:
        return 'bg-[#C9C6B4]';
    }
  };

  const getTypeColor = (type: 'lead' | 'candidat') => {
    return type === 'lead' ? 'bg-[#F0C75E]' : 'bg-[#4CAF50]';
  };

  const getTypeLabel = (type: 'lead' | 'candidat') => {
    return type === 'lead' ? 'LEAD' : 'CANDIDAT';
  };

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen">
      {/* En-tête */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] mb-2 sm:mb-3 md:mb-4 break-words"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          GESTION DES INSCRIPTIONS
        </h1>
        <p className="text-[#032622]/70 text-xs sm:text-sm md:text-base">
          Gérez les leads et candidats de votre plateforme
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-4 sm:mb-5 md:mb-6 space-y-3 sm:space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#032622]/50" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
          />
        </div>

        {/* Bouton filtres */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf] active:bg-[#e0dbc5] transition-colors"
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold">Filtres</span>
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="text-xs sm:text-sm text-[#032622]/70">
            {filteredInscriptions.length} inscription{filteredInscriptions.length > 1 ? 's' : ''} trouvée{filteredInscriptions.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border border-[#032622] bg-[#F8F5E4]">
            {/* Filtre par type */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5 sm:mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'lead' | 'candidat')}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
              >
                <option value="all">Tous</option>
                <option value="lead">Leads</option>
                <option value="candidat">Candidats</option>
              </select>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5 sm:mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
              >
                <option value="all">Tous</option>
                <option value="nouveau">Nouveau</option>
                <option value="contacte">Contacté</option>
                <option value="en_attente">En attente</option>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="text-center py-8 sm:py-10 md:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622]">Chargement des inscriptions...</p>
        </div>
      ) : filteredInscriptions.length === 0 ? (
        <div className="text-center py-8 sm:py-10 md:py-12 border border-[#032622] bg-[#F8F5E4] px-4">
          <p className="text-base sm:text-lg text-[#032622] mb-1 sm:mb-2">Aucune inscription trouvée</p>
          <p className="text-xs sm:text-sm text-[#032622]/70 break-words">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Aucune inscription disponible pour le moment'}
          </p>
        </div>
      ) : (
        <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#032622] text-[#F8F5E4]">
              <tr>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Type</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Nom/Prénom</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Formation</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Statut</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInscriptions.map((inscription) => (
                <tr
                  key={`${inscription.type}-${inscription.id}`}
                  className="border-b border-[#032622]/20 hover:bg-[#eae5cf] transition-colors"
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white ${getTypeColor(inscription.type)} whitespace-nowrap`}>
                      {getTypeLabel(inscription.type)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <span className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wide break-words">
                      {inscription.name}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] break-words">
                    {inscription.formation || '-'}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white ${getStatusColor(inscription.status)} whitespace-nowrap`}>
                      {getStatusLabel(inscription.status)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] whitespace-nowrap">
                    {inscription.date ? new Date(inscription.date).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                    <Link
                      href={`/espace-admin/gestion-inscriptions/${inscription.type}/${inscription.id}`}
                      className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80"
                    >
                      <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
  );
}

