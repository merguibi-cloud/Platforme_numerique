'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidature } from '@/contexts/CandidatureContext';
import { ProgressHeader } from './ProgressHeader';

interface ContratStepProps {
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export default function ContratStep({ onNext, onPrev, onClose }: ContratStepProps) {
  const router = useRouter();
  const { candidatureData, refreshCandidature } = useCandidature();
  const [currentView, setCurrentView] = useState<'forms' | 'review'>('forms');

  // URLs des formulaires Airtable (à remplacer par vos vrais liens)
  const AIRTABLE_FORM_ETUDIANT = 'https://airtable.com/appXXXXXXXXXXXXXX/formXXXXXXXXXXXXXX';
  const AIRTABLE_FORM_ENTREPRISE = 'https://airtable.com/appYYYYYYYYYYYYYY/formYYYYYYYYYYYYYY';

  // Vérifier le statut des formulaires
  const checkFormsStatus = async () => {
    if (!candidatureData) return;
    
    try {
      await refreshCandidature();
      
      // Si les deux formulaires sont complétés, passer à la vue de vérification
      if (candidatureData.airtable_form_etudiant_completed && candidatureData.airtable_form_entreprise_completed) {
        setCurrentView('review');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  };

  // Vérifier le statut au chargement du composant
  useEffect(() => {
    if (candidatureData) {
      if (candidatureData.airtable_form_etudiant_completed && candidatureData.airtable_form_entreprise_completed) {
        setCurrentView('review');
      } else {
        setCurrentView('forms');
      }
    }
  }, [candidatureData]);

  const handleFormClick = (formType: 'etudiant' | 'entreprise') => {
    const url = formType === 'etudiant' ? AIRTABLE_FORM_ETUDIANT : AIRTABLE_FORM_ENTREPRISE;
    
    // Ouvrir le formulaire dans un nouvel onglet
    window.open(url, '_blank');
    
    // Démarrer une vérification périodique du statut
    const checkInterval = setInterval(async () => {
      await checkFormsStatus();
      
      // Arrêter la vérification si les deux formulaires sont complétés
      if (candidatureData?.airtable_form_etudiant_completed && candidatureData?.airtable_form_entreprise_completed) {
        clearInterval(checkInterval);
      }
    }, 5000); // Vérifier toutes les 5 secondes

    // Arrêter la vérification après 10 minutes pour éviter les boucles infinies
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  };

  const getButtonStatus = (formType: 'etudiant' | 'entreprise') => {
    if (!candidatureData) return 'pending';
    
    const isCompleted = formType === 'etudiant' 
      ? candidatureData.airtable_form_etudiant_completed 
      : candidatureData.airtable_form_entreprise_completed;
    
    return isCompleted ? 'completed' : 'pending';
  };

  const handleNext = () => {
    // Vérifier que les deux formulaires sont complétés
    if (candidatureData?.airtable_form_etudiant_completed && candidatureData?.airtable_form_entreprise_completed) {
      onNext(); // Passer à l'étape suivante (Documents)
    }
  };

  const handlePrev = () => {
    if (currentView === 'review') {
      setCurrentView('forms');
    } else {
      onPrev(); // Retourner à l'étape précédente (Informations)
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-4 sm:px-8 lg:px-16 py-4 sm:py-8">
        <ProgressHeader currentStep="CONTRAT" onClose={onClose} />

        {/* Contenu selon la vue actuelle */}
        {currentView === 'forms' ? (
          <div className="space-y-8">
            {/* Titre */}
            <div className="text-left mb-12">
              <h1 className="text-4xl font-bold text-[#032622] mb-6" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                INFORMATION D'ENTREPRISE
              </h1>
              <p className="text-lg text-[#032622] max-w-2xl" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                Cette étape permet de vérifier les infos administratives de ton alternance. 
                Une fois validées, on passe à la génération du contrat.
              </p>
            </div>

            {/* Boutons des formulaires */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Formulaire Étudiant */}
              <div className="relative">
                <button
                  onClick={() => handleFormClick('etudiant')}
                  disabled={getButtonStatus('etudiant') === 'completed'}
                  className={`w-full p-6 text-center transition-all duration-200 font-bold text-white ${
                    getButtonStatus('etudiant') === 'completed'
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-[#032622] hover:bg-[#032622]/90'
                  }`}
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <div className="text-lg">
                    REMPLIR MON FORMULAIRE ÉTUDIANT
                  </div>
                  {getButtonStatus('etudiant') === 'completed' && (
                    <div className="text-sm mt-2">✅ Formulaire complété</div>
                  )}
                </button>
              </div>

              {/* Formulaire Entreprise */}
              <div className="relative">
                <button
                  onClick={() => handleFormClick('entreprise')}
                  disabled={getButtonStatus('entreprise') === 'completed'}
                  className={`w-full p-6 text-center transition-all duration-200 font-bold text-white ${
                    getButtonStatus('entreprise') === 'completed'
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-[#032622] hover:bg-[#032622]/90'
                  }`}
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <div className="text-lg">
                    FORMULAIRE ENTREPRISE D'ACCUEIL
                  </div>
                  {getButtonStatus('entreprise') === 'completed' && (
                    <div className="text-sm mt-2">✅ Formulaire complété</div>
                  )}
                </button>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                className="px-8 py-3 border border-[#032622] text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white transition-colors font-bold"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RETOUR
              </button>
              
              <button
                onClick={handleNext}
                disabled={!candidatureData?.airtable_form_etudiant_completed || !candidatureData?.airtable_form_entreprise_completed}
                className={`px-8 py-3 font-bold transition-colors ${
                  candidatureData?.airtable_form_etudiant_completed && candidatureData?.airtable_form_entreprise_completed
                    ? 'bg-[#6B7280] text-white hover:bg-[#4B5563]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                SUIVANT
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Icône horloge */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-[#032622] rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
            </div>

            {/* Titre principal */}
            <h1 className="text-3xl font-bold text-[#032622] mb-6 text-center">
              TON DOSSIER EST EN COURS DE VÉRIFICATION
            </h1>

            {/* Description */}
            <p className="text-lg text-[#032622] mb-8 leading-relaxed text-center">
              Notre équipe commerciale vérifie actuellement les informations de ton entreprise d'accueil 
              avant de générer ton contrat d'alternance.
            </p>

            {/* Informations sur les formulaires soumis */}
            {candidatureData && (
              <div className="bg-white p-6 rounded-lg border border-[#032622] mb-8">
                <h3 className="text-lg font-bold text-[#032622] mb-4">
                  Statut de tes formulaires
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#032622]">Formulaire étudiant</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      candidatureData.airtable_form_etudiant_completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {candidatureData.airtable_form_etudiant_completed ? '✅ Complété' : '⏳ En attente'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#032622]">Formulaire entreprise</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      candidatureData.airtable_form_entreprise_completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {candidatureData.airtable_form_entreprise_completed ? '✅ Complété' : '⏳ En attente'}
                    </span>
                  </div>
                </div>

                {candidatureData.airtable_forms_submitted_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Dernière mise à jour: {new Date(candidatureData.airtable_forms_submitted_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Informations supplémentaires */}
            <div className="bg-white p-6 rounded-lg border border-[#032622] mb-8">
              <h3 className="text-lg font-bold text-[#032622] mb-3">
                Prochaines étapes
              </h3>
              <ul className="text-[#032622] text-left space-y-2">
                <li>• Vérification des informations par notre équipe commerciale</li>
                <li>• Validation de l'entreprise d'accueil</li>
                <li>• Génération du contrat d'alternance</li>
                <li>• Notification par email une fois le contrat prêt</li>
              </ul>
            </div>

            {/* Boutons de navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                className="px-8 py-3 border border-[#032622] text-[#032622] bg-white hover:bg-[#032622] hover:text-white transition-colors font-bold rounded-lg"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RETOUR
              </button>
              
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-[#6B7280] text-white hover:bg-[#4B5563] transition-colors font-bold rounded-lg"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                SUIVANT
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
