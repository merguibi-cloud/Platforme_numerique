"use client";
import { useState, useEffect } from 'react';
import { Upload, X, FileText, Image, Download } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { useRouter } from 'next/navigation';
import { saveCandidatureStep } from '@/lib/candidature-api';
import { useCandidature } from '@/contexts/CandidatureContext';

interface DocumentsProps {
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Documents = ({ onClose, onNext, onPrev }: DocumentsProps) => {
  const router = useRouter();
  const { candidatureData, refreshCandidature } = useCandidature();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    cv: null as File | null,
    diplome: null as File | null,
    releves: [] as File[],
    pieceIdentite: [] as File[],
    entrepriseAccueil: '',
    motivationFormation: '',
  });
  
  // État pour les fichiers existants (chemin + URL signée)
  const [existingFiles, setExistingFiles] = useState({
    cv: { path: '', url: '' },
    diplome: { path: '', url: '' },
    releves: [] as Array<{ path: string, url: string }>,
    pieceIdentite: [] as Array<{ path: string, url: string }>,
  });
  
  // État pour les fichiers manquants (enregistrés en BDD mais introuvables dans le storage)
  const [missingFiles, setMissingFiles] = useState<string[]>([]);

  // Charger les données depuis le Context quand disponibles
  useEffect(() => {
    if (candidatureData) {
      loadCandidatureData();
    } else {
      setIsLoading(false);
    }
  }, [candidatureData]);

  const loadCandidatureData = async () => {
    try {
      setIsLoading(true);
      
      // Réinitialiser les nouveaux fichiers pour éviter les doublons
      setFormData({
        cv: null,
        diplome: null,
        releves: [],
        pieceIdentite: [],
        entrepriseAccueil: candidatureData?.entreprise_accueil || '',
        motivationFormation: candidatureData?.motivation_formation || '',
      });

      // Charger les fichiers existants
      if (candidatureData) {
        await loadExistingFiles(candidatureData);
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingFiles = async (candidature: any) => {
    // Réinitialiser les fichiers existants
    const newExistingFiles = {
      cv: { path: '', url: '' },
      diplome: { path: '', url: '' },
      releves: [] as Array<{ path: string, url: string }>,
      pieceIdentite: [] as Array<{ path: string, url: string }>,
    };
    
    const newMissingFiles: string[] = [];
    const filesToLoad = [];

    if (candidature.cv_path) {
      filesToLoad.push({ field: 'cv', path: candidature.cv_path });
    }
    if (candidature.diplome_path) {
      filesToLoad.push({ field: 'diplome', path: candidature.diplome_path });
    }
    if (candidature.releves_paths && candidature.releves_paths.length > 0) {
      candidature.releves_paths.forEach((path: string) => {
        filesToLoad.push({ field: 'releves', path });
      });
    }
    if (candidature.piece_identite_paths && candidature.piece_identite_paths.length > 0) {
      candidature.piece_identite_paths.forEach((path: string) => {
        filesToLoad.push({ field: 'pieceIdentite', path });
      });
    }

    // Charger les URLs signées pour tous les fichiers
    for (const file of filesToLoad) {
      let fileLoaded = false;
      
      try {
        // Essayer d'abord avec user_documents
        let urlResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(file.path)}&bucket=user_documents`);
        
        if (urlResponse.ok) {
          const urlResult = await urlResponse.json();
          if (urlResult.success && urlResult.url) {
            if (file.field === 'releves' || file.field === 'pieceIdentite') {
              newExistingFiles[file.field].push({ path: file.path, url: urlResult.url });
            } else {
              newExistingFiles[file.field as 'cv' | 'diplome'] = { path: file.path, url: urlResult.url };
            }
            fileLoaded = true;
          }
        }
        
        // Si échec, essayer avec photo_profil
        if (!fileLoaded) {
          urlResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(file.path)}&bucket=photo_profil`);
          
          if (urlResponse.ok) {
            const urlResult = await urlResponse.json();
            if (urlResult.success && urlResult.url) {
              if (file.field === 'releves' || file.field === 'pieceIdentite') {
                newExistingFiles[file.field].push({ path: file.path, url: urlResult.url });
              } else {
                newExistingFiles[file.field as 'cv' | 'diplome'] = { path: file.path, url: urlResult.url };
              }
              fileLoaded = true;
            }
          }
        }
        
        if (!fileLoaded) {
          newMissingFiles.push(file.path.split('/').pop() || file.path);
        }
      } catch (error) {
        newMissingFiles.push(file.path.split('/').pop() || file.path);
      }
    }

    setExistingFiles(newExistingFiles);
    setMissingFiles(newMissingFiles);
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'releves' || field === 'pieceIdentite') {
      const newFiles = Array.from(files);
      
      // Limiter à 2 documents pour la pièce d'identité
      if (field === 'pieceIdentite') {
        const currentTotal = existingFiles.pieceIdentite.length + formData.pieceIdentite.length;
        const availableSlots = 2 - currentTotal;
        
        if (availableSlots <= 0) {
          alert('Vous ne pouvez télécharger que 2 documents maximum pour la pièce d\'identité (recto et verso).');
          return;
        }
        
        if (newFiles.length > availableSlots) {
          alert(`Vous ne pouvez ajouter que ${availableSlots} document(s) supplémentaire(s). Maximum 2 documents au total.`);
          setFormData(prev => ({ ...prev, [field]: [...prev[field], ...newFiles.slice(0, availableSlots)] }));
          return;
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: [...prev[field], ...newFiles] }));
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeExistingFile = async (field: string, index?: number) => {
    let fileToDelete: { path: string, url: string } | null = null;
    
    // Récupérer le fichier à supprimer avant de le retirer de l'état
    if (field === 'releves' || field === 'pieceIdentite') {
      if (index !== undefined) {
        fileToDelete = existingFiles[field][index];
      }
    } else {
      fileToDelete = existingFiles[field as 'cv' | 'diplome'];
    }

    // Supprimer du storage si le fichier existe
    if (fileToDelete && fileToDelete.path) {
      try {
        // Déterminer le bucket (essayer user_documents d'abord, puis photo_profil)
        const buckets = ['user_documents', 'photo_profil'];
        
        for (const bucket of buckets) {
          const response = await fetch(`/api/delete-file?path=${encodeURIComponent(fileToDelete.path)}&bucket=${bucket}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            // Fichier supprimé avec succès
            break;
          }
        }
      } catch (error) {
        // Continuer même en cas d'erreur pour permettre la suppression de l'interface
      }
    }

    // Retirer de l'état local
    if (field === 'releves' || field === 'pieceIdentite') {
      setExistingFiles(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setExistingFiles(prev => ({
        ...prev,
        [field]: { path: '', url: '' }
      }));
    }
  };

  const removeNewFile = (field: string, index?: number) => {
    if (field === 'releves' || field === 'pieceIdentite') {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (field === 'releves' || field === 'pieceIdentite') {
        // Limiter à 2 documents pour la pièce d'identité
        if (field === 'pieceIdentite') {
          const currentTotal = existingFiles.pieceIdentite.length + formData.pieceIdentite.length;
          const availableSlots = 2 - currentTotal;
          
          if (availableSlots <= 0) {
            alert('Vous ne pouvez télécharger que 2 documents maximum pour la pièce d\'identité (recto et verso).');
            return;
          }
          
          if (files.length > availableSlots) {
            alert(`Vous ne pouvez ajouter que ${availableSlots} document(s) supplémentaire(s). Maximum 2 documents au total.`);
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...files.slice(0, availableSlots)] }));
            return;
          }
        }
        
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ...files] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: files[0] }));
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const getFilePreview = (file: File | null, url: string | null, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    const isPDF = ext === 'pdf';

    if (isImage) {
      if (file) {
        // Aperçu pour nouveau fichier image
        const previewUrl = URL.createObjectURL(file);
        return (
          <div className="w-full h-32 bg-[#F8F5E4] flex items-center justify-center overflow-hidden relative group">
            <img 
              src={previewUrl} 
              alt="Aperçu" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-[#032622]/5');
              }}
            />
            <div className="absolute inset-0 bg-[#032622]/0 group-hover:bg-[#032622]/10 transition-colors"></div>
          </div>
        );
      } else if (url) {
        // Aperçu pour fichier existant image
        return (
          <div className="w-full h-32 bg-[#F8F5E4] flex items-center justify-center overflow-hidden relative group">
            <img 
              src={url} 
              alt="Aperçu" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-[#032622]/5');
              }}
            />
            <div className="absolute inset-0 bg-[#032622]/0 group-hover:bg-[#032622]/10 transition-colors"></div>
          </div>
        );
      }
    }

    // Icône pour fichiers PDF et autres
    return (
      <div className="w-full h-32 bg-[#F8F5E4] flex flex-col items-center justify-center gap-2 relative group">
        {isPDF ? (
          <>
            <FileText className="w-12 h-12 text-[#032622]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#032622]">PDF</span>
          </>
        ) : (
          <>
            <FileText className="w-12 h-12 text-[#032622]" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#032622] uppercase">{ext || 'DOC'}</span>
          </>
        )}
        <div className="absolute inset-0 bg-[#032622]/0 group-hover:bg-[#032622]/5 transition-colors"></div>
      </div>
    );
  };

  const saveData = async () => {
    try {
      // Uploader les nouveaux fichiers
      const uploadPromises = [];
      
      if (formData.cv) {
        uploadPromises.push(uploadFile(formData.cv, 'cv'));
      }
      if (formData.diplome) {
        uploadPromises.push(uploadFile(formData.diplome, 'diplome'));
      }
      
      // Uploader les fichiers multiples
      formData.releves.forEach(file => {
        uploadPromises.push(uploadFile(file, 'releves'));
      });
      formData.pieceIdentite.forEach(file => {
        uploadPromises.push(uploadFile(file, 'pieceIdentite'));
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Préparer les données pour la sauvegarde
      const stepData = {
        entrepriseAccueil: formData.entrepriseAccueil,
        motivationFormation: formData.motivationFormation,
        cvPath: uploadResults.find(r => r.type === 'cv')?.path || existingFiles.cv.path || null,
        diplomePath: uploadResults.find(r => r.type === 'diplome')?.path || existingFiles.diplome.path || null,
        relevesPaths: [
          ...existingFiles.releves.map(f => f.path),
          ...uploadResults.filter(r => r.type === 'releves').map(r => r.path)
        ],
        pieceIdentitePaths: [
          ...existingFiles.pieceIdentite.map(f => f.path),
          ...uploadResults.filter(r => r.type === 'pieceIdentite').map(r => r.path)
        ]
      };

      // Sauvegarder les données
      const result = await saveCandidatureStep('documents', stepData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const result = await saveData();
      
      if (result.success) {
        // Rafraîchir les données du Context après sauvegarde
        await refreshCandidature();
        alert('Vos modifications ont été enregistrées avec succès. Vous pouvez reprendre plus tard.');
      } else {
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Validation des champs obligatoires
    const hasRequiredFiles = existingFiles.cv.path || formData.cv || 
                            existingFiles.diplome.path || formData.diplome ||
                            existingFiles.releves.length > 0 || formData.releves.length > 0 ||
                            existingFiles.pieceIdentite.length > 0 || formData.pieceIdentite.length > 0;

    if (!hasRequiredFiles || !formData.entrepriseAccueil) {
      alert('Veuillez remplir tous les champs obligatoires (*) pour passer à l\'étape suivante.\n\nVous pouvez utiliser le bouton "Enregistrer brouillon" pour sauvegarder et reprendre plus tard.');
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveData();
      
      if (result.success) {
        // Rafraîchir les données du Context après sauvegarde
        await refreshCandidature();
        onNext();
      } else {
        alert('Erreur lors de la sauvegarde des données. Veuillez réessayer.');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde des données. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFile = async (file: File, type: string): Promise<{ path: string, type: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur upload fichier');
    }

    const result = await response.json();
    return { path: result.path, type };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-[#032622] text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="DOCUMENTS" onClose={onClose} />

        {/* Message d'alerte si fichiers manquants */}
        {missingFiles.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Fichiers manquants détectés
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Les fichiers suivants sont enregistrés mais introuvables dans le storage :</p>
                  <ul className="list-disc list-inside mt-1">
                    {missingFiles.map((file, index) => (
                      <li key={index}>{file}</li>
                    ))}
                  </ul>
                  <p className="mt-2 font-medium">
                    💡 Solution : Veuillez ré-uploader ces fichiers ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 mb-6">
          <div className="space-y-8">
            
            {/* CV */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-4">TÉLÉCHARGER VOTRE CV*</h3>
              
              {/* Fichier existant ou nouveau */}
              {(existingFiles.cv.path || formData.cv) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  <div className="border border-[#032622]  overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {getFilePreview(
                      formData.cv, 
                      existingFiles.cv.url, 
                      formData.cv?.name || existingFiles.cv.path
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#032622] truncate">
                            {formData.cv?.name || existingFiles.cv.path.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.cv ? 'Nouveau' : 'Existant'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-1">
                          {existingFiles.cv.url && !formData.cv && (
                            <a 
                              href={existingFiles.cv.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#032622] hover:text-[#032622]/70 p-1"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                          <button 
                            onClick={() => formData.cv ? removeNewFile('cv') : removeExistingFile('cv')}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#032622]/30 p-12 text-center bg-[#F8F5E4] hover:border-[#032622] hover:bg-[#032622]/5 transition-all cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'cv')}
                  onClick={() => document.getElementById('cv-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#032622]/10 flex items-center justify-center group-hover:bg-[#032622]/20 transition-colors">
                      <Upload className="w-8 h-8 text-[#032622]" />
                    </div>
                    <div>
                      <p className="text-[#032622] font-medium mb-1">Déposez votre CV ici</p>
                      <p className="text-[#032622]/60 text-sm">ou cliquez pour sélectionner un fichier</p>
                      <p className="text-[#032622]/40 text-xs mt-2">PDF, DOC, DOCX</p>
                    </div>
                  </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange('cv', e.target.files)}
                className="hidden"
                id="cv-upload"
              />
                </div>
              )}
            </div>

            {/* Diplôme */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-4">TÉLÉCHARGEZ VOTRE DERNIER DIPLÔME OBTENU*</h3>
              
              {/* Fichier existant ou nouveau */}
              {(existingFiles.diplome.path || formData.diplome) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  <div className="border border-[#032622] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    {getFilePreview(
                      formData.diplome, 
                      existingFiles.diplome.url, 
                      formData.diplome?.name || existingFiles.diplome.path
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#032622] truncate">
                            {formData.diplome?.name || existingFiles.diplome.path.split('/').pop()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.diplome ? 'Nouveau' : 'Existant'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-1">
                          {existingFiles.diplome.url && !formData.diplome && (
                            <a 
                              href={existingFiles.diplome.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#032622] hover:text-[#032622]/70 p-1"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                          <button 
                            onClick={() => formData.diplome ? removeNewFile('diplome') : removeExistingFile('diplome')}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-[#032622]/30 p-12 text-center bg-[#F8F5E4] hover:border-[#032622] hover:bg-[#032622]/5 transition-all cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'diplome')}
                  onClick={() => document.getElementById('diplome-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#032622]/10 flex items-center justify-center group-hover:bg-[#032622]/20 transition-colors">
                      <Upload className="w-8 h-8 text-[#032622]" />
                    </div>
                    <div>
                      <p className="text-[#032622] font-medium mb-1">Déposez votre diplôme ici</p>
                      <p className="text-[#032622]/60 text-sm">ou cliquez pour sélectionner un fichier</p>
                      <p className="text-[#032622]/40 text-xs mt-2">PDF, JPG, PNG</p>
                    </div>
                  </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('diplome', e.target.files)}
                className="hidden"
                id="diplome-upload"
              />
                </div>
              )}
            </div>

            {/* Relevés de notes */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-4">TÉLÉCHARGEZ VOS RELEVÉS DE NOTES DES 2 DERNIÈRES ANNÉES*</h3>
              
              {/* Grille de fichiers */}
              {(existingFiles.releves.length > 0 || formData.releves.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {/* Fichiers existants */}
                  {existingFiles.releves.map((file, index) => (
                    <div key={`existing-${index}`} className="border border-[#032622]  overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(null, file.url, file.path)}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#032622] truncate">
                              {file.path.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Existant</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-1">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#032622] hover:text-[#032622]/70 p-1"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                            <button 
                              onClick={() => removeExistingFile('releves', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Supprimer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Nouveaux fichiers */}
                  {formData.releves.map((file, index) => (
                    <div key={`new-${index}`} className="border border-[#032622]  overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(file, null, file.name)}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#032622] truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Nouveau</p>
                          </div>
                          <button 
                            onClick={() => removeNewFile('releves', index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de drop */}
              <div
                className="border-2 border-dashed border-[#032622]/30 p-12 text-center bg-[#F8F5E4] hover:border-[#032622] hover:bg-[#032622]/5 transition-all cursor-pointer group"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'releves')}
                onClick={() => document.getElementById('releves-upload')?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#032622]/10 flex items-center justify-center group-hover:bg-[#032622]/20 transition-colors">
                    <Upload className="w-8 h-8 text-[#032622]" />
                  </div>
                  <div>
                    <p className="text-[#032622] font-medium mb-1">Déposez vos relevés ici</p>
                    <p className="text-[#032622]/60 text-sm">ou cliquez pour sélectionner plusieurs fichiers</p>
                    <p className="text-[#032622]/40 text-xs mt-2">PDF, JPG, PNG • Plusieurs fichiers acceptés</p>
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('releves', e.target.files)}
                  className="hidden"
                  id="releves-upload"
                />
              </div>
            </div>

            {/* Pièce d'identité */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-4">TÉLÉCHARGEZ VOTRE PIÈCE D'IDENTITÉ RECTO/VERSO* (Maximum 2 documents)</h3>
              
              {/* Grille de fichiers */}
              {(existingFiles.pieceIdentite.length > 0 || formData.pieceIdentite.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {/* Fichiers existants */}
                  {existingFiles.pieceIdentite.map((file, index) => (
                    <div key={`existing-${index}`} className="border border-[#032622]  overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(null, file.url, file.path)}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#032622] truncate">
                              {file.path.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Existant</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-1">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#032622] hover:text-[#032622]/70 p-1"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                            <button 
                              onClick={() => removeExistingFile('pieceIdentite', index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Supprimer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Nouveaux fichiers */}
                  {formData.pieceIdentite.map((file, index) => (
                    <div key={`new-${index}`} className="border border-[#032622]  overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(file, null, file.name)}
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#032622] truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Nouveau</p>
                          </div>
                          <button 
                            onClick={() => removeNewFile('pieceIdentite', index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de drop - affichée seulement si moins de 2 documents */}
              {(existingFiles.pieceIdentite.length + formData.pieceIdentite.length < 2) && (
                <div
                  className="border-2 border-dashed border-[#032622]/30 p-12 text-center bg-[#F8F5E4] hover:border-[#032622] hover:bg-[#032622]/5 transition-all cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'pieceIdentite')}
                  onClick={() => document.getElementById('identite-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#032622]/10 flex items-center justify-center group-hover:bg-[#032622]/20 transition-colors">
                      <Upload className="w-8 h-8 text-[#032622]" />
                    </div>
                    <div>
                      <p className="text-[#032622] font-medium mb-1">Déposez votre pièce d'identité ici</p>
                      <p className="text-[#032622]/60 text-sm">Recto et verso • ou cliquez pour sélectionner</p>
                      <p className="text-[#032622]/40 text-xs mt-2">PDF, JPG, PNG • Maximum 2 fichiers</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('pieceIdentite', e.target.files)}
                    className="hidden"
                    id="identite-upload"
                  />
                </div>
              )}
            </div>

            {/* Entreprise d'accueil */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">AVEZ-VOUS DÉJÀ UNE ENTREPRISE D'ACCUEIL?*</h3>
              <input
                type="text"
                value={formData.entrepriseAccueil}
                onChange={(e) => handleInputChange('entrepriseAccueil', e.target.value)}
                className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
                placeholder="Nom de l'entreprise..."
              />
            </div>

            {/* Motivation */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">POURQUOI CETTE FORMATION?</h3>
              <textarea
                value={formData.motivationFormation}
                onChange={(e) => handleInputChange('motivationFormation', e.target.value)}
                rows={4}
                className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622] resize-none"
                placeholder="Expliquez votre motivation pour cette formation..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border border-[#032622]">
          <div className="flex justify-between items-center">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
              disabled={isSaving}
            >
              RETOUR
            </button>
            
            <button
              onClick={handleSaveDraft}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#C2C6B6] transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'SAUVEGARDE...' : 'ENREGISTRER BROUILLON'}
            </button>
            
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'SAUVEGARDE...' : 'SUIVANT'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
