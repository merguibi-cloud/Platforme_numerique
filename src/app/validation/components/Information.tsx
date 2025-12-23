"use client";
import { useState, useEffect } from 'react';
import { Upload, User, X, FileText, Image, Download } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { useRouter } from 'next/navigation';
import { UserFormationData } from '@/lib/user-formations';
import { saveCandidatureStep } from '@/lib/candidature-api';
import { useCandidature } from '@/contexts/CandidatureContext';
import { Modal } from './Modal';
import { useModal } from './useModal';

interface InformationProps {
  onClose: () => void;
  userEmail: string;
  formationData: UserFormationData | null;
}

export const Information = ({ onClose, userEmail, formationData }: InformationProps) => {
  const router = useRouter();
  const { candidatureData, refreshCandidature } = useCandidature();
  const { modalState, showSuccess, showError, showWarning, hideModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoIdentite, setPhotoIdentite] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [existingPhotoPath, setExistingPhotoPath] = useState<string>('');
  
  // États pour les fichiers pièce d'identité
  const [existingPieceIdentite, setExistingPieceIdentite] = useState<Array<{ path: string, url: string }>>([]);
  const [formData, setFormData] = useState({
    // Informations personnelles
    civilite: '',
    nom: '',
    prenom: '',
    email: userEmail,
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: '',
    
    // Nouveaux champs
    typeFormation: '',
    aUneEntreprise: '',
    etudiantEtranger: '',
    accepteDonnees: false,
    
    // Documents
    cv: null as File | null,
    diplome: null as File | null,
    releves: [] as File[],
    pieceIdentite: [] as File[],
    entrepriseAccueil: '',
    motivationFormation: '',
  });

  // Charger les données depuis le Context quand disponibles
  useEffect(() => {
    loadCandidatureData();
  }, [candidatureData]);

  // Mettre à jour l'email quand userEmail change
  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const loadCandidatureData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer le profil utilisateur pour pré-remplir email et téléphone
      let profileEmail = userEmail;
      let profileTelephone = '';
      
      try {
        const profileCheck = await fetch('/api/user/ensure-profile');
        const profileResult = await profileCheck.json();
        if (profileResult.success && profileResult.profile) {
          profileEmail = profileResult.profile.email || userEmail;
          profileTelephone = profileResult.profile.telephone || '';
        }
      } catch (error) {
        // Erreur silencieuse
      }
      
      if (candidatureData) {
        // Réinitialiser les fichiers pièce d'identité pour éviter les doublons
        setExistingPieceIdentite([]);
        // Pré-remplir le formulaire avec les données existantes du Context
        const candidature = candidatureData;
        setFormData(prev => ({
          ...prev,
          civilite: candidature.civilite || '',
          nom: candidature.nom || '',
          prenom: candidature.prenom || '',
          email: candidature.email || profileEmail,
          telephone: candidature.telephone || profileTelephone,
          adresse: candidature.adresse || '',
          codePostal: candidature.code_postal || '',
          ville: candidature.ville || '',
          pays: candidature.pays || '',
          typeFormation: candidature.type_formation || '',
          aUneEntreprise: candidature.a_une_entreprise || '',
          etudiantEtranger: candidature.etudiant_etranger || '',
          accepteDonnees: candidature.accepte_donnees || false,
        }));
        
        // Charger la photo existante si elle existe
        if (candidature.photo_identite_path) {
          setExistingPhotoPath(candidature.photo_identite_path);
          
          // Récupérer l'URL signée pour les buckets privés
          try {
            const urlResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(candidature.photo_identite_path)}&bucket=photo_profil`);
            
            if (urlResponse.ok) {
              const urlResult = await urlResponse.json();
              if (urlResult.success && urlResult.url) {
                setPhotoPreview(urlResult.url);
              }
            }
          } catch (error) {
            // Erreur silencieuse
          }
        }
        
        // Charger les fichiers pièce d'identité existants
        if (candidature.piece_identite_paths && candidature.piece_identite_paths.length > 0) {
          const pieceIdentiteFiles = [];
          for (const path of candidature.piece_identite_paths) {
            try {
              const urlResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(path)}&bucket=user_documents`);
              if (urlResponse.ok) {
                const urlResult = await urlResponse.json();
                if (urlResult.success && urlResult.url) {
                  pieceIdentiteFiles.push({ path, url: urlResult.url });
                }
              }
            } catch (error) {
              // Erreur silencieuse
            }
          }
          setExistingPieceIdentite(pieceIdentiteFiles);
        }
      } else {
        // Si pas de candidature existante, pré-remplir avec les données du profil
        setFormData(prev => ({
          ...prev,
          email: profileEmail,
          telephone: profileTelephone,
        }));
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'releves' || field === 'pieceIdentite') {
      setFormData(prev => ({ ...prev, [field]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
  };


  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Supprimer l'ancienne photo du storage si elle existe
      if (existingPhotoPath) {
        try {
          await fetch(`/api/delete-file?path=${encodeURIComponent(existingPhotoPath)}&bucket=photo_profil`, {
            method: 'DELETE',
          });
        } catch (error) {
          // Erreur silencieuse
        }
      }

      setPhotoIdentite(file);
      // Effacer le chemin de la photo existante puisqu'on a une nouvelle photo
      setExistingPhotoPath('');
      // Créer une URL de prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Nouvelle photo sélectionnée
    }
  };

  const handleRemovePhoto = async () => {
    // Supprimer la photo du storage si elle existe
    if (existingPhotoPath) {
      try {
        await fetch(`/api/delete-file?path=${encodeURIComponent(existingPhotoPath)}&bucket=photo_profil`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Erreur silencieuse
      }
    }

    // Réinitialiser l'état
    setPhotoIdentite(null);
    setPhotoPreview('');
    setExistingPhotoPath('');
  };

  // Fonctions pour gérer les fichiers pièce d'identité
  const handlePieceIdentiteChange = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const currentTotal = existingPieceIdentite.length + formData.pieceIdentite.length;
    const availableSlots = 2 - currentTotal;
    
    if (availableSlots <= 0) {
      showWarning('Vous ne pouvez télécharger que 2 documents maximum pour la pièce d\'identité (recto et verso).', 'Limite atteinte');
      return;
    }
    
    if (newFiles.length > availableSlots) {
      showWarning(`Vous ne pouvez ajouter que ${availableSlots} document(s) supplémentaire(s). Maximum 2 documents au total.`, 'Limite atteinte');
      setFormData(prev => ({ ...prev, pieceIdentite: [...prev.pieceIdentite, ...newFiles.slice(0, availableSlots)] }));
      return;
    }
    
    setFormData(prev => ({ ...prev, pieceIdentite: [...prev.pieceIdentite, ...newFiles] }));
  };

  const removeExistingPieceIdentite = async (index: number) => {
    const fileToDelete = existingPieceIdentite[index];
    
    if (fileToDelete && fileToDelete.path) {
      try {
        // Essayer d'abord avec user_documents (bucket principal pour les documents)
        let deleteSuccess = false;
        const response = await fetch(`/api/delete-file?path=${encodeURIComponent(fileToDelete.path)}&bucket=user_documents`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            deleteSuccess = true;
            console.log('Fichier supprimé du storage:', fileToDelete.path);
          }
        }
        
        // Si échec avec user_documents, essayer avec photo_profil
        if (!deleteSuccess) {
          const response2 = await fetch(`/api/delete-file?path=${encodeURIComponent(fileToDelete.path)}&bucket=photo_profil`, {
            method: 'DELETE',
          });
          
          if (response2.ok) {
            const result2 = await response2.json();
            if (result2.success) {
              deleteSuccess = true;
              console.log('Fichier supprimé du storage (photo_profil):', fileToDelete.path);
            }
          }
        }
        
        if (!deleteSuccess) {
          console.warn('Impossible de supprimer le fichier du storage:', fileToDelete.path);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
      }
    }
    
    // Retirer de l'état local même si la suppression du storage a échoué
    setExistingPieceIdentite(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewPieceIdentite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pieceIdentite: prev.pieceIdentite.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Créer un objet FileList simulé
      const fileList = {
        ...files,
        item: (index: number) => files[index] || null,
        length: files.length
      } as FileList;
      handlePieceIdentiteChange(fileList);
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
        const previewUrl = URL.createObjectURL(file);
        return (
          <div className="w-full h-24 sm:h-28 md:h-32 bg-[#F8F5E4] flex items-center justify-center overflow-hidden relative group">
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
        return (
          <div className="w-full h-24 sm:h-28 md:h-32 bg-[#F8F5E4] flex items-center justify-center overflow-hidden relative group">
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

    return (
      <div className="w-full h-24 sm:h-28 md:h-32 bg-[#F8F5E4] flex flex-col items-center justify-center gap-1 sm:gap-2 relative group">
        {isPDF ? (
          <>
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#032622]" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-xs font-medium text-[#032622]">PDF</span>
          </>
        ) : (
          <>
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#032622]" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-xs font-medium text-[#032622] uppercase">{ext || 'DOC'}</span>
          </>
        )}
        <div className="absolute inset-0 bg-[#032622]/0 group-hover:bg-[#032622]/5 transition-colors"></div>
      </div>
    );
  };

  const saveData = async () => {
    try {
      let photoPath = '';
      
      // Uploader la photo seulement si une nouvelle photo a été sélectionnée
      if (photoIdentite) {
        // Upload nouvelle photo
        const photoFormData = new FormData();
        photoFormData.append('file', photoIdentite);
        photoFormData.append('type', 'photo-identite');

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: photoFormData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            photoPath = uploadResult.path;
          }
        } catch (error) {
          // Erreur silencieuse
        }
      } else if (existingPhotoPath) {
        // Si pas de nouvelle photo mais qu'une photo existe déjà, garder le chemin existant
        photoPath = existingPhotoPath;
      }
      
      // Uploader les fichiers pièce d'identité
      const pieceIdentitePaths = [...existingPieceIdentite.map(f => f.path)];
      
      // Uploader seulement les nouveaux fichiers (pas encore uploadés)
      for (const file of formData.pieceIdentite) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('type', 'pieceIdentite');

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            // Vérifier que le fichier n'est pas déjà dans la liste
            if (!pieceIdentitePaths.includes(uploadResult.path)) {
              pieceIdentitePaths.push(uploadResult.path);
            }
          }
        } catch (error) {
          // Erreur silencieuse
        }
      }
      
      // Vider les nouveaux fichiers après upload pour éviter les doublons
      setFormData(prev => ({ ...prev, pieceIdentite: [] }));
      
      // Préparer les données pour l'étape informations
      const stepData = {
        civilite: formData.civilite,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        codePostal: formData.codePostal,
        ville: formData.ville,
        pays: formData.pays,
        typeFormation: formData.typeFormation,
        aUneEntreprise: formData.aUneEntreprise,
        etudiantEtranger: formData.etudiantEtranger,
        accepteDonnees: formData.accepteDonnees,
        ...(photoPath && { photoIdentitePath: photoPath }),
        pieceIdentitePaths: pieceIdentitePaths,
      };

      // Sauvegarder les données
      const result = await saveCandidatureStep('informations', stepData);
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
        showSuccess('Vos modifications ont été enregistrées avec succès. Vous pouvez reprendre plus tard.', 'Succès');
      } else {
        showError('Erreur lors de la sauvegarde. Veuillez réessayer.', 'Erreur');
      }
    } catch (error) {
      showError('Erreur lors de la sauvegarde. Veuillez réessayer.', 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  const hasDataChanged = () => {
    if (!candidatureData) return true; // Si pas de données existantes, considérer comme changé
    
    // Vérifier si les données ont changé par rapport à celles existantes
    const hasFormChanges = (
      formData.civilite !== (candidatureData.civilite || '') ||
      formData.nom !== (candidatureData.nom || '') ||
      formData.prenom !== (candidatureData.prenom || '') ||
      formData.email !== (candidatureData.email || '') ||
      formData.telephone !== (candidatureData.telephone || '') ||
      formData.adresse !== (candidatureData.adresse || '') ||
      formData.codePostal !== (candidatureData.code_postal || '') ||
      formData.ville !== (candidatureData.ville || '') ||
      formData.pays !== (candidatureData.pays || '') ||
      formData.typeFormation !== (candidatureData.type_formation || '') ||
      formData.aUneEntreprise !== (candidatureData.a_une_entreprise || '') ||
      formData.etudiantEtranger !== (candidatureData.etudiant_etranger || '') ||
      formData.accepteDonnees !== (candidatureData.accepte_donnees || false)
    );
    
    // Vérifier si une nouvelle photo a été ajoutée
    const hasNewPhoto = photoIdentite !== null;
    
    // Vérifier si de nouveaux fichiers pièce d'identité ont été ajoutés
    const hasNewPieceIdentite = formData.pieceIdentite.length > 0;
    
    return hasFormChanges || hasNewPhoto || hasNewPieceIdentite;
  };

  const handleNext = async () => {
    // Validation des champs obligatoires
    const hasRequiredFields = formData.nom && formData.prenom && formData.email && formData.telephone &&
                             formData.adresse && formData.codePostal && formData.ville && formData.pays &&
                             formData.typeFormation && formData.etudiantEtranger && formData.accepteDonnees;
    
    // Validation conditionnelle pour l'entreprise si alternance
    const hasRequiredConditionalFields = formData.typeFormation !== 'alternance' || formData.aUneEntreprise;
    
    // Validation des fichiers pièce d'identité
    const hasPieceIdentite = existingPieceIdentite.length > 0 || formData.pieceIdentite.length > 0;

    if (!hasRequiredFields || !hasRequiredConditionalFields || !hasPieceIdentite) {
      showWarning('Veuillez remplir tous les champs obligatoires (*) pour passer à l\'étape suivante.\n\nVous pouvez utiliser le bouton "Enregistrer brouillon" pour sauvegarder et reprendre plus tard.', 'Champs manquants');
      return;
    }

    try {
      setIsSaving(true);
      
      // Vérifier si des données ont été modifiées
      if (hasDataChanged()) {
        console.log('Données modifiées détectées - Sauvegarde en cours...');
        const result = await saveData();
        
        if (result.success) {
          // Rafraîchir les données du Context après sauvegarde
          await refreshCandidature();
          console.log('Sauvegarde réussie');
        } else {
          showError('Erreur lors de la sauvegarde des données. Veuillez réessayer.', 'Erreur');
          return;
        }
      } else {
        console.log('Aucune modification détectée - Pas d\'appel API');
      }
      
      // Aller directement à inscription après informations (CONTRAT retiré)
      router.push('/validation?step=inscription');
    } catch (error) {
      showError('Erreur lors de la sauvegarde des données. Veuillez réessayer.', 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrev = () => {
    router.push('/validation?step=accueil');
  };

  const renderStepContent = () => {
    return (
          <div className="space-y-6">
            
      {/* Section photo et informations de la formation */}
      <div className="w-full mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Photo de profil */}
          <div className="relative w-full sm:w-40 md:w-48 h-48 sm:h-56 md:h-60 border border-[#032622] flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 mx-auto sm:mx-0">
            {photoPreview ? (
              <>
                <img 
                  src={photoPreview} 
                  alt="Photo d'identité" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 sm:p-1 rounded-full hover:bg-red-700 active:bg-red-800 transition-colors z-10"
                  title="Supprimer la photo"
                  aria-label="Supprimer la photo"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            ) : (
              <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
            )}
          </div>
          
          {/* Informations de la formation */}
          <div className="flex-1">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-[#032622] mb-1 uppercase">
                {formationData?.formation_titre || 'Formation non spécifiée'}
              </h3>
              <p className="text-sm sm:text-base text-[#032622] font-medium uppercase">
                {formationData?.formation_ecole ? `Chez ${formationData.formation_ecole}` : ''}
              </p>
            </div>
            
            {/* Section téléchargement photo */}
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOTRE PHOTO D'IDENTITÉ</h4>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={handlePhotoChange}
              />
              <label
                htmlFor="photo-upload"
                className="inline-block text-[#032622] px-4 sm:px-5 py-2 sm:py-2.5 cursor-pointer hover:bg-[#032622]/30 active:bg-[#032622]/20 transition-colors border border-[#032622] text-sm sm:text-base"
              >
                Choisir un fichier
              </label>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 break-words">
                {photoIdentite 
                  ? `Nouveau fichier: ${photoIdentite.name}` 
                  : existingPhotoPath 
                    ? `Photo existante: ${existingPhotoPath.split('/').pop()}` 
                    : 'Aucun fichier choisi'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
            {/* Civilité */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#032622] mb-2">CIVILITÉ*</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.civilite === 'MADAME'}
                    onChange={(e) => handleInputChange('civilite', e.target.checked ? 'MADAME' : '')}
                    className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xs sm:text-sm text-[#032622] font-bold uppercase">MADAME</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.civilite === 'MONSIEUR'}
                    onChange={(e) => handleInputChange('civilite', e.target.checked ? 'MONSIEUR' : '')}
                    className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <span className="text-xs sm:text-sm text-[#032622] font-bold uppercase">MONSIEUR</span>
                </label>
              </div>
            </div>

            {/* Champs de saisie - 2 colonnes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  placeholder="NOM*"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="PRÉNOM*"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-MAIL*"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] bg-gray-300 text-[#032622] focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="TÉLÉPHONE*"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  disabled={true}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] bg-gray-300 text-[#032622] focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Adresse - pleine largeur */}
            <div>
              <input
                type="text"
                placeholder="ADRESSE*"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
              />
            </div>

            {/* Code postal, ville, pays - 3 colonnes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  placeholder="CODE POSTAL*"
                  value={formData.codePostal}
                  onChange={(e) => handleInputChange('codePostal', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="VILLE*"
                  value={formData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="PAYS*"
                  value={formData.pays}
                  onChange={(e) => handleInputChange('pays', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                />
              </div>
            </div>

            {/* Type de formation */}
            <div>
              <select
                value={formData.typeFormation}
                onChange={(e) => handleInputChange('typeFormation', e.target.value)}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] bg-[#F8F5E4] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
              >
                <option value="">TYPE DE FORMATION*</option>
                <option value="initial">Formation Initiale</option>
                <option value="alternance">Formation en Alternance</option>
              </select>
            </div>

            {/* Avez-vous une entreprise (conditionnel) */}
            {formData.typeFormation === 'alternance' && (
              <div>
                <select
                  value={formData.aUneEntreprise}
                  onChange={(e) => handleInputChange('aUneEntreprise', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] bg-[#F8F5E4] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
                >
                  <option value="">AVEZ-VOUS UNE ENTREPRISE?*</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </select>
              </div>
            )}

            {/* Êtes-vous un étudiant étranger */}
            <div>
              <select
                value={formData.etudiantEtranger}
                onChange={(e) => handleInputChange('etudiantEtranger', e.target.value)}
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-[#032622] text-[#032622] bg-[#F8F5E4] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-[#032622]"
              >
                <option value="">ÊTES-VOUS UN ÉTUDIANT ÉTRANGER?*</option>
                <option value="oui">Oui</option>
                <option value="non">Non</option>
              </select>
            </div>

            {/* Pièce d'identité */}
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#032622] mb-3 sm:mb-4">TÉLÉCHARGEZ VOTRE PIÈCE D'IDENTITÉ RECTO/VERSO* (Maximum 2 documents)</h3>
              
              {/* Grille de fichiers */}
              {(existingPieceIdentite.length > 0 || formData.pieceIdentite.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  {/* Fichiers existants */}
                  {existingPieceIdentite.map((file, index) => (
                    <div key={`existing-${index}`} className="border border-[#032622] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(null, file.url, file.path)}
                      <div className="p-2 sm:p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-[#032622] truncate">
                              {file.path.split('/').pop()}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Existant</p>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-1.5 ml-1 flex-shrink-0">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 p-1"
                              title="Télécharger"
                              aria-label="Télécharger"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            </a>
                            <button 
                              onClick={() => removeExistingPieceIdentite(index)}
                              className="text-red-600 hover:text-red-800 active:text-red-900 p-1"
                              title="Supprimer"
                              aria-label="Supprimer"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Nouveaux fichiers */}
                  {formData.pieceIdentite.map((file, index) => (
                    <div key={`new-${index}`} className="border border-[#032622] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      {getFilePreview(file, null, file.name)}
                      <div className="p-2 sm:p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-medium text-[#032622] truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Nouveau</p>
                          </div>
                          <button 
                            onClick={() => removeNewPieceIdentite(index)}
                            className="text-red-600 hover:text-red-800 active:text-red-900 p-1 flex-shrink-0"
                            title="Supprimer"
                            aria-label="Supprimer"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zone de drop - affichée seulement si moins de 2 documents */}
              {(existingPieceIdentite.length + formData.pieceIdentite.length < 2) && (
                <div
                  className="border-2 border-dashed border-[#032622]/30 p-6 sm:p-8 md:p-12 text-center bg-[#F8F5E4] hover:border-[#032622] hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-all cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('identite-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#032622]/10 flex items-center justify-center group-hover:bg-[#032622]/20 transition-colors">
                      <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#032622]" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm md:text-base text-[#032622] font-medium mb-1">Déposez votre pièce d'identité ici</p>
                      <p className="text-[#032622]/60 text-xs sm:text-sm">Recto et verso • ou cliquez pour sélectionner</p>
                      <p className="text-[#032622]/40 text-[10px] sm:text-xs mt-1 sm:mt-2">PDF, JPG, PNG • Maximum 2 fichiers</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handlePieceIdentiteChange(e.target.files)}
                    className="hidden"
                    id="identite-upload"
                  />
                </div>
              )}
            </div>

            {/* Checkbox d'acceptation */}
            <div>
              <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accepteDonnees}
                  onChange={(e) => handleInputChange('accepteDonnees', e.target.checked)}
                  className="mt-1 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                />
                <span className="text-xs sm:text-sm text-[#032622]">
                  J'accepte que mes données soient utilisées pour le traitement de ma candidature et pour être contacté(e) par un conseiller.*
                </span>
              </label>
            </div>
          </div>
        );
  };

  // Afficher un indicateur de chargement pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#032622]">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <ProgressHeader currentStep="INFORMATIONS" onClose={onClose} />

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 md:p-6 border border-[#032622]">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
            <button
              onClick={handlePrev}
              disabled={true}
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto order-3 sm:order-1"
            >
              RETOUR
            </button>
            
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#032622] text-[#032622] hover:bg-[#C2C6B6] active:bg-[#C2C6B6]/80 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto order-2 sm:order-2"
            >
              ENREGISTRER BROUILLON
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#032622] text-white hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto order-1 sm:order-3"
            >
              {isSaving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>SAUVEGARDE...</span>
                </>
              ) : (
                <span>SUIVANT</span>
              )}
            </button>
          </div>
        </div>
      </main>
      
      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};