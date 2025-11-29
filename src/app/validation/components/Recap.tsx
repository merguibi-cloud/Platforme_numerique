"use client";
import { useState, useEffect } from 'react';
import { User, Download, FileText, ExternalLink, Edit } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';
import { saveCandidatureStep } from '@/lib/candidature-api';
import { useRouter } from 'next/navigation';
import { useCandidature } from '@/contexts/CandidatureContext';
import { Modal } from './Modal';
import { useModal } from './useModal';
import { validatePreviousSteps } from '../utils/stepValidation';

interface RecapProps {
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Recap = ({ onClose, onNext, onPrev }: RecapProps) => {
  const router = useRouter();
  const { candidatureData, refreshCandidature } = useCandidature();
  const { modalState, showSuccess, showError, showWarning, hideModal } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [attestCorrect, setAttestCorrect] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [documentUrls, setDocumentUrls] = useState<{
    cv?: string;
    diplome?: string;
    releves: Array<{ path: string, url: string }>;
    pieceIdentite: Array<{ path: string, url: string }>;
    lettreMotivation?: string;
  }>({
    releves: [],
    pieceIdentite: []
  });

  // Vérifier les étapes précédentes au chargement
  useEffect(() => {
    if (!candidatureData) return;
    
    const validation = validatePreviousSteps('recap', candidatureData);
    if (!validation.isValid && validation.missingStep && validation.message) {
      // Utiliser setTimeout pour éviter la boucle infinie
      const timer = setTimeout(() => {
        showWarning(
          validation.message + '\n\nCliquez sur OK pour être redirigé vers l\'étape manquante.',
          'Étape manquante',
          () => {
            router.push(`/validation?step=${validation.missingStep}`);
          }
        );
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatureData?.id, candidatureData?.paid_at]); // Inclure paid_at pour détecter les changements

  useEffect(() => {
    if (candidatureData) {
      loadRecapData();
    } else {
      setIsLoading(false);
    }
  }, [candidatureData]);

  const loadRecapData = async () => {
    try {
      setIsLoading(true);
      
      if (candidatureData) {
        const result = { success: true, data: candidatureData };
        
        // Charger la photo
        if (result.data.photo_identite_path) {
          try {
            const photoResponse = await fetch(`/api/photo-url?path=${encodeURIComponent(result.data.photo_identite_path)}&bucket=photo_profil`);
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
        
        // Charger les URLs des documents
        const urls: any = { releves: [], pieceIdentite: [] };
        
        // CV
        if (result.data.cv_path) {
          const cvUrl = await loadFileUrl(result.data.cv_path);
          if (cvUrl) urls.cv = cvUrl;
        }
        
        // Diplôme
        if (result.data.diplome_path) {
          const diplomeUrl = await loadFileUrl(result.data.diplome_path);
          if (diplomeUrl) urls.diplome = diplomeUrl;
        }
        
        // Lettre de motivation
        if (result.data.lettre_motivation_path) {
          const lettreUrl = await loadFileUrl(result.data.lettre_motivation_path);
          if (lettreUrl) urls.lettreMotivation = lettreUrl;
        }
        
        // Relevés
        if (result.data.releves_paths && result.data.releves_paths.length > 0) {
          for (const path of result.data.releves_paths) {
            const url = await loadFileUrl(path);
            if (url) urls.releves.push({ path, url });
          }
        }
        
        // Pièces d'identité
        if (result.data.piece_identite_paths && result.data.piece_identite_paths.length > 0) {
          for (const path of result.data.piece_identite_paths) {
            const url = await loadFileUrl(path);
            if (url) urls.pieceIdentite.push({ path, url });
          }
        }
        
        setDocumentUrls(urls);
        
        // Vérifier si toutes les données obligatoires sont présentes
        const hasAllRequiredData = !!(
          result.data.nom &&
          result.data.prenom &&
          result.data.email &&
          result.data.telephone &&
          result.data.adresse &&
          result.data.code_postal &&
          result.data.ville &&
          result.data.pays &&
          result.data.type_formation &&
          result.data.etudiant_etranger &&
          result.data.accepte_donnees &&
          (result.data.cv_path || urls.cv) &&
          (result.data.diplome_path || urls.diplome) &&
          (result.data.lettre_motivation_path || urls.lettreMotivation) &&
          ((result.data.releves_paths && result.data.releves_paths.length > 0) || urls.releves.length > 0) &&
          ((result.data.piece_identite_paths && result.data.piece_identite_paths.length > 0) || urls.pieceIdentite.length > 0)
        );
        
        // Si des données obligatoires manquent, décocher les checkboxes automatiquement
        if (!hasAllRequiredData) {
          setAcceptConditions(false);
          setAttestCorrect(false);
        } else {
          // Sinon, garder les valeurs de la BDD
          setAcceptConditions(result.data.accept_conditions || false);
          setAttestCorrect(result.data.attest_correct || false);
        }
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const loadFileUrl = async (path: string): Promise<string | null> => {
    try {
      // Essayer user_documents d'abord
      let response = await fetch(`/api/photo-url?path=${encodeURIComponent(path)}&bucket=user_documents`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) return result.url;
      }
      
      // Essayer photo_profil
      response = await fetch(`/api/photo-url?path=${encodeURIComponent(path)}&bucket=photo_profil`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) return result.url;
      }
    } catch (error) {
      // Erreur silencieuse
    }
    return null;
  };

  const hasDataChanged = () => {
    if (!candidatureData) return true; // Si pas de données existantes, considérer comme changé
    
    // Vérifier si les checkboxes ont changé
    const hasCheckboxChanges = (
      acceptConditions !== (candidatureData.accept_conditions || false) ||
      attestCorrect !== (candidatureData.attest_correct || false)
    );
    
    return hasCheckboxChanges;
  };

  const handleNext = async () => {
    if (!acceptConditions || !attestCorrect) {
      showWarning('Veuillez accepter les deux conditions pour continuer', 'Conditions requises');
      return;
    }

    try {
      setIsSaving(true);
      
      // Vérifier si des données ont été modifiées
      if (hasDataChanged()) {
        console.log('Données modifiées détectées - Sauvegarde en cours...');
        // Sauvegarder les checkboxes
        const result = await saveCandidatureStep('recap', {
          acceptConditions,
          attestCorrect
        });
        
        if (result.success) {
          // Rafraîchir les données du Context après sauvegarde
          await refreshCandidature();
          console.log('Sauvegarde réussie');
        } else {
          showError('Erreur lors de la sauvegarde. Veuillez réessayer.', 'Erreur');
          return;
        }
      } else {
        console.log('Aucune modification détectée - Pas d\'appel API');
      }
      
      // Passer à l'étape suivante
      onNext();
    } catch (error) {
      showError('Erreur lors de la sauvegarde. Veuillez réessayer.', 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#032622]">Chargement du récapitulatif...</p>
        </div>
      </div>
    );
  }

  if (!candidatureData) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center text-[#032622] px-4">
          <p className="text-sm sm:text-base">Erreur lors du chargement des données</p>
          <button 
            onClick={onPrev}
            className="mt-4 px-5 sm:px-6 py-2.5 sm:py-3 border border-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors text-sm sm:text-base"
          >
            RETOUR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="DOSSIER" onClose={onClose} />

        {/* Titre de la section */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#032622] uppercase">Récapitulatif de votre candidature</h2>
          <p className="text-xs sm:text-sm text-[#032622]/70 mt-1 sm:mt-2">Veuillez vérifier attentivement toutes les informations avant de valider</p>
        </div>

        {/* Document de récapitulatif */}
        <div className="w-full mb-4 sm:mb-6 p-4 sm:p-6 md:p-8 border border-[#032622] bg-[#F8F5E4]">
          {/* Section photo et informations personnelles */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-[#032622]/20">
            {/* Photo de profil */}
            <div className="w-full sm:w-40 md:w-48 h-48 sm:h-56 md:h-60 border border-[#032622] bg-[#C2C6B6] flex items-center justify-center flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Photo d'identité" className="w-full h-full object-cover" />
              ) : (
              <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#032622]" />
              )}
            </div>
            
            {/* Informations personnelles */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-bold text-[#032622] uppercase">Informations personnelles</h3>
                <button
                  onClick={() => router.push('/validation?step=informations')}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>MODIFIER</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 text-sm sm:text-base text-[#032622]">
                {/* Colonne gauche */}
                <div className="space-y-3">
                  <div>
                    <span className="font-bold">CIVILITÉ :</span> {candidatureData.civilite || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">NOM :</span> {candidatureData.nom || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">PRÉNOM :</span> {candidatureData.prenom || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">TYPE DE FORMATION :</span> {candidatureData.type_formation || 'Non renseigné'}
                  </div>
                </div>
                
                {/* Colonne droite */}
                <div className="space-y-3">
                  <div>
                    <span className="font-bold">TÉLÉPHONE :</span> {candidatureData.telephone || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">EMAIL :</span> {candidatureData.email || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">ADRESSE :</span> {candidatureData.adresse || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">CODE POSTAL:</span> {candidatureData.code_postal || '-'}, {candidatureData.ville || '-'}
                  </div>
                  <div>
                    <span className="font-bold">PAYS :</span> {candidatureData.pays || '-'}
                  </div>
                  <div>
                    <span className="font-bold">ÉTUDIANT ÉTRANGER :</span> {candidatureData.etudiant_etranger || 'Non renseigné'}
                  </div>
                  <div>
                    <span className="font-bold">A UNE ENTREPRISE :</span> {candidatureData.a_une_entreprise || 'Non renseigné'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal du document */}
          <div className="space-y-8 text-[#032622]">
            
            
            {/* Documents */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <h3 className="text-base sm:text-lg font-bold text-[#032622] uppercase">Documents déposés</h3>
                <button
                  onClick={() => router.push('/validation?step=documents')}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>MODIFIER</span>
                </button>
            </div>
            
              {/* CV */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-[#F8F5E4] border border-[#032622]/20">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
            <div className="min-w-0">
                    <span className="font-bold text-sm sm:text-base">CV</span>
                    {candidatureData.cv_path && (
                      <p className="text-xs sm:text-sm text-[#032622]/70 truncate">{candidatureData.cv_path.split('/').pop()}</p>
                    )}
                  </div>
                </div>
                {documentUrls.cv ? (
                  <a 
                    href={documentUrls.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>TÉLÉCHARGER</span>
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm text-[#032622]/60 italic">Non déposé</span>
                )}
            </div>
            
              {/* Diplôme */}
              <div className="flex items-center justify-between p-4 bg-[#F8F5E4] border border-[#032622]/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#032622]" />
            <div>
                    <span className="font-bold">DERNIER DIPLÔME OBTENU</span>
                    {candidatureData.diplome_path && (
                      <p className="text-sm text-[#032622]/70">{candidatureData.diplome_path.split('/').pop()}</p>
                    )}
                  </div>
                </div>
                {documentUrls.diplome ? (
                  <a 
                    href={documentUrls.diplome}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>TÉLÉCHARGER</span>
                  </a>
                ) : (
                  <span className="text-sm text-[#032622]/60 italic">Non déposé</span>
                )}
            </div>
            
              {/* Lettre de motivation */}
              <div className="flex items-center justify-between p-4 bg-[#F8F5E4] border border-[#032622]/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#032622]" />
                  <div>
                    <span className="font-bold">LETTRE DE MOTIVATION</span>
                    {candidatureData.lettre_motivation_path && (
                      <p className="text-sm text-[#032622]/70">{candidatureData.lettre_motivation_path.split('/').pop()}</p>
                    )}
                  </div>
                </div>
                {documentUrls.lettreMotivation ? (
                  <a 
                    href={documentUrls.lettreMotivation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>TÉLÉCHARGER</span>
                  </a>
                ) : (
                  <span className="text-sm text-[#032622]/60 italic">Non déposée</span>
                )}
              </div>
            
              {/* Relevés de notes */}
              <div className="p-4 bg-[#F8F5E4] border border-[#032622]/20">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-[#032622]" />
                  <span className="font-bold">RELEVÉS DE NOTES DES 2 DERNIÈRES ANNÉES</span>
                </div>
                {documentUrls.releves.length > 0 ? (
                  <div className="space-y-2 ml-8">
                    {documentUrls.releves.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-[#032622]/70">{doc.path.split('/').pop()}</span>
                        <a 
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>TÉLÉCHARGER</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-[#032622]/60 italic ml-8">Aucun relevé déposé</span>
                )}
              </div>
              
              {/* Pièces d'identité */}
              <div className="p-4 bg-[#F8F5E4] border border-[#032622]/20">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-[#032622]" />
                  <span className="font-bold">PIÈCE D'IDENTITÉ RECTO/VERSO</span>
                </div>
                {documentUrls.pieceIdentite.length > 0 ? (
                  <div className="space-y-2 ml-8">
                    {documentUrls.pieceIdentite.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-[#032622]/70">{doc.path.split('/').pop()}</span>
                        <a 
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>TÉLÉCHARGER</span>
                        </a>
              </div>
                    ))}
              </div>
                ) : (
                  <span className="text-sm text-[#032622]/60 italic ml-8">Aucune pièce déposée</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zone d'intégration PDF du règlement 
        <div className="w-full mb-6">
          <div className="border border-[#032622] bg-gray-100 flex items-center justify-center" style={{ height: '890px' }}>
            <div className="text-center text-[#032622]">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-[#032622]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-bold">RÈGLEMENT INTÉRIEUR</p>
              <p className="text-sm mt-2">Zone d'intégration PDF</p>
            </div>
          </div>
        </div>
*/}
        {/* Checkboxes */}
        <div className="w-full mb-4 sm:mb-6 p-4 sm:p-5 md:p-6 border border-[#032622] bg-[#F8F5E4]">
          <h3 className="text-base sm:text-lg font-bold text-[#032622] mb-3 sm:mb-4 uppercase">Validation finale</h3>
          <div className="space-y-3 sm:space-y-4">
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-[#C2C6B6]/30 p-2 sm:p-3 transition-colors">
            <input
              type="checkbox"
              checked={acceptConditions}
              onChange={(e) => setAcceptConditions(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
            />
              <span className="text-xs sm:text-sm text-[#032622] flex-1">
                J'accepte les conditions générales d'utilisation et la politique de confidentialité de la plateforme. 
                J'ai lu et compris les termes et conditions applicables à ma candidature.
            </span>
          </label>
          
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-[#C2C6B6]/30 p-2 sm:p-3 transition-colors">
            <input
              type="checkbox"
              checked={attestCorrect}
              onChange={(e) => setAttestCorrect(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0"
            />
              <span className="text-xs sm:text-sm text-[#032622] flex-1">
                J'atteste sur l'honneur que toutes les informations fournies dans ce formulaire sont exactes et complètes. 
                Je suis conscient(e) que toute fausse déclaration peut entraîner le rejet de ma candidature.
            </span>
          </label>
          </div>
          
          {(!acceptConditions || !attestCorrect) && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="text-xs sm:text-sm text-yellow-800">
                ⚠️ Vous devez accepter les deux conditions pour pouvoir continuer
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 md:p-6 border border-[#032622]">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
            <button
              onClick={onPrev}
              disabled={isSaving}
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
              RETOUR
            </button>
            
            <button
              onClick={handleNext}
              disabled={!acceptConditions || !attestCorrect || isSaving}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#032622] text-white hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base w-full sm:w-auto order-1 sm:order-2"
            >
              {isSaving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>SAUVEGARDE...</span>
                </>
              ) : (
                <span>VALIDER ET CONTINUER</span>
              )}
            </button>
          </div>
        </div>
      </main>
      
      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
      />
    </div>
  );
};
