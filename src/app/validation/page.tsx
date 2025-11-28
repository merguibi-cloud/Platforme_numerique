"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/app/Navbar';
import { Hero } from './components/Hero';
import { Accueil } from './components/Accueil';
import { Information } from './components/Information';
import { Documents } from './components/Documents';
import { Recap } from './components/Recap';
import { Validation } from './components/Validation';
import ContratStep from './components/ContratStep';
import PaiementFraisScolarite from './components/PaiementFraisScolarite';
import { getCurrentUser, getSessionRole } from '@/lib/auth-api';
import { getUserFormationData, UserFormationData } from '@/lib/user-formations';
import { CandidatureProvider, useCandidature } from '@/contexts/CandidatureContext';
import { StudentGuard } from '@/components/RoleGuard';

const ValidationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { candidatureData, isLoading: isCandidatureLoading } = useCandidature();
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
      const sessionResult = await getSessionRole();

      if (!sessionResult.success || !sessionResult.role) {
        router.replace('/');
        setIsLoading(false);
        return;
      }

      if (sessionResult.role !== 'validation') {
        router.replace(sessionResult.redirectTo ?? '/');
        setIsLoading(false);
        return;
      }

      // Vérification utilisateur
      const userResult = await getCurrentUser();
      
      if (!userResult.success || !userResult.user) {
        return;
      }

      setUser(userResult.user);

      // Charger les données de formation
      const formationResult = await getUserFormationData();
      if (formationResult.success && formationResult.data) {
        setFormationData(formationResult.data);
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

  const redirectToNextIncompleteStep = (data: any) => {
    // Vérifier quelles étapes sont complétées
    const hasInfos = data.nom && data.prenom && data.email && data.telephone &&
                    data.adresse && data.code_postal && data.ville && data.pays &&
                    data.type_formation && data.etudiant_etranger && data.accepte_donnees &&
                    (data.piece_identite_paths && data.piece_identite_paths.length > 0) &&
                    (data.type_formation !== 'alternance' || data.a_une_entreprise);
    
    const hasDocs = data.cv_path && data.diplome_path && 
                   (data.releves_paths && data.releves_paths.length > 0) &&
                   data.entreprise_accueil;
    const hasRecap = data.accept_conditions && data.attest_correct && hasDocs;
    const hasPaid = data.paid_at;
    const hasValidation = data.status === 'validated';
    
    // Rediriger vers la prochaine étape non complétée
    // CONTRAT temporairement retiré du flux
    if (hasValidation) {
      router.push('/validation?step=validation');
    } else if (hasPaid) {
      router.push('/validation?step=documents');
    } else if (hasRecap) {
      router.push('/validation?step=inscription');
    } else if (hasDocs) {
      router.push('/validation?step=recap');
    } else if (hasInfos) {
      // Après informations, aller directement à inscription (contrat retiré)
      router.push('/validation?step=inscription');
    } else {
      router.push('/validation?step=informations');
    }
  };

  const handleStartApplication = () => {
    // Utiliser les données du Context si disponibles
    if (candidatureData) {
      redirectToNextIncompleteStep(candidatureData);
    } else {
      // Pas de candidature, commencer à l'étape informations
      router.push('/validation?step=informations');
    }
  };

  const handleCloseCandidatureForm = () => {
    router.push('/validation');
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'informations':
        // La logique de redirection est gérée dans Information.tsx
        break;
      case 'contrat':
        // CONTRAT retiré, rediriger vers inscription
        router.push('/validation?step=inscription');
        break;
      case 'inscription':
        router.push('/validation?step=documents');
        break;
      case 'documents':
        router.push('/validation?step=recap');
        break;
      case 'recap':
        router.push('/validation?step=validation');
        break;
      default:
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'contrat':
        // CONTRAT retiré, rediriger vers informations
        router.push('/validation?step=informations');
        break;
      case 'inscription':
        // Après inscription, revenir à informations (contrat retiré)
        router.push('/validation?step=informations');
        break;
      case 'documents':
        // Revenir à inscription
        router.push('/validation?step=inscription');
        break;
      case 'recap':
        router.push('/validation?step=documents');
        break;
      case 'validation':
        router.push('/validation?step=recap');
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
      case 'recap':
        return (
          <Recap 
            onClose={handleCloseCandidatureForm}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 'contrat':
        return (
          <ContratStep 
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onClose={handleCloseCandidatureForm}
          />
        );
      case 'inscription':
        return (
          <PaiementFraisScolarite 
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onClose={handleCloseCandidatureForm}
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

// Wrapper pour charger l'utilisateur avant le Provider
const ValidationWithAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userResult = await getCurrentUser();
      if (userResult.success && userResult.user) {
        setUser(userResult.user);
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoadingUser(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <CandidatureProvider userId={user?.id} key={user?.id}>
      <ValidationContent />
    </CandidatureProvider>
  );
};

export default function ValidationPage() {
  return (
    <StudentGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
            <p className="mt-4 text-[#032622]">Chargement...</p>
          </div>
        </div>
      }>
        <ValidationWithAuth />
      </Suspense>
    </StudentGuard>
  );
}