"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Download, Eye, User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';
import AdminTopBar from '../../../components/AdminTopBar';

interface EtudiantData {
  id: string;
  user_id: string;
  statut: string;
  date_inscription: string;
  email: string;
  telephone?: string;
  formation_id?: number;
  formation: {
    id: number;
    titre: string;
    ecole: string;
  } | null;
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
    email?: string;
    telephone?: string;
    photo_identite_path?: string;
    cv_path?: string;
    diplome_path?: string;
    releves_paths?: string[];
    piece_identite_paths?: string[];
    lettre_motivation_path?: string;
    created_at?: string;
    paid_at?: string;
  } | null;
}

export default function EtudiantInformationsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<EtudiantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/etudiants/${id}`, {
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

          // Charger les URLs des documents
          if (result.data.candidature) {
            loadDocumentUrls(result.data.candidature);
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
      const response = await fetch(`/api/photo-url?path=${encodeURIComponent(photoPath)}&bucket=photo_profil`, {
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

  const loadDocumentUrls = async (candidature: any) => {
    const documents: Record<string, { path: string; bucket: string }> = {};

    if (candidature.photo_identite_path) {
      documents.photo_identite = { path: candidature.photo_identite_path, bucket: 'photo_profil' };
    }
    if (candidature.cv_path) {
      documents.cv = { path: candidature.cv_path, bucket: 'user_documents' };
    }
    if (candidature.diplome_path) {
      documents.diplome = { path: candidature.diplome_path, bucket: 'user_documents' };
    }
    if (candidature.lettre_motivation_path) {
      documents.lettre_motivation = { path: candidature.lettre_motivation_path, bucket: 'user_documents' };
    }
    if (candidature.piece_identite_paths && Array.isArray(candidature.piece_identite_paths)) {
      candidature.piece_identite_paths.forEach((path: string, index: number) => {
        documents[`piece_identite_${index}`] = { path, bucket: 'user_documents' };
      });
    }
    if (candidature.releves_paths && Array.isArray(candidature.releves_paths)) {
      candidature.releves_paths.forEach((path: string, index: number) => {
        documents[`releve_${index}`] = { path, bucket: 'user_documents' };
      });
    }

    // Charger toutes les URLs signées
    const urlPromises = Object.entries(documents).map(async ([key, doc]) => {
      try {
        const response = await fetch(`/api/photo-url?path=${encodeURIComponent(doc.path)}&bucket=${doc.bucket}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.url) {
            return [key, result.url];
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du document ${key}:`, error);
      }
      return [key, null];
    });

    const urls = await Promise.all(urlPromises);
    const urlMap = urls.reduce((acc, [key, url]) => {
      if (url) acc[key] = url as string;
      return acc;
    }, {} as Record<string, string>);

    setDocumentUrls(urlMap);
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen">
        <AdminTopBar notificationCount={1} className="mb-6" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
            <p className="text-[#032622]">Chargement des informations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen">
        <AdminTopBar notificationCount={1} className="mb-6" />
        <div className="text-center py-12">
          <p className="text-[#032622] text-lg">Étudiant non trouvé</p>
        </div>
      </div>
    );
  }

  const candidature = data.candidature;
  const nomComplet = candidature 
    ? `${candidature.prenom} ${candidature.nom}`.toUpperCase()
    : data.email.split('@')[0].toUpperCase();

  // Liste des documents à afficher
  const documentsToDisplay = [
    { 
      name: 'PHOTO D\'IDENTITÉ', 
      path: candidature?.photo_identite_path, 
      bucket: 'photo_profil',
      key: 'photo_identite'
    },
    { 
      name: 'CURRICULUM VITAE', 
      path: candidature?.cv_path, 
      bucket: 'user_documents',
      key: 'cv'
    },
    { 
      name: 'DIPLÔMES', 
      path: candidature?.diplome_path, 
      bucket: 'user_documents',
      key: 'diplome'
    },
    { 
      name: 'LETTRE DE MOTIVATION', 
      path: candidature?.lettre_motivation_path, 
      bucket: 'user_documents',
      key: 'lettre_motivation'
    },
    ...(candidature?.piece_identite_paths || []).map((path: string, index: number) => ({
      name: `PIÈCE D'IDENTITÉ ${index + 1}`,
      path: path,
      bucket: 'user_documents',
      key: `piece_identite_${index}`
    })),
    ...(candidature?.releves_paths || []).map((path: string, index: number) => ({
      name: `RELEVÉ DE NOTES ${index + 1}`,
      path: path,
      bucket: 'user_documents',
      key: `releve_${index}`
    })),
  ].filter(doc => doc.path);

  return (
    <div className="flex-1 p-6 md:p-10 bg-[#F8F5E4] min-h-screen">
      <AdminTopBar notificationCount={1} className="mb-6" />

      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-[#032622] hover:underline mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Retour</span>
      </button>

      {/* En-tête */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-4xl font-bold text-[#032622] mb-2"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          INFORMATIONS DE {nomComplet}
        </h1>
        <p className="text-[#032622]/70 text-sm md:text-base">
          Profil complet de l'étudiant
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-6">
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
                    <span className="font-bold text-[#032622] uppercase">DATE DE NAISSANCE:</span>
                    <span className="ml-2 text-[#032622]">
                      {candidature?.date_naissance 
                        ? new Date(candidature.date_naissance).toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#032622] uppercase">TYPE DE FORMATION:</span>
                    <span className="ml-2 text-[#032622]">{candidature?.type_formation || '-'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-[#032622] uppercase">TÉLÉPHONE:</span>
                    <span className="ml-2 text-[#032622]">{data.telephone || candidature?.telephone || '-'}</span>
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

          {/* Formation */}
          {data.formation && (
            <div className="border border-[#032622] bg-[#F8F5E4] p-6">
              <h2
                className="text-xl font-bold text-[#032622] mb-4 uppercase"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                FORMATION
              </h2>
              <div className="space-y-2 text-sm text-[#032622]">
                <p><span className="font-semibold">ÉCOLE:</span> {data.formation.ecole}</p>
                <p><span className="font-semibold">FORMATION:</span> {data.formation.titre}</p>
                <p><span className="font-semibold">TYPE DE FORMATION:</span> {candidature?.type_formation || 'FORMATION INITIALE'}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-6">
            <h2
              className="text-xl font-bold text-[#032622] mb-4 uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DOCUMENTS
            </h2>
            <div className="space-y-2">
              {documentsToDisplay.map((doc, index) => {
                const docUrl = documentUrls[doc.key];
                const hasDocument = !!doc.path;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-[#032622]/30 bg-[#F8F5E4]"
                  >
                    <span className="text-sm font-semibold text-[#032622]">{doc.name}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold text-white ${
                          hasDocument ? 'bg-[#4CAF50]' : 'bg-[#D96B6B]'
                        }`}
                      >
                        {hasDocument ? 'ENVOYÉ' : 'MANQUANTE'}
                      </span>
                      {hasDocument && docUrl && (
                        <>
                          <button
                            onClick={() => handleViewDocument(docUrl)}
                            className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>VOIR</span>
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(docUrl, doc.name)}
                            className="text-[#032622] hover:underline text-sm font-semibold flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>TÉLÉCHARGER</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar droite (1/3) */}
        <div className="space-y-6">
          {/* Informations complémentaires */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-6">
            <h2
              className="text-xl font-bold text-[#032622] mb-4 uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              INFORMATIONS COMPLÉMENTAIRES
            </h2>
            <div className="space-y-3 text-sm text-[#032622]">
              <div>
                <span className="font-semibold">STATUT:</span>
                <span className="ml-2 capitalize">{data.statut}</span>
              </div>
              <div>
                <span className="font-semibold">DATE D'INSCRIPTION:</span>
                <span className="ml-2">
                  {data.date_inscription 
                    ? new Date(data.date_inscription).toLocaleDateString('fr-FR')
                    : '-'}
                </span>
              </div>
              {candidature?.paid_at && (
                <div>
                  <span className="font-semibold">DATE DE PAIEMENT:</span>
                  <span className="ml-2">
                    {new Date(candidature.paid_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

