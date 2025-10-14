"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/app/Navbar';
import { Hero } from './components/Hero';
import { Accueil } from './components/Accueil';
import { Information } from './components/Information';
import { Documents } from './components/Documents';
import { Contrat } from './components/Contrat';
import { Validation } from './components/Validation';
import { getCurrentUser } from '@/lib/auth-api';
import { getUserFormationData, UserFormationData } from '@/lib/user-formations';

const ValidationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [formationData, setFormationData] = useState<UserFormationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Déterminer l'état initial basé sur l'URL
  const currentStep = searchParams.get('step');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Vérification utilisateur
      const userResult = await getCurrentUser();
      // Résultat authentification
      
      if (!userResult.success || !userResult.user) {
        // Utilisateur non authentifié
        return;
      }

      setUser(userResult.user);
      // Utilisateur authentifié

      // Charger les données de formation
      const formationResult = await getUserFormationData();
      if (formationResult.success && formationResult.data) {
        setFormationData(formationResult.data);
        // Données formation chargées
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#032622] mb-2">Accès refusé</h1>
          <p className="text-[#032622] mb-4">Vous devez d'abord vous connecter pour accéder à votre espace.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#032622]/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const handleStartApplication = () => {
    router.push('/validation?step=informations');
  };

  const handleCloseCandidatureForm = () => {
    router.push('/validation');
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'informations':
        router.push('/validation?step=documents');
        break;
      case 'documents':
        router.push('/validation?step=contrat');
        break;
      case 'contrat':
        router.push('/validation?step=validation');
        break;
      default:
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'documents':
        router.push('/validation?step=informations');
        break;
      case 'contrat':
        router.push('/validation?step=documents');
        break;
      case 'validation':
        router.push('/validation?step=contrat');
        break;
      default:
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'informations':
        return (
          <Information 
            onClose={handleCloseCandidatureForm}
            userEmail={user?.email || ''}
            formationData={formationData}
          />
        );
      case 'documents':
        return (
          <Documents 
            onClose={handleCloseCandidatureForm}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 'contrat':
        return (
          <Contrat 
            onClose={handleCloseCandidatureForm}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 'validation':
        return (
          <Validation 
            onClose={handleCloseCandidatureForm}
            onPrev={handlePrevStep}
          />
        );
      default:
        return (
          <Accueil
            userEmail={user.email}
            onStartApplication={handleStartApplication}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      {renderCurrentStep()}
    </div>
  );
};

export default function ValidationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement...</p>
        </div>
      </div>
    }>
      <ValidationContent />
    </Suspense>
  );
}