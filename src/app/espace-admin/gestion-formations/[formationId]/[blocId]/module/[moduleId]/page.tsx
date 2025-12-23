'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface ModuleViewerPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    moduleId: string;
  }>;
}

export default function ModuleViewerPage({ params }: ModuleViewerPageProps) {
  const router = useRouter();
  const { formationId, blocId } = use(params);

  // Redirection automatique vers la page du bloc
  useEffect(() => {
    router.replace(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
  }, [formationId, blocId, router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
        <p className="text-[#032622]">Redirection...</p>
      </div>
    </div>
  );
}
