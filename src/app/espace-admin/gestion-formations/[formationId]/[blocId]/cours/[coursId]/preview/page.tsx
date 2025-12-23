'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ModulePreviewViewer } from '@/app/espace-admin/gestion-formations/components/ModulePreview/ModulePreviewViewer';

interface PreviewPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
  }>;
}

export default function CoursPreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const { formationId, blocId, coursId } = use(params);

  const handleBack = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
  };

  return (
    <ModulePreviewViewer
      coursId={parseInt(coursId)}
      formationId={formationId}
      blocId={blocId}
      onBack={handleBack}
    />
  );
}

