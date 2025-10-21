'use client';

import { useRouter } from 'next/navigation';
import { Edit, Eye, Trash2 } from 'lucide-react';

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
    } else {
      console.log('Éditer le bloc:', id);
    }
  };

  const handleDeleteBlock = () => {
    if (onDeleteBlock) {
      onDeleteBlock(id);
    } else {
      console.log('Supprimer le bloc:', id);
    }
  };

  return (
    <div className="border border-[#032622] bg-[#F8F5E4] p-6 flex gap-6">
      {/* Placeholder image */}
      <div className="w-32 h-32 bg-gray-300 flex-shrink-0"></div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#032622] mb-2">{title}</h3>
          <p className="text-[#032622] text-sm leading-relaxed">{description}</p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleViewBlock}
            className="bg-[#032622] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            VOIR LE BLOC
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditBlock}
              className="bg-[#032622] text-white px-3 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              ÉDITER
            </button>
            
            <button
              onClick={handleDeleteBlock}
              className="bg-red-600 text-white px-3 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              SUPPRIMER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
