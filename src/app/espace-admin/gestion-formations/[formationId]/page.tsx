'use client';

import { use } from 'react';
import { BlocManagement } from '../components/BlocManagement';

interface FormationDetailsPageProps {
  params: Promise<{
    formationId: string;
  }>;
}

export default function FormationDetailsPage({ params }: FormationDetailsPageProps) {
  const { formationId } = use(params);
  return <BlocManagement formationId={formationId} />;
}
