'use client';

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CreateModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: { titre: string; cours: string[] }) => void;
}

export const CreateModule = ({ isOpen, onClose, onSave }: CreateModuleProps) => {
  const [titreModule, setTitreModule] = useState('');
  const [cours, setCours] = useState<string[]>(['']);

  const handleAddCours = () => {
    setCours([...cours, '']);
  };

  const handleRemoveCours = (index: number) => {
    if (cours.length > 1) {
      setCours(cours.filter((_, i) => i !== index));
    }
  };

  const handleCoursChange = (index: number, value: string) => {
    const newCours = [...cours];
    newCours[index] = value;
    setCours(newCours);
  };

  const handleSave = () => {
    if (titreModule.trim() && cours.some(coursItem => coursItem.trim())) {
      onSave({
        titre: titreModule.trim(),
        cours: cours.filter(coursItem => coursItem.trim())
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setTitreModule('');
    setCours(['']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#032622]">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CRÉATION D'UN MODULE
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 border-2 border-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-[#F8F5E4] transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Module */}
          <div className="space-y-2">
            <label 
              className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              MODULE
            </label>
            <input
              type="text"
              value={titreModule}
              onChange={(e) => setTitreModule(e.target.value)}
              placeholder="Nom du module"
              className="w-full p-4 border-2 border-[#032622] bg-gray-100 text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Cours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold text-[#032622] uppercase"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                COURS
              </h3>
              <button
                onClick={handleAddCours}
                className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <Plus className="w-4 h-4" />
                AJOUTER UN COURS
              </button>
            </div>

            <div className="space-y-3">
              {cours.map((coursItem, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={coursItem}
                    onChange={(e) => handleCoursChange(index, e.target.value)}
                    placeholder={`Cours ${index + 1}`}
                    className="flex-1 p-3 border-2 border-[#032622] bg-gray-100 text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  />
                  {cours.length > 1 && (
                    <button
                      onClick={() => handleRemoveCours(index)}
                      className="w-8 h-8 border-2 border-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-[#F8F5E4] transition-colors flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-[#032622]">
          <button
            onClick={handleSave}
            disabled={!titreModule.trim() || !cours.some(coursItem => coursItem.trim())}
            className="w-full bg-[#032622] text-[#F8F5E4] py-3 text-lg font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CRÉER LE MODULE
          </button>
        </div>
      </div>
    </div>
  );
};
