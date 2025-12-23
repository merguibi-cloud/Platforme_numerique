"use client";
import Image from 'next/image';
import { User, Mail, Phone, Search, ChevronDown, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFormationData, UserFormationData } from '@/lib/user-formations';
import { useCandidature } from '@/contexts/CandidatureContext';
import { getAllFormations } from '@/lib/formations';
import { Formation, categories, niveaux, rythmes } from '@/types/formations';
import { Modal } from './Modal';
import { useModal } from './useModal';

interface AccueilProps {
  userEmail: string;
  onStartApplication: () => void;
}

export const Accueil = ({ 
  userEmail,
  onStartApplication 
}: AccueilProps) => {
  const router = useRouter();
  const { candidatureData, isLoading: isCandidatureLoading, refreshCandidature } = useCandidature();
  const [formationData, setFormationData] = useState<UserFormationData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showChangeFormationModal, setShowChangeFormationModal] = useState(false);
  const [isChangingFormation, setIsChangingFormation] = useState(false);
  const { modalState, showSuccess, showError, hideModal, showConfirm, handleConfirm, handleCancel } = useModal();
  
  // États pour la modale de sélection de formation
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [selectedNewFormation, setSelectedNewFormation] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUS');
  const [selectedNiveau, setSelectedNiveau] = useState('TOUS');
  const [selectedRythme, setSelectedRythme] = useState('TOUS');

  useEffect(() => {
    loadFormationData();
  }, []);

  // Charger la photo quand candidatureData change
  useEffect(() => {
    if (candidatureData?.photo_identite_path) {
      loadPhotoUrl(candidatureData.photo_identite_path);
    }
  }, [candidatureData]);

  const loadFormationData = async () => {
    try {
      setIsLoading(true);
      
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

  const loadPhotoUrl = async (photoPath: string) => {
    try {
      const photoResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(photoPath)}&bucket=photo_profil`);
            if (photoResponse.ok) {
              const photoResult = await photoResponse.json();
              if (photoResult.success && photoResult.url) {
                setPhotoUrl(photoResult.url);
              }
            }
          } catch (error) {
      // Erreur silencieuse
    }
  };

  const getCandidatureProgress = () => {
    if (!candidatureData) return { completedSteps: [], missingDocuments: [] };

    const completedSteps = [];
    const missingDocuments = [];

    // Vérifier les étapes complétées
    if (candidatureData.nom && candidatureData.prenom && candidatureData.email && candidatureData.telephone &&
        candidatureData.adresse && candidatureData.code_postal && candidatureData.ville && candidatureData.pays &&
        candidatureData.type_formation && candidatureData.etudiant_etranger && candidatureData.accepte_donnees &&
        (candidatureData.piece_identite_paths && candidatureData.piece_identite_paths.length > 0) &&
        (candidatureData.type_formation !== 'alternance' || candidatureData.a_une_entreprise)) {
      completedSteps.push('INFORMATIONS');
    }

    // CONTRAT temporairement retiré de la progression

    // Vérifier l'étape INSCRIPTION (paiement des frais d'inscription)
    if (candidatureData.paid_at) {
      completedSteps.push('INSCRIPTION');
    }

    // Vérifier l'étape documents - tous les documents obligatoires doivent être présents
    const hasAllDocuments = candidatureData.cv_path && 
                           candidatureData.diplome_path &&
                           candidatureData.lettre_motivation_path &&
                           (candidatureData.releves_paths && candidatureData.releves_paths.length > 0);
    
    if (hasAllDocuments) {
      completedSteps.push('DOCUMENTS');
    }

    // Vérifier l'étape récapitulatif - les checkboxes doivent être cochées
    if (candidatureData.accept_conditions && candidatureData.attest_correct && hasAllDocuments) {
      completedSteps.push('DOSSIER');
    }

    // Vérifier l'étape validation - vérifie si le statut est validé
    if (candidatureData.status === 'validated') {
      completedSteps.push('VALIDATION');
    }

    // Vérifier les documents manquants
    if (!candidatureData.cv_path) missingDocuments.push('CV');
    if (!candidatureData.diplome_path) missingDocuments.push('DIPLÔME');
    if (!candidatureData.lettre_motivation_path) missingDocuments.push('LETTRE DE MOTIVATION');
    if (!candidatureData.releves_paths || candidatureData.releves_paths.length === 0) missingDocuments.push('RELEVÉS DE NOTES');
    if (!candidatureData.piece_identite_paths || candidatureData.piece_identite_paths.length === 0) missingDocuments.push('PIÈCE D\'IDENTITÉ');

    return { completedSteps, missingDocuments };
  };

  const { completedSteps, missingDocuments } = getCandidatureProgress();
  
  // Vérifier si la candidature a vraiment été commencée
  const hasStarted = candidatureData && (
    // Au moins une donnée personnelle remplie
    candidatureData.nom || 
    candidatureData.prenom || 
    candidatureData.telephone ||
    candidatureData.civilite ||
    candidatureData.adresse ||
    // Ou au moins un document uploadé
    candidatureData.cv_path ||
    candidatureData.diplome_path ||
    candidatureData.lettre_motivation_path ||
    (candidatureData.releves_paths && candidatureData.releves_paths.length > 0) ||
    (candidatureData.piece_identite_paths && candidatureData.piece_identite_paths.length > 0)
  );

  // Déterminer le statut de la candidature
  const getCandidatureStatus = () => {
    if (!candidatureData || !hasStarted) {
      return { label: 'BROUILLON', color: 'bg-gray-400', textColor: 'text-gray-400' };
    }

    const status = candidatureData.status;

    if (status === 'validated' || status === 'approved') {
      return { label: 'VALIDÉ', color: 'bg-green-600', textColor: 'text-green-600' };
    } else if (status === 'submitted' || status === 'pending') {
      return { label: 'EN COURS D\'ÉTUDE', color: 'bg-blue-600', textColor: 'text-blue-600' };
    } else {
      // draft ou null
      return { label: 'BROUILLON', color: 'bg-[#C2C6B6]', textColor: 'text-[#032622]' };
    }
  };

  const candidatureStatus = getCandidatureStatus();
  
  const handleResumeApplication = () => {
    // Déterminer la prochaine étape non complétée
    if (completedSteps.includes('VALIDATION')) {
      // Tout est terminé, aller à la page de confirmation finale
      router.push('/validation?step=validation');
    } else if (completedSteps.includes('DOSSIER')) {
      // DOSSIER complété, aller à VALIDATION
      router.push('/validation?step=validation');
    } else if (completedSteps.includes('DOCUMENTS')) {
      // DOCUMENTS complété, aller à DOSSIER
      router.push('/validation?step=recap');
    } else if (completedSteps.includes('INSCRIPTION')) {
      // INSCRIPTION complété, aller à DOCUMENTS
      router.push('/validation?step=documents');
    } else if (completedSteps.includes('INFORMATIONS')) {
      // INFORMATIONS complété, aller directement à INSCRIPTION (CONTRAT retiré)
      router.push('/validation?step=inscription');
    } else {
      // Rien n'est complété, commencer par INFORMATIONS
      router.push('/validation?step=informations');
    }
  };

  const loadAllFormations = async () => {
    try {
      setLoadingFormations(true);
      const data = await getAllFormations();
      setFormations(data);
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setLoadingFormations(false);
    }
  };

  const handleChangeFormation = () => {
    if (hasStarted) {
      // Si candidature commencée, demander confirmation
      showConfirm(
        'Attention : Changer de formation supprimera définitivement votre candidature actuelle.\n\n' +
        'Toutes vos informations et documents seront perdus.\n\n' +
        'Voulez-vous vraiment continuer ?',
        'Confirmation requise',
        () => {
          loadAllFormations();
          setShowChangeFormationModal(true);
        }
      );
    } else {
      // Pas de candidature, ouvrir la modale directement
      loadAllFormations();
      setShowChangeFormationModal(true);
    }
  };

  const handleConfirmChangeFormation = async () => {
    if (!selectedNewFormation) {
      showError('Veuillez sélectionner une formation', 'Sélection requise');
      return;
    }

    try {
      setIsChangingFormation(true);

      const response = await fetch('/api/user/change-formation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formation_id: selectedNewFormation }),
      });

      const result = await response.json();

      if (result.success) {
        // Rafraîchir les données
        await refreshCandidature();
        await loadFormationData();
        
        // Fermer la modale
        setShowChangeFormationModal(false);
        setSelectedNewFormation(null);
        
        // Message de succès
        showSuccess('Formation changée avec succès ! Votre candidature précédente a été supprimée.', 'Succès');
        
        // Recharger la page pour tout réinitialiser
        window.location.reload();
      } else {
        showError(result.error || 'Impossible de changer la formation', 'Erreur');
      }
    } catch (error) {
      showError('Erreur lors du changement de formation. Veuillez réessayer.', 'Erreur');
    } finally {
      setIsChangingFormation(false);
    }
  };

  // Filtrer les formations selon les critères
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TOUS' || formation.theme === selectedCategory;
    const matchesNiveau = selectedNiveau === 'TOUS' || formation.niveau === selectedNiveau;
    const matchesRythme = selectedRythme === 'TOUS' || formation.rythme === selectedRythme;
    
    return matchesSearch && matchesCategory && matchesNiveau && matchesRythme;
  });
  
  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        
        {/* Première ligne - Photo de profil + Informations (pleine largeur) */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Photo de profil - responsive */}
            <div className="w-full sm:w-[192px] h-[120px] sm:h-[200px] border border-[#032622] flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#C2C6B6]">
              {photoUrl ? (
                <img 
                  src={photoUrl}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-[#032622]" />
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
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 
                      className="text-xs sm:text-sm font-bold text-[#032622] uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      STATUT DE LA CANDIDATURE
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${candidatureStatus.color}`}></div>
                      <span className={`text-xs sm:text-sm font-bold ${candidatureStatus.textColor} uppercase`}>
                        {candidatureStatus.label}
                    </span>
                  </div>
                  </div>
                  
                  {/* Message d'information si candidature soumise */}
                  {(candidatureData?.status === 'submitted' || candidatureData?.status === 'pending') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs sm:text-sm text-blue-800">
                        📋 Un administrateur étudie actuellement votre candidature. Vous serez notifié dès qu'une décision sera prise.
                      </p>
                    </div>
                  )}
                  
                  {/* Barre de progression visuelle */}
                  <div className="w-full bg-[#C2C6B6] h-1 sm:h-2 mb-2">
                    <div 
                      className="bg-[#032622] h-1 sm:h-2 transition-all duration-300" 
                      style={{ 
                        width: completedSteps.includes('VALIDATION') ? '100%' :
                               completedSteps.includes('DOSSIER') ? '80%' :
                               completedSteps.includes('DOCUMENTS') ? '60%' : 
                               completedSteps.includes('INSCRIPTION') ? '40%' :
                               completedSteps.includes('INFORMATIONS') ? '20%' : '0%' 
                      }}
                    ></div>
                  </div>
                  
                  {/* Indicateur textuel de progression */}
                  <div className="flex justify-between text-[10px] sm:text-xs text-[#032622]/60">
                    <span>
                      {completedSteps.length === 0 ? 'Non démarrée' : 
                       `${completedSteps.length} étape${completedSteps.length > 1 ? 's' : ''} complétée${completedSteps.length > 1 ? 's' : ''}`}
                    </span>
                    <span>
                      {completedSteps.length}/5
                    </span>
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
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Étape INFORMATIONS */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#032622] flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes('INFORMATIONS') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('INFORMATIONS') && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${
                        completedSteps.includes('INFORMATIONS') ? 'text-[#032622]' : 'text-[#032622]/60'
                      }`}>
                        INFORMATIONS
                      </span>
                    </div>
                    
                    {/* Ligne de connexion */}
                    <div className="ml-2 sm:ml-[10px] w-0.5 h-3 sm:h-4 bg-[#032622]/40"></div>
                    
                    {/* Étape INSCRIPTION */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#032622] flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes('INSCRIPTION') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('INSCRIPTION') && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${
                        completedSteps.includes('INSCRIPTION') ? 'text-[#032622]' : 'text-[#032622]/60'
                      }`}>
                        INSCRIPTION
                      </span>
                    </div>
                    
                    {/* Ligne de connexion */}
                    <div className="ml-2 sm:ml-[10px] w-0.5 h-3 sm:h-4 bg-[#032622]/40"></div>
                    
                    {/* Étape DOCUMENTS */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#032622] flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes('DOCUMENTS') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('DOCUMENTS') && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${
                        completedSteps.includes('DOCUMENTS') ? 'text-[#032622]' : 'text-[#032622]/60'
                      }`}>
                        DOCUMENTS
                      </span>
                    </div>
                    
                    {/* Ligne de connexion */}
                    <div className="ml-2 sm:ml-[10px] w-0.5 h-3 sm:h-4 bg-[#032622]/40"></div>
                    
                    {/* Étape DOSSIER */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#032622] flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes('DOSSIER') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('DOSSIER') && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${
                        completedSteps.includes('DOSSIER') ? 'text-[#032622]' : 'text-[#032622]/60'
                      }`}>
                        DOSSIER
                      </span>
                    </div>
                    
                    {/* Ligne de connexion */}
                    <div className="ml-2 sm:ml-[10px] w-0.5 h-3 sm:h-4 bg-[#032622]/40"></div>
                    
                    {/* Étape VALIDATION */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#032622] flex items-center justify-center flex-shrink-0 ${
                        completedSteps.includes('VALIDATION') ? 'bg-[#032622]' : 'bg-transparent'
                      }`}>
                        {completedSteps.includes('VALIDATION') && (
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold ${
                        completedSteps.includes('VALIDATION') ? 'text-[#032622]' : 'text-[#032622]/60'
                      }`}>
                        VALIDATION
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
                  onClick={handleResumeApplication}
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
                  
                  <button
                    onClick={handleChangeFormation}
                    className="text-[#032622] hover:underline text-xs sm:text-sm text-left font-medium"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    CHANGER DE FORMATION
                  </button>
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

      {/* Modale de changement de formation */}
      {showChangeFormationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => {
          setShowChangeFormationModal(false);
          setSelectedNewFormation(null);
        }}>
          <div className="bg-[#F8F5E4] border-2 border-[#032622] max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-lg sm:rounded-none overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-[#032622] flex-shrink-0">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] uppercase">Changer de formation</h2>
                  {hasStarted && (
                    <p className="text-xs sm:text-sm text-red-600 mt-1">⚠️ Votre candidature actuelle sera supprimée</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowChangeFormationModal(false);
                    setSelectedNewFormation(null);
                  }}
                  className="text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 flex-shrink-0 p-1"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Formation actuelle */}
            <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 bg-[#C2C6B6]/20 border-b border-[#032622]/20 flex-shrink-0">
              <p className="text-xs sm:text-sm text-[#032622] break-words">
                <span className="font-bold">Formation actuelle :</span> {formationData?.formation_titre || 'Non spécifiée'}
              </p>
            </div>

            {/* Filtres */}
            <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-[#032622]/20 flex-shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="RECHERCHER"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F8F5E4] text-[#032622] border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] text-sm"
                  />
                </div>

                {/* Catégorie */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none w-full bg-[#F8F5E4] text-[#032622] px-4 py-2 pr-8 border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] text-sm"
                  >
                    <option value="TOUS">TOUS</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#032622] w-4 h-4 pointer-events-none" />
                </div>

                {/* Niveau */}
                <div className="relative">
                  <select
                    value={selectedNiveau}
                    onChange={(e) => setSelectedNiveau(e.target.value)}
                    className="appearance-none w-full bg-[#F8F5E4] text-[#032622] px-4 py-2 pr-8 border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] text-sm"
                  >
                    <option value="TOUS">TOUS NIVEAUX</option>
                    {niveaux.map((niv) => (
                      <option key={niv} value={niv}>{niv}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#032622] w-4 h-4 pointer-events-none" />
                </div>

                {/* Rythme */}
                <div className="relative">
                  <select
                    value={selectedRythme}
                    onChange={(e) => setSelectedRythme(e.target.value)}
                    className="appearance-none w-full bg-[#F8F5E4] text-[#032622] px-4 py-2 pr-8 border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] text-sm"
                  >
                    <option value="TOUS">TOUS RYTHMES</option>
                    {rythmes.map((ryt) => (
                      <option key={ryt} value={ryt}>{ryt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#032622] w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Liste des formations */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              {loadingFormations ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#032622]"></div>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#032622]">Chargement des formations...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredFormations.map((formation) => (
                    <div
                      key={formation.id}
                      onClick={() => setSelectedNewFormation(formation.id)}
                      className={`bg-[#032622] shadow-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-[280px] sm:h-[300px] md:h-[320px] relative ${
                        selectedNewFormation === formation.id ? 'ring-2 sm:ring-4 ring-[#F8F5E4]' : 'hover:shadow-xl'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 border-2 rounded flex items-center justify-center transition-colors z-10 ${
                        selectedNewFormation === formation.id
                          ? 'bg-[#F8F5E4] border-[#F8F5E4] text-[#032622]'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedNewFormation === formation.id && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </div>

                      {/* Badge RNCP */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-[#F8F5E4] text-[#032622] px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold z-10">
                        CERTIFIÉE RNCP
                      </div>

                      {/* Image */}
                      <div className="h-24 sm:h-28 md:h-32 bg-gray-200 relative overflow-hidden flex-shrink-0">
                        <Image
                          src={formation.image}
                          alt={formation.titre}
                          width={400}
                          height={128}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.currentTarget.src = '/img/formation/forma_digital.png';
                          }}
                        />
                      </div>

                      {/* Contenu */}
                      <div className="p-3 sm:p-4 flex flex-col flex-grow">
                        <h3 className="text-xs sm:text-sm font-bold mb-2 text-[#F8F5E4] leading-tight min-h-[36px] sm:h-10 overflow-hidden">
                          {formation.titre}
                        </h3>
                        <p className="text-[#F8F5E4] text-[10px] sm:text-xs mb-2 sm:mb-3 leading-relaxed flex-grow min-h-[40px] sm:h-12 overflow-hidden">
                          {formation.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto gap-2">
                          <span className="text-[#F8F5E4] font-bold text-xs sm:text-sm">{formation.prix}€</span>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                            <Image
                              src={formation.icon}
                              alt={formation.ecole}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingFormations && filteredFormations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#032622]">Aucune formation trouvée avec ces critères</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 md:p-6 border-t border-[#032622] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 flex-shrink-0">
              <button
                onClick={() => {
                  setShowChangeFormationModal(false);
                  setSelectedNewFormation(null);
                }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#032622] text-[#032622] hover:bg-[#C2C6B6] active:bg-[#C2C6B6]/80 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                ANNULER
              </button>
              
              <button
                onClick={handleConfirmChangeFormation}
                disabled={!selectedNewFormation || isChangingFormation}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#032622] text-white font-bold hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base w-full sm:w-auto whitespace-nowrap"
              >
                {isChangingFormation ? 'CHANGEMENT EN COURS...' : 'VALIDER LA NOUVELLE FORMATION'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        isConfirm={modalState.isConfirm}
        onConfirm={modalState.onConfirm ? handleConfirm : undefined}
        onCancel={modalState.onCancel ? handleCancel : undefined}
      />
    </div>
  );
};
