"use client";
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserFormationData, UserFormationData } from '@/lib/user-formations';
import { getCandidature } from '@/lib/candidature-api';

interface AccueilProps {
  userEmail: string;
  onStartApplication: () => void;
}

export const Accueil = ({ 
  userEmail,
  onStartApplication 
}: AccueilProps) => {
  const [formationData, setFormationData] = useState<UserFormationData | null>(null);
  const [candidatureData, setCandidatureData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les données de formation
      const formationResult = await getUserFormationData();
      if (formationResult.success && formationResult.data) {
        setFormationData(formationResult.data);
      }
      
      // Charger les données de candidature
      const candidatureResult = await getCandidature();
      if (candidatureResult.success && candidatureResult.data) {
        setCandidatureData(candidatureResult.data);
        
        // Charger la photo de profil si elle existe
        if (candidatureResult.data.photo_identite_path) {
          try {
            const photoResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(candidatureResult.data.photo_identite_path)}&bucket=photo_profil`);
            if (photoResponse.ok) {
              const photoResult = await photoResponse.json();
              if (photoResult.success && photoResult.url) {
                setPhotoUrl(photoResult.url);
              }
            }
          } catch (error) {
            // Erreur silencieuse
          }
        }
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const getCandidatureProgress = () => {
    if (!candidatureData) return { completedSteps: [], missingDocuments: [] };

    const completedSteps = [];
    const missingDocuments = [];

    // Vérifier les étapes complétées
    if (candidatureData.nom && candidatureData.prenom && candidatureData.email && candidatureData.telephone) {
      completedSteps.push('INFORMATIONS');
    }

    // Vérifier l'étape documents
    const hasDocuments = (candidatureData.cv_path || (candidatureData.releves_paths && candidatureData.releves_paths.length > 0) || 
                         candidatureData.diplome_path || (candidatureData.piece_identite_paths && candidatureData.piece_identite_paths.length > 0)) &&
                        candidatureData.entreprise_accueil;
    
    if (hasDocuments) {
      completedSteps.push('DOCUMENTS');
    }

    // Vérifier les documents manquants
    if (!candidatureData.cv_path) missingDocuments.push('CV');
    if (!candidatureData.diplome_path) missingDocuments.push('DIPLÔME');
    if (!candidatureData.releves_paths || candidatureData.releves_paths.length === 0) missingDocuments.push('RELEVÉS DE NOTES');
    if (!candidatureData.piece_identite_paths || candidatureData.piece_identite_paths.length === 0) missingDocuments.push('PIÈCE D\'IDENTITÉ');

    return { completedSteps, missingDocuments };
  };

  const { completedSteps, missingDocuments } = getCandidatureProgress();
  const hasStarted = completedSteps.length > 0 || missingDocuments.length < 4;
  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        
        {/* Première ligne - Photo de profil + Informations (pleine largeur) */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Photo de profil - responsive */}
            <div className="w-full sm:w-[192px] h-[120px] sm:h-[200px] border border-[#032622] flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50">
              {photoUrl ? (
                <img 
                  src={photoUrl}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
              )}
            </div>
            
            {/* Informations - prend tout l'espace restant */}
            <div className="flex-1 h-[120px] sm:h-[200px] shadow-lg p-4 sm:p-6 border border-[#032622]">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h2 
                    className="text-lg sm:text-xl font-bold text-[#032622] mb-1 sm:mb-2"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {candidatureData?.nom && candidatureData?.prenom 
                      ? `${candidatureData.prenom} ${candidatureData.nom.toUpperCase()}`
                      : userEmail
                    }
                  </h2>
                  <p 
                    className="text-sm sm:text-base text-[#032622] mb-2 sm:mb-4"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    {userEmail}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 
                      className="text-xs sm:text-sm font-bold text-[#032622] uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      INFORMATIONS
                    </h3>
                    <span className="text-xs sm:text-sm text-[#032622]">
                      {completedSteps.includes('DOCUMENTS') ? 'ÉTAPE 2 TERMINÉE' : 
                       completedSteps.includes('INFORMATIONS') ? 'ÉTAPE 1 TERMINÉE' : 'ÉTAPE 1 SUR 4'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 sm:h-2">
                    <div 
                      className="bg-[#032622] h-1 sm:h-2 transition-all duration-300" 
                      style={{ 
                        width: completedSteps.includes('DOCUMENTS') ? '50%' : 
                               completedSteps.includes('INFORMATIONS') ? '25%' : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième ligne - Layout en 5 colonnes (60% / 40%) */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Progression de la candidature - prend 3 colonnes (60%) */}
            <div className="lg:col-span-3 shadow-lg p-4 sm:p-6 border border-[#032622]">
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 
                    className="text-base sm:text-lg font-bold text-[#032622] text-center"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    PROGRESSION DE LA CANDIDATURE
                  </h3>
                  
                  {/* Étapes de progression */}
                  <div className="space-y-2">
                    {/* Étape INFORMATIONS */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 border-2 border-[#032622] flex items-center justify-center ${
                        completedSteps.includes('INFORMATIONS') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('INFORMATIONS') && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${
                        completedSteps.includes('INFORMATIONS') ? 'text-[#032622] underline' : 'text-[#032622]'
                      }`}>
                        INFORMATIONS
                      </span>
                    </div>
                    
                    {/* Ligne de connexion */}
                    <div className="ml-[10px] w-0.5 h-4 bg-[#032622]"></div>
                    
                    {/* Étape DOCUMENTS */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 border-2 border-[#032622] flex items-center justify-center ${
                        completedSteps.includes('DOCUMENTS') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('DOCUMENTS') && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-bold ${
                        completedSteps.includes('DOCUMENTS') ? 'text-[#032622] underline' : 'text-[#032622]'
                      }`}>
                        DOCUMENTS
                      </span>
                    </div>
                  </div>

                  {/* Documents manquants */}
                  {missingDocuments.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#032622]">DOCUMENTS MANQUANTS :</p>
                      <ul className="space-y-1">
                        {missingDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-[#032622] rounded-full"></div>
                            <span className="text-xs text-[#032622]">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Bouton d'action en bas */}
                <button 
                  onClick={onStartApplication}
                  className="w-full bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-4 sm:px-6 font-bold hover:bg-[#032622]/90 transition-colors text-base sm:text-lg mt-4"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {hasStarted ? 'REPRENDRE' : 'COMMENCER'}
                </button>
              </div>
            </div>

            {/* Colonne droite - Formation + Besoin d'aide */}
            <div className="lg:col-span-2 space-y-4">
              {/* Formation sélectionnée */}
              <div className="shadow-lg p-4 sm:p-6 border border-[#032622]">
                <div className="flex flex-col justify-between h-full">
                  <h3 
                    className="text-base sm:text-lg font-bold text-[#032622] mb-3"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    FORMATION SÉLECTIONNÉE
                  </h3>
                  
                   <div className="border border-[#032622] p-3 sm:p-4 mb-3">
                     <div className="flex items-center justify-between">
                       <div className="flex-1">
                         <h4 
                           className="font-bold text-[#032622] text-xs sm:text-sm"
                           style={{ fontFamily: 'var(--font-termina-bold)' }}
                         >
                           {isLoading ? 'Chargement...' : formationData?.formation_titre || 'Formation non spécifiée'}
                         </h4>
                       </div>
                       <div className="text-right ml-2 sm:ml-4">
                         <p className="font-bold text-[#032622] text-sm sm:text-lg">
                           {isLoading ? '...' : formationData?.formation_prix ? `${formationData.formation_prix}€` : 'Prix non disponible'}
                         </p>
                       </div>
                     </div>
                   </div>
                  
                  <Link 
                    href="/formations"
                    className="text-[#032622] hover:underline text-xs sm:text-sm text-left"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    CHANGER DE FORMATION
                  </Link>
                </div>
              </div>

              {/* Besoin d'aide */}
              <div className="shadow-lg p-4 sm:p-6 border border-[#032622]">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 
                      className="text-base sm:text-lg font-bold text-[#032622] mb-3 sm:mb-4"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      BESOIN D'AIDE ?
                    </h3>
                    
                    <p 
                      className="text-xs sm:text-sm text-[#032622] mb-3 sm:mb-4"
                      style={{ fontFamily: 'var(--font-termina-medium)' }}
                    >
                      Besoin d'aide pour finaliser votre candidature? Contactez le référent de la formation.
                    </p>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <button className="w-full bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-3 sm:px-4 font-bold hover:bg-[#032622]/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>PAR MAIL</span>
                    </button>
                    
                    <button className="w-full bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-3 sm:px-4 font-bold hover:bg-[#032622]/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>PAR TÉLÉPHONE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
