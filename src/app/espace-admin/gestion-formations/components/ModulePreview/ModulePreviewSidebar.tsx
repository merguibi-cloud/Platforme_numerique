'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { CoursApprentissage, ChapitreCours } from '@/types/formation-detailed';

interface QuizData {
  id: number;
  chapitre_id: number;
  titre: string;
}

interface EtudeCasData {
  id: number;
  titre: string;
}

interface CoursPreviewSidebarProps {
  cours: CoursApprentissage[];
  currentCoursId: number;
  currentChapitreId?: number;
  onCoursClick?: (coursId: number) => void;
  onChapitreClick?: (chapitreId: number) => void;
  onQuizClick?: (chapitreId: number) => void;
  onEtudeCasClick?: (coursIdOrChapitreId: number, etudeCasId?: number) => void;
  fichiersComplementaires?: string[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const ModulePreviewSidebar = ({
  cours,
  currentCoursId,
  currentChapitreId,
  onCoursClick,
  onChapitreClick,
  onQuizClick,
  onEtudeCasClick,
  fichiersComplementaires = [],
  isCollapsed = false,
  onToggle
}: CoursPreviewSidebarProps) => {
  // Déplier le cours actuel par défaut
  const [expandedCours, setExpandedCours] = useState<Set<number>>(new Set([currentCoursId]));
  const [quizzesByChapitre, setQuizzesByChapitre] = useState<Map<number, QuizData>>(new Map());
  const [etudeCasByChapitre, setEtudeCasByChapitre] = useState<Map<number, EtudeCasData>>(new Map());

  // S'assurer que le cours actuel reste déplié quand il change et est ouvert par défaut
  useEffect(() => {
    setExpandedCours(prev => {
      const newSet = new Set(prev);
      newSet.add(currentCoursId);
      return newSet;
    });
  }, [currentCoursId]);

  // S'assurer que le cours actuel est ouvert au chargement initial
  useEffect(() => {
    if (currentCoursId) {
      setExpandedCours(prev => {
        if (!prev.has(currentCoursId)) {
          const newSet = new Set(prev);
          newSet.add(currentCoursId);
          return newSet;
        }
        return prev;
      });
    }
  }, []);

  // OPTIMISATION : Extraire les quiz depuis les chapitres et les études de cas au niveau cours
  // Les cours sont déjà chargés avec leurs quiz et études de cas via l'endpoint batch
  const [etudeCasByCours, setEtudeCasByCours] = useState<Map<number, EtudeCasData>>(new Map());
  
  useEffect(() => {
      const quizzesMap = new Map<number, QuizData>();
      const etudeCasCoursMap = new Map<number, EtudeCasData>();

    // Extraire les données des cours passés en props (déjà chargées)
    console.log('[CoursPreviewSidebar] Extraction des quiz et études de cas depuis cours:', cours.length);
    cours.forEach((c: any) => {
      const chapitresList = c.chapitres || [];
      
      // Extraire les quiz depuis les chapitres
      chapitresList.forEach((chapitre: any) => {
        if (chapitre.quiz) {
          const quiz = chapitre.quiz.quiz || chapitre.quiz;
          if (quiz && quiz.id) {
            quizzesMap.set(chapitre.id, {
              id: quiz.id,
              chapitre_id: chapitre.id,
              titre: quiz.titre || 'Quiz'
                    });
            console.log(`[CoursPreviewSidebar] Quiz trouvé pour chapitre ${chapitre.id}:`, quiz.titre);
              }
        }
      });
      
      // Extraire l'étude de cas au niveau cours (pas au niveau chapitre)
      if (c.etude_cas) {
        const etudeCas = c.etude_cas.etudeCas || c.etude_cas;
        if (etudeCas && etudeCas.id) {
          etudeCasCoursMap.set(c.id, {
            id: etudeCas.id,
            titre: etudeCas.titre || 'Étude de cas'
          });
          console.log(`[CoursPreviewSidebar] Étude de cas trouvée pour cours ${c.id}:`, etudeCas.titre);
        }
      }
    });

    setQuizzesByChapitre(quizzesMap);
    setEtudeCasByCours(etudeCasCoursMap);
    console.log(`[CoursPreviewSidebar] Total quiz extraits: ${quizzesMap.size}, Total études de cas au niveau cours: ${etudeCasCoursMap.size}`);
  }, [cours]);

  const toggleCours = (coursId: number) => {
    setExpandedCours(prev => {
      const newSet = new Set(prev);
      if (newSet.has(coursId)) {
        newSet.delete(coursId);
      } else {
        newSet.add(coursId);
      }
      return newSet;
    });
  };

  // Trier les cours par ordre d'affichage
  const sortedCours = [...cours].sort((a, b) => 
    (a.ordre_affichage || a.numero_cours || 0) - (b.ordre_affichage || b.numero_cours || 0)
  );

  return (
    <div className="h-full overflow-y-auto relative bg-[#F8F5E4] p-4">
      {/* Liste des cours - Encadré dans un seul cadre */}
      <div className="border-4 border-[#032622] bg-[#F8F5E4] overflow-hidden">
        {sortedCours.map((c, coursIndex) => {
          const isExpanded = expandedCours.has(c.id);
          const isCurrent = c.id === currentCoursId;
          const chapitresList = c.chapitres || [];
          const sortedChapitres = [...chapitresList].sort((a, b) => a.ordre_affichage - b.ordre_affichage);
          
          return (
            <div key={c.id} className={coursIndex > 0 ? 'border-t-4 border-[#032622]' : ''}>
              {/* Header du cours */}
              <button
                onClick={() => {
                  // Juste toggle, ne pas naviguer vers le cours
                  toggleCours(c.id);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                  isExpanded
                    ? 'bg-[#032622] text-[#F8F5E4]' 
                    : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622]/5'
                }`}
              >
                <div className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  COURS {c.numero_cours || c.ordre_affichage}
                </div>
                <div className="flex-1 text-right ml-4">
                  <div className="font-bold uppercase text-base" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    {c.titre}
                  </div>
                </div>
                {sortedChapitres.length > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Liste des chapitres du cours - Fond vert clair quand développé */}
              {isExpanded && (
                <div className="bg-[#D4E6D1] border-t-2 border-[#032622]">
                  <div className="px-4 py-3 space-y-2">
                    {sortedChapitres.length > 0 ? (
                      <>
                        {sortedChapitres.map((chapitre, index) => {
                          const isCurrentChapitre = chapitre.id === currentChapitreId;
                          const hasQuiz = quizzesByChapitre.has(chapitre.id);
                          const quiz = hasQuiz ? quizzesByChapitre.get(chapitre.id) : null;
                          return (
                            <div key={chapitre.id} className="space-y-1">
                              <button
                                onClick={() => {
                                  // Seulement naviguer si ce n'est pas le chapitre actuel
                                  if (!isCurrentChapitre) {
                                    onChapitreClick?.(chapitre.id);
                                  }
                                }}
                                className={`w-full text-left text-sm transition-colors ${
                                  isCurrentChapitre
                                    ? 'text-[#032622] font-bold cursor-default'
                                    : 'text-[#032622] hover:text-[#032622]/70 cursor-pointer'
                                }`}
                                style={{ fontFamily: isCurrentChapitre ? 'var(--font-termina-bold)' : 'var(--font-termina-medium)' }}
                              >
                                {index + 1}. {chapitre.titre}
                              </button>
                              {quiz && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuizClick?.(chapitre.id);
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
                        {/* Afficher l'étude de cas au niveau cours, après tous les chapitres et quiz */}
                        {etudeCasByCours.has(c.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Passer le coursId pour l'étude de cas au niveau cours
                              const etudeCas = etudeCasByCours.get(c.id);
                              if (etudeCas) {
                                onEtudeCasClick?.(c.id, etudeCas.id);
                              }
                            }}
                            className="mt-2 pt-2 border-t-2 border-[#032622] text-xs text-[#032622] hover:text-[#032622]/70 cursor-pointer transition-colors w-full text-left"
                          >
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span style={{ fontFamily: 'var(--font-termina-medium)' }}>
                                {etudeCasByCours.get(c.id)?.titre || 'Étude de cas'}
                              </span>
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-[#032622]/70 italic text-center">
                        Aucun chapitre disponible
                      </div>
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

