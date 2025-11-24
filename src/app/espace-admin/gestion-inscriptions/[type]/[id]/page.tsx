"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Eye, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface CandidatData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  telephone?: string;
  date_naissance?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  formation?: string;
  type: 'lead' | 'candidat';
  date_inscription?: string;
}

export default function CandidatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as 'lead' | 'candidat';
  const id = params.id as string;

  const [candidat, setCandidat] = useState<CandidatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Récupérer les données depuis l'API
    // Pour l'instant, données mockées
    setTimeout(() => {
      setCandidat({
        id: id,
        user_id: 'mock-user-id',
        name: 'TOJI ZENIN',
        email: 'toute.nglu@fr',
        telephone: '06 12 30 40 40',
        date_naissance: '28/08/1990',
        adresse: '85 AVENUE DU FLEUVE VERDE',
        ville: 'SAINT-PIERRE',
        code_postal: '97410',
        pays: 'France',
        formation: 'COMMUNITY MANAGER',
        type: type,
        date_inscription: '10/08/2023',
      });
      setIsLoading(false);
    }, 500);
  }, [id, type]);

  const steps = [
    { id: 1, label: 'INFORMATIONS', active: true },
    { id: 2, label: 'CONTRAT', active: false },
    { id: 3, label: 'INSCRIPTION', active: false },
    { id: 4, label: 'DOSSIER', active: false },
    { id: 5, label: 'VALIDATION', active: false },
  ];

  const currentStep = 1;
  const totalSteps = 5;

  const paiements = [
    { date: '10 OCTOBRE 2023', statut: 'paye', montant: '950,00€' },
    { date: '10 NOVEMBRE 2023', statut: 'en_attente', montant: '950,00€' },
    { date: '10 DÉCEMBRE 2023', statut: 'en_attente', montant: '950,00€' },
    { date: '10 JANVIER 2024', statut: 'en_attente', montant: '950,00€' },
  ];

  const documents = [
    { nom: 'CURRICULUM VITAE', statut: 'envoye' },
    { nom: "PIÈCE D'IDENTITÉ", statut: 'manquante' },
    { nom: 'DIPLÔMES', statut: 'manquante' },
    { nom: 'RELEVÉS DE NOTES', statut: 'manquante' },
    { nom: 'PHOTO', statut: 'envoye' },
  ];

  const suivi = [
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
  ];

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

  if (!candidat) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#032622] text-lg mb-2">Candidat non trouvé</p>
          <button
            onClick={() => router.back()}
            className="text-[#032622] underline hover:no-underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

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
          PROFIL {type === 'lead' ? 'LEAD' : 'CANDIDAT'} DE {candidat.name.toUpperCase()}
        </h1>
        {candidat.date_inscription && (
          <p className="text-[#032622]/70 text-sm md:text-base">
            CANDIDATURE COMMENCÉE LE {candidat.date_inscription} À 03H32
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Carte Informations Candidat */}
        <div className="lg:col-span-2 border border-[#032622] bg-[#F8F5E4] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 border border-[#032622]/50 bg-[#C9C6B4] flex items-center justify-center flex-shrink-0">
              <User className="w-16 h-16 text-[#032622]/50" />
            </div>

            {/* Informations */}
            <div className="flex-1 space-y-3">
              <h2
                className="text-2xl font-bold text-[#032622] uppercase"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                {candidat.name}
              </h2>

              <div className="space-y-2 text-sm text-[#032622]">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{candidat.email}</span>
                </div>
                {candidat.telephone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{candidat.telephone}</span>
                  </div>
                )}
                {candidat.date_naissance && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>NÉ LE {candidat.date_naissance} À SEINS</span>
                  </div>
                )}
                {(candidat.adresse || candidat.ville) && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span>
                      {candidat.adresse}
                      {candidat.ville && `, ${candidat.ville}`}
                      {candidat.code_postal && ` ${candidat.code_postal}`}
                    </span>
                  </div>
                )}
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
            <button className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm">
              DÉBLOQUER L'ACCÈS À LA PLATEFORME
            </button>
            <button className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm">
              DÉBLOQUER L'ÉTAPE SUIVANTE
            </button>
            <button className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm">
              RELANCER PAR MAIL
            </button>
            <button className="w-full px-4 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors text-sm">
              SUPPRIMER LA CANDIDATURE
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
      <div className="border border-[#032622] bg-[#F8F5E4] p-6 mb-6">
        <h2
          className="text-xl font-bold text-[#032622] mb-4"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          FORMATION CHOISIE
        </h2>
        <div className="space-y-2 text-sm text-[#032622]">
          <p><span className="font-semibold">ÉCOLE:</span> DOFYL LEGACY</p>
          <p><span className="font-semibold">TYPE DE FORMATION:</span> FORMATION INITIALE</p>
          <p><span className="font-semibold">FORMATION:</span> {candidat.formation || '-'}</p>
        </div>
      </div>

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
                {paiements.map((paiement, index) => (
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
                  {doc.statut === 'envoye' ? 'ENVOYÉ' : doc.statut === 'envoye' ? 'ENVOYÉE' : 'MANQUANTE'}
                </span>
                {doc.statut === 'envoye' && (
                  <>
                    <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>VOIR</span>
                    </button>
                    <button className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1">
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
          {suivi.map((item, index) => (
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
    </div>
  );
}

