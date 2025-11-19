'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from './TiptapEditor';
import AdminTopBar from '../../components/AdminTopBar';
import { Cours, FichierElement } from '../../../../types/cours';
import { ArrowLeft } from 'lucide-react';

interface CoursEditorProps {
  coursId?: number;
  moduleId: number;
  moduleTitle: string;
  blocTitle: string;
  blocNumber: string;
  moduleOrder?: number;
  formationId?: string;
  blocId?: string;
}

export const CoursEditor = ({ coursId, moduleId, moduleTitle, blocTitle, blocNumber, moduleOrder, formationId, blocId }: CoursEditorProps) => {
  const router = useRouter();
  const [cours, setCours] = useState<Cours | null>(null);
  const [currentCoursId, setCurrentCoursId] = useState<number | undefined>(coursId);
  const [contenu, setContenu] = useState('');
  const [fichiers, setFichiers] = useState<FichierElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFormationId, setCurrentFormationId] = useState<string | null>(formationId || null);
  const [currentBlocId, setCurrentBlocId] = useState<string | null>(blocId || null);
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [existingQuizId, setExistingQuizId] = useState<number | null>(null);

  const loadModuleInfo = async () => {
    try {
      // Récupérer le module pour obtenir le bloc_id
      const moduleResponse = await fetch(`/api/modules/${moduleId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (moduleResponse.ok) {
        const moduleData = await moduleResponse.json();
        // L'API ne retourne pas directement bloc_id, on doit le récupérer via une autre méthode
        // On va utiliser l'API des modules avec blocId pour obtenir les informations
        const modulesResponse = await fetch(`/api/modules?blocId=${moduleData.module?.bloc_id || ''}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Alternative: récupérer directement depuis la base via une requête qui inclut bloc et formation
        // Pour l'instant, on va utiliser les props si disponibles
        if (moduleData.module?.bloc_id) {
          setCurrentBlocId(moduleData.module.bloc_id.toString());
        }
      }
      
      // Si on n'a toujours pas les infos, on essaie de les récupérer via l'API des blocs
      if (!currentFormationId && currentBlocId) {
        // On doit récupérer tous les blocs de toutes les formations pour trouver celui qui correspond
        // Cette approche n'est pas optimale, mais fonctionne si formationId n'est pas fourni
        // En pratique, formationId et blocId devraient toujours être fournis via les props
      }
    } catch (error) {
      console.error('Erreur lors du chargement des informations du module:', error);
    }
  };

  const loadCours = useCallback(async () => {
    if (!currentCoursId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setCours(null);
      setContenu('');
      
      const response = await fetch(`/api/cours?coursId=${currentCoursId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCours(data.cours);
        const loadedContent = data.cours.contenu || '';
        setContenu(loadedContent);
        setLastSavedContent(loadedContent);
        setHasUnsavedChanges(false);
        // TODO: Charger les fichiers depuis le contenu JSON
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCoursId]);

  // Charger les informations du module une seule fois au montage si nécessaire
  useEffect(() => {
    if (!currentFormationId || !currentBlocId) {
      loadModuleInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger le cours uniquement quand coursId change
  useEffect(() => {
    loadCours();
  }, [loadCours]);

  // Mettre à jour currentCoursId quand coursId change
  useEffect(() => {
    setCurrentCoursId(coursId);
  }, [coursId]);

  // Vérifier s'il existe un quiz pour ce cours
  useEffect(() => {
    const checkQuiz = async () => {
      if (currentCoursId) {
        try {
          const response = await fetch(`/api/quiz?coursId=${currentCoursId}`, {
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
  }, [currentCoursId]);

  // Détecter les changements de contenu
  useEffect(() => {
    if (contenu !== lastSavedContent && contenu !== '') {
      setHasUnsavedChanges(true);
    }
  }, [contenu, lastSavedContent]);

  const handleSaveDraft = useCallback(async (isAutoSave = false) => {
    // Ne pas sauvegarder si le contenu n'a pas changé
    if (contenu === lastSavedContent && !isAutoSave) {
      return;
    }

    // Ne pas sauvegarder si on est déjà en train de sauvegarder
    if (isSaving || isAutoSaving) {
      return;
    }

    // Pour la sauvegarde automatique, utiliser isAutoSaving au lieu de isSaving
    if (isAutoSave) {
      setIsAutoSaving(true);
    } else {
      setIsSaving(true);
    }

    try {
      const coursData = {
        module_id: moduleId,
        titre: moduleTitle,
        contenu,
        statut: 'brouillon'
      };

      if (currentCoursId) {
        // Mise à jour
        const response = await fetch('/api/cours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coursId: currentCoursId, ...coursData })
        });
        
        if (response.ok) {
          setLastSavedContent(contenu);
          setHasUnsavedChanges(false);
          if (isAutoSave) {
            setLastAutoSaveTime(new Date());
          }
        }
      } else {
        // Création
        const response = await fetch('/api/cours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursData)
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentCoursId(data.cours.id);
          setCours(data.cours);
          setLastSavedContent(contenu);
          setHasUnsavedChanges(false);
          if (isAutoSave) {
            setLastAutoSaveTime(new Date());
          }
          // Rediriger seulement si ce n'est pas une sauvegarde automatique
          if (!isAutoSave) {
            router.push(`/espace-admin/gestion-formations/${moduleId}/cours/${data.cours.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      if (isAutoSave) {
        setIsAutoSaving(false);
      } else {
        setIsSaving(false);
      }
    }
  }, [contenu, lastSavedContent, isSaving, isAutoSaving, currentCoursId, moduleId, moduleTitle, router]);

  // Sauvegarde automatique après 5 secondes d'inactivité
  useEffect(() => {
    // Ne pas sauvegarder si :
    // - Il n'y a pas de changements non sauvegardés
    // - On est déjà en train de sauvegarder
    // - Le contenu est vide
    if (!hasUnsavedChanges || isSaving || !contenu || contenu === '') {
      return;
    }

    // Timer de 5 secondes
    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft(true); // true = sauvegarde automatique
    }, 5000); // 5 secondes

    // Nettoyer le timer si le contenu change avant les 5 secondes
    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [contenu, hasUnsavedChanges, isSaving, handleSaveDraft]);

  const handleNextStep = async () => {
    setIsSaving(true);
    try {
      const coursData = {
        module_id: moduleId,
        titre: moduleTitle,
        contenu,
        statut: 'en_cours_examen'
      };

      let finalCoursId = currentCoursId;

      if (currentCoursId) {
        // Mise à jour
        await fetch('/api/cours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coursId: currentCoursId, ...coursData })
        });
      } else {
        // Création
        const response = await fetch('/api/cours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursData)
        });
        
        if (response.ok) {
          const data = await response.json();
          finalCoursId = data.cours.id;
          // Mettre à jour le state avec le nouveau cours
          setCours(data.cours);
          setCurrentCoursId(finalCoursId);
          setExistingQuizId(null); // Réinitialiser car c'est un nouveau cours
          // Mettre à jour l'URL si nécessaire
          if (finalCoursId) {
            router.push(`/espace-admin/gestion-formations/${moduleId}/cours/${finalCoursId}`, { scroll: false });
          }
        } else {
          throw new Error('Erreur lors de la création du cours');
        }
      }

      // Rediriger vers la page d'édition de quiz
      if (finalCoursId && currentFormationId && currentBlocId) {
        router.push(`/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/module/${moduleId}/cours/${finalCoursId}/quiz`);
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

  const handleCoursClick = (clickedCoursId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/module/${moduleId}/cours/${clickedCoursId}`
      );
    }
  };

  const handleQuizClick = (coursId: number, quizId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/module/${moduleId}/cours/${coursId}/quiz`
      );
    }
  };

  const handleEtudeCasClick = (moduleId: number, etudeCasId: number) => {
    if (currentFormationId && currentBlocId) {
      router.push(
        `/espace-admin/gestion-formations/${currentFormationId}/${currentBlocId}/module/${moduleId}/etude-cas`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du cours...</p>
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
          fichiers={fichiers}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
          deletingFileId={deletingFileId}
          moduleNumber={moduleOrder?.toString() || moduleId.toString()}
          moduleTitle={moduleTitle}
          moduleId={moduleId}
          currentCoursId={currentCoursId}
          currentCoursTitle={cours?.titre}
          onCoursClick={handleCoursClick}
          onQuizClick={handleQuizClick}
          onEtudeCasClick={handleEtudeCasClick}
          formationId={currentFormationId || undefined}
          blocId={currentBlocId || undefined}
          nextStepButtonText={existingQuizId ? 'ÉDITER LE QUIZ' : 'CRÉER LE QUIZ'}
        />
      </div>
      </div>
  );
};
