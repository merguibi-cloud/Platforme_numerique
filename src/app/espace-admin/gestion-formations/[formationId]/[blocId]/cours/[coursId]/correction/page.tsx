'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Pencil, ChevronDown, ArrowLeft } from 'lucide-react';
import AdminTopBar from '@/app/espace-admin/components/AdminTopBar';

interface Soumission {
  id: number;
  etudiant_nom: string;
  etudiant_email: string;
  etat: 'a_corriger' | 'en_retard' | 'corrige';
  date_envoi: string | null;
  date_correction: string | null;
  note: number | null;
  etude_cas_id: number;
}

interface TentativeQuiz {
  id: number;
  quiz_id: number;
  quiz_titre: string;
  etudiant_nom: string;
  etudiant_email: string;
  score: number;
  note_sur_20: number;
  date_tentative: string | null;
  note_modifiee_manuellement: boolean;
  correcteur_id: string | null;
  date_modification_note: string | null;
}

interface CoursBloc {
  id: number;
  titre: string;
  statut: string;
}

interface CorrectionData {
  cours: {
    id: number;
    titre: string;
  };
  bloc: {
    id: number;
    titre: string;
  };
  formation: {
    id: number;
    titre: string;
    ecole: string;
  };
  coursBloc: CoursBloc[];
  soumissions: {
    aCorriger: Soumission[];
    corrigees: Soumission[];
  };
  tentativesQuiz: TentativeQuiz[];
}

export default function CorrectionPage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.formationId as string;
  const blocId = params.blocId as string;
  const coursId = params.coursId as string;

  const [data, setData] = useState<CorrectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoursId, setSelectedCoursId] = useState<string>(coursId);
  const [showCoursDropdown, setShowCoursDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/espace-admin/corrections/${selectedCoursId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error('Erreur lors du chargement des données');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCoursId) {
      loadData();
    }
  }, [selectedCoursId]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.cours-dropdown')) {
        setShowCoursDropdown(false);
      }
    };

    if (showCoursDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCoursDropdown]);

  const handleCoursChange = (newCoursId: string) => {
    setSelectedCoursId(newCoursId);
    setShowCoursDropdown(false);
    // Mettre à jour l'URL sans recharger la page
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${newCoursId}/correction`);
  };

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case 'a_corriger':
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase bg-[#4CAF50]/30 text-[#032622] rounded">
            À CORRIGER
          </span>
        );
      case 'en_retard':
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase bg-[#D96B6B] text-white rounded">
            EN RETARD
          </span>
        );
      case 'corrige':
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase bg-[#4CAF50] text-white rounded">
            CORRIGÉ
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement des corrections...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <p className="text-[#032622]">Aucune donnée disponible</p>
      </div>
    );
  }

  const selectedCours = data.coursBloc.find(c => c.id.toString() === selectedCoursId);

  const handleBack = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <div className="p-6">
        <AdminTopBar notificationCount={0} className="mb-6" />

        {/* Bouton retour */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            Retour à la gestion
          </span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 
              className="text-4xl font-bold text-[#032622] uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              RENDUS
            </h1>
          </div>
          
          {/* Liste déroulante des cours du bloc */}
          <div className="relative inline-block cours-dropdown">
            <button
              onClick={() => setShowCoursDropdown(!showCoursDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F8F5E4] border border-[#032622] text-[#032622] font-semibold uppercase text-sm hover:bg-[#032622]/10 transition-colors"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {selectedCours?.titre || data.cours.titre}
              <ChevronDown className={`w-4 h-4 transition-transform ${showCoursDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCoursDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg z-10 min-w-[300px] max-h-[300px] overflow-y-auto">
                {data.coursBloc.map((cours) => (
                  <button
                    key={cours.id}
                    onClick={() => handleCoursChange(cours.id.toString())}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold uppercase text-[#032622] hover:bg-[#032622]/20 transition-colors ${
                      cours.id.toString() === selectedCoursId ? 'bg-[#032622]/20' : ''
                    }`}
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {cours.titre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-[#032622]/70 italic">
            {data.formation.ecole} - {data.formation.titre}
          </p>
        </div>

        {/* Section CORRECTION À FAIRE */}
        <div className="mb-12">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase mb-4"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CORRECTION À FAIRE
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-[#032622]">
              <thead>
                <tr className="bg-[#F8F5E4]">
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ECOLE
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    FORMATION
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ETUDIANT
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ETAT
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    BLOC
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    DATE D'ENVOI
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    EDITION
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.soumissions.aCorriger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-[#032622] p-8 text-center text-[#032622]">
                      <p className="text-lg font-medium">Aucune correction à faire</p>
                    </td>
                  </tr>
                ) : (
                  data.soumissions.aCorriger.map((soumission) => (
                    <tr key={soumission.id} className="bg-[#032622]/5">
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.formation.ecole}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.formation.titre}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622] uppercase">
                        {soumission.etudiant_nom}
                      </td>
                      <td className="border border-[#032622] p-3">
                        {getEtatBadge(soumission.etat)}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.bloc.titre}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {formatDate(soumission.date_envoi)}
                      </td>
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => {
                            router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${selectedCoursId}/correction/${soumission.id}`);
                          }}
                          className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <Pencil className="w-3 h-3" />
                          CORRIGER
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section HISTORIQUE DE CORRECTION */}
        <div>
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase mb-4"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            HISTORIQUE DE CORRECTION
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-[#032622]">
              <thead>
                <tr className="bg-[#F8F5E4]">
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ECOLE
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    FORMATION
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ETUDIANT
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ETAT
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    BLOC
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    DATE D'ENVOI
                    <span className="ml-1 text-xs">▼</span>
                  </th>
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    EDITION
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.soumissions.corrigees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-[#032622] p-8 text-center text-[#032622]">
                      <p className="text-lg font-medium">Aucune correction effectuée</p>
                    </td>
                  </tr>
                ) : (
                  data.soumissions.corrigees.map((soumission) => (
                    <tr key={soumission.id} className="bg-[#032622]/5">
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.formation.ecole}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.formation.titre}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622] uppercase">
                        {soumission.etudiant_nom}
                      </td>
                      <td className="border border-[#032622] p-3">
                        {getEtatBadge(soumission.etat)}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {data.bloc.titre}
                      </td>
                      <td className="border border-[#032622] p-3 text-[#032622]">
                        {formatDate(soumission.date_envoi)}
                      </td>
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => {
                            router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${selectedCoursId}/correction/${soumission.id}`);
                          }}
                          className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <Pencil className="w-3 h-3" />
                          CORRIGER
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

