'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EtudiantsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/espace-tuteur/mes-etudiants');
  }, [router]);
  return null;
}
