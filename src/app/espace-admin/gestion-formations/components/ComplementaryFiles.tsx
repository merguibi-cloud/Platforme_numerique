'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, RefreshCw } from 'lucide-react';
import { FichierElement } from '../../../../types/cours';
import { isFileTooLarge } from '@/lib/content-validator';
import { Modal } from '../../../Modal';

interface ComplementaryFilesProps {
  fichiers: FichierElement[];
  onAddFile: (file: File) => void;
  onRemoveFile: (fileId: string) => void;
  deletingFileId?: string | null;
}

export const ComplementaryFiles = ({ fichiers, onAddFile, onRemoveFile, deletingFileId }: ComplementaryFilesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileErrorModal, setFileErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        // Valider la taille du fichier
        const validation = isFileTooLarge(file, 'file');
        if (validation.tooLarge) {
          setFileErrorModal({
            isOpen: true,
            message: `Le fichier "${file.name}" est trop volumineux (${validation.formattedSize}). La taille maximale autorisée est de ${validation.formattedMaxSize}. Veuillez choisir un fichier plus petit.`
          });
          // Réinitialiser l'input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        onAddFile(file);
      });
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        // Valider la taille du fichier
        const validation = isFileTooLarge(file, 'file');
        if (validation.tooLarge) {
          setFileErrorModal({
            isOpen: true,
            message: `Le fichier "${file.name}" est trop volumineux (${validation.formattedSize}). La taille maximale autorisée est de ${validation.formattedMaxSize}. Veuillez choisir un fichier plus petit.`
          });
          return;
        }
        onAddFile(file);
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col">
      <div className="p-4 border-b border-[#032622]/20">
        <h3 
          className="text-lg font-bold text-[#032622] uppercase"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          SUPPORTS COMPLÉMENTAIRES
        </h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {/* Fichiers existants */}
        {fichiers.length > 0 && (
          <div className="space-y-2 mb-4">
            {fichiers.map((fichier) => (
              <div 
                key={fichier.id} 
                  className="flex items-center justify-between bg-[#032622]/5 p-2 border border-[#032622]/20"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#032622]" />
                  <div>
                    <p className="font-semibold text-[#032622] text-sm">{fichier.nom}</p>
                    <p className="text-xs text-[#032622]/70">{formatFileSize(fichier.taille)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(fichier.id)}
                  className="p-1 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Supprimer le fichier"
                  disabled={deletingFileId === fichier.id}
                >
                  {deletingFileId === fichier.id ? (
                    <RefreshCw className="w-3 h-3 text-red-600 animate-spin" />
                  ) : (
                    <X className="w-3 h-3 text-red-600" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zone de téléchargement */}
        <div
          className={`border-2 border-dashed p-4 text-center transition-colors flex-1 flex flex-col items-center justify-center ${
            isDragOver 
              ? 'border-[#032622] bg-[#032622]/5' 
              : 'border-[#032622]/30 hover:border-[#032622]/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-6 h-6 text-[#032622]/50 mb-2" />
          <p className="text-[#032622] text-sm mb-2">
            Déposez les fichiers ici ou
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            Sélectionnez des fichiers
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
          />
          
          <p className="text-xs text-[#032622]/50 mt-1">
            Formats acceptés: PDF, DOC, PPT, TXT, Images, Vidéos
          </p>
        </div>
      </div>
    </div>
  );
};
