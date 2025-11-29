'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BlockCard } from './BlockCard';
import { CreateBloc } from './CreateBloc';
import { Block, FormationInfo } from '@/types/block';
import { BlocCompetence } from '@/types/formation-detailed';

interface BlocksListViewProps {
  formation: FormationInfo;
  blocks: BlocCompetence[];
  onViewBlock: (blockId: string) => void;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: (blocData: { titre: string; description: string; modules: string[] }) => void;
}

export const BlocksListView = ({ 
  formation, 
  blocks, 
  onViewBlock, 
  onEditBlock,
  onDeleteBlock,
  onAddBlock
}: BlocksListViewProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddBlockClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveBloc = (blocData: { titre: string; description: string; modules: string[] }) => {
    onAddBlock(blocData);
    setIsCreateModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Formation Header */}
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-[#032622]/70 uppercase tracking-wider break-words">
            {formation.level}
          </p>
          <h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] break-words"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {formation.title}
          </h1>
        </div>
        
        {/* Add Block Button */}
        <button
          onClick={handleAddBlockClick}
          className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          AJOUTER UN BLOC
        </button>
        
        {/* Blocks List */}
        {blocks.length === 0 ? (
          <div className="text-center py-8 sm:py-10 md:py-12 px-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#032622]/10 rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#032622]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#032622] mb-1.5 sm:mb-2 break-words">Aucun bloc de compétences</h3>
            <p className="text-sm sm:text-base text-[#032622]/70 mb-4 sm:mb-5 md:mb-6 max-w-md mx-auto break-words">
              Cette formation ne contient pas encore de blocs de compétences. 
              Commencez par créer votre premier bloc pour organiser les modules d'apprentissage.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {blocks.map((bloc) => (
              <BlockCard
                key={bloc.id}
                id={bloc.id.toString()}
                title={bloc.titre}
                description={bloc.description || 'Aucune description disponible'}
                formationId={formation.id}
                onViewBlock={onViewBlock}
                onEditBlock={onEditBlock}
                onDeleteBlock={onDeleteBlock}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Bloc Modal */}
      <CreateBloc
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveBloc}
      />
    </>
  );
};
