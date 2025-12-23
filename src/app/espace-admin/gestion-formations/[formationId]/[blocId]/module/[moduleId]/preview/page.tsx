'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ModulePreviewViewer } from '@/app/espace-admin/gestion-formations/components/ModulePreview/ModulePreviewViewer';

interface PreviewPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    moduleId: string;
  }>;
}

export default function ModulePreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const { formationId, blocId, moduleId } = use(params);

  const handleBack = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
  };

  return (
    <ModulePreviewViewer
      coursId={parseInt(moduleId, 10)}
      formationId={formationId}
      blocId={blocId}
      onBack={handleBack}
    />
  );
}

