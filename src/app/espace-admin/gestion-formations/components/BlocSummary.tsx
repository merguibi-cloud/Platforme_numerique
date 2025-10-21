'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, BarChart3, Clock, BookOpen } from 'lucide-react';
import { BlocCompetence } from '@/types/formation-detailed';
import { getBlocStats } from '@/lib/blocs-api';

interface BlocSummaryProps {
  bloc: BlocCompetence;
  onViewBlock: (blockId: string) => void;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

export const BlocSummary = ({ bloc, onViewBlock, onEditBlock, onDeleteBlock }: BlocSummaryProps) => {
  const [stats, setStats] = useState<{ total_modules: number; modules_actifs: number; duree_totale: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getBlocStats(bloc.id);
        if (statsData) {
          setStats({
            total_modules: statsData.total_modules,
            modules_actifs: statsData.modules_actifs,
            duree_totale: statsData.duree_totale
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [bloc.id]);

  return (
    <div className="border border-[#032622] bg-[#F8F5E4] p-6 rounded-lg hover:shadow-lg transition-shadow">
      {/* Header du bloc */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-sm font-bold uppercase rounded">
              BLOC {bloc.numero_bloc}
            </span>
            {bloc.duree_estimee && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {bloc.duree_estimee}h
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#032622] mb-2">{bloc.titre}</h3>
          {bloc.description && (
            <p className="text-[#032622]/70 text-sm leading-relaxed mb-3">{bloc.description}</p>
          )}
        </div>
        
        {/* Placeholder image */}
        <div className="w-24 h-24 bg-gray-300 rounded flex-shrink-0 ml-4"></div>
      </div>

      {/* Statistiques */}
      {!isLoadingStats && stats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white rounded border border-[#032622]/20">
          <div className="text-center">
            <BookOpen className="w-5 h-5 text-[#032622] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#032622]">{stats.total_modules}</p>
            <p className="text-xs text-[#032622]/70 uppercase">Modules</p>
          </div>
          <div className="text-center">
            <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{stats.modules_actifs}</p>
            <p className="text-xs text-[#032622]/70 uppercase">Actifs</p>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{stats.duree_totale}h</p>
            <p className="text-xs text-[#032622]/70 uppercase">Durée</p>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      {!isLoadingStats && stats && stats.total_modules > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#032622]/70 mb-1">
            <span>Progression</span>
            <span>{stats.modules_actifs}/{stats.total_modules}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#032622] h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(stats.modules_actifs / stats.total_modules) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Objectifs */}
      {bloc.objectifs && bloc.objectifs.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-[#032622] mb-2 uppercase">Objectifs</h4>
          <ul className="space-y-1">
            {bloc.objectifs.slice(0, 3).map((objectif, index) => (
              <li key={index} className="text-xs text-[#032622]/70 flex items-start gap-2">
                <span className="w-1 h-1 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                {objectif}
              </li>
            ))}
            {bloc.objectifs.length > 3 && (
              <li className="text-xs text-[#032622]/50 italic">
                +{bloc.objectifs.length - 3} autres objectifs...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onViewBlock(bloc.id.toString())}
          className="bg-[#032622] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          VOIR LE BLOC
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditBlock(bloc.id.toString())}
            className="bg-[#032622] text-white px-3 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-1"
          >
            <Edit className="w-3 h-3" />
            ÉDITER
          </button>
          
          <button
            onClick={() => onDeleteBlock(bloc.id.toString())}
            className="bg-red-600 text-white px-3 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            SUPPRIMER
          </button>
        </div>
      </div>
    </div>
  );
};
