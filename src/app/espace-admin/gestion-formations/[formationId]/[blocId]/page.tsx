'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleManagement } from '../../components/ModuleManagement';
import { FormationHeader } from '../../components/FormationHeader';
import { BlocStats } from '../../components/BlocStats';

interface ModuleManagementPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
  }>;
}

interface ModuleWithStatus {
  id: string;
  type: string;
  matiere: string;
  creationModification?: string;
  creePar?: string;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
}

export default function ModuleManagementPage({ params }: ModuleManagementPageProps) {
  const router = useRouter();
  const { formationId, blocId } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<ModuleWithStatus[]>([]);

  useEffect(() => {
    // Simuler un chargement
    setTimeout(() => {
      setIsLoading(false);
      
      // Données de test pour vérifier que la vue fonctionne
      setModules([
        {
          id: '1',
          type: 'MODULE 1',
          matiere: 'CONTRIBUER À LA STRATÉGIE DE DÉVELOPPEMENT DE L\'ORGANISATION',
          creationModification: '25/05/24',
          creePar: 'JACQUES POTE',
          statut: 'en_ligne'
        },
        {
          id: '2',
          type: 'MODULE 2',
          matiere: 'DÉFINIR ET PLANIFIER DES ACTIONS MARKETING ET DE DÉVELOPPEMENT',
          creationModification: '25/05/24',
          creePar: 'JACQUES POTE',
          statut: 'en_ligne'
        },
        {
          id: '3',
          type: 'MODULE 3',
          matiere: 'PILOTER UN PROJET DE DÉVELOPPEMENT',
          creationModification: '15/03/23',
          creePar: 'JACQUES POTE',
          statut: 'brouillon'
        },
        {
          id: '4',
          type: 'MODULE 4',
          matiere: 'CONTRIBUER À LA STRATÉGIE DE DÉVELOPPEMENT DE L\'ORGANISATION',
          statut: 'manquant'
        },
        {
          id: '5',
          type: 'MODULE 5',
          matiere: 'DÉFINIR ET PLANIFIER DES ACTIONS MARKETING ET DE DÉVELOPPEMENT',
          statut: 'manquant'
        },
        {
          id: '6',
          type: 'MODULE 6',
          matiere: 'DÉFINIR ET PLANIFIER DES ACTIONS MARKETING ET DE DÉVELOPPEMENT',
          statut: 'manquant'
        }
      ]);
    }, 1000);
  }, [formationId, blocId]);

  const handleAddModule = async (moduleData: { titre: string; cours: string[] }) => {
    console.log('Ajouter module:', moduleData);
    // TODO: Implémenter l'ajout réel du module
  };

  const handleEditModule = (moduleId: string) => {
    console.log('Éditer le module:', moduleId);
  };

  const handleAddQuiz = (moduleId: string) => {
    console.log('Ajouter quiz au module:', moduleId);
  };

  const handleAssignModule = (moduleId: string) => {
    console.log('Attribuer le module:', moduleId);
  };

  const handleBackToBlocs = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement des modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <div className="flex-1 p-6">
        <div className="space-y-8">
          <FormationHeader />
          
          <div className="space-y-4">
            <button
              onClick={handleBackToBlocs}
              className="text-[#032622] hover:text-[#032622]/70 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux blocs
            </button>
            
            {/* Statistiques du bloc */}
            <BlocStats 
              blocId={parseInt(blocId)} 
              blocTitle="CONTRIBUER À LA STRATÉGIE DE DÉVELOPPEMENT DE L'ORGANISATION"
            />
            
            <ModuleManagement
              blocTitle="CONTRIBUER À LA STRATÉGIE DE DÉVELOPPEMENT DE L'ORGANISATION"
              blocNumber="BLOC-1"
              modules={modules}
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onAddQuiz={handleAddQuiz}
              onAssignModule={handleAssignModule}
            />
          </div>
        </div>
      </div>
    </div>
  );
}