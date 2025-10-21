'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllFormations } from '@/lib/formations';
import { Formation } from '@/types/formations';
import { SchoolSelection, getSchoolConfig } from './SchoolSelection';
import { FormationSelection } from './FormationSelection';
import { FormationHeader } from './FormationHeader';
import { BlocksListView } from './BlocksListView';
import { Modal } from '../../../validation/components/Modal';

export const FormationManagement = () => {
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedFormation, setSelectedFormation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les modals
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Charger toutes les formations au montage du composant
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const formations = await getAllFormations();
        setAllFormations(formations);
        
        // Définir la première école comme sélectionnée par défaut
        if (formations.length > 0) {
          const firstSchool = formations[0].ecole;
          setSelectedSchool(firstSchool);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Obtenir les écoles uniques disponibles avec leurs logos et couleurs
  const availableSchools = useMemo(() => {
    const schools = Array.from(new Set(allFormations.map(f => f.ecole)));
    return schools.map(school => {
      // Mapping des écoles vers leurs logos et couleurs
      const schoolConfig = getSchoolConfig(school);
      return {
        id: school,
        name: school,
        logo: schoolConfig.logo,
        color: schoolConfig.color,
        isSelected: school === selectedSchool
      };
    });
  }, [allFormations, selectedSchool]);

  // Obtenir les formations filtrées par école sélectionnée
  const availableFormations = useMemo(() => {
    if (!selectedSchool) return [];
    const filteredFormations = allFormations
      .filter(f => f.ecole === selectedSchool)
      .map(formation => ({
        id: formation.id.toString(),
        level: formation.niveau || 'FORMATION',
        levelCode: 'FORMATION',
        title: formation.titre,
        isSelected: formation.id.toString() === selectedFormation
      }));
    
    console.log('Formations disponibles pour école', selectedSchool, ':', filteredFormations);
    return filteredFormations;
  }, [allFormations, selectedSchool, selectedFormation]);

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedFormation(''); // Reset formation selection
  };

  const handleFormationSelect = (formationId: string) => {
    setSelectedFormation(formationId);
  };

  const handleViewBlock = (blockId: string) => {
    setModalTitle('Voir le bloc');
    setModalMessage(`Vous voulez voir les détails du bloc ${blockId}. Cette fonctionnalité sera bientôt disponible.`);
    setShowInfoModal(true);
  };

  const handleEditBlock = (blockId: string) => {
    setModalTitle('Éditer le bloc');
    setModalMessage(`Vous voulez éditer le bloc ${blockId}. Cette fonctionnalité sera bientôt disponible.`);
    setShowInfoModal(true);
  };

  const handleAddBlock = () => {
    setModalTitle('Ajouter un bloc');
    setModalMessage('Vous voulez ajouter un nouveau bloc à cette formation. Cette fonctionnalité sera bientôt disponible.');
    setShowInfoModal(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    setModalTitle('Supprimer le bloc');
    setModalMessage(`Vous voulez supprimer le bloc ${blockId}. Cette fonctionnalité sera bientôt disponible.`);
    setShowInfoModal(true);
  };

  const handleModalClose = () => {
    setShowInfoModal(false);
    setModalMessage('');
    setModalTitle('');
  };

  // Données temporaires pour les blocs
  const mockBlocks = [
    {
      id: 1,
      formation_id: parseInt(selectedFormation) || 1,
      numero_bloc: 1,
      titre: 'BLOC 1',
      description: 'CONTRIBUER À LA STRATÉGIE DE DÉVELOPPEMENT DE L\'ORGANISATION',
      ordre_affichage: 1,
      actif: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      formation_id: parseInt(selectedFormation) || 1,
      numero_bloc: 2,
      titre: 'BLOC 2',
      description: 'DÉFINIR ET PLANIFIER DES ACTIONS MARKETING ET DE DÉVELOPPEMENT',
      ordre_affichage: 2,
      actif: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      formation_id: parseInt(selectedFormation) || 1,
      numero_bloc: 3,
      titre: 'BLOC 3',
      description: 'PILOTER UN PROJET DE DÉVELOPPEMENT',
      ordre_affichage: 3,
      actif: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      formation_id: parseInt(selectedFormation) || 1,
      numero_bloc: 4,
      titre: 'BLOC 4',
      description: 'MANAGER DURABLEMENT UNE ÉQUIPE DANS LE CADRE DU DÉVELOPPEMENT',
      ordre_affichage: 4,
      actif: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Obtenir la formation sélectionnée
  const currentFormation = availableFormations.find(f => f.id === selectedFormation);

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="space-y-8">
          {/* Header avec notifications et profil */}
          <FormationHeader />

          {!selectedFormation ? (
            <>
              {/* Section CHOISIS L'ÉCOLE */}
              <SchoolSelection 
                schools={availableSchools}
                onSchoolSelect={handleSchoolSelect}
              />

              {/* Section CHOISIS LA FORMATION */}
              <FormationSelection 
                formations={availableFormations}
                onFormationSelect={handleFormationSelect}
              />
            </>
          ) : (
            <BlocksListView
              formation={{
                id: selectedFormation,
                level: currentFormation?.level || 'FORMATION',
                levelCode: currentFormation?.levelCode || 'FORMATION',
                title: currentFormation?.title || 'FORMATION SÉLECTIONNÉE'
              }}
              blocks={mockBlocks}
              onViewBlock={handleViewBlock}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
              onAddBlock={handleAddBlock}
            />
          )}
        </div>
      </div>

      {/* Modal d'information */}
      <Modal
        isOpen={showInfoModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        type="info"
        isConfirm={false}
      />
    </div>
  );
};
