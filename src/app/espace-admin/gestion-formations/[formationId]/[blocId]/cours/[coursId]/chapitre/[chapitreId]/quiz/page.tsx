'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizEditorPage } from '@/app/espace-admin/gestion-formations/components/QuizEditorPage';
import AdminTopBar from '@/app/espace-admin/components/AdminTopBar';
import { ArrowLeft } from 'lucide-react';

interface QuizPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
    chapitreId: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
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
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${coursId}/chapitre/${chapitreId}`);
  };

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
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 bg-[#032622] text-[#F8F5E4] rounded hover:bg-[#032622]/80 transition-colors"
              title="Retour au chapitre"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                CRÉATION DE QUIZ DU CHAPITRE
              </h1>
              {chapitreInfo && (
                <p className="text-sm text-[#032622]/70">{chapitreInfo.titre}</p>
              )}
            </div>
          </div>
          <AdminTopBar notificationCount={0} />
        </div>
      </div>

      {/* Quiz Editor */}
      <QuizEditorPage
        chapitreId={parseInt(chapitreId)}
        coursId={parseInt(coursId)}
        formationId={formationId}
        blocId={blocId}
      />
    </div>
  );
}

