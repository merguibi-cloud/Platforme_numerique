'use client';

import { use, useState, useEffect } from 'react';
import { CoursEditor } from '@/app/espace-admin/gestion-formations/components/CoursEditor';

interface EditChapitrePageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
    chapitreId: string;
  }>;
}

interface CoursInfo {
  titre: string;
  ordre_affichage: number;
  numero_cours: number;
}

interface BlocInfo {
  titre: string;
  numero_bloc: number;
}

export default function TutorEditChapitrePage({ params }: EditChapitrePageProps) {
  const { formationId, blocId, coursId, chapitreId } = use(params);
  const [coursInfo, setCoursInfo] = useState<CoursInfo | null>(null);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursResponse, blocResponse] = await Promise.all([
          fetch(`/api/cours/${coursId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch(`/api/blocs?formationId=${formationId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        if (coursResponse.ok) {
          const coursData = await coursResponse.json();
          setCoursInfo({
            titre: coursData.cours.titre,
            ordre_affichage: coursData.cours.ordre_affichage,
            numero_cours: coursData.cours.numero_cours,
          });
        }

        if (blocResponse.ok) {
          const blocData = await blocResponse.json();
          const bloc = blocData.blocs?.find((b: any) => b.id.toString() === blocId);
          if (bloc) {
            setBlocInfo({ titre: bloc.titre, numero_bloc: bloc.numero_bloc });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [coursId, blocId, formationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#032622]/20 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#032622] mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-sm text-[#032622] font-bold mb-1.5" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            CHARGEMENT DES INFORMATIONS
          </p>
          <p className="text-xs text-[#032622]/70">Préparation de l'éditeur de cours...</p>
        </div>
      </div>
    );
  }

  return (
    <CoursEditor
      chapitreId={parseInt(chapitreId, 10)}
      coursId={parseInt(coursId, 10)}
      coursTitle={coursInfo?.titre || 'Chargement...'}
      blocTitle={blocInfo?.titre || 'Chargement...'}
      blocNumber={`BLOC ${blocInfo?.numero_bloc || ''}`}
      coursOrder={coursInfo?.numero_cours || 0}
      formationId={formationId}
      blocId={blocId}
      basePath="/espace-tuteur/cours"
    />
  );
}
