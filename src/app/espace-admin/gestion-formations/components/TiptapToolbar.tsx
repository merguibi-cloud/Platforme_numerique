'use client';

import { Editor } from '@tiptap/react';
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
  Image as ImageIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface TiptapToolbarProps {
  editor: Editor | null;
  onSaveDraft?: () => void;
  onNextStep?: () => void;
  isSaving?: boolean;
  onOpenImageModal?: () => void;
  onOpenVideoModal?: () => void;
  onOpenLinkModal?: () => void;
  nextStepButtonText?: string;
}

export const TiptapToolbar = ({
  editor,
  onSaveDraft,
  onNextStep,
  isSaving = false,
  onOpenImageModal,
  onOpenVideoModal,
  onOpenLinkModal,
  nextStepButtonText = 'ÉTAPE SUIVANTE'
}: TiptapToolbarProps) => {
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsTextMenuOpen(false);
        setIsMediaMenuOpen(false);
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

  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-[#F8F5E4] border-b border-[#032622] shadow-sm">
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
                    onOpenImageModal?.();
                    setIsMediaMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
                >
                  IMPORTER UNE PHOTO
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVideoModal?.();
                    setIsMediaMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
                >
                  IMPORTER UNE VIDÉO
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLinkModal?.();
                    setIsMediaMenuOpen(false);
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
              {isSaving ? 'Envoi...' : nextStepButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

