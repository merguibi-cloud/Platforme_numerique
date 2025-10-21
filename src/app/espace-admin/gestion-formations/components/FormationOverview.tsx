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
      <div className="bg-[#F8F5E4] border border-[#032622] p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#F8F5E4] border border-[#032622] p-6 rounded-lg">
        <p className="text-[#032622] text-center">Aucune statistique disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F5E4] border border-[#032622] p-6 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
         onClick={() => onViewFormation(formation.id.toString())}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-sm font-bold uppercase rounded">
              {formation.niveau || 'FORMATION'}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold rounded">
              {formation.theme || 'THÈME'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#032622] mb-2">{formation.titre}</h3>
          {formation.description && (
            <p className="text-[#032622]/70 text-sm leading-relaxed mb-3">{formation.description}</p>
          )}
        </div>
        
        {/* Placeholder image */}
        <div className="w-20 h-20 bg-gray-300 rounded flex-shrink-0 ml-4"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Total Blocs */}
        <div className="bg-white border border-[#032622] p-3 rounded text-center">
          <BookOpen className="w-6 h-6 text-[#032622] mx-auto mb-1" />
          <p className="text-lg font-bold text-[#032622]">{stats.total_blocs}</p>
          <p className="text-xs text-[#032622]/70 uppercase">Blocs</p>
        </div>

        {/* Blocs Actifs */}
        <div className="bg-white border border-[#032622] p-3 rounded text-center">
          <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600">{stats.blocs_actifs}</p>
          <p className="text-xs text-[#032622]/70 uppercase">Actifs</p>
        </div>

        {/* Total Modules */}
        <div className="bg-white border border-[#032622] p-3 rounded text-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-600">{stats.total_modules}</p>
          <p className="text-xs text-[#032622]/70 uppercase">Modules</p>
        </div>

        {/* Durée Totale */}
        <div className="bg-white border border-[#032622] p-3 rounded text-center">
          <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-purple-600">{stats.duree_totale}h</p>
          <p className="text-xs text-[#032622]/70 uppercase">Durée</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-[#032622]/70 mb-2">
          <span>Progression des blocs</span>
          <span>{stats.blocs_actifs}/{stats.total_blocs}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#032622] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: stats.total_blocs > 0 
                ? `${(stats.blocs_actifs / stats.total_blocs) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#032622]/70">
          <TrendingUp className="w-4 h-4" />
          <span>Cliquez pour gérer les blocs</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewFormation(formation.id.toString());
          }}
          className="bg-[#032622] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors"
        >
          GÉRER LES BLOCS
        </button>
      </div>
    </div>
  );
};
