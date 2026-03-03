'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizEditorPage } from '@/app/espace-admin/gestion-formations/components/QuizEditorPage';
import { ArrowLeft } from 'lucide-react';

interface QuizPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
    chapitreId: string;
  }>;
}

export default function TutorQuizPage({ params }: QuizPageProps) {
  const { formationId, blocId, coursId, chapitreId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chapitreInfo, setChapitreInfo] = useState<any>(null);

  useEffect(() => {
    const loadChapitreInfo = async () => {
      try {
        const response = await fetch(`/api/chapitres?chapitreId=${chapitreId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setChapitreInfo(data.chapitre);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du chapitre:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChapitreInfo();
  }, [chapitreId]);

  const handleBack = () => {
    router.push(`/espace-tuteur/cours/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#032622] mx-auto mb-3"></div>
          <p className="text-xs sm:text-sm text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-[#032622] text-[#F8F5E4] hover:bg-[#032622]/80 transition-colors flex-shrink-0"
            title="Retour au chapitre"
            aria-label="Retour au chapitre"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              CRÉATION DE QUIZ DU CHAPITRE
            </h1>
            {chapitreInfo && (
              <p className="text-xs sm:text-sm text-[#032622]/70">{chapitreInfo.titre}</p>
            )}
          </div>
        </div>
      </div>

      <QuizEditorPage
        chapitreId={parseInt(chapitreId)}
        coursId={parseInt(coursId)}
        formationId={formationId}
        blocId={blocId}
        basePath="/espace-tuteur/cours"
      />
    </div>
  );
}
