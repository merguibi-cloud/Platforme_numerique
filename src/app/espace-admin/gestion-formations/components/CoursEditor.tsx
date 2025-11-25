'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from './TiptapEditor';
import AdminTopBar from '../../components/AdminTopBar';
import { Chapitre, FichierElement } from '../../../../types/cours';
import { ArrowLeft } from 'lucide-react';
import { isContentTooLarge, estimateFinalSize, formatSize, MAX_CONTENT_SIZE } from '@/lib/content-validator';
import { Modal } from '../../../Modal';

interface ChapitreEditorProps {
  chapitreId?: number;
  coursId: number;
  coursTitle: string;
  blocTitle: string;
  blocNumber: string;
  coursOrder?: number;
  formationId?: string;
  blocId?: string;
}

export const CoursEditor = ({ chapitreId, coursId, coursTitle, blocTitle, blocNumber, coursOrder, formationId, blocId }: ChapitreEditorProps) => {
  const router = useRouter();
  const [cours, setCours] = useState<Chapitre | null>(null);
  const [currentChapitreId, setCurrentChapitreId] = useState<number | undefined>(chapitreId);
  const [contenu, setContenu] = useState('');
  const [fichiers, setFichiers] = useState<FichierElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormationId, setCurrentFormationId] = useState<string | null>(formationId || null);
  const [currentBlocId, setCurrentBlocId] = useState<string | null>(blocId || null);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [lastSavedTitre, setLastSavedTitre] = useState<string>('');
  const [lastSavedStatut, setLastSavedStatut] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [lastManualSaveTime, setLastManualSaveTime] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'auto-saving' | 'auto-saved'>('idle');
  const [existingQuizId, setExistingQuizId] = useState<number | null>(null);
  const [saveAbortController, setSaveAbortController] = useState<AbortController | null>(null);
  const [chapitrageData, setChapitrageData] = useState<{
    chapitres?: any[];
    quizzes?: Record<number, { quiz: any; questions: any[] }>;
    etudeCas?: { id: number; titre: string };
  } | null>(null);
  const [contentSizeWarningModal, setContentSizeWarningModal] = useState<{ isOpen: boolean; size: number; maxSize: number }>({ isOpen: false, size: 0, maxSize: MAX_CONTENT_SIZE });

  const loadCoursInfo = async () => {
    try {
      // Récupérer le cours pour obtenir le bloc_id
      const coursResponse = await fetch(`/api/cours/${coursId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (coursResponse.ok) {
        const coursData = await coursResponse.json();
        // Pour l'instant, on va utiliser les props si disponibles
        if (coursData.cours?.bloc_id) {
          setCurrentBlocId(coursData.cours.bloc_id.toString());
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations du cours:', error);
    }
  };

  const loadChapitre = useCallback(async () => {
    if (!currentChapitreId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setCours(null);
      setContenu('');
      
      const response = await fetch(`/api/chapitres?chapitreId=${currentChapitreId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCours(data.chapitre);
        const loadedContent = data.chapitre.contenu || '';
        const loadedTitre = data.chapitre.titre || '';
        const loadedStatut = data.chapitre.statut || 'brouillon';
        setContenu(loadedContent);
        setLastSavedContent(loadedContent);
        setLastSavedTitre(loadedTitre);
        setLastSavedStatut(loadedStatut);
        setHasUnsavedChanges(false);
        // TODO: Charger les fichiers depuis le contenu JSON
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChapitreId]);

  // Charger toutes les données du chapitrage au montage pour optimisation
  const loadChapitrageData = useCallback(async () => {
    try {
      console.log('[CoursEditor] Chargement des données complètes du chapitrage pour cours:', coursId);
      const response = await fetch(`/api/cours/${coursId}/complete`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const coursData = data.cours || {};
        const chapitresList = coursData.chapitres || [];
        
        console.log('[CoursEditor] Données complètes chargées:', {
          chapitres: chapitresList.length,
          etudeCas: coursData.etude_cas ? 1 : 0
        });

        // Transformer les données au format attendu par Chapitrage
        // L'API retourne les quiz dans chaque chapitre, on doit les regrouper par chapitre_id
        const quizzesByChapitre: Record<number, { quiz: any; questions: any[] }> = {};
        
        chapitresList.forEach((chapitre: any) => {
          if (chapitre.quizzes && chapitre.quizzes.length > 0) {
            // Prendre le premier quiz du chapitre (normalement il n'y en a qu'un)
            const quizData = chapitre.quizzes[0];
            if (quizData) {
              quizzesByChapitre[chapitre.id] = {
                quiz: quizData,
                questions: quizData.questions || []
              };
            }
          }
        });
        
        // Formater les données pour le Chapitrage
        const formattedData = {
          chapitres: chapitresList,
          quizzes: quizzesByChapitre,
          etudeCas: coursData.etude_cas ? {
            id: coursData.etude_cas.id,
            titre: coursData.etude_cas.titre
          } : undefined
        };
        
        console.log('[CoursEditor] Données formatées pour Chapitrage:', {
          chapitres: formattedData.chapitres.length,
          quizzes: Object.keys(formattedData.quizzes).length,
          etudeCas: formattedData.etudeCas ? 1 : 0
        });
        
        setChapitrageData(formattedData);
      } else {
        console.warn('[CoursEditor] Impossible de charger les données complètes, le Chapitrage chargera les données individuellement');
      }
    } catch (error) {
      console.error('[CoursEditor] Erreur lors du chargement des données complètes:', error);
    }
  }, [coursId]);

  // Charger les informations du cours une seule fois au montage si nécessaire
  useEffect(() => {
    if (!currentFormationId || !currentBlocId) {
      loadCoursInfo();
    }
    // Charger les données du chapitrage en parallèle
    loadChapitrageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger le chapitre uniquement quand chapitreId change
  useEffect(() => {
    loadChapitre();
  }, [loadChapitre]);

  // Mettre à jour currentChapitreId quand chapitreId change
  useEffect(() => {
    setCurrentChapitreId(chapitreId);
  }, [chapitreId]);

  // Vérifier s'il existe un quiz pour ce chapitre
  useEffect(() => {
    const checkQuiz = async () => {
      if (currentChapitreId) {
        try {
          const response = await fetch(`/api/quiz?chapitreId=${currentChapitreId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.quiz) {
              setExistingQuizId(data.quiz.id);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du quiz:', error);
        }
      }
    };
    checkQuiz();
  }, [currentChapitreId]);

  // Détecter les changements (contenu, titre, statut)
  // Ne pas mettre à jour hasUnsavedChanges si on est en train de sauvegarder
  useEffect(() => {
    // Ne pas détecter de changements pendant une sauvegarde
    if (isSaving || isAutoSaving) {
      return;
    }
    
    // Utiliser le titre du chapitre (cours?.titre) et non le titre du cours (coursTitle)
    const chapitreTitre = cours?.titre || '';
    const contenuChanged = contenu !== lastSavedContent && contenu !== '';
    const titreChanged = chapitreTitre !== lastSavedTitre;
    const statutChanged = 'brouillon' !== lastSavedStatut;
    
    if (contenuChanged || titreChanged || statutChanged) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [contenu, lastSavedContent, cours, lastSavedTitre, lastSavedStatut, isSaving, isAutoSaving]);

  const handleSaveDraft = useCallback(async (isAutoSave = false) => {
    // Calculer les différences pour ne sauvegarder que ce qui a changé
    // IMPORTANT: Utiliser le titre du chapitre (cours?.titre) et non le titre du cours (coursTitle)
    const chapitreTitre = cours?.titre || '';
    const contenuChanged = contenu !== lastSavedContent;
    const titreChanged = chapitreTitre !== lastSavedTitre;
    const statutChanged = 'brouillon' !== lastSavedStatut;
    
    // Ne pas sauvegarder si rien n'a changé
    if (!contenuChanged && !titreChanged && !statutChanged) {
      // Si c'est une sauvegarde manuelle et qu'il n'y a pas de changements, afficher quand même un message
      if (!isAutoSave) {
        setSaveStatus('saved');
        setLastManualSaveTime(new Date());
        // Le message reste affiché jusqu'à la prochaine sauvegarde
      }
      return;
    }

    // Désactiver la sauvegarde manuelle si une sauvegarde automatique est en cours
    if (!isAutoSave && isAutoSaving) {
      return; // Ne pas permettre la sauvegarde manuelle pendant une sauvegarde automatique
    }

    // Annuler la sauvegarde précédente si elle est en cours (sauf si c'est une sauvegarde manuelle qui annule une auto)
    if (saveAbortController && isAutoSave) {
      saveAbortController.abort();
    }

    // Pour la sauvegarde automatique, on ne sauvegarde pas si une sauvegarde manuelle est en cours
    if (isAutoSave && isSaving) {
      return; // Ne pas interrompre une sauvegarde manuelle avec une auto
    }

    // Créer un nouveau AbortController pour cette sauvegarde
    const abortController = new AbortController();
    setSaveAbortController(abortController);

    // Pour la sauvegarde automatique, utiliser isAutoSaving au lieu de isSaving
    if (isAutoSave) {
      setIsAutoSaving(true);
      setSaveStatus('auto-saving');
    } else {
      setIsSaving(true);
      setSaveStatus('saving');
    }

    try {
      // Valider la taille du contenu avant l'envoi (toujours vérifier si le contenu existe)
      if (contenu) {
        // Estimer la taille finale du JSON (plus précis que juste le contenu)
        const estimatedSize = estimateFinalSize(contenu);
        if (estimatedSize > MAX_CONTENT_SIZE) {
          console.log('Contenu trop volumineux détecté:', { estimatedSize, maxSize: MAX_CONTENT_SIZE });
          setContentSizeWarningModal({
            isOpen: true,
            size: estimatedSize,
            maxSize: MAX_CONTENT_SIZE
          });
          // Réinitialiser les états
          if (isAutoSave) {
            setIsAutoSaving(false);
            setSaveStatus('idle');
          } else {
            setIsSaving(false);
            setSaveStatus('idle');
          }
          setSaveAbortController(null);
          return; // Ne pas sauvegarder
        }
      }

      // Construire l'objet de données avec seulement les champs modifiés
      const chapitreData: any = {
        cours_id: coursId
      };
      
      // Ajouter seulement les champs qui ont changé
      if (contenuChanged) {
        chapitreData.contenu = contenu;
      }
      if (titreChanged) {
        // IMPORTANT: Utiliser le titre du chapitre, pas le titre du cours
        chapitreData.titre = chapitreTitre;
      }
      if (statutChanged) {
        chapitreData.statut = 'brouillon';
      }

      if (currentChapitreId) {
        // Mise à jour - envoyer seulement les champs modifiés
        const response = await fetch('/api/chapitres', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chapitreId: currentChapitreId, 
            ...chapitreData,
            // Indiquer quels champs ont changé pour optimisation côté serveur
            _changedFields: {
              contenu: contenuChanged,
              titre: titreChanged,
              statut: statutChanged
            }
          }),
          signal: abortController.signal
        });
        
        if (response.ok) {
          // Sauvegarde réussie - arrêter immédiatement et afficher le message avec l'heure
          const data = await response.json();
          
          // Mettre à jour seulement les champs sauvegardés
          // IMPORTANT: Mettre à jour hasUnsavedChanges AVANT de mettre à jour lastSavedContent
          // pour éviter que le useEffect de sauvegarde automatique ne se déclenche
          setHasUnsavedChanges(false);
          
          if (contenuChanged) {
            setLastSavedContent(contenu);
          }
          if (titreChanged) {
            // IMPORTANT: Sauvegarder le titre du chapitre, pas le titre du cours
            setLastSavedTitre(chapitreTitre);
          }
          if (statutChanged) {
            setLastSavedStatut('brouillon');
          }
          
          // Mettre à jour le statut avec l'heure appropriée
          const saveTime = new Date();
          if (isAutoSave) {
            setLastAutoSaveTime(saveTime);
            setSaveStatus('auto-saved');
          } else {
            setLastManualSaveTime(saveTime);
            setSaveStatus('saved');
          }
          
          // Si l'API retourne le chapitre mis à jour, mettre à jour l'état
          if (data.chapitre) {
            setCours(data.chapitre);
          }
          
          // Rafraîchir le chapitrage après mise à jour (en arrière-plan, sans bloquer)
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              const refreshFn = (window as any)[`refreshChapitrage_${coursId}`];
              if (refreshFn && typeof refreshFn === 'function') {
                refreshFn();
              }
            }, 100);
          }
          
          // Arrêter ici - ne pas continuer avec d'autres vérifications
          return;
        } else if (response.status === 413) {
          // Gérer les erreurs 413
          const errorData = await response.json().catch(() => ({ error: 'Contenu trop volumineux' }));
          // Estimer la taille pour afficher dans le modal
          const estimatedSize = contenu ? estimateFinalSize(contenu) : MAX_CONTENT_SIZE + 1;
          setContentSizeWarningModal({
            isOpen: true,
            size: estimatedSize,
            maxSize: MAX_CONTENT_SIZE
          });
          if (isAutoSave) {
            setIsAutoSaving(false);
            setSaveStatus('idle');
          } else {
            setIsSaving(false);
            setSaveStatus('idle');
          }
          setSaveAbortController(null);
          return;
        } else {
          // Autre erreur
          console.error('Erreur lors de la sauvegarde:', response.status);
          if (isAutoSave) {
            setIsAutoSaving(false);
            setSaveStatus('idle');
          } else {
            setIsSaving(false);
            setSaveStatus('idle');
          }
          setSaveAbortController(null);
          alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
          return;
        }
      } else {
        // Création
        const response = await fetch('/api/chapitres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chapitreData)
        });
        
        if (response.ok) {
          // Création réussie - arrêter immédiatement et afficher le message avec l'heure
          const data = await response.json();
          setCurrentChapitreId(data.chapitre.id);
          setCours(data.chapitre);
          
          // Mettre à jour les états de sauvegarde
          setHasUnsavedChanges(false);
          if (contenuChanged) {
            setLastSavedContent(contenu);
          }
          if (titreChanged) {
            setLastSavedTitre(chapitreTitre);
          }
          if (statutChanged) {
            setLastSavedStatut('brouillon');
          }
          
          // Mettre à jour le statut avec l'heure appropriée
          const saveTime = new Date();
          if (isAutoSave) {
            setLastAutoSaveTime(saveTime);
            setSaveStatus('auto-saved');
          } else {
            setLastManualSaveTime(saveTime);
            setSaveStatus('saved');
          }
          
          // Arrêter ici - ne pas continuer avec d'autres vérifications
          return;
        } else if (response.status === 413) {
          // Gérer les erreurs 413
          const errorData = await response.json().catch(() => ({ error: 'Contenu trop volumineux' }));
          // Estimer la taille pour afficher dans le modal
          const estimatedSize = contenu ? estimateFinalSize(contenu) : MAX_CONTENT_SIZE + 1;
          setContentSizeWarningModal({
            isOpen: true,
            size: estimatedSize,
            maxSize: MAX_CONTENT_SIZE
          });
          if (isAutoSave) {
            setIsAutoSaving(false);
            setSaveStatus('idle');
          } else {
            setIsSaving(false);
            setSaveStatus('idle');
          }
          setSaveAbortController(null);
          return;
        } else {
          // En cas d'autre erreur
          console.error('Erreur lors de la création du chapitre:', response.status);
          if (isAutoSave) {
            setIsAutoSaving(false);
            setSaveStatus('idle');
          } else {
            setIsSaving(false);
            setSaveStatus('idle');
          }
          setSaveAbortController(null);
          alert('Erreur lors de la création du chapitre. Veuillez réessayer.');
          return;
        }
      }
    } catch (error: any) {
      // Ignorer les erreurs d'annulation
      if (error?.name === 'AbortError') {
        console.log('Sauvegarde annulée');
        return;
      }
      console.error('Erreur lors de la sauvegarde:', error);
      // Réinitialiser les états en cas d'erreur
      setSaveStatus('idle');
      // Afficher un message d'erreur à l'utilisateur
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      if (isAutoSave) {
        setIsAutoSaving(false);
      } else {
        setIsSaving(false);
      }
      setSaveAbortController(null);
      // Ne pas réinitialiser saveStatus ici, il sera mis à jour après la sauvegarde réussie
    }
  }, [contenu, lastSavedContent, lastSavedTitre, lastSavedStatut, isSaving, isAutoSaving, currentChapitreId, coursId, cours, router, formationId, blocId, saveAbortController]);

  // Sauvegarde automatique avec debouncing adaptatif selon la taille du contenu
  useEffect(() => {
    // Ne pas sauvegarder si :
    // - Il n'y a pas de changements non sauvegardés
    // - On est déjà en train de sauvegarder (manuelle ou automatique)
    // - Le contenu est vide
    if (!hasUnsavedChanges || isSaving || isAutoSaving || !contenu || contenu === '') {
      return;
    }

    // Calculer le délai de debounce en fonction de la taille du contenu
    // Petits contenus (< 100KB) : 5 secondes
    // Moyens contenus (100KB - 1MB) : 8 secondes
    // Gros contenus (1MB - 5MB) : 12 secondes
    // Très gros contenus (> 5MB) : 15 secondes
    const contentSize = new Blob([contenu]).size;
    let debounceDelay = 5000; // 5 secondes par défaut
    
    if (contentSize > 5 * 1024 * 1024) { // > 5MB
      debounceDelay = 15000; // 15 secondes
    } else if (contentSize > 1024 * 1024) { // > 1MB
      debounceDelay = 12000; // 12 secondes
    } else if (contentSize > 100 * 1024) { // > 100KB
      debounceDelay = 8000; // 8 secondes
    }

    // Timer avec délai adaptatif
    const autoSaveTimer = setTimeout(() => {
      // Vérifier à nouveau avant de sauvegarder (au cas où l'état aurait changé)
      if (hasUnsavedChanges && !isSaving && !isAutoSaving) {
      handleSaveDraft(true); // true = sauvegarde automatique
      }
    }, debounceDelay);

    // Nettoyer le timer si le contenu change avant le délai
    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [contenu, hasUnsavedChanges, isSaving, isAutoSaving, handleSaveDraft]);

  const handleNextStep = async () => {
    setIsSaving(true);
    try {
      // Valider la taille du contenu avant l'envoi
      if (contenu) {
        // Estimer la taille finale du JSON (plus précis que juste le contenu)
        const estimatedSize = estimateFinalSize(contenu);
        if (estimatedSize > MAX_CONTENT_SIZE) {
          setContentSizeWarningModal({
            isOpen: true,
            size: estimatedSize,
            maxSize: MAX_CONTENT_SIZE
          });
          setIsSaving(false);
          return;
        }
      }

      let finalChapitreId = currentChapitreId;

      // Vérifier si le contenu a changé avant de sauvegarder
      const hasChanges = contenu !== lastSavedContent;

      if (currentChapitreId) {
        // Si le chapitre existe déjà, ne sauvegarder que s'il y a des modifications
        if (hasChanges) {
          // IMPORTANT: Utiliser le titre du chapitre s'il existe, sinon le titre du cours comme fallback
          const chapitreTitre = cours?.titre || coursTitle;
          const chapitreData = {
            cours_id: coursId,
            titre: chapitreTitre,
        contenu,
        statut: 'en_cours_examen'
      };

          const response = await fetch('/api/chapitres', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapitreId: currentChapitreId, ...chapitreData })
        });

          if (response.ok) {
            setLastSavedContent(contenu);
            setHasUnsavedChanges(false);
        } else {
          // Gérer les erreurs 413
          if (response.status === 413) {
            const errorData = await response.json().catch(() => ({ error: 'Contenu trop volumineux' }));
            // Estimer la taille pour afficher dans le modal
            const estimatedSize = contenu ? estimateFinalSize(contenu) : MAX_CONTENT_SIZE + 1;
            setContentSizeWarningModal({
              isOpen: true,
              size: estimatedSize,
              maxSize: MAX_CONTENT_SIZE
            });
            setIsSaving(false);
            return;
          }
          throw new Error('Erreur lors de la mise à jour du chapitre');
        }
        }
        // Si pas de changements, on passe directement à la redirection
      } else {
        // Si le chapitre n'existe pas encore, le créer seulement si le contenu n'est pas vide
        if (contenu && contenu.trim() !== '') {
          const chapitreData = {
            cours_id: coursId,
            titre: coursTitle,
            contenu,
            statut: 'en_cours_examen'
          };

          const response = await fetch('/api/chapitres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chapitreData)
        });
        
        if (response.ok) {
          // Création réussie - arrêter immédiatement
          const data = await response.json();
          finalChapitreId = data.chapitre.id;
          // Mettre à jour le state avec le nouveau chapitre
          setCours(data.chapitre);
          setCurrentChapitreId(finalChapitreId);
          setLastSavedContent(contenu);
          setHasUnsavedChanges(false);
          setExistingQuizId(null); // Réinitialiser car c'est un nouveau chapitre
          setIsSaving(false);
          
          // Mettre à jour l'URL si nécessaire
          if (finalChapitreId) {
            router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${finalChapitreId}`, { scroll: false });
          }
          
          // Arrêter ici, ne pas continuer
          // Note: La redirection vers le quiz se fera après cette fonction
        } else {
          // Gérer les erreurs 413
          if (response.status === 413) {
            const errorData = await response.json().catch(() => ({ error: 'Contenu trop volumineux' }));
            setContentSizeWarningModal({
              isOpen: true,
              size: 0,
              maxSize: MAX_CONTENT_SIZE
            });
            setIsSaving(false);
            return;
          }
          setIsSaving(false);
          throw new Error('Erreur lors de la création du chapitre');
        }
        } else {
          // Si le contenu est vide et qu'il n'y a pas de chapitre, on ne peut pas créer de quiz
          alert('Veuillez d\'abord ajouter du contenu au chapitre avant de créer le quiz');
          setIsSaving(false);
          return;
        }
      }

      // Rediriger vers la page d'édition de quiz
      if (finalChapitreId && currentFormationId && currentBlocId) {
        router.push(`/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/cours/${coursId}/chapitre/${finalChapitreId}/quiz`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de la sauvegarde du cours');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFile = async (file: File) => {
    // TODO: Implémenter l'upload de fichier
    const newFile: FichierElement = {
      id: Date.now().toString(),
      nom: file.name,
      url: URL.createObjectURL(file),
      taille: file.size,
      type: file.type
    };
    setFichiers(prev => [...prev, newFile]);
  };

  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const handleRemoveFile = async (fileId: string) => {
    setDeletingFileId(fileId);
    // Trouver le fichier à supprimer
    const fileToDelete = fichiers.find(f => f.id === fileId);
    
    // Supprimer le fichier du storage si une URL existe
    if (fileToDelete?.url) {
      try {
        const { deleteFileFromStorage } = await import('@/lib/storage-utils');
        const success = await deleteFileFromStorage(fileToDelete.url, 'cours-fichiers-complementaires');
        if (success) {
          // Message de confirmation visuel
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = 'Fichier supprimé avec succès';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'Erreur lors de la suppression du fichier';
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    }
    
    setFichiers(prev => prev.filter(f => f.id !== fileId));
    setDeletingFileId(null);
  };

  const handleChapitreClick = (clickedChapitreId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/cours/${coursId}/chapitre/${clickedChapitreId}`
      );
    }
  };

  const handleQuizClick = (chapitreId: number, quizId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/cours/${coursId}/chapitre/${chapitreId}/quiz`
      );
    }
  };

  const handleEtudeCasClick = (chapitreId: number, etudeCasId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/cours/${coursId}/chapitre/${chapitreId}/etude-cas`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#032622]/20 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#032622] mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-[#032622] text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            CHARGEMENT DU COURS
          </p>
          <p className="text-[#032622]/70 text-sm" style={{ fontFamily: 'var(--font-rota-medium)' }}>
            Veuillez patienter pendant le chargement des données...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (currentFormationId && currentBlocId) {
      router.push(`/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-6 py-4">
        <div className="flex mb-[5%] items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Flèche de retour */}
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 bg-[#032622] text-[#F8F5E4] rounded hover:bg-[#032622]/80 transition-colors"
              title="Retour à la liste des cours"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Header avec notifications et profil */}
          <AdminTopBar notificationCount={0} className="mb-6" />
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full">
        <div className="w-full space-y-6 px-6">
        </div>

        {/* Éditeur de contenu - Pleine largeur */}
        <TiptapEditor
          content={contenu}
          onChange={setContenu}
          placeholder="ÉCRIS ICI..."
          onSaveDraft={handleSaveDraft}
          onNextStep={handleNextStep}
          isSaving={isSaving}
          lastAutoSaveTime={lastAutoSaveTime}
          isAutoSaving={isAutoSaving}
          lastManualSaveTime={lastManualSaveTime}
          saveStatus={saveStatus}
          fichiers={fichiers}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
          deletingFileId={deletingFileId}
          moduleNumber={coursOrder?.toString() || coursId.toString()}
          moduleTitle={coursTitle}
          moduleId={coursId}
          currentCoursId={currentChapitreId}
          currentCoursTitle={cours?.titre}
          onCoursClick={handleChapitreClick}
          onQuizClick={handleQuizClick}
          onEtudeCasClick={handleEtudeCasClick}
          formationId={currentFormationId || undefined}
          blocId={currentBlocId || undefined}
          nextStepButtonText={existingQuizId ? 'ÉDITER LE QUIZ' : 'CRÉER LE QUIZ'}
          chapitrageData={chapitrageData || undefined}
        />
      </div>

      {/* Modal d'avertissement pour le contenu trop volumineux */}
      <Modal
        isOpen={contentSizeWarningModal.isOpen}
        onClose={() => {
          console.log('Fermeture du modal de taille');
          setContentSizeWarningModal({ isOpen: false, size: 0, maxSize: MAX_CONTENT_SIZE });
        }}
        title="Contenu trop volumineux"
        message={contentSizeWarningModal.size > 0 
          ? `Le contenu que vous essayez de sauvegarder est trop volumineux (${formatSize(contentSizeWarningModal.size)}).\n\nLa taille maximale autorisée est de ${formatSize(contentSizeWarningModal.maxSize)}.\n\nVeuillez réduire la taille du contenu en supprimant du texte ou des images, ou divisez le contenu en plusieurs chapitres.`
          : `Le contenu que vous essayez de sauvegarder est trop volumineux.\n\nLa taille maximale autorisée est de ${formatSize(contentSizeWarningModal.maxSize)}.\n\nVeuillez réduire la taille du contenu en supprimant du texte ou des images, ou divisez le contenu en plusieurs chapitres.`
        }
        type="warning"
      />
      </div>
  );
};

