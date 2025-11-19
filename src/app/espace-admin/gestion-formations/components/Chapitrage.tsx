'use client';

import { useEffect, useState } from 'react';
import { Cours } from '../../../../types/cours';
import { FileText } from 'lucide-react';

interface ChapitrageProps {
  moduleId: number;
  currentCoursId?: number;
  onCoursClick?: (coursId: number) => void;
  onQuizClick?: (coursId: number, quizId: number) => void;
  onEtudeCasClick?: (moduleId: number, etudeCasId: number) => void;
  formationId?: string;
  blocId?: string;
}

interface QuizData {
  id: number;
  cours_id: number;
  titre: string;
}

interface EtudeCasData {
  id: number;
  titre: string;
}

export const Chapitrage = ({ moduleId, currentCoursId, onCoursClick, onQuizClick, onEtudeCasClick, formationId, blocId }: ChapitrageProps) => {
  const [cours, setCours] = useState<Cours[]>([]);
  const [quizzesByCours, setQuizzesByCours] = useState<Map<number, QuizData>>(new Map());
  const [etudeCas, setEtudeCas] = useState<EtudeCasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCours = async () => {
      try {
        // Charger les cours
        const response = await fetch(`/api/cours?moduleId=${moduleId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const sortedCours = (data.cours || []).sort((a: any, b: any) => 
            (a.ordre_affichage || 0) - (b.ordre_affichage || 0)
          );
          setCours(sortedCours as Cours[]);

          // Charger les quiz pour chaque cours
          const quizzesMap = new Map<number, QuizData>();
          await Promise.all(
            sortedCours.map(async (c: Cours) => {
              try {
                const quizResponse = await fetch(`/api/quiz?coursId=${c.id}`, {
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                });
                if (quizResponse.ok) {
                  const quizData = await quizResponse.json();
                  if (quizData.quiz) {
                    quizzesMap.set(c.id, {
                      id: quizData.quiz.id,
                      cours_id: c.id,
                      titre: quizData.quiz.titre || 'Quiz'
                    });
                  }
                }
              } catch (error) {
                console.error(`Erreur lors du chargement du quiz pour le cours ${c.id}:`, error);
              }
            })
          );
          setQuizzesByCours(quizzesMap);

          // Charger l'étude de cas du module
          try {
            const etudeCasResponse = await fetch(`/api/etude-cas?moduleId=${moduleId}`, {
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (etudeCasResponse.ok) {
              const etudeCasData = await etudeCasResponse.json();
              if (etudeCasData.etudeCas) {
                setEtudeCas({
                  id: etudeCasData.etudeCas.id,
                  titre: etudeCasData.etudeCas.titre || 'Étude de cas'
                });
              }
            }
          } catch (error) {
            console.error('Erreur lors du chargement de l\'étude de cas:', error);
          }
        } else {
          console.error('Erreur lors du chargement des cours:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      loadCours();
    }
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col shadow-lg">
        <div className="p-4 border-b border-[#032622]/20">
          <h3 
            className="text-lg font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CHAPITRAGE
          </h3>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <p className="text-[#032622]/70 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col shadow-lg">
      <div className="p-4 border-b border-[#032622]/20">
        <h3 
          className="text-lg font-bold text-[#032622] uppercase"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          CHAPITRAGE
        </h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {cours.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#032622]/70 text-sm text-center">
              Aucun cours créé pour ce module
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cours.map((coursItem) => {
              const hasQuiz = quizzesByCours.has(coursItem.id);
              const quiz = hasQuiz ? quizzesByCours.get(coursItem.id) : null;
              
              return (
                <div key={coursItem.id} className="space-y-1">
                  <div
                    onClick={() => onCoursClick?.(coursItem.id)}
                    className={`p-2 border-b border-[#032622]/20 cursor-pointer transition-colors ${
                      currentCoursId === coursItem.id
                        ? 'bg-[#032622]/10 font-semibold'
                        : 'hover:bg-[#032622]/5'
                    }`}
                  >
                    <p 
                      className={`text-[#032622] text-sm ${
                        currentCoursId === coursItem.id ? 'underline' : ''
                      }`}
                      style={{ 
                        fontFamily: 'var(--font-termina-bold)',
                        textDecoration: currentCoursId === coursItem.id ? 'underline' : 'none'
                      }}
                    >
                      {coursItem.titre}
                    </p>
                  </div>
                  {quiz && (
                    <div 
                      className="pl-4 py-1 border-b border-[#032622]/10 cursor-pointer hover:bg-[#032622]/5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuizClick?.(coursItem.id, quiz.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-[#032622]/70" />
                        <p 
                          className="text-[#032622]/70 text-xs"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          {quiz.titre}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {etudeCas && (
              <div className="pt-2 mt-2 border-t-2 border-[#032622]/30">
                <div 
                  className="p-2 cursor-pointer hover:bg-[#032622]/5 transition-colors"
                  onClick={() => onEtudeCasClick?.(moduleId, etudeCas.id)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#032622]" />
                    <p 
                      className="text-[#032622] text-sm font-semibold"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {etudeCas.titre}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

