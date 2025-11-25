'use client';

import { useEffect, useState, useCallback } from 'react';
import { Chapitre } from '../../../../types/cours';
import { FileText, Plus } from 'lucide-react';
import { CreateModule } from './CreateModule';

interface ChapitrageProps {
  coursId: number;
  currentChapitreId?: number;
  onChapitreClick?: (chapitreId: number) => void;
  onQuizClick?: (chapitreId: number, quizId: number) => void;
  onEtudeCasClick?: (chapitreId: number, etudeCasId: number) => void;
  formationId?: string;
  blocId?: string;
  // OPTIMISATION : Permettre de passer les données déjà chargées pour éviter les requêtes
  preloadedData?: {
    chapitres?: Chapitre[];
    quizzes?: Record<number, { quiz: any; questions: any[] }>;
    etudeCas?: { id: number; titre: string };
  };
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

export const Chapitrage = ({ coursId, currentChapitreId, onChapitreClick, onQuizClick, onEtudeCasClick, formationId, blocId, preloadedData }: ChapitrageProps) => {
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [quizzesByChapitre, setQuizzesByChapitre] = useState<Map<number, QuizData>>(new Map());
  const [etudeCas, setEtudeCas] = useState<EtudeCasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddChapitreModalOpen, setIsAddChapitreModalOpen] = useState(false);
  const [coursInfo, setCoursInfo] = useState<{ id: string; titre: string } | null>(null);

