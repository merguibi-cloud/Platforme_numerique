'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EtudeCasEditorPage } from '@/app/espace-admin/gestion-formations/components/EtudeCasEditorPage';
import AdminTopBar from '@/app/espace-admin/components/AdminTopBar';
import { ArrowLeft } from 'lucide-react';

interface EtudeCasPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
    chapitreId: string;
  }>;
}

export default function EtudeCasPage({ params }: EtudeCasPageProps) {
  const router = useRouter();
  const { formationId, blocId, coursId, chapitreId } = use(params);
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
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-[#032622] break-words">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-[#032622] text-[#F8F5E4] rounded hover:bg-[#032622]/80 active:bg-[#032622]/70 transition-colors flex-shrink-0"
              title="Retour au chapitre"
              aria-label="Retour au chapitre"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#032622] break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                CRÉATION DE L'ÉTUDE DE CAS
              </h1>
              {chapitreInfo && (
                <p className="text-xs sm:text-sm text-[#032622]/70 break-words">{chapitreInfo.titre}</p>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <AdminTopBar notificationCount={0} />
          </div>
        </div>
      </div>

      {/* Etude Cas Editor */}
      <EtudeCasEditorPage
        coursId={parseInt(coursId)}
        formationId={formationId}
        blocId={blocId}
      />
    </div>
  );
}

