'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ChevronDown, RefreshCw, ArrowLeft, Upload, Image as ImageIcon, Video, FileText, Check } from 'lucide-react';
import { Modal } from '@/app/Modal';

interface EtudeCasEditorPageProps {
  coursId: number;
  formationId: string;
  blocId: string;
}

interface QuestionForm {
  id?: number;
  question: string;
  type_question: 'ouverte' | 'choix_unique' | 'choix_multiple' | 'vrai_faux' | 'piece_jointe';
  reponses: ReponseForm[];
  contenu_question?: string;
  image_url?: string;
  video_url?: string;
  fichier_question?: string;
  supports_annexes?: string[]; // Array de chemins/URLs des fichiers
  points: number;
}

interface ReponseForm {
  id?: number;
  reponse: string;
  est_correcte: boolean;
}

interface ReponseData {
  reponse: string;
  est_correcte: boolean;
  ordre_affichage: number;
}

export const EtudeCasEditorPage = ({ coursId, formationId, blocId }: EtudeCasEditorPageProps) => {
  const router = useRouter();
  const [consigne, setConsigne] = useState('');
  const [fichierConsigne, setFichierConsigne] = useState<File | null>(null);
  const [fichierConsigneUrl, setFichierConsigneUrl] = useState<string | null>(null);
  const [fichierConsigneNom, setFichierConsigneNom] = useState<string | null>(null); // Nom original du fichier
  const [useFichierConsigne, setUseFichierConsigne] = useState(false);
  const [isUploadingConsigne, setIsUploadingConsigne] = useState(false);
  const [isDeletingConsigne, setIsDeletingConsigne] = useState(false);
  const [deletingAnnexeIndex, setDeletingAnnexeIndex] = useState<{ qIndex: number; aIndex: number } | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [etudeCasId, setEtudeCasId] = useState<number | null>(null);
  const [lastSavedData, setLastSavedData] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; message: string; type: 'info' | 'success' | 'warning' | 'error'; title?: string }>({
    isOpen: false,
    message: '',
    type: 'info'
  });
  const [noQuestionsModal, setNoQuestionsModal] = useState<{ isOpen: boolean }>({
    isOpen: false
  });

  // Charger l'étude de cas existante
  useEffect(() => {
    const loadEtudeCas = async () => {
      setIsLoading(true);
      try {
        // Si on a déjà un etudeCasId, l'utiliser directement
        // Sinon, utiliser coursId
        let url = '/api/etude-cas?';
        if (etudeCasId) {
          url += `etudeCasId=${etudeCasId}`;
        } else {
          url += `coursId=${coursId}`;
        }
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.etudeCas) {
            console.log('[loadEtudeCas] Données reçues:', {
              id: data.etudeCas.id,
              hasFichierConsigne: !!data.etudeCas.fichier_consigne,
              fichierConsigne: data.etudeCas.fichier_consigne
            });
            
            setEtudeCasId(data.etudeCas.id);
            setConsigne(data.etudeCas.consigne || '');
            
            // Si un fichier existe, configurer correctement l'état pour l'affichage
            if (data.etudeCas.fichier_consigne) {
              console.log('[loadEtudeCas] Fichier consigne trouvé:', data.etudeCas.fichier_consigne);
              setFichierConsigneUrl(data.etudeCas.fichier_consigne);
              setUseFichierConsigne(true);
              
              // Utiliser le nom stocké en base ou extraire depuis l'URL
              let fileName = data.etudeCas.nom_fichier_consigne || 'fichier_consigne';
              if (!data.etudeCas.nom_fichier_consigne) {
                // Fallback : extraire le nom du fichier depuis l'URL
                try {
                  const url = new URL(data.etudeCas.fichier_consigne);
                  const pathParts = url.pathname.split('/');
                  fileName = pathParts[pathParts.length - 1]?.split('?')[0] || fileName;
                  console.log('[loadEtudeCas] Nom du fichier extrait depuis URL:', fileName);
                } catch (e) {
                  const pathParts = data.etudeCas.fichier_consigne.split('/');
                  fileName = pathParts[pathParts.length - 1]?.split('?')[0] || fileName;
                  console.log('[loadEtudeCas] Nom du fichier extrait (chemin):', fileName);
                }
              } else {
                console.log('[loadEtudeCas] Nom du fichier depuis la base:', fileName);
              }
              
              // Créer un objet File factice pour l'affichage et stocker le nom
              setFichierConsigneNom(fileName);
              setFichierConsigne(new File([], fileName, { type: 'application/octet-stream' }));
              console.log('[loadEtudeCas] États mis à jour: useFichierConsigne=true, fichierConsigneUrl=', data.etudeCas.fichier_consigne);
            } else {
              console.log('[loadEtudeCas] Aucun fichier consigne trouvé');
              setFichierConsigneUrl(null);
              setUseFichierConsigne(false);
              setFichierConsigne(null);
            }
            
            // Charger les questions
            const formattedQuestions: QuestionForm[] = (data.questions || []).map((q: any) => ({
              id: q.id,
              question: q.question,
              type_question: q.type_question,
              reponses: (q.reponses_possibles || []).map((r: any) => ({
                id: r.id,
                reponse: r.reponse,
                est_correcte: r.est_correcte,
              })),
              contenu_question: q.contenu_question,
              image_url: q.image_url,
              video_url: q.video_url,
              fichier_question: q.fichier_question,
              supports_annexes: q.supports_annexes || [],
              points: q.points || 1,
            }));
            setQuestions(formattedQuestions);
            
            // Mettre à jour lastSavedData après avoir défini tous les états
            // Utiliser les valeurs chargées depuis la base de données
            const loadedConsigne = data.etudeCas.consigne || '';
            const loadedFichierConsigneUrl = data.etudeCas.fichier_consigne || null;
            const loadedFichierConsigneNom = data.etudeCas.nom_fichier_consigne || null;
            setLastSavedData(JSON.stringify({ 
              consigne: loadedConsigne, 
              questions: formattedQuestions, 
              fichierConsigneUrl: loadedFichierConsigneUrl,
              fichierConsigneNom: loadedFichierConsigneNom
            }));
            setHasUnsavedChanges(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'étude de cas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEtudeCas();
  }, [coursId]);
  
  // Recharger les données après qu'un etudeCasId soit créé (après sauvegarde automatique)
  // Utiliser une ref pour éviter les rechargements en boucle
  const previousEtudeCasIdRef = useRef<number | null>(null);
  useEffect(() => {
    // Ne recharger que si etudeCasId vient d'être créé (passage de null à une valeur)
    if (!etudeCasId || previousEtudeCasIdRef.current === etudeCasId) {
      previousEtudeCasIdRef.current = etudeCasId;
      return;
    }
    
    const wasNull = previousEtudeCasIdRef.current === null;
    previousEtudeCasIdRef.current = etudeCasId;
    
    // Ne recharger que si on vient de créer l'étude de cas (passage de null à une valeur)
    if (!wasNull) return;
    
    const reloadAfterSave = async () => {
      try {
        const reloadResponse = await fetch(`/api/etude-cas?etudeCasId=${etudeCasId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          if (reloadData.etudeCas) {
            // Mettre à jour uniquement le fichier consigne si présent et différent
            if (reloadData.etudeCas.fichier_consigne && reloadData.etudeCas.fichier_consigne !== fichierConsigneUrl) {
              console.log('[reloadAfterSave] Mise à jour du fichier consigne:', reloadData.etudeCas.fichier_consigne);
              setFichierConsigneUrl(reloadData.etudeCas.fichier_consigne);
              setUseFichierConsigne(true);
              
              // Utiliser le nom stocké en base ou extraire depuis l'URL
              let fileName = reloadData.etudeCas.nom_fichier_consigne || 'fichier_consigne';
              if (!reloadData.etudeCas.nom_fichier_consigne) {
                try {
                  const url = new URL(reloadData.etudeCas.fichier_consigne);
                  const pathParts = url.pathname.split('/');
                  fileName = pathParts[pathParts.length - 1]?.split('?')[0] || fileName;
                } catch (e) {
                  const pathParts = reloadData.etudeCas.fichier_consigne.split('/');
                  fileName = pathParts[pathParts.length - 1]?.split('?')[0] || fileName;
                }
              }
              setFichierConsigneNom(fileName);
              setFichierConsigne(new File([], fileName, { type: 'application/octet-stream' }));
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du rechargement après sauvegarde:', error);
      }
    };
    
    // Délai pour éviter les rechargements trop fréquents
    const timeoutId = setTimeout(reloadAfterSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [etudeCasId, fichierConsigneUrl]); // Se déclenche uniquement quand etudeCasId change

  // Détecter les changements
  useEffect(() => {
    const currentDataJson = JSON.stringify({ consigne, questions, fichierConsigneUrl });
    if (currentDataJson !== lastSavedData && (consigne || questions.length > 0 || fichierConsigneUrl)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [consigne, questions, fichierConsigneUrl, lastSavedData]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        type_question: 'ouverte',
        reponses: [],
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    if (field === 'type_question') {
      // Pour vrai/faux, ajouter automatiquement les réponses
      if (value === 'vrai_faux') {
        updated[index] = {
          ...updated[index],
          type_question: value,
          reponses: [
            { reponse: 'Vrai', est_correcte: false },
            { reponse: 'Faux', est_correcte: false },
          ],
        };
      } else if (value === 'choix_unique' || value === 'choix_multiple') {
        // Pour les choix, initialiser avec 2 réponses vides
        updated[index] = {
          ...updated[index],
          type_question: value,
          reponses: updated[index].reponses.length === 0 
            ? [
                { reponse: '', est_correcte: false },
                { reponse: '', est_correcte: false },
              ]
            : updated[index].reponses,
        };
      } else {
        // Pour ouverte et piece_jointe, vider les réponses
        updated[index] = {
          ...updated[index],
          type_question: value,
          reponses: [],
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  };

  const addSupportAnnexe = (qIndex: number, file: File) => {
    const updated = [...questions];
    if (!updated[qIndex].supports_annexes) {
      updated[qIndex].supports_annexes = [];
    }
    // Ici, on stockera le chemin après upload, pour l'instant on stocke le nom
    updated[qIndex].supports_annexes = [...updated[qIndex].supports_annexes!, file.name];
    setQuestions(updated);
  };

  const removeSupportAnnexe = async (qIndex: number, annexeIndex: number) => {
    setDeletingAnnexeIndex({ qIndex, aIndex: annexeIndex });
    const updated = [...questions];
    if (updated[qIndex].supports_annexes) {
      const annexeToDelete = updated[qIndex].supports_annexes[annexeIndex];
      
      // Supprimer le fichier du storage si c'est une URL
      if (annexeToDelete && (annexeToDelete.startsWith('http') || annexeToDelete.includes('/'))) {
        try {
          const { deleteFileFromStorage } = await import('@/lib/storage-utils');
          const success = await deleteFileFromStorage(annexeToDelete);
          if (success) {
            // Message de confirmation visuel
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
            notification.textContent = 'Support annexe supprimé avec succès';
            document.body.appendChild(notification);
            setTimeout(() => {
              notification.remove();
            }, 3000);
          }
        } catch (error) {
          console.error('Erreur lors de la suppression du support annexe:', error);
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50';
          notification.textContent = 'Erreur lors de la suppression du support annexe';
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
      }
      
      updated[qIndex].supports_annexes = updated[qIndex].supports_annexes.filter((_, i) => i !== annexeIndex);
    }
    setQuestions(updated);
    setDeletingAnnexeIndex(null);
  };

  const addReponse = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].reponses.push({ reponse: '', est_correcte: false });
    setQuestions(updated);
  };

  const removeReponse = (qIndex: number, rIndex: number) => {
    const updated = [...questions];
    updated[qIndex].reponses = updated[qIndex].reponses.filter((_, i) => i !== rIndex);
    setQuestions(updated);
  };

  const updateReponse = (qIndex: number, rIndex: number, field: keyof ReponseForm, value: any) => {
    const updated = [...questions];
    updated[qIndex].reponses[rIndex] = { ...updated[qIndex].reponses[rIndex], [field]: value };
    setQuestions(updated);
  };


  const handleConsigneFileUpload = async (file: File) => {
    setFichierConsigne(file);
    setUseFichierConsigne(true);
    setIsUploadingConsigne(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (etudeCasId) {
        formData.append('etudeCasId', etudeCasId.toString());
      }

      // Utiliser AbortController pour permettre l'annulation si nécessaire
      const controller = new AbortController();
      console.log('[handleConsigneFileUpload] Envoi du fichier vers /api/etude-cas/upload-consigne');
      const uploadResponse = await fetch('/api/etude-cas/upload-consigne', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: controller.signal,
      });

      console.log('[handleConsigneFileUpload] Réponse reçue:', uploadResponse.status, uploadResponse.statusText);

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.fichier) {
          setFichierConsigneUrl(uploadData.fichier.url || uploadData.fichier.chemin_fichier);
          // Stocker le nom original du fichier
          setFichierConsigneNom(uploadData.fichier.nom_fichier || file.name);
        }
      } else {
        let errorData;
        try {
          errorData = await uploadResponse.json();
        } catch (e) {
          errorData = { error: `Erreur ${uploadResponse.status}: ${uploadResponse.statusText}` };
        }
        console.error('Erreur upload fichier consigne:', errorData, 'Status:', uploadResponse.status);
        setModal({
          isOpen: true,
          message: `Erreur lors de l'upload du fichier (${uploadResponse.status}): ${errorData.error || uploadResponse.statusText || 'Erreur inconnue'}`,
          type: 'error',
          title: 'Erreur d\'upload'
        });
        setFichierConsigne(null);
        setUseFichierConsigne(false);
      }
    } catch (error) {
      console.error('Erreur upload fichier consigne:', error);
      setModal({
        isOpen: true,
        message: 'Erreur lors de l\'upload du fichier',
        type: 'error',
        title: 'Erreur d\'upload'
      });
      setFichierConsigne(null);
      setUseFichierConsigne(false);
    } finally {
      setIsUploadingConsigne(false);
    }
  };

  // Fonction de sauvegarde automatique
  const handleAutoSave = useCallback(async () => {
    if (isSaving || isAutoSaving || !hasUnsavedChanges) {
      return;
    }

    setIsAutoSaving(true);
    try {
      // Créer ou mettre à jour l'étude de cas
      let currentEtudeCasId = etudeCasId;
      if (!currentEtudeCasId) {
        const payload = {
          cours_id: coursId,
          titre: `Étude de cas - Cours`,
          consigne: consigne || '', // consigne est NOT NULL, utiliser '' au lieu de null
          fichier_consigne: fichierConsigneUrl || null,
          nom_fichier_consigne: fichierConsigneNom || null,
        };
        console.log('[handleAutoSave] Envoi POST /api/etude-cas avec:', payload);
        const etudeCasResponse = await fetch('/api/etude-cas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (etudeCasResponse.ok) {
          const etudeCasData = await etudeCasResponse.json();
          currentEtudeCasId = etudeCasData.etudeCas.id;
          setEtudeCasId(currentEtudeCasId);
        } else {
          return;
        }
      } else {
        const updateResponse = await fetch('/api/etude-cas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etudeCasId: currentEtudeCasId,
            consigne: consigne || '', // consigne est NOT NULL, utiliser '' au lieu de null
            fichier_consigne: fichierConsigneUrl || null,
            nom_fichier_consigne: fichierConsigneNom || null,
          }),
        });
        if (!updateResponse.ok) {
          // En mode auto-save, on ne lance pas d'erreur, on retourne silencieusement
          return;
        }
      }

      // Sauvegarder les questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) continue;

        const questionData: any = {
          etude_cas_id: currentEtudeCasId,
          question: q.question,
          type_question: q.type_question,
          points: q.points,
          contenu_question: q.contenu_question || null,
          image_url: q.image_url || null,
          video_url: q.video_url || null,
          fichier_question: q.fichier_question || null,
          supports_annexes: q.supports_annexes || [],
        };

        let reponsesData: ReponseData[] = [];
        if (q.type_question === 'vrai_faux') {
          reponsesData = [
            { reponse: 'Vrai', est_correcte: q.reponses[0]?.est_correcte || false, ordre_affichage: 1 },
            { reponse: 'Faux', est_correcte: q.reponses[1]?.est_correcte || false, ordre_affichage: 2 },
          ];
        } else if (q.type_question === 'choix_unique' || q.type_question === 'choix_multiple') {
          reponsesData = q.reponses
            .filter(r => r.reponse.trim())
            .map((r, index): ReponseData => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          await fetch('/api/etude-cas/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        } else {
          await fetch('/api/etude-cas/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        }
      }

      setLastSavedData(JSON.stringify({ consigne, questions, fichierConsigneUrl, fichierConsigneNom }));
      setHasUnsavedChanges(false);
      setLastAutoSaveTime(new Date());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    } finally {
      setIsAutoSaving(false);
    }
      }, [consigne, questions, etudeCasId, coursId, isSaving, isAutoSaving, hasUnsavedChanges, fichierConsigneUrl, fichierConsigneNom]);

  // Sauvegarde automatique après 5 secondes
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving || isAutoSaving) {
      return;
    }

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 5000);

    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [consigne, questions, hasUnsavedChanges, isSaving, isAutoSaving, handleAutoSave]);

  const handleSubmit = async () => {
    // Vérifier s'il y a des questions valides (non vides)
    const questionsValides = questions.filter(q => q.question.trim());
    
    // Si aucune question valide, afficher un modal de confirmation
    if (questionsValides.length === 0) {
      setNoQuestionsModal({ isOpen: true });
      return;
    }
    
    // VALIDATION : Vérifier que toutes les questions présentes ont au moins une bonne réponse
    const validationErrors: string[] = [];
    let questionNum = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) continue; // Ignorer les questions vides
      
      questionNum++; // Numéro de la question valide
      
      // Les questions ouvertes et pièce jointe n'ont pas de réponses prédéfinies
      // Elles sont corrigées manuellement, donc on les ignore dans la validation
      if (q.type_question === 'ouverte' || q.type_question === 'piece_jointe') {
        continue; // Passer à la question suivante
      }
      
      // Filtrer les réponses valides (non vides)
      const reponsesValides = q.reponses.filter(r => r.reponse.trim());
      
      if (reponsesValides.length === 0) {
        validationErrors.push(`Question ${questionNum}: Aucune réponse valide`);
        continue;
      }
      
      // Compter les bonnes réponses
      const bonnesReponses = reponsesValides.filter(r => r.est_correcte).length;
      
      if (q.type_question === 'vrai_faux') {
        // Pour vrai/faux, il faut qu'une des deux réponses soit correcte
        const vraiCorrect = q.reponses[0]?.est_correcte || false;
        const fauxCorrect = q.reponses[1]?.est_correcte || false;
        if (!vraiCorrect && !fauxCorrect) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner au moins une bonne réponse (Vrai ou Faux)`);
        }
      } else if (q.type_question === 'choix_multiple') {
        // Pour choix multiple, il faut au moins 2 bonnes réponses
        if (bonnesReponses === 0) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner au moins une bonne réponse`);
        } else if (bonnesReponses < 2) {
          validationErrors.push(`Question ${questionNum}: Pour les questions à choix multiple, vous devez sélectionner au moins 2 bonnes réponses (actuellement: ${bonnesReponses})`);
        }
      } else if (q.type_question === 'choix_unique') {
        // Pour choix unique, il faut exactement 1 bonne réponse
        if (bonnesReponses === 0) {
          validationErrors.push(`Question ${questionNum}: Vous devez sélectionner une bonne réponse`);
        } else if (bonnesReponses > 1) {
          validationErrors.push(`Question ${questionNum}: Pour les questions à choix unique, vous ne pouvez sélectionner qu'une seule bonne réponse`);
        }
      }
    }
    
    // Si des erreurs de validation sont trouvées, afficher un message et empêcher la soumission
    if (validationErrors.length > 0) {
      const errorMessage = `Impossible de soumettre l'étude de cas. Veuillez corriger les erreurs suivantes :\n\n${validationErrors.join('\n')}`;
      setModal({
        isOpen: true,
        message: errorMessage,
        type: 'error',
        title: 'Erreurs de validation'
      });
      setIsSaving(false);
      return;
    }
    
    // Procéder à la sauvegarde
    await proceedWithSave();
  };

  const proceedWithSave = async () => {
    setIsSaving(true);
    try {
      // Créer ou mettre à jour l'étude de cas
      let currentEtudeCasId = etudeCasId;
      if (!currentEtudeCasId) {
        const payload = {
          cours_id: coursId,
          titre: `Étude de cas - Cours`,
          consigne: consigne || '', // consigne est NOT NULL, utiliser '' au lieu de null
          fichier_consigne: fichierConsigneUrl || null,
          nom_fichier_consigne: fichierConsigneNom || null,
        };
        console.log('[handleSubmit] Envoi POST /api/etude-cas avec:', payload);
        const etudeCasResponse = await fetch('/api/etude-cas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (etudeCasResponse.ok) {
          const etudeCasData = await etudeCasResponse.json();
          currentEtudeCasId = etudeCasData.etudeCas.id;
          setEtudeCasId(currentEtudeCasId);
        } else {
          const errorData = await etudeCasResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
          throw new Error(errorData.error || 'Erreur lors de la création de l\'étude de cas');
        }
      } else {
        await fetch('/api/etude-cas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etudeCasId: currentEtudeCasId,
            consigne: consigne || '', // consigne est NOT NULL, utiliser '' au lieu de null
            fichier_consigne: fichierConsigneUrl,
            nom_fichier_consigne: fichierConsigneNom || null,
          }),
        });
      }

      // Sauvegarder les questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) continue;

        const questionData: any = {
          etude_cas_id: currentEtudeCasId,
          question: q.question,
          type_question: q.type_question,
          points: q.points,
          contenu_question: q.contenu_question || null,
          image_url: q.image_url || null,
          video_url: q.video_url || null,
          fichier_question: q.fichier_question || null,
          supports_annexes: q.supports_annexes || [],
        };

        let reponsesData: ReponseData[] = [];
        if (q.type_question === 'vrai_faux') {
          reponsesData = [
            { reponse: 'Vrai', est_correcte: q.reponses[0]?.est_correcte || false, ordre_affichage: 1 },
            { reponse: 'Faux', est_correcte: q.reponses[1]?.est_correcte || false, ordre_affichage: 2 },
          ];
        } else if (q.type_question === 'choix_unique' || q.type_question === 'choix_multiple') {
          reponsesData = q.reponses
            .filter(r => r.reponse.trim())
            .map((r, index): ReponseData => ({
              reponse: r.reponse,
              est_correcte: r.est_correcte,
              ordre_affichage: index + 1,
            }));
        }

        if (q.id) {
          await fetch('/api/etude-cas/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: q.id,
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        } else {
          await fetch('/api/etude-cas/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...questionData,
              reponses_possibles: reponsesData,
            }),
          });
        }
      }

      setLastSavedData(JSON.stringify({ consigne, questions, fichierConsigneUrl, fichierConsigneNom }));
      setHasUnsavedChanges(false);
      setLastAutoSaveTime(new Date());

      router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'étude de cas:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de l\'étude de cas';
      setModal({
        isOpen: true,
        message: errorMessage,
        type: 'error',
        title: 'Erreur'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement de l'étude de cas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Flèche retour et indicateur de sauvegarde automatique */}
      <div className="mb-4 space-y-2">
        <button
          onClick={() => router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`)}
          className="flex items-center gap-2 text-[#032622] hover:text-[#032622]/70 transition-colors"
          title="Retour aux modules"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold uppercase text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            Retour aux modules
          </span>
        </button>
        
        {(lastAutoSaveTime || isAutoSaving) && (
          <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-[#032622] ${isAutoSaving ? 'animate-spin' : ''}`} />
            <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
              {isAutoSaving ? (
                'Enregistrement automatique en cours...'
              ) : (
                `Enregistrement automatique - ${lastAutoSaveTime?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              )}
            </span>
          </div>
        )}
      </div>

      {/* Rédaction de l'étude de cas */}
      <div className="mb-8 space-y-4">
        <h2 className="text-xl font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          RÉDACTION DE L'ÉTUDE DE CAS
        </h2>
        
        {!useFichierConsigne ? (
          <textarea
            value={consigne}
            onChange={(e) => setConsigne(e.target.value)}
            placeholder="Écrivez le sujet de l'étude de cas ici..."
            className="w-full px-4 py-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] min-h-[200px] font-bold"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          />
        ) : (
          <div className="border-2 border-dashed border-[#032622] p-8 text-center">
            {isUploadingConsigne ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#032622]" />
                <span className="text-[#032622] font-bold">Upload en cours...</span>
              </div>
            ) : fichierConsigneUrl ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#032622]" />
                  <span className="text-[#032622] font-bold">
                    {fichierConsigneNom || fichierConsigne?.name || 'Fichier consigne'}
                  </span>
                  {fichierConsigneUrl && (
                    <a
                      href={fichierConsigneUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm ml-2"
                    >
                      (Télécharger)
                    </a>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setIsDeletingConsigne(true);
                    // Supprimer le fichier du storage si une URL existe
                    if (fichierConsigneUrl) {
                      try {
                        const { deleteFileFromStorage } = await import('@/lib/storage-utils');
                        const success = await deleteFileFromStorage(fichierConsigneUrl);
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
                    setFichierConsigne(null);
                    setFichierConsigneUrl(null);
                    setFichierConsigneNom(null);
                    setUseFichierConsigne(false);
                    setIsDeletingConsigne(false);
                  }}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeletingConsigne}
                >
                  {isDeletingConsigne ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              <>
                <p className="text-[#032622] mb-4">Déposez les fichiers ici pdf, .docx ou .pptx</p>
                <label className="bg-[#032622] text-[#F8F5E4] px-4 py-2 cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleConsigneFileUpload(file);
                    }}
                    className="hidden"
                  />
                  Sélectionnez des fichiers
                </label>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-[#032622]"></div>
          <span className="text-[#032622] font-bold uppercase">OU</span>
          <div className="flex-1 h-px bg-[#032622]"></div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setUseFichierConsigne(false)}
            className={`px-4 py-2 font-bold uppercase ${!useFichierConsigne ? 'bg-[#032622] text-[#F8F5E4]' : 'bg-[#F8F5E4] text-[#032622] border-2 border-[#032622]'}`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            Texte
          </button>
          <button
            onClick={() => setUseFichierConsigne(true)}
            className={`px-4 py-2 font-bold uppercase ${useFichierConsigne ? 'bg-[#032622] text-[#F8F5E4]' : 'bg-[#F8F5E4] text-[#032622] border-2 border-[#032622]'}`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            Fichier
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="mb-8 space-y-6">
        <h2 className="text-xl font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
          QUESTIONS
        </h2>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border-2 border-[#032622] p-4 bg-[#F8F5E4] space-y-4">
            {/* En-tête de la question */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                QUESTION {qIndex + 1}
              </h3>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question et type */}
            <div className="flex gap-4">
              <input
                type="text"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="ECRIS LA QUESTION ICI..."
                className={`flex-1 px-4 py-3 border-2 border-[#032622] text-[#032622] font-bold ${
                  question.type_question === 'choix_unique' || question.type_question === 'choix_multiple' || question.type_question === 'vrai_faux'
                    ? 'bg-[#F8F5E4]'
                    : 'bg-[#F8F5E4]'
                }`}
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              />
              <div className="relative">
                <select
                  value={question.type_question}
                  onChange={(e) => updateQuestion(qIndex, 'type_question', e.target.value)}
                  className="bg-[#032622] border-2 border-[#032622] text-[#F8F5E4] px-4 py-3 pr-10 font-bold uppercase appearance-none cursor-pointer"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <option value="ouverte">QUESTION OUVERTE</option>
                  <option value="choix_unique">CHOIX UNIQUE</option>
                  <option value="choix_multiple">CHOIX MULTIPLE</option>
                  <option value="vrai_faux">VRAI/FAUX</option>
                  <option value="piece_jointe">PIÈCE JOINTE</option>
                </select>
                <ChevronDown className="absolute  right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#F8F5E4] pointer-events-none" />
              </div>
            </div>

            {/* Contenu additionnel pour question ouverte */}
            {question.type_question === 'ouverte' && (
              <textarea
                value={question.contenu_question || ''}
                onChange={(e) => updateQuestion(qIndex, 'contenu_question', e.target.value)}
                placeholder="Contenu détaillé de la question..."
                className="w-full px-4 py-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] min-h-[100px]"
              />
            )}

            {/* Boutons pour ajouter image/vidéo (pour question ouverte) */}
            {question.type_question === 'ouverte' && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#032622] text-[#F8F5E4] font-bold uppercase text-sm">
                  <ImageIcon className="w-4 h-4" />
                  AJOUTER UNE IMAGE
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#032622] text-[#F8F5E4] font-bold uppercase text-sm">
                  <Video className="w-4 h-4" />
                  AJOUTER UNE VIDÉO
                </button>
              </div>
            )}

            {/* Zone de dépôt pour question pièce jointe */}
            {question.type_question === 'piece_jointe' && (
              <div className="border-2 border-dashed border-[#032622] p-8 text-center">
                <p className="text-[#032622] mb-4">Déposez les fichiers ici pdf, .docx ou .pptx</p>
                <label className="bg-[#032622] text-[#F8F5E4] px-4 py-2 cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateQuestion(qIndex, 'fichier_question', file.name);
                    }}
                    className="hidden"
                  />
                  Sélectionnez des fichiers
                </label>
              </div>
            )}

            {/* Réponses pour choix unique, multiple et vrai/faux */}
            {(question.type_question === 'choix_unique' || question.type_question === 'choix_multiple' || question.type_question === 'vrai_faux') && (
              <div className="space-y-3">
                {question.reponses.map((reponse, rIndex) => (
                  <div key={rIndex} className="flex items-center gap-3">
                    {question.type_question !== 'vrai_faux' && (
                      <button
                        onClick={() => updateReponse(qIndex, rIndex, 'est_correcte', !reponse.est_correcte)}
                        className={`w-10 h-10 flex items-center justify-center border-2 border-[#032622] ${
                          reponse.est_correcte
                            ? 'bg-[#032622] text-[#F8F5E4]'
                            : 'bg-[#F8F5E4] text-[#032622]'
                        }`}
                      >
                        {reponse.est_correcte ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    {question.type_question === 'vrai_faux' ? (
                      <button
                        type="button"
                        onClick={() => {
                          // Pour vrai/faux, on toggle la réponse correcte et on désactive l'autre
                          const updated = [...questions];
                          updated[qIndex].reponses.forEach((r, i) => {
                            r.est_correcte = i === rIndex;
                          });
                          setQuestions(updated);
                        }}
                        className={`flex-1 px-4 py-3 border-2 border-[#032622] font-bold cursor-pointer ${
                          reponse.est_correcte
                            ? 'bg-[#032622] text-[#F8F5E4]'
                            : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
                        } transition-colors`}
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        {rIndex === 0 ? 'VRAI' : 'FAUX'}
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={reponse.reponse}
                          onChange={(e) => updateReponse(qIndex, rIndex, 'reponse', e.target.value)}
                          placeholder={
                            reponse.est_correcte
                              ? 'Ecris une bonne réponse'
                              : 'Ecris une mauvaise réponse'
                          }
                          className={`flex-1 px-4 py-3 border-2 border-[#032622] ${
                            reponse.est_correcte
                              ? 'bg-[#032622] text-[#F8F5E4] placeholder-[#F8F5E4]/70'
                              : 'bg-[#F8F5E4] text-[#032622]'
                          } font-bold`}
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        />
                        {question.reponses.length > 2 && (
                          <button
                            onClick={() => removeReponse(qIndex, rIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {question.type_question !== 'vrai_faux' && (
                  <button
                    onClick={() => addReponse(qIndex)}
                    className="text-[#032622] hover:text-[#032622]/70 font-bold text-sm uppercase"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    + Ajouter une réponse
                  </button>
                )}
              </div>
            )}

            {/* Supports annexes pour chaque question */}
            <div className="space-y-3 mt-4 pt-4 border-t-2 border-[#032622]">
              <h4 className="font-bold text-[#032622] uppercase text-sm mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                SUPPORTS ANNEXES
              </h4>
              {question.supports_annexes && question.supports_annexes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {question.supports_annexes.map((annexe, aIndex) => (
                    <div key={aIndex} className="flex items-center justify-between p-3 bg-[#F8F5E4] border-2 border-[#032622]">
                      <span className="text-[#032622] font-bold text-sm">{annexe}</span>
                      <button
                        onClick={() => removeSupportAnnexe(qIndex, aIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="border-2 border-dashed border-[#032622] p-6 text-center cursor-pointer block hover:bg-[#032622]/10 transition-colors bg-[#F8F5E4]">
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addSupportAnnexe(qIndex, file);
                  }}
                  className="hidden"
                />
                <span className="text-[#032622] font-bold uppercase text-sm flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un support annexe
                </span>
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full bg-[#032622] text-[#F8F5E4] py-3 px-4 font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#032622]/90 transition-colors"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <Plus className="w-5 h-5" />
          AJOUTER UNE QUESTION
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 flex justify-end border-t-2 border-[#032622]">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#032622] text-[#F8F5E4] px-4 py-2 font-bold uppercase hover:bg-[#032622]/90 transition-colors disabled:opacity-50 text-sm"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          {isSaving ? 'SAUVEGARDE...' : 'SOUMETTRE MON ETUDE DE CAS'}
        </button>
      </div>

      {/* Modal pour les alertes */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        message={modal.message}
        type={modal.type}
        title={modal.title}
      />

      {/* Modal de confirmation pour étude de cas sans questions */}
      <Modal
        isOpen={noQuestionsModal.isOpen}
        onClose={() => setNoQuestionsModal({ isOpen: false })}
        message="Vous n'avez pas ajouté de questions à cette étude de cas.\n\nSouhaitez-vous continuer et enregistrer l'étude de cas sans questions, ou annuler pour ajouter des questions ?"
        type="warning"
        title="Aucune question ajoutée"
        isConfirm={true}
        onConfirm={() => {
          setNoQuestionsModal({ isOpen: false });
          proceedWithSave();
        }}
        onCancel={() => {
          setNoQuestionsModal({ isOpen: false });
        }}
      />
    </div>
  );
};

