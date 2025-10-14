"use client";
import { useState, useEffect } from 'react';
import { Upload, User } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { useRouter } from 'next/navigation';
import { UserFormationData } from '@/lib/user-formations';
import { getCandidature, saveCandidatureStep } from '@/lib/candidature-api';

interface InformationProps {
  onClose: () => void;
  userEmail: string;
  formationData: UserFormationData | null;
}

export const Information = ({ onClose, userEmail, formationData }: InformationProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoIdentite, setPhotoIdentite] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [existingPhotoPath, setExistingPhotoPath] = useState<string>('');
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
    situationActuelle: '',
    
    // Documents
    cv: null as File | null,
    diplome: null as File | null,
    releves: [] as File[],
    pieceIdentite: [] as File[],
    entrepriseAccueil: '',
    motivationFormation: '',
  });

  // Charger les données de candidature existantes
  useEffect(() => {
    loadCandidatureData();
  }, []);

  // Mettre à jour l'email quand userEmail change
  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const loadCandidatureData = async () => {
    try {
      setIsLoading(true);
      
      // S'assurer que le profil utilisateur existe
      try {
        const profileCheck = await fetch('/api/user/ensure-profile');
        const profileResult = await profileCheck.json();
        // Vérification profil
      } catch (error) {
        // Erreur silencieuse
      }
      
      const result = await getCandidature();
      
      if (result.success && result.data) {
        // Pré-remplir le formulaire avec les données existantes
        const candidature = result.data;
        setFormData(prev => ({
          ...prev,
          civilite: candidature.civilite || '',
          nom: candidature.nom || '',
          prenom: candidature.prenom || '',
          email: candidature.email || userEmail,
          telephone: candidature.telephone || '',
          adresse: candidature.adresse || '',
          codePostal: candidature.code_postal || '',
          ville: candidature.ville || '',
          pays: candidature.pays || '',
          situationActuelle: candidature.situation_actuelle || '',
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
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
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


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleNext = async () => {
    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      alert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    try {
      setIsSaving(true);
      
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
            // Photo uploadée
          }
        } catch (error) {
          // Erreur silencieuse
        }
      } else if (existingPhotoPath) {
        // Si pas de nouvelle photo mais qu'une photo existe déjà, garder le chemin existant
        photoPath = existingPhotoPath;
        // Conservation photo existante
      }
      
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
        situationActuelle: formData.situationActuelle,
        ...(photoPath && { photoIdentitePath: photoPath }),
      };

      // Sauvegarder les données
      const result = await saveCandidatureStep('informations', stepData);
      
      if (result.success) {
        router.push('/validation?step=documents');
      } else {
        alert('Erreur lors de la sauvegarde des données. Veuillez réessayer.');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde des données. Veuillez réessayer.');
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
      <div className="w-full mb-6">
        <div className="flex gap-6">
          {/* Photo de profil */}
          <div className="w-48 h-60 border border-[#032622] flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Photo d'identité" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          
          {/* Informations de la formation */}
          <div className="flex-1">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#032622] mb-1 uppercase">
                {formationData?.formation_titre || 'Formation non spécifiée'}
              </h3>
              <p className="text-[#032622] font-medium uppercase">
                {formationData?.formation_ecole ? `Chez ${formationData.formation_ecole}` : ''}
              </p>
            </div>
            
            {/* Section téléchargement photo */}
            <div>
              <h4 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOTRE PHOTO D'IDENTITÉ</h4>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={handlePhotoChange}
              />
              <label
                htmlFor="photo-upload"
                className="inline-block text-[#032622] px-4 py-2 cursor-pointer hover:bg-[#032622]/30 transition-colors border border-[#032622]"
              >
                Choisir un fichier
              </label>
              <p className="text-gray-500 text-sm mt-1">
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
              <label className="block text-sm font-medium text-[#032622] mb-2">CIVILITÉ*</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.civilite === 'MADAME'}
                    onChange={(e) => handleInputChange('civilite', e.target.checked ? 'MADAME' : '')}
                    className="mr-2"
                  />
                  <span className="text-[#032622] font-bold uppercase">MADAME</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.civilite === 'MONSIEUR'}
                    onChange={(e) => handleInputChange('civilite', e.target.checked ? 'MONSIEUR' : '')}
                    className="mr-2"
                  />
                  <span className="text-[#032622] font-bold uppercase">MONSIEUR</span>
                </label>
              </div>
            </div>

            {/* Champs de saisie - 2 colonnes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="NOM*"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="PRÉNOM*"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-MAIL*"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={true}
                  className="w-full p-3 border border-[#032622] bg-gray-300 text-[#032622] focus:outline-none focus:border-[#032622] cursor-not-allowed"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="TÉLÉPHONE*"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
            </div>

            {/* Adresse - pleine largeur */}
            <div>
              <input
                type="text"
                placeholder="ADRESSE"
                value={formData.adresse}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                className="w-full p-3 border border-[#032622] text-[#032622] focus:outline-none focus:border-[#032622]"
              />
            </div>

            {/* Code postal, ville, pays - 3 colonnes */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="CODE POSTAL"
                  value={formData.codePostal}
                  onChange={(e) => handleInputChange('codePostal', e.target.value)}
                  className="w-full p-3 border border-[#032622] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="VILLE"
                  value={formData.ville}
                  onChange={(e) => handleInputChange('ville', e.target.value)}
                  className="w-full p-3 border border-[#032622] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="PAYS"
                  value={formData.pays}
                  onChange={(e) => handleInputChange('pays', e.target.value)}
                  className="w-full p-3 border border-[#032622] text-[#032622] focus:outline-none focus:border-[#032622]"
                />
              </div>
            </div>

            {/* Situation actuelle */}
            <div>
              <select
                value={formData.situationActuelle}
                onChange={(e) => handleInputChange('situationActuelle', e.target.value)}
                className="w-full p-3 border border-[#032622] text-[#032622] focus:outline-none focus:border-[#032622]"
              >
                <option value="">SITUATION ACTUELLE</option>
                <option value="etudiant">Étudiant</option>
                <option value="salarie">Salarié</option>
                <option value="demandeur-emploi">Demandeur d'emploi</option>
                <option value="freelance">Freelance</option>
                <option value="entrepreneur">Entrepreneur</option>
              </select>
            </div>
          </div>
        );
  };

  // Afficher un indicateur de chargement pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="INFORMATIONS" onClose={onClose} />

        {/* Content */}
        <div className="p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border border-[#032622]">
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={true}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              RETOUR
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
};