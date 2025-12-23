'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Modal } from '@/app/Modal';

/**
 * Composant global pour gérer le modal de session expirée
 * Détecte les erreurs 401 et affiche le modal sur la page actuelle
 */
export function SessionExpiredModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Vérifier via les searchParams (pour les redirections depuis middleware/layouts)
    const sessionExpired = searchParams?.get('session_expired');
    if (sessionExpired === 'true') {
      setShowModal(true);
      // Nettoyer l'URL en retirant le paramètre
      const url = new URL(window.location.href);
      url.searchParams.delete('session_expired');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleOk = () => {
    setShowModal(false);
    // Rediriger vers la page principale sans déconnecter explicitement
    router.push('/');
  };

  if (!showModal) return null;

  return (
    <Modal
      isOpen={showModal}
      onClose={handleOk}
      title="Session expirée"
      message="Votre session a expiré. Vous allez être redirigé vers la page principale."
      type="warning"
    >
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleOk}
          className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
