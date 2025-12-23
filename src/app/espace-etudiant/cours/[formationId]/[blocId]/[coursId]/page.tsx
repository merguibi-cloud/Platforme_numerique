'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { StudentCourseViewer } from '@/app/espace-etudiant/components/StudentCourseViewer';

interface CoursePageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    coursId: string;
  }>;
}

export default function StudentCoursePage({ params }: CoursePageProps) {
  const router = useRouter();
  const { formationId, blocId, coursId } = use(params);

  const handleBack = () => {
    router.push('/espace-etudiant/mes-formations');
  };

  return (
    <StudentCourseViewer
      coursId={parseInt(coursId, 10)}
      formationId={formationId}
      blocId={blocId}
      onBack={handleBack}
    />
  );
}

