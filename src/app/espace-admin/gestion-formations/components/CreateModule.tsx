'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface CreateModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: { titre?: string; cours: Array<{ id?: number; titre: string }>; moduleId?: string }) => void;
  existingModules?: Array<{ id: string; titre: string }>;
  preselectedCoursId?: string | null;
  addChapitreOnly?: boolean; // Mode "ajout de chapitre uniquement" - désactive les champs de création de cours
}

interface ChapitreItem {
  id?: number;
  titre: string;
  isNew?: boolean;
}

export const CreateModule = ({ isOpen, onClose, onSave, existingModules = [], preselectedCoursId = null, addChapitreOnly = false }: CreateModuleProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [titreCours, setTitreCours] = useState('');
  const [chapitres, setChapitres] = useState<ChapitreItem[]>([{ titre: '', isNew: true }]);
  const [isLoadingChapitres, setIsLoadingChapitres] = useState(false);

  // Charger les chapitres d'un cours existant
  const loadChapitres = async (coursId: string) => {
    setIsLoadingChapitres(true);
    try {
      const response = await fetch(`/api/chapitres?coursId=${coursId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const chapitresList = data.chapitres || [];
        
        // Convertir les chapitres en format ChapitreItem
        // IMPORTANT: Ne jamais utiliser le titre du cours comme titre de chapitre
        const formattedChapitres: ChapitreItem[] = chapitresList.map((ch: any) => ({
          id: ch.id,
          titre: (ch.titre && ch.titre.trim()) || '', // S'assurer que le titre n'est pas vide ou juste des espaces
          isNew: false,
        }));

        // Si aucun chapitre, ajouter un champ vide pour en créer un nouveau
        if (formattedChapitres.length === 0) {
          setChapitres([{ titre: '', isNew: true }]);
        } else {
          setChapitres(formattedChapitres);
        }
      } else {
        console.error('Erreur lors du chargement des chapitres');
        setChapitres([{ titre: '', isNew: true }]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des chapitres:', error);
      setChapitres([{ titre: '', isNew: true }]);
    } finally {
      setIsLoadingChapitres(false);
    }
  };

  const handleAddChapitre = () => {
    setChapitres([...chapitres, { titre: '', isNew: true }]);
  };

  const handleRemoveChapitre = (index: number) => {
    if (chapitres.length > 1) {
      setChapitres(chapitres.filter((_, i) => i !== index));
    }
  };

  const handleChapitreChange = (index: number, value: string) => {
    const newChapitres = [...chapitres];
    newChapitres[index] = {
      ...newChapitres[index],
      titre: value,
    };
    setChapitres(newChapitres);
  };

  const handleSave = () => {
    const hasExistingModule = Boolean(selectedModuleId);
    const coursTitle = titreCours.trim();

    // Filtrer les chapitres vides et garder les IDs pour les chapitres existants
    // IMPORTANT: Ne jamais utiliser le titre du cours comme titre de chapitre
    const chapitresData = chapitres
      .filter(chapitre => chapitre.titre && chapitre.titre.trim())
      .map(chapitre => ({
        id: chapitre.id,
        titre: chapitre.titre.trim(), // Utiliser uniquement le titre du chapitre, jamais le titre du cours
      }));

    // Validation: s'assurer qu'on a au moins un chapitre avec un titre valide
    if (chapitresData.length === 0) {
      console.error('Aucun chapitre valide à sauvegarder');
      return;
    }

    // Pour un cours existant, le titre n'est pas nécessaire car il est déjà dans la base
    // Pour un nouveau cours, le titre est requis
    // En mode "ajout de chapitre uniquement", on peut sauvegarder sans titre de cours
    if ((coursTitle || hasExistingModule || addChapitreOnly) && chapitresData.length > 0) {
      onSave({
        titre: coursTitle || (addChapitreOnly ? '' : undefined), // En mode addChapitreOnly, envoyer une chaîne vide
        cours: chapitresData,
        moduleId: hasExistingModule ? selectedModuleId : (addChapitreOnly && preselectedCoursId ? preselectedCoursId : undefined)
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedModuleId('');
    setTitreCours('');
    setChapitres([{ titre: '', isNew: true }]);
    setIsLoadingChapitres(false);
    onClose();
  };

  // Charger les chapitres quand un cours existant est sélectionné
  useEffect(() => {
    if (selectedModuleId) {
      loadChapitres(selectedModuleId);
    } else {
      // Réinitialiser les chapitres si aucun cours n'est sélectionné
      setChapitres([{ titre: '', isNew: true }]);
    }
  }, [selectedModuleId]);

  // Pré-sélectionner le cours si fourni
  useEffect(() => {
    if (isOpen && preselectedCoursId) {
      setSelectedModuleId(preselectedCoursId);
      setTitreCours(''); // Vider le champ titre car le cours est déjà sélectionné
      // Charger les chapitres existants si en mode "ajout de chapitre uniquement"
      if (addChapitreOnly) {
        loadChapitres(preselectedCoursId);
      }
    } else if (!isOpen) {
      // Réinitialiser quand le modal se ferme
      setSelectedModuleId('');
      setTitreCours('');
      setChapitres([{ titre: '', isNew: true }]);
    }
  }, [isOpen, preselectedCoursId, addChapitreOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#032622]">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {addChapitreOnly || selectedModuleId ? 'AJOUTER UN CHAPITRAGE' : 'CRÉATION D\'UN COURS'}
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
          {/* Cours - Masqué en mode "ajout de chapitre uniquement" */}
          {!addChapitreOnly && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label 
                  className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  COURS
                </label>
                <input
                  type="text"
                  value={titreCours}
                  onChange={(e) => {
                    setTitreCours(e.target.value);
                    setSelectedModuleId('');
                  }}
                  placeholder={selectedModuleId ? "Cours sélectionné ci-dessous" : "Nom du cours"}
                  disabled={!!selectedModuleId}
                  className="w-full p-4 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent disabled:bg-gray-200 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                />
              </div>

              {existingModules.length > 0 && (
                <div className="space-y-2">
                  <label 
                    className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    COURS EXISTANT
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedModuleId(value);
                      const selectedModule = existingModules.find((module) => module.id === value);
                      if (selectedModule) {
                        // Ne pas modifier titreCours quand on sélectionne un cours existant
                        // Le titre du cours est déjà dans le select, pas besoin de le mettre dans le champ input
                        // setTitreCours(selectedModule.titre);
                      } else {
                        setTitreCours('');
                        setChapitres([{ titre: '', isNew: true }]);
                      }
                    }}
                    className="w-full p-4 border-2 border-[#032622] bg-gray-100 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                    disabled={isLoadingChapitres || !!preselectedCoursId}
                  >
                    <option value="">Sélectionner un cours existant</option>
                    {existingModules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.titre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Afficher le cours sélectionné en mode "ajout de chapitre uniquement" */}
          {addChapitreOnly && preselectedCoursId && existingModules.length > 0 && (
            <div className="space-y-2">
              <label 
                className="text-sm font-semibold text-[#032622] uppercase tracking-wider underline"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                COURS
              </label>
              <input
                type="text"
                value={existingModules.find(m => m.id === preselectedCoursId)?.titre || ''}
                disabled
                className="w-full p-4 border-2 border-[#032622] bg-gray-200 text-[#032622] cursor-not-allowed"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              />
            </div>
          )}

          {/* Chapitres */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-lg font-semibold text-[#032622] uppercase"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                CHAPITRES
              </h3>
              <button
                onClick={handleAddChapitre}
                className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <Plus className="w-4 h-4" />
                AJOUTER UN CHAPITRE
              </button>
            </div>

            {isLoadingChapitres ? (
              <div className="text-center py-4 text-[#032622]">
                <p style={{ fontFamily: 'var(--font-termina-medium)' }}>Chargement des chapitres...</p>
              </div>
            ) : (
            <div className="space-y-3">
                {chapitres.map((chapitreItem, index) => (
                  <div key={chapitreItem.id || `new-${index}`} className="flex items-center gap-3">
                  <input
                    type="text"
                      value={chapitreItem.titre}
                      onChange={(e) => handleChapitreChange(index, e.target.value)}
                      placeholder={chapitreItem.isNew ? `Nouveau chapitre ${index + 1}` : `Chapitre ${index + 1}`}
                      className="flex-1 p-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  />
                    {!chapitreItem.isNew && (
                      <span className="text-xs text-gray-500 px-2" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                        Existant
                      </span>
                    )}
                    {chapitres.length > 1 && (
                    <button
                        onClick={() => handleRemoveChapitre(index)}
                      className="w-8 h-8 border-2 border-[#032622] bg-[#032622] hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center justify-center"
                        title={chapitreItem.isNew ? 'Supprimer ce chapitre' : 'Supprimer ce chapitre (sera supprimé lors de la sauvegarde)'}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-[#032622]">
          <button
            onClick={handleSave}
            disabled={
              (!addChapitreOnly && !(titreCours.trim() || selectedModuleId)) ||
              !chapitres.some(chapitreItem => chapitreItem.titre.trim()) ||
              isLoadingChapitres ||
              (addChapitreOnly && !selectedModuleId && !preselectedCoursId)
            }
            className="w-full bg-[#032622] text-[#F8F5E4] py-3 text-lg font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {addChapitreOnly || selectedModuleId ? 'AJOUTER LES CHAPITRES' : 'CRÉER LE COURS'}
          </button>
        </div>
      </div>
    </div>
  );
};
