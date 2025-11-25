'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import ImageResize from 'tiptap-extension-resize-image';
import { Video as VideoExtension } from './VideoExtension';



import { 
  Video,
  Link as LinkIcon,
  X,
  RefreshCw
} from 'lucide-react';
import { ComplementaryFiles } from './ComplementaryFiles';
import { Chapitrage } from './Chapitrage';
import { TiptapToolbar } from './TiptapToolbar';
import { FichierElement } from '../../../../types/cours';
import { useState, useEffect } from 'react';
import { Modal } from '../../../Modal';
import { 
  isContentTooLarge, 
  isFileTooLarge, 
  formatSize,
  MAX_CONTENT_SIZE 
} from '@/lib/content-validator';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSaveDraft?: () => void;
  onNextStep?: () => void;
  isSaving?: boolean;
  lastAutoSaveTime?: Date | null;
  isAutoSaving?: boolean;
  lastManualSaveTime?: Date | null;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'auto-saving' | 'auto-saved';
  fichiers?: FichierElement[];
  onAddFile?: (file: File) => void;
  onRemoveFile?: (fileId: string) => void;
  deletingFileId?: string | null;
  moduleNumber?: string;
  moduleTitle?: string;
  moduleId?: number;
  currentCoursId?: number;
  currentCoursTitle?: string;
  onCoursClick?: (coursId: number) => void;
  onQuizClick?: (coursId: number, quizId: number) => void;
  onEtudeCasClick?: (moduleId: number, etudeCasId: number) => void;
  formationId?: string;
  blocId?: string;
  nextStepButtonText?: string;
  chapitrageData?: {
    chapitres?: any[];
    quizzes?: Record<number, { quiz: any; questions: any[] }>;
    etudeCas?: { id: number; titre: string };
  };
}

