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
  nextStepButtonText?: string;
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
  nextStepButtonText
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
      onChange(editor.getHTML());
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
    },
    immediatelyRender: false,
  });


  // Fonctions pour gérer l'upload de fichiers
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.type)) {
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
              console.error('Erreur lors de la suppression de l\'image:', error);
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
          const errorData = await uploadResponse.json();
          const errorMessage = errorData.error || 'Erreur inconnue lors de l\'upload de la vidéo';
          
          setErrorModal({ isOpen: true, message: errorMessage });
          setIsUploadingVideo(false);
          return;
        }
        setIsUploadingVideo(false);
      } else if (videoUrl) {
        // Utiliser l'URL fournie directement
        finalVideoUrl = videoUrl;
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
        },
      }).run();

    // Reset des états
    setVideoUrl('');
    setSelectedVideoFile(null);
    setVideoPreview('');
    setIsVideoModalOpen(false);
      setIsUploadingVideo(false);
    } catch (error) {
      console.error('Erreur lors de l\'insertion de la vidéo:', error);
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
      {/* Indicateur de sauvegarde automatique */}
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
      
      {/* Toolbar - Sticky */}
      <TiptapToolbar
        editor={editor}
        onSaveDraft={onSaveDraft}
        onNextStep={onNextStep}
        isSaving={isSaving}
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
            moduleId={moduleId}
            currentCoursId={currentCoursId}
            onCoursClick={onCoursClick}
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
                  placeholder="https://exemple.com/video.mp4"
                  className="w-full p-3 border border-[#032622] rounded bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                />
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
    </div>
  );
};
