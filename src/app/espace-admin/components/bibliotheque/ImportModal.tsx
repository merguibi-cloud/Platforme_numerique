"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Link, Check, Play, ChevronDown } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { schools } from './types';

interface ImportModalProps {
  onClose: () => void;
  urlInput: string;
  setUrlInput: (value: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  importStep: number;
  setImportStep: (step: number) => void;
  fileName: string;
  setFileName: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  fileType: string;
  setFileType: (value: string) => void;
  fileSize: string;
  setFileSize: (value: string) => void;
  selectedSchoolImport: string;
  setSelectedSchoolImport: (value: string) => void;
  enableDownload: boolean;
  setEnableDownload: (value: boolean) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  isDragOver: boolean;
  setIsDragOver: (value: boolean) => void;
  onImportSuccess?: () => void;
  showModal: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ImportModal = ({ 
  onClose, 
  urlInput, 
  setUrlInput,
  youtubeUrl,
  setYoutubeUrl,
  importStep,
  setImportStep,
  fileName,
  setFileName,
  subject,
  setSubject,
  description,
  setDescription,
  fileType,
  setFileType,
  fileSize,
  setFileSize,
  selectedSchoolImport,
  setSelectedSchoolImport,
  enableDownload,
  setEnableDownload,
  selectedFiles,
  setSelectedFiles,
  isDragOver,
  setIsDragOver,
  onImportSuccess,
  showModal
}: ImportModalProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingYoutube, setIsValidatingYoutube] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{filePath: string, bucketName: string, videoInfo?: any} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  
  // Hook pour l'upload avec progression réelle
  const { uploadProgress: realUploadProgress, uploadFile, cancelUpload, reset: resetUpload } = useFileUpload();

  // Fonction pour supprimer un fichier uploadé du storage
  const deleteUploadedFile = async (fileInfo: { filePath: string; bucketName: string } | null) => {
    if (!fileInfo || fileInfo.bucketName === 'youtube') {
      // Suppression ignorée pour les fichiers YouTube
      return;
    }

    try {
      const response = await fetch('/api/bibliotheque/delete-temp', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: fileInfo.filePath,
          bucketName: fileInfo.bucketName
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Fichier temporaire supprimé avec succès
      } else {
        const errorData = await response.json();
        // Erreur lors de la suppression du fichier temporaire
      }
    } catch (error) {
      // Erreur lors de la suppression du fichier temporaire
      throw error;
    }
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
        setShowSubjectDropdown(false);
      }
    };

