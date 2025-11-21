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
    moduleId: string;
    coursId: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { formationId, blocId, moduleId, coursId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [coursInfo, setCoursInfo] = useState<any>(null);

  useEffect(() => {
    const loadCoursInfo = async () => {
      try {
        const response = await fetch(`/api/chapitres?chapitreId=${coursId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setCoursInfo(data.cours);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du cours:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCoursInfo();
  }, [coursId]);

  const handleBack = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${moduleId}/cours/${coursId}`);
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
              title="Retour au cours"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                CRÉATION DE QUIZ DE LA PARTIE
              </h1>
              {coursInfo && (
                <p className="text-sm text-[#032622]/70">{coursInfo.titre}</p>
              )}
            </div>
          </div>
          <AdminTopBar notificationCount={0} />
        </div>
      </div>

      {/* Quiz Editor */}
      <QuizEditorPage
        chapitreId={parseInt(coursId, 10)}
        coursId={parseInt(moduleId, 10)}
        formationId={formationId}
        blocId={blocId}
      />
    </div>
  );
}

