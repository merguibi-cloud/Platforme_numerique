'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CreateBlocProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blocData: { titre: string; description: string; modules: string[] }) => void;
}

export const CreateBloc = ({ isOpen, onClose, onSave }: CreateBlocProps) => {
  const [titreBloc, setTitreBloc] = useState('');
  const [descriptionBloc, setDescriptionBloc] = useState('');
  const [modules, setModules] = useState<string[]>(['']);

  const handleAddModule = () => {
    setModules([...modules, '']);
  };

  const handleRemoveModule = (index: number) => {
    if (modules.length > 1) {
      setModules(modules.filter((_, i) => i !== index));
    }
  };

  const handleModuleChange = (index: number, value: string) => {
    const newModules = [...modules];
    newModules[index] = value;
    setModules(newModules);
  };

  const handleSave = () => {
    if (titreBloc.trim() && modules.some(module => module.trim())) {
      onSave({
        titre: titreBloc.trim(),
        description: descriptionBloc.trim(),
        modules: modules.filter(module => module.trim())
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitreBloc('');
    setDescriptionBloc('');
    setModules(['']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b-2 border-[#032622]">
          <h2 
            className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] uppercase break-words pr-2"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CRÉATION D'UN BLOC
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#032622] bg-[#032622] hover:bg-[#F8F5E4] hover:text-[#032622] active:bg-[#032622]/80 transition-colors flex items-center justify-center flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Bloc de compétence */}
          <div className="space-y-1.5 sm:space-y-2">
            <label 
              className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wider underline break-words"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              BLOC DE COMPÉTENCE
            </label>
            <input
              type="text"
              value={titreBloc}
              onChange={(e) => setTitreBloc(e.target.value)}
              placeholder="Nom du bloc de compétence"
              className="w-full p-3 sm:p-4 border-2 border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label 
                className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wider underline break-words"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                DESCRIPTION
              </label>
              <span className={`text-[10px] sm:text-xs whitespace-nowrap ${descriptionBloc.length > 90 ? 'text-red-600' : descriptionBloc.length > 80 ? 'text-orange-600' : 'text-[#032622]/70'}`}>
                {descriptionBloc.length}/100 caractères
              </span>
            </div>
            <textarea
              value={descriptionBloc}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setDescriptionBloc(e.target.value);
                }
              }}
              placeholder="Description du bloc de compétence (max 100 caractères)"
              rows={4}
              maxLength={100}
              className={`w-full p-3 sm:p-4 border-2 bg-[#F8F5E4] text-sm sm:text-base text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                descriptionBloc.length > 90 
                  ? 'border-red-500 focus:ring-red-500' 
                  : descriptionBloc.length > 80 
                    ? 'border-orange-500 focus:ring-orange-500' 
                    : 'border-[#032622] focus:ring-[#032622]'
              }`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Modules */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <h3 
                className="text-base sm:text-lg font-semibold text-[#032622] uppercase break-words"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                MODULES
              </h3>
              <button
                onClick={handleAddModule}
                className="bg-[#032622] text-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                AJOUTER UN MODULE
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {modules.map((module, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={module}
                    onChange={(e) => handleModuleChange(index, e.target.value)}
                    placeholder={`Module ${index + 1}`}
                    className="flex-1 p-2.5 sm:p-3 border-2 border-[#032622] bg-[#F8F5E4] text-sm sm:text-base text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-0"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  />
                  {modules.length > 1 && (
                    <button
                      onClick={() => handleRemoveModule(index)}
                      className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-[#F8F5E4] active:bg-[#032622]/80 transition-colors flex items-center justify-center flex-shrink-0"
                      aria-label={`Supprimer le module ${index + 1}`}
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 md:p-6 border-t-2 border-[#032622]">
          <button
            onClick={handleSave}
            disabled={!titreBloc.trim() || !modules.some(module => module.trim())}
            className="w-full bg-[#032622] text-[#F8F5E4] py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CRÉER LE BLOC
          </button>
        </div>
      </div>
    </div>
  );
};
