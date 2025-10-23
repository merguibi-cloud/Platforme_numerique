'use client';

import { use, useState, useEffect } from 'react';
import { CoursEditor } from '../../../../../components/CoursEditor';

interface CreateCoursPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    moduleId: string;
  }>;
}

interface ModuleInfo {
  titre: string;
  ordre_affichage: number;
  numero_module: number;
}

interface BlocInfo {
  titre: string;
  numero_bloc: number;
}

export default function CreateCoursPage({ params }: CreateCoursPageProps) {
  const { formationId, blocId, moduleId } = use(params);
  const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les informations du module
        const moduleResponse = await fetch(`/api/modules/${moduleId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json();
          setModuleInfo({
            titre: moduleData.module.titre,
            ordre_affichage: moduleData.module.ordre_affichage,
            numero_module: moduleData.module.numero_module
          });
        } else {
          console.error('Erreur lors du chargement du module:', await moduleResponse.text());
        }

        // Charger les informations du bloc
        const blocResponse = await fetch(`/api/blocs?formationId=${formationId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (blocResponse.ok) {
          const blocData = await blocResponse.json();
          const bloc = blocData.blocs?.find((b: any) => b.id.toString() === blocId);
          if (bloc) {
            setBlocInfo({
              titre: bloc.titre,
              numero_bloc: bloc.numero_bloc
            });
          }
        } else {
          console.error('Erreur lors du chargement du bloc:', await blocResponse.text());
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [formationId, blocId, moduleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <CoursEditor
      moduleId={parseInt(moduleId)}
      moduleTitle={moduleInfo?.titre || "Chargement..."}
      blocTitle={blocInfo?.titre || "Chargement..."}
      blocNumber={`BLOC ${blocInfo?.numero_bloc || ""}`}
      moduleOrder={moduleInfo?.ordre_affichage || moduleInfo?.numero_module || 1}
    />
  );
}
