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
    moduleId: string;
  }>;
}

export default function EtudeCasPage({ params }: EtudeCasPageProps) {
  const router = useRouter();
  const { formationId, blocId, moduleId } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleInfo, setModuleInfo] = useState<any>(null);
  const [hasEtudeCas, setHasEtudeCas] = useState(false);

  useEffect(() => {
    const loadModuleInfo = async () => {
      try {
        const response = await fetch(`/api/cours/${moduleId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setModuleInfo(data.module);
        }
        
        // Vérifier si une étude de cas existe pour ce cours
        const etudeCasResponse = await fetch(`/api/etude-cas?coursId=${moduleId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (etudeCasResponse.ok) {
          const etudeCasData = await etudeCasResponse.json();
          setHasEtudeCas(!!etudeCasData.etudeCas);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du module:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModuleInfo();
  }, [moduleId]);

  const handleBack = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
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
              title="Retour aux modules"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                {hasEtudeCas ? 'ÉDITION DE L\'ÉTUDE DE CAS' : 'CRÉATION DE L\'ÉTUDE DE CAS'}
              </h1>
              {moduleInfo && (
                <p className="text-sm text-[#032622]/70">{moduleInfo.titre}</p>
              )}
            </div>
          </div>
          <AdminTopBar notificationCount={0} />
        </div>
      </div>

      {/* Etude Cas Editor */}
      <EtudeCasEditorPage
        coursId={parseInt(moduleId, 10)}
        formationId={formationId}
        blocId={blocId}
      />
    </div>
  );
}

