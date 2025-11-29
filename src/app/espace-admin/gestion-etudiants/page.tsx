"use client";

import { useState, useEffect, useMemo } from 'react';
import AdminTopBar from '../components/AdminTopBar';
import { Search, Filter, UserCog, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface EtudiantItem {
  id: string;
  user_id: string;
  name: string;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  statut: string;
  formation?: string | null;
  ecole?: string | null;
  date_inscription?: string | null;
}

export default function GestionEtudiants() {
  const [etudiants, setEtudiants] = useState<EtudiantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'inscrit' | 'actif' | 'suspendu' | 'diplome'>('all');
  const [filterEcole, setFilterEcole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Charger les étudiants
  useEffect(() => {
    const loadEtudiants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/etudiants', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEtudiants(data.etudiants || []);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEtudiants();
  }, []);

  // Obtenir les écoles uniques
  const ecoles = useMemo(() => {
    const uniqueEcoles = Array.from(new Set(
      etudiants
        .map(e => e.ecole)
        .filter((ecole): ecole is string => Boolean(ecole))
    ));
    return uniqueEcoles;
  }, [etudiants]);

  // Filtrer les étudiants
  const filteredEtudiants = useMemo(() => {
    let filtered = [...etudiants];

    // Filtre par statut
    if (filterStatut !== 'all') {
      filtered = filtered.filter(e => e.statut === filterStatut);
    }

    // Filtre par école
    if (filterEcole !== 'all') {
      filtered = filtered.filter(e => e.ecole === filterEcole);
    }

    // Recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        (e.formation && e.formation.toLowerCase().includes(searchLower)) ||
        (e.ecole && e.ecole.toLowerCase().includes(searchLower))
      );
    }

    // Trier par date d'inscription (plus récent en premier)
    return filtered.sort((a, b) => {
      const dateA = a.date_inscription ? new Date(a.date_inscription).getTime() : 0;
      const dateB = b.date_inscription ? new Date(b.date_inscription).getTime() : 0;
      return dateB - dateA;
    });
  }, [etudiants, filterStatut, filterEcole, searchTerm]);

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'inscrit':
        return 'Inscrit';
      case 'actif':
        return 'Actif';
      case 'suspendu':
        return 'Suspendu';
      case 'diplome':
        return 'Diplômé';
      default:
        return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'inscrit':
        return 'bg-[#F0C75E]';
      case 'actif':
        return 'bg-[#4CAF50]';
      case 'suspendu':
        return 'bg-[#D96B6B]';
      case 'diplome':
        return 'bg-[#032622]';
      default:
        return 'bg-[#C9C6B4]';
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
        <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />
      
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div>
          <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] mb-1 sm:mb-2 break-words"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            GESTION DES ÉTUDIANTS
          </h1>
            <p className="text-[#032622]/70 text-xs sm:text-sm md:text-base">
              Gérez tous les étudiants de votre plateforme
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="space-y-3 sm:space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#032622]/50" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, formation ou école..."
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
                {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} trouvé{filteredEtudiants.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 border border-[#032622] bg-[#F8F5E4]">
                {/* Filtre par statut */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5 sm:mb-2">
                    Statut
                  </label>
                  <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value as any)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="all">Tous</option>
                    <option value="inscrit">Inscrit</option>
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="diplome">Diplômé</option>
                  </select>
                </div>

                {/* Filtre par école */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#032622] mb-1.5 sm:mb-2">
                    École
                  </label>
                  <select
                    value={filterEcole}
                    onChange={(e) => setFilterEcole(e.target.value)}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="all">Toutes</option>
                    {ecoles.map((ecole) => (
                      <option key={ecole} value={ecole || ''}>
                        {ecole}
                      </option>
                    ))}
                  </select>
          </div>
        </div>
            )}
          </div>

          {/* Tableau */}
          {isLoading ? (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base text-[#032622]">Chargement des étudiants...</p>
            </div>
          ) : filteredEtudiants.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12 border border-[#032622] bg-[#F8F5E4] px-4">
              <p className="text-base sm:text-lg text-[#032622] mb-1 sm:mb-2">Aucun étudiant trouvé</p>
              <p className="text-xs sm:text-sm text-[#032622]/70 break-words">
                {searchTerm || filterStatut !== 'all' || filterEcole !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Aucun étudiant disponible pour le moment'}
              </p>
            </div>
          ) : (
            <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#032622] text-[#F8F5E4]">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Nom/Prénom</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Email</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Formation</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">École</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Statut</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Date d'inscription</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wide whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEtudiants.map((etudiant) => (
                    <tr
                      key={etudiant.id}
                      className="border-b border-[#032622]/20 hover:bg-[#eae5cf] transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wide break-words">
                          {etudiant.name}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] break-words">
                        {etudiant.email}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] break-words">
                        {etudiant.formation || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] break-words">
                        {etudiant.ecole || '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white ${getStatutColor(etudiant.statut)} whitespace-nowrap`}>
                          {getStatutLabel(etudiant.statut)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] whitespace-nowrap">
                        {etudiant.date_inscription 
                          ? new Date(etudiant.date_inscription).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                        <Link
                          href={`/espace-admin/gestion-etudiants/${etudiant.id}`}
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
    </div>
  );
}