    if (showSubjectDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectDropdown]);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.mp4,.mp3,.ppt,.pptx';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      handleFiles(files);
    };
    
    input.click();
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    const firstFile = files[0];
    
    // Si un fichier est déjà uploadé, le supprimer avant d'uploader le nouveau
    if (uploadedFileInfo && uploadedFileInfo.bucketName !== 'youtube') {
      try {
        await deleteUploadedFile(uploadedFileInfo);
      } catch (error) {
        // Erreur lors de la suppression de l'ancien fichier
      }
    }
    
    setSelectedFiles([firstFile]);
    setFileName(firstFile.name);
    
    const extension = firstFile.name.split('.').pop()?.toLowerCase() || '';
    let detectedType = extension ? extension.toUpperCase() : 'PDF';
    
    setFileType(detectedType);
    
    const sizeInMB = (firstFile.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MO`);

    setIsUploading(true);
    try {
      const result = await uploadFile(firstFile);
      if (result.success && result.filePath && result.bucketName) {
        if (result.bucketName !== 'bibliotheque-numerique') {
          // Bucket inattendu
        }
        
        setUploadedFileInfo({
          filePath: result.filePath,
          bucketName: result.bucketName
        });
      } else {
        throw new Error(result.error || 'Erreur lors de l\'upload du fichier. Le fichier n\'a pas pu être téléchargé dans le bucket.');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Une erreur est survenue lors du téléchargement du fichier dans le bucket de stockage.';
      let errorTitle = 'Erreur de téléchargement';
      
      if (error.message?.includes('bucket') && error.message?.includes('n\'existe pas')) {
        errorTitle = 'Bucket introuvable';
        errorMessage = `Le bucket "bibliotheque-numerique" n'existe pas dans Supabase Storage.\n\nVeuillez créer ce bucket dans votre dashboard Supabase :\n1. Allez dans Storage\n2. Cliquez sur "New bucket"\n3. Nommez-le "bibliotheque-numerique"\n4. Configurez les permissions (public ou privé selon vos besoins)\n\nPuis réessayez d'importer le fichier.`;
      } else if (error.message?.includes('permission') || error.message?.includes('Permissions')) {
        errorTitle = 'Permissions insuffisantes';
        errorMessage = `Vous n'avez pas les permissions nécessaires pour uploader dans le bucket "bibliotheque-numerique".\n\nVeuillez vérifier les politiques RLS (Row Level Security) du bucket dans Supabase Storage.`;
      } else if (error.message?.includes('vérifié')) {
        errorTitle = 'Vérification échouée';
        errorMessage = `Le fichier a été uploadé mais n'a pas pu être vérifié.\n\nCela peut être dû à un délai de propagation de Supabase Storage. Le fichier peut exister mais n'est pas encore accessible.\n\nVeuillez réessayer dans quelques instants.`;
      }
      
      showModal(
        errorMessage,
        errorTitle,
        'error'
      );
      setSelectedFiles([]);
      setFileSize('');
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleUrlImport = () => {
    // Import depuis URL
  };

  const handleYoutubeImport = async () => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeUrl.trim()) {
      showModal(
        'Le champ "Lien YouTube" est vide. Veuillez entrer un lien YouTube valide pour continuer.',
        'Champ requis manquant',
        'warning'
      );
      return;
    }
    if (!youtubeRegex.test(youtubeUrl)) {
      showModal(
        'Le lien YouTube que vous avez entré n\'est pas valide.\n\nFormat attendu :\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID\n• https://www.youtube.com/embed/VIDEO_ID\n\nVeuillez vérifier le lien et réessayer.',
        'Lien YouTube invalide',
        'error'
      );
      return;
    }
    
    let videoId = '';
    const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }
    
    if (!videoId) {
      showModal(
        'Impossible d\'extraire l\'ID de la vidéo depuis le lien YouTube fourni.\n\nVeuillez vérifier que le lien est complet et au bon format, puis réessayer.',
        'Erreur d\'extraction',
        'error'
      );
      return;
    }

    setIsValidatingYoutube(true);
    try {
      const response = await fetch('/api/bibliotheque/youtube-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'La vidéo YouTube n\'a pas pu être validée';
        const errorDetails = data.details ? `\n\n${data.details}` : '';
        showModal(
          `${errorMessage}${errorDetails}\n\nVeuillez vérifier que :\n• Le lien est correct\n• La vidéo existe et est accessible\n• La vidéo n'est pas privée ou restreinte`,
          'Vidéo YouTube invalide',
          'error'
        );
        return;
      }

      const video = data.video;

      if (!fileType || fileType === 'PDF') {
        setFileType('MP4');
      }
      
      setFileName(video.title || `Vidéo YouTube ${videoId}`);
      setFileSize('');
      
      setUploadedFileInfo({
        filePath: youtubeUrl,
        bucketName: 'youtube',
        videoInfo: video
      });
      
      setImportStep(2);
    } catch (error: any) {
      showModal(
        `Une erreur est survenue lors de la validation de la vidéo YouTube.\n\nDétails : ${error.message || 'Erreur inconnue'}\n\nVeuillez réessayer.`,
        'Erreur de validation',
        'error'
      );
    } finally {
      setIsValidatingYoutube(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toUpperCase())) {
      setTags([...tags, tagInput.trim().toUpperCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleClose = async () => {
    if (uploadedFileInfo && importStep !== 3 && uploadedFileInfo.bucketName !== 'youtube') {
      cancelUpload();
      try {
        await deleteUploadedFile(uploadedFileInfo);
      } catch (error) {
        // Erreur lors de la suppression du fichier lors de la fermeture
      }
      setUploadedFileInfo(null);
    }
    resetUpload();
    onClose();
  };

  const handleNext = () => {
    if (realUploadProgress.status === 'completed' && uploadedFileInfo) {
      setImportStep(2);
    } else if (uploadedFileInfo && uploadedFileInfo.bucketName === 'youtube') {
      setImportStep(2);
    } else if (realUploadProgress.status === 'uploading') {
      showModal(
        'Le téléchargement du fichier est en cours. Veuillez patienter jusqu\'à la fin du téléchargement avant de continuer.',
        'Téléchargement en cours',
        'warning'
      );
    } else if (!uploadedFileInfo && selectedFiles.length === 0 && !urlInput.trim() && !youtubeUrl.trim()) {
      const missingFields = [];
      if (selectedFiles.length === 0) missingFields.push('• Un fichier à importer');
      if (!youtubeUrl.trim()) missingFields.push('• Un lien YouTube');
      if (!urlInput.trim()) missingFields.push('• Une URL');
      
      showModal(
        `Aucune source de fichier n'a été sélectionnée.\n\nVeuillez choisir l'une des options suivantes :\n${missingFields.join('\n')}\n\nPuis réessayez.`,
        'Source de fichier manquante',
        'warning'
      );
    }
  };

  const handleBack = () => {
    setImportStep(1);
  };

  const handleImport = async () => {
    if (!uploadedFileInfo) {
      showModal(
        'Aucun fichier n\'a été téléchargé.\n\nVeuillez d\'abord sélectionner et télécharger un fichier, un lien YouTube ou une URL avant de continuer.',
        'Fichier manquant',
        'warning'
      );
      return;
    }

    const missingFields = [];
    if (!fileName.trim()) missingFields.push('• Nom du fichier');
    if (!fileType.trim()) missingFields.push('• Type de fichier');
    if (!subject.trim()) missingFields.push('• Sujet');
    if (!selectedSchoolImport.trim()) missingFields.push('• École');
    
    if (missingFields.length > 0) {
      showModal(
        `Les champs suivants sont requis et doivent être remplis :\n${missingFields.join('\n')}\n\nVeuillez compléter ces informations avant de continuer.`,
        'Champs requis manquants',
        'warning'
      );
      return;
    }

    if (uploadedFileInfo.bucketName !== 'youtube') {
      try {
        const verifyResponse = await fetch('/api/bibliotheque/verify-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: uploadedFileInfo.filePath,
            bucketName: uploadedFileInfo.bucketName
          })
        });

        if (!verifyResponse.ok) {
          const verifyError = await verifyResponse.json();
          // Vérification fichier échouée (non-bloquant)
        } else {
          // Fichier vérifié avec succès
        }
      } catch (verifyError: any) {
        // Erreur vérification fichier (non-bloquant)
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/bibliotheque/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titre: fileName,
          nom_fichier_original: uploadedFileInfo.bucketName === 'youtube' ? youtubeUrl : (selectedFiles[0]?.name || fileName),
          type_fichier: fileType,
          taille_fichier: uploadedFileInfo.bucketName === 'youtube' ? 0 : (selectedFiles[0]?.size || 0),
          chemin_fichier: uploadedFileInfo.filePath,
          bucket_name: uploadedFileInfo.bucketName,
          description: description || null,
          sujet: subject || null,
          ecole: selectedSchoolImport || null,
          activer_telechargement: enableDownload,
          tags: tags
        })
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Une erreur est survenue lors de la sauvegarde du fichier.';
        const errorDetails = error.details ? `\n\nDétails : ${error.details}` : '';
        throw new Error(errorMessage + errorDetails);
      }

      setImportStep(3);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error: any) {
      showModal(
        error.message || 'Une erreur est survenue lors de la sauvegarde du fichier dans la bibliothèque. Veuillez vérifier les informations saisies et réessayer.',
        'Erreur de sauvegarde',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Étape 1 : Upload
  if (importStep === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
        <div 
          className="bg-[#F8F5E4] w-full max-w-2xl border-2 border-[#032622] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-8">
            <h2 
              className="text-2xl font-bold text-[#032622] uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              FICHIER À IMPORTER
            </h2>
            <button 
              onClick={handleClose}
              className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
              disabled={isUploading}
            >
              <X className="w-5 h-5 text-[#032622]" />
            </button>
          </div>

          <div className="mb-8">
            <h3 
              className="text-lg font-bold text-[#032622] uppercase mb-4"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              IMPORTER DEPUIS SON APPAREIL
            </h3>
            
            <div 
              className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-[#032622] bg-[#032622]/10' 
                  : 'border-[#032622] bg-[#F8F5E4] hover:bg-[#eae5cf]'
              }`}
              onClick={handleFileUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-[#032622] mx-auto mb-4" />
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[#032622] font-semibold">
                    {selectedFiles.length} fichier(s) sélectionné(s)
                  </p>
                  {selectedFiles.slice(0, 3).map((file, index) => (
                    <p key={index} className="text-sm text-[#032622]/70">
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MO)
                    </p>
                  ))}
                  {selectedFiles.length > 3 && (
                    <p className="text-sm text-[#032622]/70">
                      ... et {selectedFiles.length - 3} autre(s)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#032622] font-semibold mb-2">
                    Déposez les fichiers ici ou
                  </p>
                  <button className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-6 py-2 text-sm font-semibold hover:bg-[#eae5cf] transition-colors">
                    Sélectionner des fichiers
                  </button>
                </>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#032622] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${realUploadProgress.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  {realUploadProgress.status === 'uploading' && (
                    <p className="text-xs text-[#032622]">Téléchargement en cours...</p>
                  )}
                  {realUploadProgress.status === 'completed' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Check className="w-4 h-4" />
                      <p className="text-xs font-semibold">Téléchargé avec succès</p>
                    </div>
                  )}
                  {realUploadProgress.status === 'error' && (
                    <p className="text-xs text-red-600">{realUploadProgress.error}</p>
                  )}
                  <p className="text-xs text-[#032622] font-semibold">
                    {realUploadProgress.progress || 0}%
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#032622]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F5E4] text-[#032622] font-semibold">OU</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 
              className="text-lg font-bold text-[#032622] uppercase mb-4"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              IMPORTER DEPUIS YOUTUBE
            </h3>
            
            <div className="border-2 border-[#032622] bg-[#F8F5E4] p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#032622]/70 mb-1">
                    Collez le lien YouTube de la vidéo que vous souhaitez importer
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-4 py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-400 focus:outline-none focus:border-[#01302C] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isValidatingYoutube}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isValidatingYoutube && youtubeUrl.trim()) {
                          handleYoutubeImport();
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (youtubeUrl.trim() && !isValidatingYoutube) {
                          handleYoutubeImport();
                        }
                      }}
                      disabled={!youtubeUrl.trim() || isValidatingYoutube}
                      className="bg-[#032622] text-white px-6 py-2 text-sm font-semibold hover:bg-[#01302C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isValidatingYoutube ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>VALIDATION...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>IMPORTER</span>
                        </>
                      )}
                    </button>
                  </div>
                  {isValidatingYoutube && (
                    <p className="text-xs text-[#032622]/70 mt-2">
                      Vérification de la vidéo YouTube en cours...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#032622]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F5E4] text-[#032622] font-semibold">OU</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 
              className="text-lg font-bold text-[#032622] uppercase mb-4"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              IMPORTER DEPUIS UNE URL
            </h3>
            
            <div className="flex space-x-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-4 py-3 border border-r-0 border-[#032622] bg-[#C2C6B6] text-[#032622] text-sm font-semibold">
                  http://
                </span>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="drive.google.com"
                  className="flex-1 px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:border-[#01302C]"
                />
              </div>
              <button 
                onClick={handleUrlImport}
                className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-6 py-3 text-sm font-semibold hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>IMPORTER</span>
              </button>
            </div>
          </div>

          {uploadedFileInfo && (
            <div className="text-center">
              <button 
                onClick={handleNext}
                disabled={
                  (realUploadProgress.status !== 'completed' && selectedFiles.length > 0 && !uploadedFileInfo) ||
                  isUploading ||
                  realUploadProgress.status === 'uploading'
                }
                className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-12 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'TÉLÉCHARGEMENT...' : 'SUIVANT'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Étape 2 : Formulaire de détails
  if (importStep === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div 
        className="bg-[#F8F5E4] w-full max-w-4xl border-2 border-[#032622] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-8">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            FICHIER À IMPORTER
          </h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <X className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                NOM DU FICHIER
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                SUJET
              </label>
              <div className="relative" ref={subjectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  className="w-full px-4 py-3 border border-[#032622] bg-[#C2C6B6] text-[#032622] focus:outline-none focus:border-[#01302C] flex items-center justify-between"
                >
                  <span>{subject || "Sélectionner un sujet"}</span>
                  <ChevronDown className={`w-5 h-5 text-[#032622] transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSubjectDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg max-h-60 overflow-y-auto">
                    {["Masterclass", "Ebook", "Présentation", "Podcast", "Interview", "PDF"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSubject(option);
                          setShowSubjectDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                ÉCOLE <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedSchoolImport}
                onChange={(e) => setSelectedSchoolImport(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
                required
              >
                <option value="">Sélectionner une école</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.name}>{school.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C] resize-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                TYPE DE FICHIER
              </label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
            </div>

            {uploadedFileInfo?.bucketName !== 'youtube' && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                  TAILLE DU FICHIER
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-[#032622] uppercase mb-4">
            TAGS
          </label>
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 min-h-[120px]">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-[#C2C6B6] text-[#032622] text-sm uppercase font-semibold rounded flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ajouter un tag"
                className="flex-1 px-4 py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold hover:bg-[#01302C] transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableDownload}
              onChange={(e) => setEnableDownload(e.target.checked)}
              className="w-5 h-5 border border-[#032622] text-[#032622] focus:ring-[#032622]"
            />
            <span className="text-sm font-semibold text-[#032622] uppercase">
              ACTIVER LE TÉLÉCHARGEMENT
            </span>
          </label>
        </div>

        <div className="flex space-x-4 justify-center">
          <button 
            onClick={handleBack}
            className="border border-[#032622] text-[#032622] px-8 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors"
          >
            RETOUR
          </button>
          {fileName.trim() && fileType.trim() && subject.trim() && selectedSchoolImport.trim() && uploadedFileInfo && (
            <button 
              onClick={handleImport}
              disabled={isSaving}
              className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-8 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'ENREGISTREMENT...' : 'IMPORTER'}
            </button>
          )}
        </div>
      </div>
    </div>
    );
  }

  // Étape 3 : Validation de succès
  if (importStep === 3) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div 
        className="bg-[#F8F5E4] w-full max-w-md border-2 border-[#032622] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-6">
          <button 
            onClick={handleClose}
            className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <X className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        <div className="mb-6">
          <div className="w-20 h-20 bg-[#F8F5E4] border-4 border-[#032622] rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-[#032622]" />
          </div>
        </div>

        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            VOTRE FICHIER À BIEN ÉTÉ IMPORTÉ
          </h2>
          <p className="text-sm text-[#032622]/70 leading-relaxed">
            {description || "Votre fichier a été importé avec succès dans la bibliothèque numérique."}
          </p>
        </div>
      </div>
    </div>
    );
  }

  return null;
};

