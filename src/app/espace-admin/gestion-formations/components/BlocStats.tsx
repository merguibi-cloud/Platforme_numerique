'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Clock, BookOpen, Users } from 'lucide-react';
import { getBlocStats } from '@/lib/blocs-api';
import { BlocStats as BlocStatsType } from '@/lib/blocs-api';

interface BlocStatsProps {
  blocId: number;
  blocTitle: string;
}

export const BlocStats = ({ blocId, blocTitle }: BlocStatsProps) => {
  const [stats, setStats] = useState<BlocStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getBlocStats(blocId);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [blocId]);

  if (isLoading) {
    return (
      <div className="bg-[#F8F5E4] border border-[#032622] p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
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
    <div className="bg-[#F8F5E4] border border-[#032622] p-6 rounded-lg">
      <h3 
        className="text-lg font-bold text-[#032622] mb-4 uppercase"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        STATISTIQUES - {blocTitle}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Modules */}
        <div className="bg-white border border-[#032622] p-4 rounded text-center">
          <BookOpen className="w-8 h-8 text-[#032622] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#032622]">{stats.total_modules}</p>
          <p className="text-sm text-[#032622]/70 uppercase">Modules Total</p>
        </div>

        {/* Modules Actifs */}
        <div className="bg-white border border-[#032622] p-4 rounded text-center">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.modules_actifs}</p>
          <p className="text-sm text-[#032622]/70 uppercase">Modules Actifs</p>
        </div>

        {/* Modules Inactifs */}
        <div className="bg-white border border-[#032622] p-4 rounded text-center">
          <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">{stats.modules_inactifs}</p>
          <p className="text-sm text-[#032622]/70 uppercase">Modules Inactifs</p>
        </div>

        {/* Durée Totale */}
        <div className="bg-white border border-[#032622] p-4 rounded text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.duree_totale}h</p>
          <p className="text-sm text-[#032622]/70 uppercase">Durée Totale</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-[#032622]/70 mb-2">
          <span>Progression des modules</span>
          <span>{stats.modules_actifs}/{stats.total_modules}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#032622] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: stats.total_modules > 0 
                ? `${(stats.modules_actifs / stats.total_modules) * 100}%` 
                : '0%' 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