  const loadChapitres = useCallback(async () => {
      try {
        // OPTIMISATION : Si les données sont déjà chargées, les utiliser directement
        if (preloadedData) {
          const sortedChapitres = (preloadedData.chapitres || []).sort((a: any, b: any) => 
            (a.ordre_affichage || 0) - (b.ordre_affichage || 0)
          );
          setChapitres(sortedChapitres as Chapitre[]);

          // Extraire les quiz depuis les données préchargées
          const quizzesMap = new Map<number, QuizData>();
          if (preloadedData.quizzes) {
            console.log('[Chapitrage] Extraction des quiz depuis preloadedData:', preloadedData.quizzes);
            Object.entries(preloadedData.quizzes).forEach(([chapitreIdStr, quizData]: [string, any]) => {
              const chapitreId = parseInt(chapitreIdStr, 10);
              // La structure peut être { quiz: {...}, questions: [...] } ou directement { id, chapitre_id, titre, quiz, questions }
              const quiz = quizData.quiz || quizData;
              if (quiz && quiz.id) {
                quizzesMap.set(chapitreId, {
                  id: quiz.id,
                  cours_id: quiz.chapitre_id || chapitreId,
                  titre: quiz.titre || 'Quiz'
                });
                console.log(`[Chapitrage] Quiz trouvé pour chapitre ${chapitreId}:`, quiz.titre);
              } else {
                console.warn(`[Chapitrage] Structure de quiz invalide pour chapitre ${chapitreId}:`, quizData);
              }
            });
          } else {
            console.log('[Chapitrage] Aucun quiz dans preloadedData');
          }
          console.log(`[Chapitrage] Total quiz extraits: ${quizzesMap.size}`);
          setQuizzesByChapitre(quizzesMap);

          // Extraire l'étude de cas depuis les données préchargées
          if (preloadedData.etudeCas) {
            setEtudeCas(preloadedData.etudeCas);
          }

          setIsLoading(false);
          return;
        }

        // Sinon, utiliser l'endpoint batch optimisé (avec fallback sur l'ancien système)
        let response;
        let data;
        
        try {
          response = await fetch(`/api/cours/${coursId}/complete`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
          
          // Vérifier que la réponse est bien du JSON et non une page HTML
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Endpoint non disponible, utilisation du système de fallback');
          }
        
        if (response.ok) {
            data = await response.json();
          } else {
            throw new Error('Endpoint retourne une erreur');
          }
        } catch (error) {
          console.warn('[Chapitrage] Endpoint /complete non disponible, utilisation du système de fallback:', error);
          
          // FALLBACK : Utiliser l'ancien système
          const chapitresResponse = await fetch(`/api/chapitres?coursId=${coursId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!chapitresResponse.ok) {
            throw new Error('Erreur lors du chargement des chapitres');
          }
          
          const chapitresData = await chapitresResponse.json();
          const sortedChapitres = (chapitresData.chapitres || []).sort((a: any, b: any) => 
            (a.ordre_affichage || 0) - (b.ordre_affichage || 0)
          );
          setChapitres(sortedChapitres as Chapitre[]);

          // Charger les quiz pour chaque chapitre (ancien système)
          const quizzesMap = new Map<number, QuizData>();
          await Promise.all(
            sortedChapitres.map(async (ch: Chapitre) => {
              try {
                const quizResponse = await fetch(`/api/quiz?chapitreId=${ch.id}`, {
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' }
                });
                if (quizResponse.ok) {
                  const quizData = await quizResponse.json();
                  if (quizData.quiz) {
                    quizzesMap.set(ch.id, {
                      id: quizData.quiz.id,
                      cours_id: ch.id,
                      titre: quizData.quiz.titre || 'Quiz'
                    });
                  }
                }
              } catch (error) {
                console.error(`Erreur lors du chargement du quiz pour le chapitre ${ch.id}:`, error);
              }
            })
          );
          setQuizzesByChapitre(quizzesMap);

          // Charger l'étude de cas pour le premier chapitre (ou tous les chapitres)
          if (sortedChapitres.length > 0) {
          try {
              const firstChapitreId = sortedChapitres[0].id;
              const etudeCasResponse = await fetch(`/api/etude-cas?chapitreId=${firstChapitreId}`, {
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
          }
          
          setIsLoading(false);
          return;
        }
        
        if (data && data.cours) {
          const coursData = data.cours;
          const sortedChapitres = (coursData.chapitres || []).sort((a: any, b: any) => 
            (a.ordre_affichage || 0) - (b.ordre_affichage || 0)
          );
          setChapitres(sortedChapitres as Chapitre[]);

          // Extraire les quiz depuis la réponse batch
          const quizzesMap = new Map<number, QuizData>();
          sortedChapitres.forEach((chapitre: any) => {
            if (chapitre.quizzes && chapitre.quizzes.length > 0) {
              const quiz = chapitre.quizzes[0];
              quizzesMap.set(chapitre.id, {
                id: quiz.id || quiz.quiz?.id,
                cours_id: chapitre.id,
                titre: quiz.titre || quiz.quiz?.titre || 'Quiz'
              });
            }
          });

          console.log(`[Chapitrage] Total quiz extraits: ${quizzesMap.size}`);
          setQuizzesByChapitre(quizzesMap);

          // Extraire l'étude de cas depuis la réponse batch
          if (coursData.etude_cas) {
            setEtudeCas({
              id: coursData.etude_cas.id,
              titre: coursData.etude_cas.titre || 'Étude de cas'
            });
          }
        } else {
          console.error('Erreur lors du chargement des chapitres:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chapitres:', error);
      } finally {
        setIsLoading(false);
      }
  }, [coursId, preloadedData]);

  useEffect(() => {
    if (coursId) {
      loadChapitres();
    }
  }, [coursId, preloadedData, loadChapitres]);

  // Exposer une fonction de rafraîchissement via window pour pouvoir la déclencher depuis l'extérieur
  useEffect(() => {
    if (typeof window !== 'undefined' && coursId) {
      (window as any)[`refreshChapitrage_${coursId}`] = loadChapitres;
    }
    return () => {
      if (typeof window !== 'undefined' && coursId) {
        delete (window as any)[`refreshChapitrage_${coursId}`];
    }
    };
  }, [coursId, loadChapitres]);

  // Charger les informations du cours pour le modal
  useEffect(() => {
    const loadCoursInfo = async () => {
      try {
        const response = await fetch(`/api/cours/${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cours) {
            setCoursInfo({
              id: coursId.toString(),
              titre: data.cours.titre || `Cours ${coursId}`
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations du cours:', error);
        // En cas d'erreur, créer quand même l'info avec l'ID
        setCoursInfo({
          id: coursId.toString(),
          titre: `Cours ${coursId}`
        });
      }
    };
    if (coursId) {
      loadCoursInfo();
    }
  }, [coursId]);

  const handleSaveChapitres = async (moduleData: { titre?: string; cours: Array<{ id?: number; titre: string }> | string[]; moduleId?: string }) => {
    try {
      // Convertir les chapitres en format attendu par l'API
      const chapitres = Array.isArray(moduleData.cours) && moduleData.cours.length > 0 && typeof moduleData.cours[0] === 'object'
        ? moduleData.cours
        : (moduleData.cours as string[]).map(titre => ({ titre }));

      const response = await fetch(`/api/cours?formationId=${formationId}&blocId=${blocId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: moduleData.titre || coursInfo?.titre,
          chapitres: chapitres,
          description: '',
          type_module: 'cours',
          coursId: coursId.toString(), // Utiliser le coursId actuel
        }),
      });

      if (response.ok) {
        // Fermer le modal d'abord
        setIsAddChapitreModalOpen(false);
        
        // Forcer le rafraîchissement en rechargeant depuis l'API (ignorer preloadedData)
        // Cela garantit que les nouveaux chapitres apparaissent immédiatement
        try {
          const refreshResponse = await fetch(`/api/cours/${coursId}/complete`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.cours) {
              const coursData = refreshData.cours;
              const sortedChapitres = (coursData.chapitres || []).sort((a: any, b: any) => 
                (a.ordre_affichage || 0) - (b.ordre_affichage || 0)
              );
              setChapitres(sortedChapitres as Chapitre[]);
              
              // Mettre à jour les quiz
              const quizzesMap = new Map<number, QuizData>();
              sortedChapitres.forEach((chapitre: any) => {
                if (chapitre.quizzes && chapitre.quizzes.length > 0) {
                  const quiz = chapitre.quizzes[0];
                  quizzesMap.set(chapitre.id, {
                    id: quiz.id || quiz.quiz?.id,
                    cours_id: chapitre.id,
                    titre: quiz.titre || quiz.quiz?.titre || 'Quiz'
                  });
                }
              });
              setQuizzesByChapitre(quizzesMap);
              
              // Mettre à jour l'étude de cas
              if (coursData.etude_cas) {
                setEtudeCas({
                  id: coursData.etude_cas.id,
                  titre: coursData.etude_cas.titre || 'Étude de cas'
                });
              } else {
                setEtudeCas(null);
              }
            }
          } else {
            // Fallback: utiliser la fonction de rafraîchissement normale
            await loadChapitres();
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement:', error);
          // Fallback: utiliser la fonction de rafraîchissement normale
          await loadChapitres();
        }
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de l'ajout du chapitre: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du chapitre:', error);
      alert('Erreur lors de l\'ajout du chapitre');
    }
  };

  const handleCloseModal = () => {
    setIsAddChapitreModalOpen(false);
  };

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
    <>
      <div className="fixed bottom-4 right-4 z-40 bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col shadow-lg">
        <div className="p-4 border-b border-[#032622]/20 flex items-center justify-between">
          <h3 
            className="text-lg font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CHAPITRAGE
          </h3>
          <button
            onClick={() => setIsAddChapitreModalOpen(true)}
            className="w-6 h-6 border border-[#032622] bg-[#032622] text-[#F8F5E4] hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center justify-center"
            title="Ajouter un chapitre"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {chapitres.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#032622]/70 text-sm text-center">
              Aucun chapitre créé pour ce cours
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chapitres.map((chapitreItem) => {
              const hasQuiz = quizzesByChapitre.has(chapitreItem.id);
              const quiz = hasQuiz ? quizzesByChapitre.get(chapitreItem.id) : null;
              
              return (
                <div key={chapitreItem.id} className="space-y-1">
                  <div
                    onClick={() => onChapitreClick?.(chapitreItem.id)}
                    className={`p-2 border-b border-[#032622]/20 cursor-pointer transition-colors ${
                      currentChapitreId === chapitreItem.id
                        ? 'bg-[#032622]/10 font-semibold'
                        : 'hover:bg-[#032622]/5'
                    }`}
                  >
                    <p 
                      className={`text-[#032622] text-sm ${
                        currentChapitreId === chapitreItem.id ? 'underline' : ''
                      }`}
                      style={{ 
                        fontFamily: 'var(--font-termina-bold)',
                        textDecoration: currentChapitreId === chapitreItem.id ? 'underline' : 'none'
                      }}
                    >
                      {chapitreItem.titre}
                    </p>
                  </div>
                  {quiz && (
                    <div 
                      className="pl-4 py-1 border-b border-[#032622]/10 cursor-pointer hover:bg-[#032622]/5 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuizClick?.(chapitreItem.id, quiz.id);
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
                  onClick={() => {
                    // Trouver le chapitre qui a l'étude de cas
                    const chapitreWithEtudeCas = chapitres.find(ch => ch.id);
                    if (chapitreWithEtudeCas) {
                      onEtudeCasClick?.(chapitreWithEtudeCas.id, etudeCas.id);
                    }
                  }}
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

    {/* Modal pour ajouter un chapitre - Utilise CreateModule */}
    <CreateModule
      isOpen={isAddChapitreModalOpen && !!coursInfo}
      onClose={handleCloseModal}
      onSave={handleSaveChapitres}
      existingModules={coursInfo ? [coursInfo] : []}
      preselectedCoursId={coursId.toString()}
      addChapitreOnly={true}
    />
    </>
  );
};

