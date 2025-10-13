"use client";
import { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { useRouter } from 'next/navigation';

interface InformationProps {
  onClose: () => void;
}

export const Information = ({ onClose }: InformationProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Informations personnelles
    civilite: '',
    nom: '',
    prenom: '',
    email: '',
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

  const handleNext = () => {
    router.push('/validation?step=documents');
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
          <div className="w-48 h-60 border border-[#032622] flex items-center justify-center flex-shrink-0">
            <User className="w-16 h-16 text-[#032622]" />
          </div>
          
          {/* Informations de la formation */}
          <div className="flex-1">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#032622] mb-1">RESPONSABLE DU DÉVELOPPEMENT</h3>
              <h3 className="text-lg font-bold text-[#032622] mb-1">DES ACTIVITÉS</h3>
              <p className="text-[#032622] font-medium">CHEZ LEADER SOCIETY</p>
            </div>
            
            {/* Section téléchargement photo */}
            <div>
              <h4 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOTRE PHOTO D'IDENTITÉ</h4>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block text-[#032622] px-4 py-2 cursor-pointer hover:bg-[#032622]/30 transition-colors border border-[#032622]"
              >
                Choisir un fichier
              </label>
              <p className="text-gray-500 text-sm mt-1">Aucun fichier choisi</p>
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
                  className="w-full p-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
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
              className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors"
            >
              SUIVANT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};