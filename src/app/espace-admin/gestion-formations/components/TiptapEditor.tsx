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



import { 
  Save, 
  Undo, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { ComplementaryFiles } from './ComplementaryFiles';
import { FichierElement } from '../../../../types/cours';
import { useState, useEffect } from 'react';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSaveDraft?: () => void;
  onNextStep?: () => void;
  isSaving?: boolean;
  fichiers?: FichierElement[];
  onAddFile?: (file: File) => void;
  onRemoveFile?: (fileId: string) => void;
  moduleNumber?: string;
  moduleTitle?: string;
}

export const TiptapEditor = ({ 
  content, 
  onChange, 
  placeholder = "ÉCRIS ICI...", 
  onSaveDraft, 
  onNextStep, 
  isSaving = false,
  fichiers = [],
  onAddFile,
  onRemoveFile,
  moduleNumber,
  moduleTitle
}: TiptapEditorProps) => {
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
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

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Ne pas fermer si on clique sur les boutons des menus
      if (!target.closest('.dropdown-container')) {
        setIsMediaMenuOpen(false);
        setIsTextMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fonction pour déterminer le texte du header selon le format actuel
  const getCurrentFormatText = () => {
    if (!editor) return 'TEXTE▾';
    
    if (editor.isActive('heading', { level: 1 })) return 'TITRE 1▾';
    if (editor.isActive('heading', { level: 2 })) return 'TITRE 2▾';
    if (editor.isActive('heading', { level: 3 })) return 'TITRE 3▾';
    if (editor.isActive('paragraph')) return 'PARAGRAPHE▾';
    
    return 'TEXTE▾';
  };

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

  const openImageModal = () => {
    setIsImageModalOpen(true);
    setIsMediaMenuOpen(false);
    // Reset des états
    setImageUrl('');
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    setIsMediaMenuOpen(false);
    // Reset des états
    setVideoUrl('');
    setSelectedVideoFile(null);
    setVideoPreview('');
  };

  const openLinkModal = () => {
    setIsLinkModalOpen(true);
    setIsMediaMenuOpen(false);
    // Reset des états
    setLinkUrl('');
    setLinkText('');
  };

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
        alert('Format de fichier non supporté. Veuillez choisir une image (JPEG, PNG, GIF, WebP).');
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
        alert('Format de fichier non supporté. Veuillez choisir une vidéo (MP4, WebM, OGG, AVI, MOV).');
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
        
        deleteButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Trouver la position de l'image dans l'éditeur
          const pos = editor.view.posAtDOM(img, 0);
          if (pos !== undefined) {
            editor.commands.deleteRange({ from: pos, to: pos + 1 });
          }
        });
      }
    });
  };

  const insertVideo = () => {
    if (selectedVideoFile && editor) {
      // Utiliser le fichier sélectionné avec HTML standard
      const videoHtml = `<video controls style="max-width: 100%; height: auto; border: 2px solid #032622; border-radius: 4px;"><source src="${videoPreview}" type="${selectedVideoFile.type}"></video>`;
      editor.chain().focus().insertContent(videoHtml).run();
    } else if (videoUrl && editor) {
      // Utiliser l'URL avec HTML standard
      const videoHtml = `<video controls style="max-width: 100%; height: auto; border: 2px solid #032622; border-radius: 4px;"><source src="${videoUrl}" type="video/mp4"></video>`;
      editor.chain().focus().insertContent(videoHtml).run();
    }
    // Reset des états
    setVideoUrl('');
    setSelectedVideoFile(null);
    setVideoPreview('');
    setIsVideoModalOpen(false);
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

  return (
    <div className="bg-[#F8F5E4] border border-[#032622] overflow-hidden">
      {/* Toolbar and Navigation */}
      <div className="flex items-stretch w-full">
        {/* Toolbar */}
        <div className="bg-[#032622] text-[#F8F5E4] p-3 flex items-center gap-4 flex-[2]">
        {/* Groupe 1: Save & Undo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor.chain().focus().run()}
            className="w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
            title="Sauvegarder"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
            title="Annuler"
          >
            <Undo className="w-5 h-5" />
          </button>
        </div>
        
        {/* Séparateur blanc */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Groupe 2: Text Format */}
        <div className="relative dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTextMenuOpen(!isTextMenuOpen);
            }}
            className="px-4 py-2 bg-[#032622] text-[#F8F5E4] text-sm hover:bg-[#032622]/80 transition-colors"
          >
            {getCurrentFormatText()}
          </button>
          
          {isTextMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-100 border border-[#032622] shadow-lg z-10 min-w-[200px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editor?.chain().focus().setParagraph().run();
                  setIsTextMenuOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors ${
                  editor?.isActive('paragraph') ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                Paragraphe
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editor?.chain().focus().toggleHeading({ level: 1 }).run();
                  setIsTextMenuOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors ${
                  editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                Titre 1
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editor?.chain().focus().toggleHeading({ level: 2 }).run();
                  setIsTextMenuOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors ${
                  editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                Titre 2
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editor?.chain().focus().toggleHeading({ level: 3 }).run();
                  setIsTextMenuOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors ${
                  editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                Titre 3
              </button>
            </div>
          )}
        </div>
        
        {/* Séparateur blanc */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Groupe 3: Formatting Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors font-bold ${
              editor.isActive('bold') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Gras"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors italic ${
              editor.isActive('italic') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Italique"
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors underline ${
              editor.isActive('underline') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Souligné"
          >
            U
          </button>
        </div>

        
        {/* Séparateur blanc */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Groupe 4: Alignment Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Aligner à gauche"
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Centrer"
          >
            <AlignCenter className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Aligner à droite"
          >
            <AlignRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Séparateur blanc */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Groupe 5: List Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
              editor.isActive('bulletList') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Liste à puces"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
              editor.isActive('orderedList') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
            }`}
            title="Liste numérotée"
          >
            <ListOrdered className="w-5 h-5" />
          </button>
        </div>

        
        {/* Séparateur blanc */}
        <div className="w-px h-8 bg-white/30"></div>

        {/* Groupe 6: Media Dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMediaMenuOpen(!isMediaMenuOpen);
            }}
            className="w-10 h-10 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
            title="Insérer un média"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {isMediaMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-100 border border-[#032622] shadow-lg z-10 min-w-[200px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal();
                }}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                IMPORTER UNE PHOTO
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openVideoModal();
                }}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                IMPORTER UNE VIDÉO
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openLinkModal();
                }}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                INSÉRER UN LIEN
              </button>
            </div>
          )}
        </div>
        </div>

        {/* Navigation Buttons */}
        {onSaveDraft && onNextStep && (
          <div className="flex flex-[1] gap-1">
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex-1 bg-gray-500 text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {isSaving ? 'Sauvegarde...' : 'METTRE EN BROUILLON'}
            </button>
            <button
              onClick={onNextStep}
              disabled={isSaving}
              className="flex-1 bg-gray-500 text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {isSaving ? 'Envoi...' : 'ÉTAPE SUIVANTE'}
            </button>
          </div>
        )}
      </div>

      {/* Module Info Display */}
       {(moduleNumber || moduleTitle) && (
         <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-4 py-2">
           <div className="text-sm text-[#032622]/70">
             {moduleNumber && <span className="font-semibold">Module {moduleNumber}</span>}
             {moduleNumber && moduleTitle && <span className="mx-2">-</span>}
             {moduleTitle && <span>{moduleTitle}</span>}
           </div>
         </div>
       )}

       {/* Editor et Supports complémentaires en flex */}
      <div className="flex flex-col">
        {/* Editor */}
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>

        {/* Supports complémentaires - En bas à gauche */}
        {onAddFile && onRemoveFile && (
          <div className="p-4 flex justify-start">
            <ComplementaryFiles
              fichiers={fichiers}
              onAddFile={onAddFile}
              onRemoveFile={onRemoveFile}
            />
          </div>
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
                className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded mr-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                ANNULER
              </button>
              <button
                onClick={insertVideo}
                className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                INSÉRER
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
    </div>
  );
};
