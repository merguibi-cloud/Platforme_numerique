'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, TrendingUp, Settings, BarChart3 } from 'lucide-react';

interface BlocPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
  }>;
}

interface Cours {
  id: number;
  titre: string;
  description: string;
  ordre_affichage: number;
  updated_at?: string;
}

interface BlocInfo {
  id: number;
  numero_bloc: number;
  titre: string;
  progression?: number;
}

interface CachedCours {
  cours: Cours[];
  timestamp: number;
  coursIds: number[];
}

const CACHE_KEY_PREFIX = 'bloc_cours_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export default function BlocCoursSelectionPage({ params }: BlocPageProps) {
  const { formationId, blocId } = use(params);
  const [cours, setCours] = useState<Cours[]>([]);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour obtenir la clé de cache
  const getCacheKey = (blocId: string) => `${CACHE_KEY_PREFIX}${blocId}`;

  // Fonction pour charger depuis le cache
  const loadFromCache = (blocId: string): CachedCours | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cacheKey = getCacheKey(blocId);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedData: CachedCours = JSON.parse(cached);
      const now = Date.now();
      
      // Vérifier si le cache est encore valide
      if (now - cachedData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return cachedData;
    } catch (err) {
      console.error('Erreur lors de la lecture du cache:', err);
      return null;
    }
  };

  // Fonction pour sauvegarder dans le cache
  const saveToCache = (blocId: string, cours: Cours[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheKey = getCacheKey(blocId);
      const cachedData: CachedCours = {
        cours,
        timestamp: Date.now(),
        coursIds: cours.map(c => c.id),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du cache:', err);
    }
  };

  // Fonction pour vérifier s'il y a de nouveaux cours
  const checkForNewCours = async (blocId: string, cachedIds: number[]): Promise<boolean> => {
    try {
      // Utiliser l'endpoint léger pour vérifier seulement les IDs
      const response = await fetch(`/api/blocs/${blocId}/cours-ids`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.coursIds && Array.isArray(data.coursIds)) {
          const currentIds = data.coursIds;
          
          // Vérifier s'il y a de nouveaux cours (IDs différents ou nombre différent)
          if (currentIds.length !== cachedIds.length) {
            return true;
          }
          
          // Vérifier si tous les IDs sont présents
          const hasNewCours = currentIds.some((id: number) => !cachedIds.includes(id));
          return hasNewCours;
        }
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la vérification des nouveaux cours:', err);
      return false;
    }
  };

  // Fonction pour charger les cours (depuis le cache ou l'API)
  const loadCours = async (blocId: string, forceReload: boolean = false) => {
    try {
      // Essayer de charger depuis le cache si on ne force pas le rechargement
      if (!forceReload) {
        const cached = loadFromCache(blocId);
        if (cached && cached.cours.length > 0) {
          setCours(cached.cours);
          setIsLoading(false);
          
          // Vérifier en arrière-plan s'il y a de nouveaux cours
          checkForNewCours(blocId, cached.coursIds).then((hasNew) => {
            if (hasNew) {
              // Recharger les cours si de nouveaux sont détectés
              loadCours(blocId, true);
            }
          });
          return;
        }
      }

      // Charger depuis l'API (version allégée pour la page de sélection)
      const coursResponse = await fetch(`/api/blocs/${blocId}/cours-list`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (coursResponse.ok) {
        const coursData = await coursResponse.json();
        if (coursData.cours && Array.isArray(coursData.cours)) {
          // Les données sont déjà dans le bon format depuis l'API
          const coursList = coursData.cours.map((c: any) => ({
            id: c.id,
            titre: c.titre,
            description: c.description || '',
            ordre_affichage: c.ordre_affichage || 0,
            updated_at: c.updated_at,
          }));
          
          setCours(coursList);
          saveToCache(blocId, coursList);
        } else {
          setCours([]);
        }
      } else {
        setError('Erreur lors du chargement des cours');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      setError('Erreur lors du chargement des cours');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger les informations du bloc avec progression
        const blocResponse = await fetch('/api/espace-etudiant/blocs', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (blocResponse.ok) {
          const blocData = await blocResponse.json();
          if (blocData.success && blocData.blocs) {
            const bloc = blocData.blocs.find((b: any) => b.id.toString() === blocId);
            if (bloc) {
              setBlocInfo({
                id: bloc.id,
                numero_bloc: bloc.numero_bloc,
                titre: bloc.titre,
                progression: bloc.progression,
              });
            }
          }
        }

        // Charger les cours (avec cache)
        await loadCours(blocId);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [formationId, blocId]);

  // Icônes pour les cours (on peut les personnaliser selon le type de cours)
  const getCourseIcon = (index: number) => {
    const icons = [
      { icon: BookOpen, color: 'bg-purple-200', iconColor: 'text-purple-600' },
      { icon: BarChart3, color: 'bg-blue-200', iconColor: 'text-blue-600' },
      { icon: Settings, color: 'bg-green-200', iconColor: 'text-green-600' },
      { icon: TrendingUp, color: 'bg-orange-200', iconColor: 'text-orange-600' },
    ];
    return icons[index % icons.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !blocInfo) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-[#032622] mb-4">{error || 'Bloc non trouvé'}</p>
          <Link
            href="/espace-etudiant/mes-formations"
            className="inline-block px-4 py-2 bg-[#032622] text-white font-bold hover:bg-[#044a3a] transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            RETOUR
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête avec retour et progression */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/espace-etudiant/mes-formations"
            className="inline-flex items-center space-x-2 text-[#032622] font-bold mb-4 hover:text-[#044a3a] transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">&lt; RETOUR</span>
          </Link>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#032622] break-words">
                Bloc {blocInfo.numero_bloc} : {blocInfo.titre}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-semibold text-[#032622]">
                  {blocInfo.progression || 0}%
                </span>
              </div>
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-300 border border-black">
              <div
                className="h-full bg-[#032622] transition-all duration-500"
                style={{ width: `${blocInfo.progression || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Titre principal */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-[#032622] text-white px-3 sm:px-4 py-1 sm:py-2 inline-block mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              BLOC {blocInfo.numero_bloc}
            </span>
          </div>
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#032622] uppercase mb-2 sm:mb-3"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {blocInfo.titre}
          </h1>
          <div className="h-1 w-24 sm:w-32 bg-[#032622] mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622]">
            Sélectionnez le cours que vous souhaitez commencer
          </p>
        </div>

        {/* Grille de cours */}
        {cours.length === 0 ? (
          <div className="text-center py-12 border border-black bg-white">
            <p className="text-[#032622]">Aucun cours disponible pour ce bloc</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {cours.map((coursItem, index) => {
              const { icon: Icon, color, iconColor } = getCourseIcon(index);
              return (
                <div
                  key={coursItem.id}
                  className="border-2 border-[#032622] bg-[#F8F5E4] p-4 sm:p-6 flex flex-col hover:shadow-lg transition-shadow"
                >
                  {/* Icône */}
                  <div className={`${color} w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} />
                  </div>

                  {/* Titre */}
                  <h3
                    className="text-base sm:text-lg md:text-xl font-bold text-[#032622] mb-2 sm:mb-3 uppercase"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {coursItem.titre}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#032622] mb-4 sm:mb-6 flex-grow">
                    {coursItem.description || 'Aucune description disponible'}
                  </p>

                  {/* Bouton COMMENCER */}
                  <Link
                    href={`/espace-etudiant/cours/${formationId}/${blocId}/${coursItem.id}`}
                    className="inline-flex items-center justify-center space-x-2 bg-[#032622] text-white px-4 sm:px-6 py-2 sm:py-3 font-bold hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors w-full sm:w-auto"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    <span>COMMENCER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Message d'information */}
        <div className="border border-[#032622] bg-green-50 p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-[#032622] text-center">
            Chaque cours est conçu pour vous donner les compétences essentielles dans votre domaine. Commencez par celui qui vous intéresse le plus !
          </p>
        </div>
      </div>
    </div>
  );
}
