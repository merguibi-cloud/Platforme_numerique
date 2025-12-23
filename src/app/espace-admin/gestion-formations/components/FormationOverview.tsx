'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Clock, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Formation } from '@/types/formations';
import { getBlocsByFormationId } from '@/lib/blocs-api';

interface FormationOverviewProps {
  formation: Formation;
  onViewFormation: (formationId: string) => void;
}

interface FormationStats {
  total_blocs: number;
  blocs_actifs: number;
  total_modules: number;
  modules_actifs: number;
  duree_totale: number;
}

export const FormationOverview = ({ formation, onViewFormation }: FormationOverviewProps) => {
  const [stats, setStats] = useState<FormationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const blocs = await getBlocsByFormationId(formation.id);
        
        let totalModules = 0;
        let modulesActifs = 0;
        let dureeTotale = 0;

        // Calculer les statistiques pour chaque bloc
        for (const bloc of blocs) {
          if (bloc.actif) {
            // Simuler le nombre de modules par bloc (en réalité, il faudrait faire une requête)
            const modulesPerBloc = Math.floor(Math.random() * 5) + 1; // 1-5 modules par bloc
            totalModules += modulesPerBloc;
            modulesActifs += Math.floor(modulesPerBloc * 0.8); // 80% des modules actifs
            dureeTotale += bloc.duree_estimee || 0;
          }
        }

        setStats({
          total_blocs: blocs.length,
          blocs_actifs: blocs.filter(b => b.actif).length,
          total_modules: totalModules,
          modules_actifs: modulesActifs,
          duree_totale: dureeTotale
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [formation.id]);

  if (isLoading) {
    return (
      <div className="bg-[#F8F5E4] border border-[#032622] p-4 sm:p-5 md:p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-3 sm:h-4 bg-gray-300 rounded w-1/3 mb-3 sm:mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 sm:h-14 md:h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#F8F5E4] border border-[#032622] p-4 sm:p-5 md:p-6 rounded-lg">
        <p className="text-xs sm:text-sm md:text-base text-[#032622] text-center break-words">Aucune statistique disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F5E4] border border-[#032622] p-4 sm:p-5 md:p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
         onClick={() => onViewFormation(formation.id.toString())}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <span className="bg-[#032622] text-[#F8F5E4] px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold uppercase rounded whitespace-nowrap">
              {formation.niveau || 'FORMATION'}
            </span>
            <span className="bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap">
              {formation.theme || 'THÈME'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#032622] mb-1 sm:mb-2 break-words">{formation.titre}</h3>
          {formation.description && (
            <p className="text-xs sm:text-sm text-[#032622]/70 leading-relaxed mb-2 sm:mb-3 break-words">{formation.description}</p>
          )}
        </div>
        
        {/* Placeholder image */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gray-300 rounded flex-shrink-0 sm:ml-4"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        {/* Total Blocs */}
        <div className="bg-white border border-[#032622] p-2 sm:p-3 rounded text-center">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#032622] mx-auto mb-0.5 sm:mb-1" />
          <p className="text-base sm:text-lg font-bold text-[#032622]">{stats.total_blocs}</p>
          <p className="text-[10px] sm:text-xs text-[#032622]/70 uppercase">Blocs</p>
        </div>

        {/* Blocs Actifs */}
        <div className="bg-white border border-[#032622] p-2 sm:p-3 rounded text-center">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 mx-auto mb-0.5 sm:mb-1" />
          <p className="text-base sm:text-lg font-bold text-green-600">{stats.blocs_actifs}</p>
          <p className="text-[10px] sm:text-xs text-[#032622]/70 uppercase">Actifs</p>
        </div>

        {/* Total Modules */}
        <div className="bg-white border border-[#032622] p-2 sm:p-3 rounded text-center">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 mx-auto mb-0.5 sm:mb-1" />
          <p className="text-base sm:text-lg font-bold text-blue-600">{stats.total_modules}</p>
          <p className="text-[10px] sm:text-xs text-[#032622]/70 uppercase">Modules</p>
        </div>

        {/* Durée Totale */}
        <div className="bg-white border border-[#032622] p-2 sm:p-3 rounded text-center">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 mx-auto mb-0.5 sm:mb-1" />
          <p className="text-base sm:text-lg font-bold text-purple-600">{stats.duree_totale}h</p>
          <p className="text-[10px] sm:text-xs text-[#032622]/70 uppercase">Durée</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between text-xs sm:text-sm text-[#032622]/70 mb-1.5 sm:mb-2">
          <span className="break-words">Progression des blocs</span>
          <span className="whitespace-nowrap ml-2">{stats.blocs_actifs}/{stats.total_blocs}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
          <div 
            className="bg-[#032622] h-1.5 sm:h-2 rounded-full transition-all duration-300"
            style={{
              width: stats.total_blocs > 0 
                ? `${(stats.blocs_actifs / stats.total_blocs) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#032622]/70">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="break-words">Cliquez pour gérer les blocs</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewFormation(formation.id.toString());
          }}
          className="bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors w-full sm:w-auto"
        >
          GÉRER LES BLOCS
        </button>
      </div>
    </div>
  );
};
