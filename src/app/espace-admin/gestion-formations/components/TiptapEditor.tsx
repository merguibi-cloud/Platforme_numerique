'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
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
  Link as LinkIcon
} from 'lucide-react';
import { ComplementaryFiles } from './ComplementaryFiles';
import { FichierElement } from '../../../../types/cours';
import { useState } from 'react';
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
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
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
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[400px] p-6 text-[#032622] focus:outline-none',
        style: 'font-family: var(--font-termina-bold);',
        'data-placeholder': placeholder,
      },
    },
    immediatelyRender: false,
  });

  const insertImage = () => {
    const url = prompt('URL de l\'image:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setIsMediaMenuOpen(false);
  };

  const insertVideo = () => {
    const url = prompt('URL de la vidéo:');
    if (url && editor) {
      const videoHtml = `<video controls style="max-width: 100%; height: auto;"><source src="${url}" type="video/mp4"></video>`;
      editor.chain().focus().insertContent(videoHtml).run();
    }
    setIsMediaMenuOpen(false);
  };

  const insertLink = () => {
    const url = prompt('URL du lien:');
    const text = prompt('Texte du lien:') || url;
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).insertContent(text).run();
    }
    setIsMediaMenuOpen(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-white border border-[#032622] overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#032622] text-[#F8F5E4] p-3 flex items-center gap-2">
        {/* Save & Undo */}
        <button
          onClick={() => editor.chain().focus().run()}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
          title="Sauvegarder"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
          title="Annuler"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Text Format Dropdown */}
        <button className="px-3 py-1 bg-[#032622] text-[#F8F5E4] text-sm hover:bg-[#032622]/80 transition-colors">
          TEXTE▾
        </button>

        {/* Formatting Buttons */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors font-bold ${
            editor.isActive('bold') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Gras"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors italic ${
            editor.isActive('italic') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Italique"
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors underline ${
            editor.isActive('underline') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Souligné"
        >
          U
        </button>

        {/* Alignment Buttons */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Aligner à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Centrer"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Aligner à droite"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        {/* List Buttons */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
            editor.isActive('bulletList') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors ${
            editor.isActive('orderedList') ? 'bg-[#F8F5E4]/30 text-[#032622]' : ''
          }`}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Media Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
            className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
            title="Insérer un média"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          
          {isMediaMenuOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-100 border border-[#032622] shadow-lg z-10 min-w-[200px]">
              <button
                onClick={insertImage}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                IMPORTER UNE PHOTO
              </button>
              <button
                onClick={insertVideo}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                IMPORTER UNE VIDÉO
              </button>
              <button
                onClick={insertLink}
                className="w-full px-4 py-2 text-left text-[#032622] hover:bg-gray-200 transition-colors"
              >
                INSÉRER UN LIEN
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {onSaveDraft && onNextStep && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-600 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {isSaving ? 'Sauvegarde...' : 'METTRE EN BROUILLON'}
            </button>
            <button
              onClick={onNextStep}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-600 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {isSaving ? 'Envoi...' : 'ÉTAPE SUIVANTE'}
            </button>
          </div>
        )}
       </div>

       {/* Module Info Display */}
       {(moduleNumber || moduleTitle) && (
         <div className="bg-gray-50 border-b border-[#032622]/20 px-4 py-2">
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
    </div>
  );
};
