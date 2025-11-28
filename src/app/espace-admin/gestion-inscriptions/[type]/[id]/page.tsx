"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Download, Eye, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Modal } from '@/app/Modal';
import { useModal } from '@/app/validation/components/useModal';

interface CandidatData {
  id: string;
  user_id: string;
  role: 'lead' | 'candidat';
  email: string;
  telephone?: string;
  formation_id?: number;
  created_at: string;
  candidature: {
    id: string;
    civilite?: string;
    nom: string;
    prenom: string;
    adresse?: string;
    code_postal?: string;
    ville?: string;
    pays?: string;
    date_naissance?: string;
    type_formation?: string;
    etudiant_etranger?: string;
    a_une_entreprise?: string;
    current_step?: string;
    status?: string;
    photo_identite_path?: string;
    cv_path?: string;
    diplome_path?: string;
    releves_paths?: string[];
    piece_identite_paths?: string[];
    lettre_motivation_path?: string;
    created_at?: string;
  } | null;
  formation: {
    id: number;
    titre: string;
    ecole: string;
  } | null;
}

const stepsMap: Record<string, number> = {
  informations: 1,
  contrat: 1, // CONTRAT retiré, mappé vers informations
  inscription: 2,
  documents: 3,
  recap: 4,
  validation: 5,
};

