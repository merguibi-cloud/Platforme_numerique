'use client';

import { useState, useRef } from 'react';
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
  Image,
  Video,
  Link
} from 'lucide-react';
import { ComplementaryFiles } from './ComplementaryFiles';
import { FichierElement } from '../../../../types/cours';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onSaveDraft?: () => void;
  onNextStep?: () => void;
  isSaving?: boolean;
  fichiers?: FichierElement[];
  onAddFile?: (file: File) => void;
  onRemoveFile?: (fileId: string) => void;
}

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "ÉCRIS ICI...", 
  onSaveDraft, 
  onNextStep, 
  isSaving = false,
  fichiers = [],
  onAddFile,
  onRemoveFile
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('URL de l\'image:');
    if (url) {
      execCommand('insertImage', url);
    }
    setIsMediaMenuOpen(false);
  };

  const insertVideo = () => {
    const url = prompt('URL de la vidéo:');
    if (url) {
      const videoHtml = `<video controls style="max-width: 100%; height: auto;"><source src="${url}" type="video/mp4"></video>`;
      execCommand('insertHTML', videoHtml);
    }
    setIsMediaMenuOpen(false);
  };

  const insertLink = () => {
    const url = prompt('URL du lien:');
    const text = prompt('Texte du lien:') || url;
    if (url) {
      execCommand('createLink', url);
    }
    setIsMediaMenuOpen(false);
  };

  return (
    <div className="bg-white border border-[#032622]  overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#032622] text-[#F8F5E4] p-3 flex items-center gap-2">
        {/* Save & Undo */}
        <button
          onClick={() => execCommand('save')}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
          title="Sauvegarder"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={() => execCommand('undo')}
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
          onClick={() => execCommand('bold')}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors font-bold"
          title="Gras"
        >
          B
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors italic"
          title="Italique"
        >
          I
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors underline"
          title="Souligné"
        >
          U
        </button>

        {/* Alignment Dropdown */}
        <button className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors">
          <AlignLeft className="w-4 h-4" />
        </button>

        {/* List Button */}
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </button>

        {/* Media Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
            className="w-8 h-8 bg-[#032622] text-[#F8F5E4] flex items-center justify-center hover:bg-[#032622]/80 transition-colors"
            title="Insérer un média"
          >
            <Image className="w-4 h-4" />
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
              {isSaving ? 'Sauvegarde...' : 'ENREGISTRER'}
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

      {/* Editor et Supports complémentaires en flex */}
      <div className="flex flex-col">
        {/* Editor */}
        <div className="flex-1">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[400px] p-6 text-[#032622] focus:outline-none"
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={handleInput}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
            data-placeholder={placeholder}
          />
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
