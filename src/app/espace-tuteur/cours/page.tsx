'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolSelection, getSchoolConfig } from '@/app/espace-admin/gestion-formations/components/SchoolSelection';
import { FormationSelection } from '@/app/espace-admin/gestion-formations/components/FormationSelection';
import { BlocksListView } from '@/app/espace-admin/gestion-formations/components/BlocksListView';

interface Formation {
  id: number;
  titre: string;
  ecole: string;
  niveau: string;
  description?: string;
  image?: string;
  theme?: string;
}

export default function TutorCoursPage() {
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [error, setError] = useState('');

  // Charger les formations assignées au tuteur
  useEffect(() => {
    fetch('/api/espace-tuteur/formations', { credentials: 'include' })
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setFormations(result.formations || []);
          if (result.formations?.length > 0) {
            setSelectedSchool(result.formations[0].ecole);
          }
        } else {
          setError(result.error || 'Erreur lors du chargement des formations');
        }
      })
      .catch(() => setError('Erreur lors du chargement des formations'))
      .finally(() => setIsLoading(false));
  }, []);

  // Charger les blocs quand une formation est sélectionnée
  useEffect(() => {
    if (!selectedFormation) {
      setBlocks([]);
      return;
    }
    setIsLoadingBlocks(true);
    fetch(`/api/blocs?formationId=${selectedFormation}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setBlocks(data.blocs || []))
      .catch(() => setBlocks([]))
      .finally(() => setIsLoadingBlocks(false));
  }, [selectedFormation]);

  // Écoles uniques parmi les formations assignées
  const availableSchools = useMemo(() => {
    const schools = Array.from(new Set(formations.map((f) => f.ecole)));
    return schools.map((school) => {
      const config = getSchoolConfig(school);
      return {
        id: school,
        name: school,
        logo: config.logo,
        color: config.color,
        isSelected: school === selectedSchool,
      };
    });
  }, [formations, selectedSchool]);

  // Formations filtrées par école sélectionnée
  const availableFormations = useMemo(() => {
    if (!selectedSchool) return [];
    return formations
      .filter((f) => f.ecole === selectedSchool)
      .map((f) => ({
        id: f.id.toString(),
        level: f.niveau || 'FORMATION',
        levelCode: 'FORMATION',
        title: f.titre,
        isSelected: f.id.toString() === selectedFormation,
      }));
  }, [formations, selectedSchool, selectedFormation]);

  const currentFormation = availableFormations.find((f) => f.id === selectedFormation);

  const handleViewBlock = (blockId: string) => {
    if (selectedFormation) {
      router.push(`/espace-tuteur/cours/${selectedFormation}/${blockId}`);
    }
  };

  const handleEditBlock = (_blockId: string) => {
    if (selectedFormation) {
      router.push(`/espace-tuteur/cours/${selectedFormation}`);
    }
  };

  const handleAddBlock = async (blocData: { titre: string; description: string; modules: string[] }) => {
    if (!selectedFormation) return;
    try {
      await fetch('/api/blocs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...blocData, formation_id: parseInt(selectedFormation) }),
      });
      // Rafraîchir les blocs
      const r = await fetch(`/api/blocs?formationId=${selectedFormation}`, { credentials: 'include' });
      const data = await r.json();
      setBlocks(data.blocs || []);
    } catch {}
  };

  const handleDeleteBlock = (_blockId: string) => {
    if (selectedFormation) {
      router.push(`/espace-tuteur/cours/${selectedFormation}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#032622]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="bg-[#D96B6B] text-white p-4 border-2 border-[#032622] text-sm font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen">
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Titre */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MES FORMATIONS
        </h1>

        {formations.length === 0 ? (
          <div className="border-2 border-[#032622] p-8 text-center bg-[#F8F5E4]">
            <p
              className="text-[#032622] text-base font-semibold uppercase"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              Aucune formation assignée
            </p>
            <p className="text-[#032622]/60 text-sm mt-2">
              Contactez un administrateur pour qu&apos;il vous assigne des formations.
            </p>
          </div>
        ) : !selectedFormation ? (
          <>
            <SchoolSelection
              schools={availableSchools}
              onSchoolSelect={(school) => {
                setSelectedSchool(school);
                setSelectedFormation('');
              }}
            />
            <FormationSelection
              formations={availableFormations}
              onFormationSelect={(id) => setSelectedFormation(id)}
            />
          </>
        ) : (
          <BlocksListView
            formation={{
              id: selectedFormation,
              level: currentFormation?.level || 'FORMATION',
              levelCode: currentFormation?.levelCode || 'FORMATION',
              title: currentFormation?.title || 'FORMATION SÉLECTIONNÉE',
            }}
            blocks={isLoadingBlocks ? [] : blocks}
            onViewBlock={handleViewBlock}
            onEditBlock={handleEditBlock}
            onDeleteBlock={handleDeleteBlock}
            onAddBlock={handleAddBlock}
          />
        )}

        {/* Bouton retour quand une formation est sélectionnée */}
        {selectedFormation && (
          <button
            onClick={() => setSelectedFormation('')}
            className="text-sm text-[#032622] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            ← Retour aux formations
          </button>
        )}
      </div>
    </div>
  );
}
