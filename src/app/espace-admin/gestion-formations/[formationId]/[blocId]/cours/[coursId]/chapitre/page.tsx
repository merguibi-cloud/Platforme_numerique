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

export default function EditCoursPage({ params }: EditCoursPageProps) {
  const { formationId, blocId, coursId } = use(params);
  const router = useRouter();
  const [coursInfo, setCoursInfo] = useState<CoursInfo | null>(null);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les informations du cours avec ses chapitres
        const coursResponse = await fetch(`/api/cours/${coursId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (coursResponse.ok) {
          const coursData = await coursResponse.json();
          const cours = coursData.cours;
          setCoursInfo({
            titre: cours.titre,
            ordre_affichage: cours.ordre_affichage,
            numero_cours: cours.numero_cours,
            chapitres: cours.chapitres || []
          });

          // Si le cours a des chapitres, rediriger vers le premier
          if (cours.chapitres && cours.chapitres.length > 0) {
            const premierChapitre = cours.chapitres[0];
            router.replace(
              `/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${premierChapitre.id}`
            );
            setShouldRedirect(true);
            return;
          }
        } else {
          console.error('Erreur lors du chargement du cours');
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
          } else {
            console.error('Bloc non trouvé');
          }
        } else {
          console.error('Erreur lors du chargement du bloc');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
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
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-[#032622]/20 mx-auto mb-4 sm:mb-5 md:mb-6"></div>
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-t-4 border-[#032622] mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-[#032622] font-bold mb-1.5 sm:mb-2 break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {shouldRedirect ? 'REDIRECTION...' : 'CHARGEMENT DES INFORMATIONS'}
          </p>
          <p className="text-xs sm:text-sm text-[#032622]/70 break-words" style={{ fontFamily: 'var(--font-rota-medium)' }}>
            {shouldRedirect ? 'Redirection vers le premier chapitre...' : 'Préparation de l\'éditeur de cours...'}
          </p>
          <div className="mt-4 sm:mt-5 md:mt-6 flex items-center justify-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Si aucun chapitre, afficher le CoursEditor pour créer le premier chapitre
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
    />
  );
}

