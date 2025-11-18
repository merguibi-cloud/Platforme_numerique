'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModuleApprentissage, CoursContenu } from '@/types/formation-detailed';

interface ModulePreviewSidebarProps {
  modules: ModuleApprentissage[];
  currentModuleId: number;
  currentCoursId?: number;
  onModuleClick?: (moduleId: number) => void;
  onCoursClick?: (coursId: number) => void;
  fichiersComplementaires?: string[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ModulePreviewSidebar = ({
  modules,
  currentModuleId,
  currentCoursId,
  onModuleClick,
  onCoursClick,
  fichiersComplementaires = [],
  isCollapsed = false,
  onToggle
}: ModulePreviewSidebarProps) => {
  // Déplier le module actuel par défaut
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([currentModuleId]));

  // S'assurer que le module actuel reste déplié quand il change
  useEffect(() => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      newSet.add(currentModuleId);
      return newSet;
    });
  }, [currentModuleId]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Trier les modules par ordre d'affichage
  const sortedModules = [...modules].sort((a, b) => 
    (a.ordre_affichage || a.numero_module || 0) - (b.ordre_affichage || b.numero_module || 0)
  );

  return (
    <div className="h-full overflow-y-auto relative bg-[#F8F5E4] p-4">
      {/* Liste des modules */}
      <div className="space-y-3">
        {sortedModules.map((module) => {
          const isExpanded = expandedModules.has(module.id);
          const isCurrent = module.id === currentModuleId;
          const coursList = module.cours || [];
          const sortedCours = [...coursList].sort((a, b) => a.ordre_affichage - b.ordre_affichage);
          
          return (
            <div key={module.id} className="border-4 border-[#032622] bg-[#F8F5E4] overflow-hidden">
              {/* Header du module */}
              <button
                onClick={() => {
                  // Juste toggle, ne pas naviguer vers le module
                  toggleModule(module.id);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                  isExpanded
                    ? 'bg-[#032622] text-[#F8F5E4]' 
                    : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622]/5'
                }`}
              >
                <div className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  MODULE {module.numero_module || module.ordre_affichage}
                </div>
                <div className="flex-1 text-right ml-4">
                  <div className="font-bold uppercase text-base" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    {module.titre}
                  </div>
                </div>
                {sortedCours.length > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Liste des cours du module - Fond vert clair quand développé */}
              {isExpanded && (
                <div className="bg-[#D4E6D1] border-t-2 border-[#032622]">
                  {sortedCours.length > 0 ? (
                    <div className="px-4 py-3 space-y-2">
                      {sortedCours.map((cours, index) => {
                        const isCurrentCours = cours.id === currentCoursId;
                        return (
                          <button
                            key={cours.id}
                            onClick={() => {
                              // Seulement naviguer si ce n'est pas le cours actuel
                              if (!isCurrentCours) {
                                onCoursClick?.(cours.id);
                              }
                            }}
                            className={`w-full text-left text-sm transition-colors ${
                              isCurrentCours
                                ? 'text-[#032622] font-bold cursor-default'
                                : 'text-[#032622] hover:text-[#032622]/70 cursor-pointer'
                            }`}
                            style={{ fontFamily: isCurrentCours ? 'var(--font-termina-bold)' : 'var(--font-termina-medium)' }}
                          >
                            {index + 1}. {cours.titre}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm text-[#032622]/70 italic text-center">
                      Aucun cours disponible
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Étude de cas du bloc - Fond vert clair */}
        <div className="border-2 border-[#032622] bg-[#D4E6D1] overflow-hidden">
          <div className="px-4 py-3 w-full text-center">
            <div className="font-bold uppercase text-sm text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              ÉTUDE DE CAS DU BLOC
            </div>
          </div>
        </div>
      </div>

      {/* Supports complémentaires */}
      <div className="mt-4 border-2 border-[#032622] bg-[#F8F5E4] overflow-hidden">
        <div className="px-4 py-3 bg-[#F8F5E4] border-b border-[#032622]">
          <h3 className="text-sm font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            SUPPORTS COMPLÉMENTAIRES
          </h3>
        </div>
        {fichiersComplementaires.length > 0 ? (
          <div className="px-4 py-3 space-y-2">
            {fichiersComplementaires.map((fichier, index) => {
              const fileName = fichier.split('/').pop() || `Fichier ${index + 1}`;
              return (
                <a
                  key={index}
                  href={fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-[#F8F5E4] border border-[#032622] hover:bg-[#032622]/5 transition-colors w-full"
                >
                  <span className="text-[#032622] font-bold text-sm flex-1 truncate mr-2">{fileName}</span>
                  <Download className="w-4 h-4 text-[#032622] flex-shrink-0" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-4 text-sm text-[#032622]/70 italic text-center">
            Aucun support complémentaire disponible
          </div>
        )}
      </div>
    </div>
  );
};

