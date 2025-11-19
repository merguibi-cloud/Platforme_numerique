'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ModuleApprentissage, CoursContenu } from '@/types/formation-detailed';

interface QuizData {
  id: number;
  cours_id: number;
  titre: string;
}

interface EtudeCasData {
  id: number;
  titre: string;
}

interface ModulePreviewSidebarProps {
  modules: ModuleApprentissage[];
  currentModuleId: number;
  currentCoursId?: number;
  onModuleClick?: (moduleId: number) => void;
  onCoursClick?: (coursId: number) => void;
  onQuizClick?: (coursId: number) => void;
  onEtudeCasClick?: (moduleId: number) => void;
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
  onQuizClick,
  onEtudeCasClick,
  fichiersComplementaires = [],
  isCollapsed = false,
  onToggle
}: ModulePreviewSidebarProps) => {
  // Déplier le module actuel par défaut
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([currentModuleId]));
  const [quizzesByCours, setQuizzesByCours] = useState<Map<number, QuizData>>(new Map());
  const [etudeCasByModule, setEtudeCasByModule] = useState<Map<number, EtudeCasData>>(new Map());

  // S'assurer que le module actuel reste déplié quand il change et est ouvert par défaut
  useEffect(() => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      newSet.add(currentModuleId);
      return newSet;
    });
  }, [currentModuleId]);

  // S'assurer que le module actuel est ouvert au chargement initial
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModules(prev => {
        if (!prev.has(currentModuleId)) {
          const newSet = new Set(prev);
          newSet.add(currentModuleId);
          return newSet;
        }
        return prev;
      });
    }
  }, []);

  // Charger les quiz et l'étude de cas pour tous les modules
  useEffect(() => {
    const loadQuizAndEtudeCas = async () => {
      const quizzesMap = new Map<number, QuizData>();
      const etudeCasMap = new Map<number, EtudeCasData>();

      // Charger les quiz et l'étude de cas pour chaque module
      await Promise.all(
        modules.map(async (module) => {
          const coursList = module.cours || [];
          const sortedCours = [...coursList].sort((a, b) => a.ordre_affichage - b.ordre_affichage);

          // Charger les quiz pour chaque cours du module
          await Promise.all(
            sortedCours.map(async (cours) => {
              try {
                const quizResponse = await fetch(`/api/quiz?coursId=${cours.id}`, {
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                });
                if (quizResponse.ok) {
                  const quizData = await quizResponse.json();
                  if (quizData.quiz) {
                    quizzesMap.set(cours.id, {
                      id: quizData.quiz.id,
                      cours_id: cours.id,
                      titre: quizData.quiz.titre || 'Quiz'
                    });
                  }
                }
              } catch (error) {
                console.error(`Erreur lors du chargement du quiz pour le cours ${cours.id}:`, error);
              }
            })
          );

          // Charger l'étude de cas du module
          try {
            const etudeCasResponse = await fetch(`/api/etude-cas?moduleId=${module.id}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (etudeCasResponse.ok) {
              const etudeCasData = await etudeCasResponse.json();
              if (etudeCasData.etudeCas) {
                etudeCasMap.set(module.id, {
                  id: etudeCasData.etudeCas.id,
                  titre: etudeCasData.etudeCas.titre || 'Étude de cas'
                });
              }
            }
          } catch (error) {
            console.error(`Erreur lors du chargement de l'étude de cas pour le module ${module.id}:`, error);
          }
        })
      );

      setQuizzesByCours(quizzesMap);
      setEtudeCasByModule(etudeCasMap);
    };

    if (modules.length > 0) {
      loadQuizAndEtudeCas();
    }
  }, [modules]);

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
      {/* Liste des modules - Encadré dans un seul cadre */}
      <div className="border-4 border-[#032622] bg-[#F8F5E4] overflow-hidden">
        {sortedModules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const isCurrent = module.id === currentModuleId;
          const coursList = module.cours || [];
          const sortedCours = [...coursList].sort((a, b) => a.ordre_affichage - b.ordre_affichage);
          
          return (
            <div key={module.id} className={moduleIndex > 0 ? 'border-t-4 border-[#032622]' : ''}>
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
                  <div className="px-4 py-3 space-y-2">
                    {sortedCours.length > 0 ? (
                      <>
                        {sortedCours.map((cours, index) => {
                          const isCurrentCours = cours.id === currentCoursId;
                          const hasQuiz = quizzesByCours.has(cours.id);
                          const quiz = hasQuiz ? quizzesByCours.get(cours.id) : null;
                          return (
                            <div key={cours.id} className="space-y-1">
                              <button
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
                              {quiz && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuizClick?.(cours.id);
                                  }}
                                  className="pl-4 text-xs text-[#032622]/70 hover:text-[#032622] cursor-pointer transition-colors w-full text-left"
                                >
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    <span style={{ fontFamily: 'var(--font-termina-medium)' }}>
                                      {quiz.titre}
                                    </span>
                                  </div>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-sm text-[#032622]/70 italic text-center">
                        Aucun cours disponible
                      </div>
                    )}
                    {etudeCasByModule.has(module.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEtudeCasClick?.(module.id);
                        }}
                        className={`pt-2 w-full text-left ${sortedCours.length > 0 ? 'mt-2 border-t-2 border-[#032622]/30' : ''} hover:opacity-80 transition-opacity cursor-pointer`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#032622]" />
                          <span 
                            className="text-[#032622] text-sm font-semibold"
                            style={{ fontFamily: 'var(--font-termina-bold)' }}
                          >
                            {etudeCasByModule.get(module.id)?.titre}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

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

