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

export default function EditChapitrePage({ params }: EditChapitrePageProps) {
  const { formationId, blocId, coursId, chapitreId } = use(params);
  const [coursInfo, setCoursInfo] = useState<CoursInfo | null>(null);
  const [blocInfo, setBlocInfo] = useState<BlocInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les informations du cours
        const coursResponse = await fetch(`/api/cours/${coursId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (coursResponse.ok) {
          const coursData = await coursResponse.json();
          setCoursInfo({
            titre: coursData.cours.titre,
            ordre_affichage: coursData.cours.ordre_affichage,
            numero_cours: coursData.cours.numero_cours
          });
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
  }, [coursId, blocId, formationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#032622]/20 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#032622] mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-[#032622] text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            CHARGEMENT DES INFORMATIONS
          </p>
          <p className="text-[#032622]/70 text-sm" style={{ fontFamily: 'var(--font-rota-medium)' }}>
            Préparation de l'éditeur de cours...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#032622] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
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
    />
  );
}