export default function CandidatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as 'lead' | 'candidat';
  const id = params.id as string;

  const [data, setData] = useState<CandidatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { showConfirm } = useModal();

  useEffect(() => {
    loadData();
  }, [id, type]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/inscriptions/${type}/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          
          // Charger la photo si elle existe
          if (result.data.candidature?.photo_identite_path) {
            loadPhoto(result.data.candidature.photo_identite_path);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhoto = async (photoPath: string) => {
    try {
      // Générer l'URL signée pour la photo
      const response = await fetch(`/api/photo-url?path=${encodeURIComponent(photoPath)}&bucket=user_documents`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          setPhotoUrl(result.url);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la photo:', error);
    }
  };

  const handleAction = async (action: string) => {
    setIsActionLoading(action);
    try {
      const response = await fetch(`/api/admin/inscriptions/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      
      if (result.success) {
        if (action === 'debloquer_acces' || action === 'supprimer_candidature') {
          router.push('/espace-admin/gestion-inscriptions');
        } else {
          // Recharger les données
          loadData();
        }
      } else {
        setErrorMessage(result.error || 'Erreur lors de l\'action');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'action');
      setShowErrorModal(true);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDownloadDocument = async (path: string, bucket: string = 'user_documents') => {
    try {
      const response = await fetch(`/api/photo-url?path=${encodeURIComponent(path)}&bucket=${bucket}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          window.open(result.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#032622] text-lg mb-2">Candidat non trouvé</p>
          <button
            onClick={() => router.push('/espace-admin/gestion-inscriptions')}
            className="text-[#032622] underline hover:no-underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const candidature = data.candidature;
  const nomComplet = candidature ? `${candidature.prenom} ${candidature.nom}` : data.email.split('@')[0];
  const dateInscription = candidature?.created_at 
    ? new Date(candidature.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Date(data.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Déterminer l'étape actuelle
  const currentStep = candidature?.current_step ? stepsMap[candidature.current_step] || 1 : 1;
  const totalSteps = 5;
  const steps = [
    { id: 1, label: 'INFORMATIONS', active: currentStep >= 1 },
    { id: 2, label: 'INSCRIPTION', active: currentStep >= 2 },
    { id: 3, label: 'DOCUMENTS', active: currentStep >= 3 },
    { id: 4, label: 'RECAP', active: currentStep >= 4 },
    { id: 5, label: 'VALIDATION', active: currentStep >= 5 },
  ];

  // Documents avec statuts
  const documents = [
    { 
      nom: 'CURRICULUM VITAE', 
      path: candidature?.cv_path,
      statut: candidature?.cv_path ? 'envoye' : 'manquante'
    },
    { 
      nom: "PIÈCE D'IDENTITÉ", 
      path: candidature?.piece_identite_paths?.[0],
      statut: candidature?.piece_identite_paths && candidature.piece_identite_paths.length > 0 ? 'envoye' : 'manquante'
    },
    { 
      nom: 'DIPLÔMES', 
      path: candidature?.diplome_path,
      statut: candidature?.diplome_path ? 'envoye' : 'manquante'
    },
    { 
      nom: 'RELEVÉS DE NOTES', 
      path: candidature?.releves_paths?.[0],
      statut: candidature?.releves_paths && candidature.releves_paths.length > 0 ? 'envoye' : 'manquante'
    },
    { 
      nom: 'PHOTO', 
      path: candidature?.photo_identite_path,
      statut: candidature?.photo_identite_path ? 'envoye' : 'manquante'
    },
    { 
      nom: 'LETTRE DE MOTIVATION', 
      path: candidature?.lettre_motivation_path,
      statut: candidature?.lettre_motivation_path ? 'envoye' : 'manquante'
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen">
      {/* En-tête avec bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/espace-admin/gestion-inscriptions')}
          className="flex items-center space-x-2 text-[#032622] hover:underline mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1
          className="text-3xl md:text-4xl font-bold text-[#032622] mb-2"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          PROFIL {type === 'lead' ? 'LEAD' : 'CANDIDAT'} DE {nomComplet.toUpperCase()}
        </h1>
        <p className="text-[#032622]/70 text-sm md:text-base">
          CANDIDATURE COMMENCÉE LE {dateInscription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Carte Informations Personnelles */}
        <div className="lg:col-span-2 border border-[#032622] bg-[#F8F5E4] p-6">
          <h2
            className="text-xl font-bold text-[#032622] mb-4 uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            INFORMATIONS PERSONNELLES
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="w-32 h-40 border border-[#032622]/50 bg-[#C9C6B4] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Photo"
                  width={128}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-[#032622]/50" />
              )}
            </div>

            {/* Informations en 2 colonnes */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-[#032622] uppercase">CIVILITÉ:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.civilite || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">NOM:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.nom || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">PRÉNOM:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.prenom || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">TYPE DE FORMATION:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.type_formation || '-'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-[#032622] uppercase">TÉLÉPHONE:</span>
                  <span className="ml-2 text-[#032622]">{data.telephone || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">EMAIL:</span>
                  <span className="ml-2 text-[#032622]">{data.email || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">ADRESSE:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.adresse || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">CODE POSTAL:</span>
                  <span className="ml-2 text-[#032622]">
                    {candidature?.code_postal || ''}
                    {candidature?.ville && `, ${candidature.ville}`}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">PAYS:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.pays || 'France'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">ÉTUDIANT ÉTRANGER:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.etudiant_etranger || 'non'}</span>
                </div>
                <div>
                  <span className="font-bold text-[#032622] uppercase">A UNE ENTREPRISE:</span>
                  <span className="ml-2 text-[#032622]">{candidature?.a_une_entreprise || 'non'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carte Actions */}
        <div className="border border-[#032622] bg-[#F8F5E4] p-6">
          <h2
            className="text-xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            ACTION
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => handleAction('debloquer_acces')}
              disabled={isActionLoading === 'debloquer_acces' || data?.role === 'lead'}
              className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={data?.role === 'lead' ? 'Seuls les candidats peuvent être débloqués' : undefined}
            >
              {isActionLoading === 'debloquer_acces' ? 'TRAITEMENT...' : "DÉBLOQUER L'ACCÈS À LA PLATEFORME"}
            </button>
            <button
              onClick={() => handleAction('debloquer_etape')}
              disabled={isActionLoading === 'debloquer_etape'}
              className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm disabled:opacity-50"
            >
              {isActionLoading === 'debloquer_etape' ? 'TRAITEMENT...' : "DÉBLOQUER L'ÉTAPE SUIVANTE"}
            </button>
            <button
              onClick={() => handleAction('relancer_mail')}
              disabled={isActionLoading === 'relancer_mail'}
              className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm disabled:opacity-50"
            >
              {isActionLoading === 'relancer_mail' ? 'TRAITEMENT...' : 'RELANCER PAR MAIL'}
            </button>
            <button
              onClick={() => {
                showConfirm(
                  'Supprimer la candidature',
                  'Êtes-vous sûr de vouloir supprimer cette candidature ? Cette action est irréversible.',
                  () => handleAction('supprimer_candidature')
                );
              }}
              disabled={isActionLoading === 'supprimer_candidature'}
              className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm disabled:opacity-50"
            >
              {isActionLoading === 'supprimer_candidature' ? 'SUPPRESSION...' : 'SUPPRIMER LA CANDIDATURE'}
            </button>
          </div>
        </div>
      </div>

      {/* Progression du Dossier */}
      <div className="border border-[#032622] bg-[#F8F5E4] p-6 mb-6">
        <h2
          className="text-xl font-bold text-[#032622] mb-4"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          PROGRESSION DU DOSSIER
        </h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div
                  className={`flex-1 h-2 ${
                    step.active ? 'bg-[#032622]' : 'bg-[#032622]/20'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      step.active ? 'bg-[#032622]' : 'bg-[#032622]/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-[#032622]">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`font-semibold ${step.active ? 'text-[#032622]' : 'text-[#032622]/50'}`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-[#032622]">
          ÉTAPE {currentStep} SUR {totalSteps}
        </p>
      </div>

      {/* Formation Choisie */}
      {data.formation && (
        <div className="border border-[#032622] bg-[#F8F5E4] p-6 mb-6">
          <h2
            className="text-xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            FORMATION CHOISIE
          </h2>
          <div className="space-y-2 text-sm text-[#032622]">
            <p><span className="font-semibold">ÉCOLE:</span> {data.formation.ecole}</p>
            <p><span className="font-semibold">TYPE DE FORMATION:</span> {candidature?.type_formation || 'FORMATION INITIALE'}</p>
            <p><span className="font-semibold">FORMATION:</span> {data.formation.titre}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contrat */}
        <div className="border border-[#032622] bg-[#F8F5E4] p-6">
          <h2
            className="text-xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            CONTRAT
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[#032622]/30 bg-[#F8F5E4]">
              <span className="text-sm font-semibold text-[#032622]">CONTRAT DE FORMATION</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-semibold text-white bg-[#4CAF50]">
                  SIGNÉ
                </span>
                <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>VOIR</span>
                </button>
                <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>TÉLÉCHARGER</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paiement */}
        <div className="border border-[#032622] bg-[#F8F5E4] p-6">
          <h2
            className="text-xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            PAIEMENT
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-[#032622]/30 bg-[#F8F5E4]">
              <span className="text-sm font-semibold text-[#032622]">Frais de Scolarité</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-semibold text-white bg-[#4CAF50]">
                  PAYÉ
                </span>
                <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>VOIR</span>
                </button>
                <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>TÉLÉCHARGER</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-[#032622]">
                <span className="font-semibold">Coût de la Formation:</span> 10 000,00€
              </p>
              <div className="space-y-2">
                {[
                  { date: '10 OCTOBRE 2023', statut: 'paye', montant: '950,00€' },
                  { date: '10 NOVEMBRE 2023', statut: 'en_attente', montant: '950,00€' },
                  { date: '10 DÉCEMBRE 2023', statut: 'en_attente', montant: '950,00€' },
                  { date: '10 JANVIER 2024', statut: 'en_attente', montant: '950,00€' },
                ].map((paiement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border border-[#032622]/20 bg-[#F8F5E4]"
                  >
                    <span className="text-xs text-[#032622]">{paiement.date}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold text-white ${
                          paiement.statut === 'paye'
                            ? 'bg-[#4CAF50]'
                            : 'bg-[#F0C75E]'
                        }`}
                      >
                        {paiement.statut === 'paye' ? 'PAYÉ' : 'EN ATTENTE'}
                      </span>
                      <span className="text-xs font-semibold text-[#032622]">
                        {paiement.montant}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#032622]/20">
                <p className="text-sm font-semibold text-[#032622] text-right">
                  Total: 950,00€
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="border border-[#032622] bg-[#F8F5E4] p-6 mb-6">
        <h2
          className="text-xl font-bold text-[#032622] mb-4"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          DOCUMENTS
        </h2>
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-[#032622]/30 bg-[#F8F5E4]"
            >
              <span className="text-sm font-semibold text-[#032622]">{doc.nom}</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold text-white ${
                    doc.statut === 'envoye' ? 'bg-[#4CAF50]' : 'bg-[#D96B6B]'
                  }`}
                >
                  {doc.statut === 'envoye' ? 'ENVOYÉ' : doc.nom === 'PHOTO' ? 'ENVOYÉE' : 'MANQUANTE'}
                </span>
                {doc.statut === 'envoye' && doc.path && (
                  <>
                    <button
                      onClick={() => handleDownloadDocument(doc.path!, 'user_documents')}
                      className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>VOIR</span>
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc.path!, 'user_documents')}
                      className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>TÉLÉCHARGER</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suivi de la Candidature */}
      <div className="border border-[#032622] bg-[#F8F5E4] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            SUIVI DE LA CANDIDATURE
          </h2>
          <button className="px-4 py-2 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm">
            NOUVEAU +
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              date: 'OCT 10 10H15',
              type: 'APPEL TÉLÉPHONIQUE',
              description: 'Durée: 30 min, discussion sur les modalités, documents à fournir et entretien d\'admission.',
              auteur: 'Par Ymir F.',
            },
            {
              date: 'SEPT 20 13H05',
              type: 'ENVOI D\'EMAIL DE RELANCE',
              description: 'Envoi des documents manquants à fournir.',
              auteur: 'Par Ymir F.',
            },
            {
              date: 'SEPT 12 13H09',
              type: 'NOTE INTERNE',
              description: 'Candidature semble prometteuse, à recontacter rapidement.',
              auteur: 'Par Ymir F.',
            },
            {
              date: 'SEPT 12',
              type: 'ENVOI D\'EMAIL DE RELANCE',
              description: '',
              auteur: 'Par Ymir F.',
            },
          ].map((item, index) => (
            <div key={index} className="border-l-4 border-[#032622] pl-4 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-[#032622]">{item.date}</span>
                    <span className="text-sm font-semibold text-[#032622]">{item.type}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-[#032622]/80 mb-1">{item.description}</p>
                  )}
                  <p className="text-xs text-[#032622]/60">{item.auteur}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'erreur */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        title="Erreur"
        message={errorMessage}
        type="error"
      />
    </div>
  );
}
