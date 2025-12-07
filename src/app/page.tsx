"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { OnlineHero } from './accueil/components/OnlineHero';
import { OnlineStats } from './accueil/components/OnlineStats';
import { CategoriesCards } from './accueil/components/CategoriesCards';
import { FeaturesGrid } from './accueil/components/FeaturesGrid';
import { FormationsGrid } from './accueil/components/FormationsGrid';
import FinanceSection from './accueil/components/FinanceSection';
import { AdmissionProcess } from './accueil/components/AdmissionProcess';
import { Events } from './accueil/components/Events';
import { Testimonials } from './accueil/components/Testimonials';
import { Formateur } from './accueil/components/Formateur';
import Partners from './accueil/components/Partners';
import { Improve } from './Improve';
import { Footer } from './Footer';
import { Modal } from './Modal';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  useEffect(() => {
    // Vérifier si le paramètre session_expired est présent
    const sessionExpired = searchParams.get('session_expired');
    if (sessionExpired === 'true') {
      setShowSessionExpiredModal(true);
      // Nettoyer l'URL en retirant le paramètre
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  const handleCloseModal = () => {
    setShowSessionExpiredModal(false);
  };

  const handleGoToLogin = () => {
    setShowSessionExpiredModal(false);
    // Ouvrir le modal de connexion en ajoutant le paramètre login
    router.push('/?login=true', { scroll: false });
  };

  return (
    <>
      <main className="min-h-screen">
        <Navbar />
        <OnlineHero />
        <OnlineStats />
        <FeaturesGrid />
        <CategoriesCards />
        <FormationsGrid />
        <Partners />
        <FinanceSection />
        <AdmissionProcess />
        <Events />
        <Formateur />
        <Testimonials />
        <Improve />
        <Footer />
      </main>

      <Modal
        isOpen={showSessionExpiredModal}
        onClose={handleCloseModal}
        title="Session expirée"
        message="Votre session a expiré. Veuillez vous reconnecter pour continuer à utiliser la plateforme."
        type="warning"
      >
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleCloseModal}
            className="bg-gray-500 text-white px-6 py-2 font-bold hover:bg-gray-600 transition-colors rounded"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            FERMER
          </button>
          <button
            onClick={handleGoToLogin}
            className="bg-[#032622] text-[#F8F5E4] px-6 py-2 font-bold hover:bg-[#032622]/90 transition-colors rounded"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            SE CONNECTER
          </button>
        </div>
      </Modal>
    </>
  );
}
