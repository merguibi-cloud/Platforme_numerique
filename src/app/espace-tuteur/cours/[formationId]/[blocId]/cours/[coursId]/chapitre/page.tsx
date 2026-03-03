'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CoursEditor } from '@/app/espace-admin/gestion-formations/components/CoursEditor';

interface EditCoursPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
  }>;
}

interface CoursInfo {
  titre: string;
  ordre_affichage: number;
  numero_cours: number;
  chapitres?: Array<{ id: number; titre: string }>;
}

interface BlocInfo {
  titre: string;
  numero_bloc: number;
}

export default function TutorEditCoursPage({ params }: EditCoursPageProps) {
  const { formationId, blocId, coursId } = use(params);
  const router = useRouter();
  const [coursInfo, setCoursInfo] = useState<CoursInfo | null>(null);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const BASE_PATH = '/espace-tuteur/cours';

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursResponse = await fetch(`/api/cours/${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (coursResponse.ok) {
          const coursData = await coursResponse.json();
          const cours = coursData.cours;
          setCoursInfo({
            titre: cours.titre,
            ordre_affichage: cours.ordre_affichage,
            numero_cours: cours.numero_cours,
            chapitres: cours.chapitres || [],
          });

          if (cours.chapitres && cours.chapitres.length > 0) {
            const premierChapitre = cours.chapitres[0];
            router.replace(
              `${BASE_PATH}/${formationId}/${blocId}/cours/${coursId}/chapitre/${premierChapitre.id}`
            );
            setShouldRedirect(true);
            return;
          }
        }

        const blocResponse = await fetch(`/api/blocs?formationId=${formationId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

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
  }, [coursId, blocId, formationId, router]);

  if (shouldRedirect || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#032622]/20 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#032622] mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-sm text-[#032622] font-bold mb-1.5" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {shouldRedirect ? 'REDIRECTION...' : 'CHARGEMENT DES INFORMATIONS'}
          </p>
          <p className="text-xs text-[#032622]/70">
            {shouldRedirect ? 'Redirection vers le premier chapitre...' : "Préparation de l'éditeur de cours..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CoursEditor
      chapitreId={undefined}
      coursId={parseInt(coursId, 10)}
      coursTitle={coursInfo?.titre || 'Chargement...'}
      blocTitle={blocInfo?.titre || 'Chargement...'}
      blocNumber={`BLOC ${blocInfo?.numero_bloc || ''}`}
      coursOrder={coursInfo?.numero_cours || 0}
      formationId={formationId}
      blocId={blocId}
      basePath={BASE_PATH}
    />
  );
}