export const TiptapEditor = ({ 
  content, 
  onChange, 
  placeholder = "ÉCRIS ICI...", 
  onSaveDraft, 
  onNextStep, 
  isSaving = false,
  lastAutoSaveTime,
  isAutoSaving = false,
  lastManualSaveTime,
  saveStatus = 'idle',
  fichiers = [],
  onAddFile,
  onRemoveFile,
  deletingFileId,
  moduleNumber,
  moduleTitle,
  moduleId,
  currentCoursId,
  currentCoursTitle,
  onCoursClick,
  onQuizClick,
  onEtudeCasClick,
  formationId,
  blocId,
  nextStepButtonText,
  chapitrageData
}: TiptapEditorProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [pasteWarningModal, setPasteWarningModal] = useState<{ isOpen: boolean; size: number; maxSize: number }>({ isOpen: false, size: 0, maxSize: MAX_CONTENT_SIZE });
  const [previousContent, setPreviousContent] = useState<string>(content);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: false, // Désactiver le heading du StarterKit pour utiliser notre configuration
      }),
      ImageResize.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'image-resizer',
          style: 'max-width: 100%; height: auto; display: inline-block;',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'heading-node',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
      VideoExtension,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const currentContent = editor.getHTML();
      
      // Vérifier si le contenu dépasse la limite (au cas où le collage aurait réussi malgré le blocage)
      const validation = isContentTooLarge(currentContent);
      if (validation.tooLarge) {
        // Si le contenu est trop gros, restaurer le contenu précédent immédiatement
        console.warn('Contenu trop volumineux détecté après mise à jour, restauration du contenu précédent');
        
        // Restaurer le contenu précédent immédiatement
        editor.commands.setContent(previousContent);
        
        // Afficher le modal d'avertissement
        setPasteWarningModal({
          isOpen: true,
          size: validation.size,
          maxSize: validation.maxSize
        });
        
        // Ne pas appeler onChange pour éviter de mettre à jour le state parent
        return;
      }
      
      // Sauvegarder le contenu actuel comme contenu précédent (pour restauration si nécessaire)
      setPreviousContent(currentContent);
      onChange(currentContent);
      // Ajouter les boutons de suppression après chaque mise à jour
      setTimeout(() => {
        addDeleteButtonsToImages();
      }, 50);
    },
    editorProps: {
      attributes: {
        class: 'min-h-[400px] p-6 text-[#032622] focus:outline-none',
        style: 'font-family: var(--font-termina-bold);',
      },
      handleKeyDown: (view, event) => {
        // Empêcher la suppression automatique des titres vides
        if (event.key === 'Backspace' || event.key === 'Delete') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Si on est dans un titre vide et qu'on appuie sur Backspace
          if ($from.parent.type.name === 'heading' && $from.parent.textContent === '') {
            // Ne pas permettre la suppression du titre vide
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        // Cette fonction est appelée par Tiptap, mais on utilise aussi un listener natif
        // pour être sûr d'intercepter avant tout traitement
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const pastedText = clipboardData.getData('text/plain');
        if (!pastedText) return false;

        const validation = isContentTooLarge(pastedText);
        
        if (validation.tooLarge) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          setPasteWarningModal({
            isOpen: true,
            size: validation.size,
            maxSize: validation.maxSize
          });
          
          return true;
        }

        return false;
      },
    },
    immediatelyRender: false,
  });

  // Intercepter le paste au niveau DOM natif AVANT que Tiptap ne le gère
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    
    const handlePasteNative = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;

      // Récupérer le texte ET le HTML depuis le presse-papier
      const pastedText = clipboardData.getData('text/plain');
      const pastedHtml = clipboardData.getData('text/html');
      
      // Utiliser le HTML si disponible (plus précis), sinon le texte
      const contentToCheck = pastedHtml || pastedText;
      
      if (!contentToCheck || contentToCheck.trim() === '') return;

      // Vérifier la taille AVANT que Tiptap ne traite le collage
      const validation = isContentTooLarge(contentToCheck);
      
      if (validation.tooLarge) {
        // Bloquer COMPLÈTEMENT le collage
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Empêcher le comportement par défaut du navigateur
        if (event.cancelable) {
          event.preventDefault();
        }
        
        // Afficher le modal immédiatement
        setPasteWarningModal({
          isOpen: true,
          size: validation.size,
          maxSize: validation.maxSize
        });
        
        // Retourner false pour empêcher la propagation
        return false;
      }
    };

    // Ajouter le listener avec capture=true pour intercepter AVANT les autres handlers
    // Utiliser { capture: true, passive: false } pour pouvoir preventDefault
    editorElement.addEventListener('paste', handlePasteNative, { capture: true, passive: false });

    return () => {
      editorElement.removeEventListener('paste', handlePasteNative, { capture: true } as any);
    };
  }, [editor]);

  // Mettre à jour previousContent quand le content prop change
  useEffect(() => {
    setPreviousContent(content);
  }, [content]);


  // Fonctions pour gérer l'upload de fichiers
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
        // Valider la taille du fichier
        const validation = isFileTooLarge(file, 'image');
        if (validation.tooLarge) {
          setErrorModal({ 
            isOpen: true, 
            message: `L'image est trop volumineuse (${validation.formattedSize}). La taille maximale autorisée est de ${validation.formattedMaxSize}. Veuillez choisir une image plus petite.` 
          });
          // Réinitialiser l'input
          event.target.value = '';
          return;
        }
        
        setSelectedImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorModal({ isOpen: true, message: 'Format de fichier non supporté. Veuillez choisir une image (JPEG, PNG, GIF, WebP).' });
      }
    }
  };

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
      if (allowedTypes.includes(file.type)) {
        // Valider la taille du fichier
        const validation = isFileTooLarge(file, 'video');
        if (validation.tooLarge) {
          setErrorModal({ 
            isOpen: true, 
            message: `La vidéo est trop volumineuse (${validation.formattedSize}). La taille maximale autorisée est de ${validation.formattedMaxSize}. Veuillez choisir une vidéo plus petite ou la compresser.` 
          });
          // Réinitialiser l'input
          event.target.value = '';
          return;
        }
        
        setSelectedVideoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setVideoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorModal({ isOpen: true, message: 'Format de fichier non supporté. Veuillez choisir une vidéo (MP4, WebM, OGG, AVI, MOV).' });
      }
    }
  };

  const insertImage = () => {
    if (selectedImageFile && editor) {
      // Utiliser le fichier sélectionné
      editor.chain().focus().setImage({ src: imagePreview }).run();
    } else if (imageUrl && editor) {
      // Utiliser l'URL
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    
    // Ajouter le bouton de suppression après insertion
    setTimeout(() => {
      addDeleteButtonsToImages();
    }, 100);
    
    // Reset des états
    setImageUrl('');
    setSelectedImageFile(null);
    setImagePreview('');
    setIsImageModalOpen(false);
  };

  // Fonction pour ajouter des boutons de suppression aux images
  const addDeleteButtonsToImages = () => {
    if (!editor) return;
    
    const images = editor.view.dom.querySelectorAll('.image-resizer img');
    images.forEach((img) => {
      const container = img.parentElement;
      if (container && !container.querySelector('.delete-button')) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '×';
        deleteButton.title = 'Supprimer l\'image';
        
        container.appendChild(deleteButton);
        
        deleteButton.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Récupérer l'URL de l'image avant de la supprimer
          const imageSrc = (img as HTMLImageElement).src;
          
          // Afficher un indicateur de suppression
          deleteButton.innerHTML = '<span class="animate-spin">⏳</span>';
          deleteButton.disabled = true;
          
          // Supprimer le fichier du storage si c'est une URL Supabase
          if (imageSrc && (imageSrc.includes('supabase') || imageSrc.includes('storage'))) {
            try {
              const { deleteFileFromStorage } = await import('@/lib/storage-utils');
              const success = await deleteFileFromStorage(imageSrc, 'cours-media');
              if (success) {
                // Message de confirmation visuel
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
                notification.textContent = 'Image supprimée avec succès';
                document.body.appendChild(notification);
                setTimeout(() => {
                  notification.remove();
                }, 3000);
              }
            } catch (error) {
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50';
              notification.textContent = 'Erreur lors de la suppression de l\'image';
              document.body.appendChild(notification);
              setTimeout(() => {
                notification.remove();
              }, 3000);
            }
          }
          
          // Trouver la position de l'image dans l'éditeur
          const pos = editor.view.posAtDOM(img, 0);
          if (pos !== undefined) {
            editor.commands.deleteRange({ from: pos, to: pos + 1 });
          }
        });
      }
    });
  };

  const insertVideo = async () => {
    if (!editor) return;

    try {
      let finalVideoUrl = '';

      // Si un fichier est sélectionné, l'uploader sur Supabase Storage
      if (selectedVideoFile && currentCoursId) {
        setIsUploadingVideo(true);
        const formData = new FormData();
        formData.append('file', selectedVideoFile);
        formData.append('coursId', currentCoursId.toString());
        formData.append('typeMedia', 'video');

        const uploadResponse = await fetch('/api/cours/upload-media', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          finalVideoUrl = uploadData.media?.url || uploadData.media?.publicUrl || '';
          
          if (!finalVideoUrl) {
            setErrorModal({ isOpen: true, message: 'Erreur lors de l\'upload de la vidéo. Aucune URL n\'a été retournée.' });
            setIsUploadingVideo(false);
            return;
          }
        } else {
          // Gérer les erreurs 413 (Payload Too Large)
          if (uploadResponse.status === 413) {
            let errorData;
            try {
              errorData = await uploadResponse.json();
            } catch {
              errorData = { error: 'Fichier trop volumineux' };
            }
            
            const fileSize = selectedVideoFile ? formatSize(selectedVideoFile.size) : 'inconnue';
            const maxSize = errorData.maxSize ? formatSize(errorData.maxSize) : '4 MB';
            
            setErrorModal({ 
              isOpen: true, 
              message: `La vidéo est trop volumineuse (${fileSize}).\n\n⚠️ LIMITE VERCEL :\n\n• La taille maximale autorisée pour un upload via l'API est de ${maxSize}\n• Votre vidéo dépasse cette limite\n\n✅ SOLUTIONS :\n\n1. Utiliser une URL externe (YouTube, Vimeo, etc.) dans le champ "URL de la vidéo"\n2. Compresser la vidéo pour réduire sa taille\n3. Diviser la vidéo en plusieurs parties plus petites\n\nPour les vidéos plus grandes, nous recommandons d'utiliser une plateforme d'hébergement vidéo externe.` 
            });
            setIsUploadingVideo(false);
            return;
          }
          
          // Autres erreurs
          let errorData;
          try {
            errorData = await uploadResponse.json();
          } catch {
            errorData = { error: 'Erreur inconnue lors de l\'upload de la vidéo' };
          }
          const errorMessage = errorData.error || 'Erreur inconnue lors de l\'upload de la vidéo';
          
          setErrorModal({ isOpen: true, message: errorMessage });
          setIsUploadingVideo(false);
          return;
        }
        setIsUploadingVideo(false);
      } else if (videoUrl) {
        // Valider l'URL avant de l'utiliser
        const trimmedUrl = videoUrl.trim();
        
        // Vérifier que l'URL est valide (commence par http:// ou https://)
        if (!trimmedUrl) {
          setErrorModal({ isOpen: true, message: 'Veuillez saisir une URL valide pour la vidéo.' });
          return;
        }
        
        try {
          const url = new URL(trimmedUrl);
          // Vérifier que c'est bien une URL http ou https
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            setErrorModal({ isOpen: true, message: 'L\'URL doit commencer par http:// ou https://' });
            return;
          }
          
          // Détecter si c'est une URL YouTube ou Vimeo et convertir en URL embed
          let embedUrl = trimmedUrl;
          let isEmbed = false;
          
          // YouTube : https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID
          if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            isEmbed = true;
            let videoId = '';
            
            if (url.hostname.includes('youtu.be')) {
              // Format: https://youtu.be/VIDEO_ID
              videoId = url.pathname.slice(1);
            } else if (url.pathname === '/watch' && url.searchParams.has('v')) {
              // Format: https://www.youtube.com/watch?v=VIDEO_ID
              videoId = url.searchParams.get('v') || '';
            } else if (url.pathname.startsWith('/embed/')) {
              // Déjà en format embed
              embedUrl = trimmedUrl;
            } else {
              // Essayer d'extraire l'ID depuis le pathname
              const match = url.pathname.match(/\/([a-zA-Z0-9_-]{11})/);
              if (match) {
                videoId = match[1];
              }
            }
            
            if (videoId) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else {
              setErrorModal({ isOpen: true, message: 'URL YouTube invalide. Veuillez utiliser une URL complète comme : https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID' });
              return;
            }
          }
          // Vimeo : https://vimeo.com/VIDEO_ID
          else if (url.hostname.includes('vimeo.com')) {
            isEmbed = true;
            const videoId = url.pathname.split('/').filter(Boolean).pop();
            if (videoId) {
              embedUrl = `https://player.vimeo.com/video/${videoId}`;
            } else {
              setErrorModal({ isOpen: true, message: 'URL Vimeo invalide. Veuillez utiliser une URL complète comme : https://vimeo.com/VIDEO_ID' });
              return;
            }
          }
          
          finalVideoUrl = embedUrl;
          
          // Insérer la vidéo dans l'éditeur
          editor.chain().focus().insertContent({
            type: 'video',
            attrs: {
              src: finalVideoUrl,
              controls: true,
              style: 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 10px auto; object-fit: contain;',
              type: selectedVideoFile?.type || 'video/mp4',
              isEmbed: isEmbed,
            },
          }).run();
          
          // Reset des états
          setVideoUrl('');
          setSelectedVideoFile(null);
          setVideoPreview('');
          setIsVideoModalOpen(false);
          setIsUploadingVideo(false);
          return; // Sortir ici car on a déjà inséré la vidéo
        } catch (error) {
          // Si l'URL n'est pas valide, afficher une erreur
          setErrorModal({ 
            isOpen: true, 
            message: 'URL invalide. Veuillez saisir une URL complète commençant par http:// ou https://\n\nExemples valides :\n• https://exemple.com/video.mp4\n• https://www.youtube.com/watch?v=...\n• https://vimeo.com/...' 
          });
          return;
        }
      } else if (selectedVideoFile && !currentCoursId) {
        // Si pas de coursId, utiliser le DataURL temporaire (pour prévisualisation)
        finalVideoUrl = videoPreview;
      } else {
        setErrorModal({ isOpen: true, message: 'Veuillez sélectionner une vidéo ou fournir une URL' });
        return;
      }

      // Insérer la vidéo dans l'éditeur en utilisant l'extension Video
      // Utiliser insertContent avec le format de nœud Tiptap
      editor.chain().focus().insertContent({
        type: 'video',
        attrs: {
          src: finalVideoUrl,
          controls: true,
          style: 'width: 819px; height: 436px; max-width: 819px; max-height: 436px; border: 2px solid #032622; border-radius: 4px; display: block; margin: 10px auto; object-fit: contain;',
          type: selectedVideoFile?.type || 'video/mp4',
          isEmbed: false,
        },
      }).run();

    // Reset des états
    setVideoUrl('');
    setSelectedVideoFile(null);
    setVideoPreview('');
    setIsVideoModalOpen(false);
      setIsUploadingVideo(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'insertion de la vidéo';
      setErrorModal({ isOpen: true, message: errorMessage });
      setIsUploadingVideo(false);
    }
  };

  const insertLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).insertContent(linkText || linkUrl).run();
    }
    setLinkUrl('');
    setLinkText('');
    setIsLinkModalOpen(false);
  };

  if (!editor) {
    return null;
  }

  const openImageModal = () => {
    setIsImageModalOpen(true);
    setImageUrl('');
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    setVideoUrl('');
    setSelectedVideoFile(null);
    setVideoPreview('');
  };

  const openLinkModal = () => {
    setIsLinkModalOpen(true);
    setLinkUrl('');
    setLinkText('');
  };

  return (
    <div className="bg-[#F8F5E4] border border-[#032622] relative">
      {/* Indicateur de sauvegarde */}
      {/* Priorité 1: Sauvegarde en cours (manuelle ou automatique) */}
      {saveStatus === 'saving' && (
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#032622] animate-spin" />
          <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
            Enregistrement en cours...
          </span>
        </div>
      )}
      {saveStatus === 'auto-saving' && (
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#032622] animate-spin" />
          <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
            Enregistrement automatique en cours...
          </span>
        </div>
      )}
      {/* Priorité 2: Message de sauvegarde manuelle (persistant jusqu'à la prochaine sauvegarde) */}
      {saveStatus === 'saved' && lastManualSaveTime && (
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
            Enregistré - {lastManualSaveTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      {/* Priorité 3: Message de sauvegarde automatique (si pas de sauvegarde manuelle récente) */}
      {saveStatus === 'auto-saved' && lastAutoSaveTime && (
        <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-[#032622]/70" style={{ fontFamily: 'var(--font-termina-medium)' }}>
            Dernière sauvegarde automatique : {lastAutoSaveTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      )}
      
      {/* Toolbar - Sticky */}
      <TiptapToolbar
        editor={editor}
        onSaveDraft={onSaveDraft}
        onNextStep={onNextStep}
        isSaving={isSaving}
        isAutoSaving={isAutoSaving}
        onOpenImageModal={openImageModal}
        onOpenVideoModal={openVideoModal}
        onOpenLinkModal={openLinkModal}
        nextStepButtonText={nextStepButtonText}
      />

      {/* Module Info Display */}
       {(moduleNumber || moduleTitle) && (
         <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2">
           <div className="text-sm text-[#032622]/70">
             {moduleNumber && <span className="font-semibold">Module {moduleNumber}</span>}
             {moduleNumber && moduleTitle && <span className="mx-2">-</span>}
             {moduleTitle && <span>{moduleTitle}</span>}
             {currentCoursTitle && (
               <>
                 <span className="mx-2">|</span>
                 <span className="font-semibold">{currentCoursTitle}</span>
               </>
             )}
           </div>
         </div>
       )}

       {/* Editor et Supports complémentaires en flex */}
      <div className="flex flex-col overflow-y-auto">
        {/* Editor */}
        <div className="flex-1 min-h-[400px]">
          <EditorContent editor={editor} />
        </div>

        {/* Supports complémentaires */}
        {onAddFile && onRemoveFile && (
          <div className="p-4 flex gap-4 justify-start">
            <ComplementaryFiles
              fichiers={fichiers}
              onAddFile={onAddFile}
              onRemoveFile={onRemoveFile}
              deletingFileId={deletingFileId}
            />
          </div>
        )}

        {/* Chapitrage - Position absolute en bas à droite */}
        {moduleId && (
          <Chapitrage
            coursId={moduleId}
            currentChapitreId={currentCoursId}
            onChapitreClick={onCoursClick}
            onQuizClick={onQuizClick}
            onEtudeCasClick={onEtudeCasClick}
            formationId={formationId}
            blocId={blocId}
            preloadedData={chapitrageData}
          />
        )}
      </div>

      {/* Modal pour insérer une image */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsImageModalOpen(false)}
          />
          <div className="relative bg-[#F8F5E4] border-2 border-[#032622] rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                  <span className="text-lg font-bold text-blue-600">🖼</span>
                </div>
                <h3 
                  className="text-lg font-bold text-blue-800"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  Insérer une image
                </h3>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-[#032622] hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Upload de fichier */}
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  Choisir un fichier image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageFileSelect}
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Formats acceptés : JPEG, PNG, GIF, WebP
                </p>
              </div>

              {/* Prévisualisation */}
              {imagePreview && (
                <div>
                  <label className="block text-[#032622] text-sm font-semibold mb-2">
                    Aperçu
                  </label>
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="max-w-full h-32 object-contain border border-[#032622] rounded"
                  />
                </div>
              )}

              {/* Séparateur */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OU</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-[#032622]">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded mr-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ANNULER
              </button>
              <button
                onClick={insertImage}
                className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                INSÉRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour insérer une vidéo */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsVideoModalOpen(false)}
          />
          <div className="relative bg-[#F8F5E4] border-2 border-[#032622] rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                  <span className="text-lg font-bold text-purple-600">🎥</span>
                </div>
                <h3 
                  className="text-lg font-bold text-purple-800"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  Insérer une vidéo
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-[#032622] hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Upload de fichier */}
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  Choisir un fichier vidéo
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/avi,video/mov"
                  onChange={handleVideoFileSelect}
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Formats acceptés : MP4, WebM, OGG, AVI, MOV
                </p>
                <p className="text-xs text-amber-600 mt-1 font-semibold">
                  ⚠️ Taille maximale : 4 MB (limite Vercel). Pour les vidéos plus grandes, utilisez une URL externe ci-dessous.
                </p>
              </div>

              {/* Prévisualisation */}
              {videoPreview && (
                <div>
                  <label className="block text-[#032622] text-sm font-semibold mb-2">
                    Aperçu
                  </label>
                  <video
                    src={videoPreview}
                    controls
                    className="max-w-full h-32 border border-[#032622] rounded"
                  />
                </div>
              )}

              {/* Séparateur */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">OU</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  URL de la vidéo
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://exemple.com/video.mp4 ou https://youtube.com/watch?v=..."
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Vous pouvez utiliser une URL directe vers un fichier vidéo (.mp4, .webm, etc.) ou une URL YouTube/Vimeo
                </p>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-[#032622]">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                disabled={isUploadingVideo}
                className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ANNULER
              </button>
              <button
                onClick={insertVideo}
                disabled={isUploadingVideo || (!selectedVideoFile && !videoUrl)}
                className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                {isUploadingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    UPLOAD EN COURS...
                  </>
                ) : (
                  'INSÉRER'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour insérer un lien */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsLinkModalOpen(false)}
          />
          <div className="relative bg-[#F8F5E4] border-2 border-[#032622] rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                  <span className="text-lg font-bold text-green-600">🔗</span>
                </div>
                <h3 
                  className="text-lg font-bold text-green-800"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  Insérer un lien
                </h3>
              </div>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-[#032622] hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  URL du lien
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemple.com"
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
              </div>
              <div>
                <label className="block text-[#032622] text-sm font-semibold mb-2">
                  Texte du lien (optionnel)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Texte à afficher"
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-[#032622]">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded mr-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ANNULER
              </button>
              <button
                onClick={insertLink}
                className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                INSÉRER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Erreur"
        message={errorModal.message}
        type="error"
      />

      {/* Modal d'avertissement pour le collage */}
      <Modal
        isOpen={pasteWarningModal.isOpen}
        onClose={() => setPasteWarningModal({ isOpen: false, size: 0, maxSize: MAX_CONTENT_SIZE })}
        title="Collage impossible - Contenu trop volumineux"
        message={`Le texte que vous essayez de coller est trop volumineux (${formatSize(pasteWarningModal.size)}).\n\n⚠️ IMPORTANT :\n\n• La taille maximale autorisée pour un collage est de ${formatSize(pasteWarningModal.maxSize)}\n• Le copier-coller d'un seul coup ne fonctionne pas pour de gros volumes de texte\n\n✅ SOLUTION :\n\nVous pouvez coller le texte par petites portions (paragraphe par paragraphe ou section par section). Chaque petite portion sera acceptée sans problème.\n\nLe problème vient uniquement du collage d'une trop grande quantité de texte en une seule fois.`}
        type="warning"
      />
    </div>
  );
};
