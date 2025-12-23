'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2, BookOpen } from 'lucide-react';
import { getModulesByBlocId } from '@/lib/blocs-api';
import { CoursApprentissage } from '@/types/formation-detailed';

interface BlockCardProps {
  id: string;
  title: string;
  description: string;
  formationId: string;
  onViewBlock?: (blockId: string) => void;
  onEditBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
}

export const BlockCard = ({ 
  id, 
  title, 
  description, 
  formationId,
  onViewBlock,
  onEditBlock,
  onDeleteBlock
}: BlockCardProps) => {
  const router = useRouter();
  const [modules, setModules] = useState<CoursApprentissage[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const fetchedModules = await getModulesByBlocId(parseInt(id));
        setModules(fetchedModules);
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } finally {
        setIsLoadingModules(false);
      }
    };

    loadModules();
  }, [id]);

  const handleViewBlock = () => {
    if (onViewBlock) {
      onViewBlock(id);
    } else {
      // Navigation par défaut vers la gestion des modules
      router.push(`/espace-admin/gestion-formations/${formationId}/${id}`);
    }
  };

  const handleEditBlock = () => {
    if (onEditBlock) {
      onEditBlock(id);
    }
  };

  const handleDeleteBlock = () => {
    if (onDeleteBlock) {
      onDeleteBlock(id);
    }
  };

  return (
    <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
      {/* Placeholder image */}
      <div className="w-full sm:w-24 md:w-32 h-32 sm:h-24 md:h-32 bg-gray-300 flex-shrink-0"></div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#032622] mb-1 sm:mb-2 break-words">{title}</h3>
          <p className="text-xs sm:text-sm text-[#032622] leading-relaxed mb-3 sm:mb-4 break-words">{description}</p>
          
          {/* Modules Section */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#032622]/70">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium break-words">
                {isLoadingModules ? 'Chargement...' : `${modules.length} module${modules.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2 md:gap-4 mt-3 sm:mt-4">
          <button
            onClick={handleViewBlock}
            className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            VOIR LE BLOC
          </button>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleEditBlock}
              className="bg-[#032622] text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-initial"
            >
              <Edit className="w-3 h-3" />
              <span className="hidden sm:inline">ÉDITER</span>
            </button>
            
            <button
              onClick={handleDeleteBlock}
              className="bg-red-600 text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-red-700 active:bg-red-800 transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-initial"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">SUPPRIMER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
