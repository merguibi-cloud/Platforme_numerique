"use client";
import { useState } from 'react';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';

interface DocumentsProps {
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Documents = ({ onClose, onNext, onPrev }: DocumentsProps) => {
  const [formData, setFormData] = useState({
    cv: null as File | null,
    diplome: null as File | null,
    releves: [] as File[],
    pieceIdentite: [] as File[],
    entrepriseAccueil: '',
    motivationFormation: '',
  });

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return;
    
    if (field === 'releves' || field === 'pieceIdentite') {
      setFormData(prev => ({ ...prev, [field]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="DOCUMENTS" onClose={onClose} />

        {/* Content */}
        <div className="p-6 mb-6">
          <div className="space-y-6">
            {/* CV */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGER VOTRE CV*</h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange('cv', e.target.files)}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="inline-block text-[#032622] px-4 py-2 cursor-pointer hover:bg-[#032622]/30 transition-colors border border-[#032622]"
              >
                Choisir un fichier
              </label>
              <p className="text-gray-500 text-sm mt-1">
                {formData.cv ? formData.cv.name : 'Aucun fichier choisi'}
              </p>
            </div>

            {/* Diplôme */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOTRE DERNIER DIPLÔME OBTENU*</h3>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('diplome', e.target.files)}
                className="hidden"
                id="diplome-upload"
              />
              <label
                htmlFor="diplome-upload"
                className="inline-block text-[#032622] px-4 py-2 cursor-pointer hover:bg-[#032622]/30 transition-colors border border-[#032622]"
              >
                Choisir un fichier
              </label>
              <p className="text-gray-500 text-sm mt-1">
                {formData.diplome ? formData.diplome.name : 'Aucun fichier choisi'}
              </p>
            </div>

            {/* Relevés de notes */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOS RELEVÉS DE NOTES DES 2 DERNIÈRES ANNÉES*</h3>
              <div
                className="border-2 border-dashed border-[#032622] p-8 text-center bg-[#F8F5E4] hover:bg-[#032622]/10 transition-colors cursor-pointer"
                onClick={() => document.getElementById('releves-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-[#032622] mx-auto mb-2" />
                <p className="text-[#032622]">Déposez les fichiers ici ou</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('releves', e.target.files)}
                  className="hidden"
                  id="releves-upload"
                />
                <button
                  type="button"
                  className="mt-2 text-[#032622] px-4 py-2 hover:bg-[#032622]/30 transition-colors border border-[#032622]"
                >
                  Sélectionnez des fichiers
                </button>
              </div>
              {formData.releves.length > 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  {formData.releves.length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Pièce d'identité */}
            <div>
              <h3 className="text-lg font-bold text-[#032622] mb-2">TÉLÉCHARGEZ VOTRE PIÈCE D'IDENTITÉ RECTO/VERSO*</h3>
              <div
                className="border-2 border-dashed border-[#032622] p-8 text-center bg-[#F8F5E4] hover:bg-[#032622]/10 transition-colors cursor-pointer"
                onClick={() => document.getElementById('identite-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-[#032622] mx-auto mb-2" />
                <p className="text-[#032622]">Déposez les fichiers ici ou</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('pieceIdentite', e.target.files)}
                  className="hidden"
                  id="identite-upload"
                />
                <button
                  type="button"
                  className="mt-2 text-[#032622] px-4 py-2 hover:bg-[#032622]/30 transition-colors border border-[#032622]"
                >
                  Sélectionnez des fichiers
                </button>
              </div>
              {formData.pieceIdentite.length > 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  {formData.pieceIdentite.length} fichier(s) sélectionné(s)
                </p>
              )}
            </div>

            {/* Entreprise d'accueil */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-[#032622]">AVEZ-VOUS DÉJÀ UNE ENTREPRISE D'ACCUEIL?*</h3>
              </div>
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
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-[#032622]">POURQUOI CETTE FORMATION?</h3>
              </div>
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
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              RETOUR
            </button>
            
            <button
              onClick={onNext}
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
