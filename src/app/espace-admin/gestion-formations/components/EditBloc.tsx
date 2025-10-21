'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { BlocCompetence } from '@/types/formation-detailed';

interface EditBlocProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blocId: number, updates: { titre: string; description?: string; objectifs?: string[]; duree_estimee?: number }) => void;
  bloc: BlocCompetence | null;
}

export const EditBloc = ({ isOpen, onClose, onSave, bloc }: EditBlocProps) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [objectifs, setObjectifs] = useState<string[]>(['']);
  const [dureeEstimee, setDureeEstimee] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (bloc) {
      setTitre(bloc.titre);
      setDescription(bloc.description || '');
      setObjectifs(bloc.objectifs && bloc.objectifs.length > 0 ? bloc.objectifs : ['']);
      setDureeEstimee(bloc.duree_estimee || undefined);
    }
  }, [bloc]);

  const handleAddObjectif = () => {
    setObjectifs([...objectifs, '']);
  };

  const handleRemoveObjectif = (index: number) => {
    if (objectifs.length > 1) {
      setObjectifs(objectifs.filter((_, i) => i !== index));
    }
  };

  const handleObjectifChange = (index: number, value: string) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = value;
    setObjectifs(newObjectifs);
  };

  const handleSave = () => {
    if (!bloc || !titre.trim()) return;

    const updates = {
      titre: titre.trim(),
      description: description.trim() || null,
      objectifs: objectifs.filter(obj => obj.trim()).length > 0 ? objectifs.filter(obj => obj.trim()) : undefined,
      duree_estimee: dureeEstimee || undefined
    };

    onSave(bloc.id, updates);
    handleClose();
  };

  const handleClose = () => {
    setTitre('');
    setDescription('');
    setObjectifs(['']);
    setDureeEstimee(undefined);
    onClose();
  };

  if (!isOpen || !bloc) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#032622]">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            ÉDITER LE BLOC
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 border-2 border-[#032622] bg-[#032622] hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Titre du bloc */}
          <div className="space-y-2">
            <label 
              className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TITRE DU BLOC
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Nom du bloc de compétence"
              className="w-full p-4 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                DESCRIPTION
              </label>
              <span className={`text-xs ${description.length > 90 ? 'text-red-600' : description.length > 80 ? 'text-orange-600' : 'text-[#032622]/70'}`}>
                {description.length}/100 caractères
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Description du bloc de compétence (max 100 caractères)"
              rows={3}
              maxLength={100}
              className={`w-full p-4 border-2 bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                description.length > 90 
                  ? 'border-red-500 focus:ring-red-500' 
                  : description.length > 80 
                    ? 'border-orange-500 focus:ring-orange-500' 
                    : 'border-[#032622] focus:ring-[#032622]'
              }`}
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Durée estimée */}
          <div className="space-y-2">
            <label 
              className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              DURÉE ESTIMÉE (HEURES)
            </label>
            <input
              type="number"
              value={dureeEstimee || ''}
              onChange={(e) => setDureeEstimee(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Nombre d'heures"
              min="0"
              className="w-full p-4 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            />
          </div>

          {/* Objectifs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold text-[#032622] uppercase"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                OBJECTIFS
              </h3>
              <button
                onClick={handleAddObjectif}
                className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                AJOUTER UN OBJECTIF
              </button>
            </div>

            <div className="space-y-3">
              {objectifs.map((objectif, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={objectif}
                    onChange={(e) => handleObjectifChange(index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 p-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  />
                  {objectifs.length > 1 && (
                    <button
                      onClick={() => handleRemoveObjectif(index)}
                      className="w-8 h-8 border-2 border-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-[#F8F5E4] transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
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
            disabled={!titre.trim()}
            className="w-full bg-[#032622] text-[#F8F5E4] py-3 text-lg font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            <Save className="w-5 h-5" />
            SAUVEGARDER LES MODIFICATIONS
          </button>
        </div>
      </div>
    </div>
  );
};
