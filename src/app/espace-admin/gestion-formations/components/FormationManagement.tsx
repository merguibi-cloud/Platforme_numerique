'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getAllFormations } from '@/lib/formations';
import { Formation } from '@/types/formations';
import { SchoolSelection, getSchoolConfig } from './SchoolSelection';
import { FormationSelection } from './FormationSelection';
import AdminTopBar from '../../components/AdminTopBar';
import { BlocksListView } from './BlocksListView';

export const FormationManagement = () => {
  const router = useRouter();
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedFormation, setSelectedFormation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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
    // Rediriger vers la page de gestion des modules du bloc
    if (selectedFormation) {
      router.push(`/espace-admin/gestion-formations/${selectedFormation}/${blockId}`);
    }
  };

  const handleEditBlock = (blockId: string) => {
    // Rediriger vers la page de gestion des blocs
    // Note: L'édition sera gérée dans BlocManagement avec le modal EditBloc
    if (selectedFormation) {
      router.push(`/espace-admin/gestion-formations/${selectedFormation}`);
    }
  };

  const handleAddBlock = () => {
    // Rediriger vers la page de gestion des blocs pour ajouter un nouveau bloc
    if (selectedFormation) {
      router.push(`/espace-admin/gestion-formations/${selectedFormation}`);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    // Rediriger vers la page de gestion des blocs
    // Note: La suppression sera gérée dans BlocManagement avec le modal de confirmation
    if (selectedFormation) {
      router.push(`/espace-admin/gestion-formations/${selectedFormation}`);
    }
  };

  // Charger les blocs depuis la BDD
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  useEffect(() => {
    const loadBlocks = async () => {
      if (!selectedFormation) {
        setBlocks([]);
        return;
      }

      setIsLoadingBlocks(true);
      try {
        const response = await fetch(`/api/blocs?formationId=${selectedFormation}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocs || []);
        } else {
          setBlocks([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des blocs:', error);
        setBlocks([]);
      } finally {
        setIsLoadingBlocks(false);
      }
    };

    loadBlocks();
  }, [selectedFormation]);

  // Obtenir la formation sélectionnée
  const currentFormation = availableFormations.find(f => f.id === selectedFormation);

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Contenu principal */}
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header avec notifications et profil */}
          <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />

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
              blocks={blocks}
              onViewBlock={handleViewBlock}
              onEditBlock={handleEditBlock}
              onDeleteBlock={handleDeleteBlock}
              onAddBlock={handleAddBlock}
            />
          )}
        </div>
      </div>
    </div>
  );
};
