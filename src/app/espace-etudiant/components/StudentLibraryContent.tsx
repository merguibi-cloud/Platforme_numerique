"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { Modal } from "@/app/Modal";
import { BibliothequeFichier, schools, LibraryDocument } from "../../espace-admin/components/bibliotheque/types";
import { mapSujetToCategory } from "../../espace-admin/components/bibliotheque/utils";
import { DocumentShelf } from "../../espace-admin/components/bibliotheque/DocumentShelf";
import { FilterButton } from "../../espace-admin/components/bibliotheque/FilterButton";
import { LibraryTable } from "../../espace-admin/components/bibliotheque/LibraryTable";
import { DocumentModal } from "../../espace-admin/components/bibliotheque/DocumentModal";
import { DocumentViewer } from "../../espace-admin/components/bibliotheque/DocumentViewer";
import { AudioPlayer } from "../../espace-admin/components/bibliotheque/AudioPlayer";
import { VideoPlayer } from "../../espace-admin/components/bibliotheque/VideoPlayer";

const StudentLibraryContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("plus récent");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedSchoolForSections, setSelectedSchoolForSections] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<BibliothequeFichier | null>(null);
  const [selectedDocumentProprietaire, setSelectedDocumentProprietaire] = useState<string>("");
  const [viewingDocument, setViewingDocument] = useState<BibliothequeFichier | null>(null);
  const [viewerType, setViewerType] = useState<'document' | 'audio' | 'video' | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // États pour les données réelles
  const [documents, setDocuments] = useState<BibliothequeFichier[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [favorites, setFavorites] = useState<BibliothequeFichier[]>([]);
  const [interviews, setInterviews] = useState<BibliothequeFichier[]>([]);
  const [podcasts, setPodcasts] = useState<BibliothequeFichier[]>([]);
  const [files, setFiles] = useState<BibliothequeFichier[]>([]);
  
  // Tous les documents combinés pour DocumentShelf (sans doublons)
  const allDocumentsCombined = useMemo(() => {
    const allDocsMap = new Map<string, BibliothequeFichier>();
    [...documents, ...favorites, ...interviews, ...podcasts, ...files].forEach(doc => {
      allDocsMap.set(doc.id, doc);
    });
    return Array.from(allDocsMap.values());
  }, [documents, favorites, interviews, podcasts, files]);
  
  // États pour le modal d'erreur/avertissement
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  
  const showModal = useCallback((message: string, title: string = 'Information', type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setModalState({ isOpen: true, title, message, type });
  }, []);
  
  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);
  
  // Références pour le debounce et les pending updates
  const favoriDebounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingFavoriUpdates = useRef<Map<string, { newValue: boolean; originalValue: boolean }>>(new Map());
  
  // Ref pour garder une référence à jour des documents
  const documentsRef = useRef<BibliothequeFichier[]>([]);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  // Fonction helper pour traiter les documents et extraire les sections
  const processDocumentsForSections = useCallback((allDocs: BibliothequeFichier[], schoolFilter?: string | null) => {
    let filteredDocs = allDocs;
    if (schoolFilter) {
      filteredDocs = allDocs.filter(doc => doc.ecole === schoolFilter);
    }

    const favs = filteredDocs
      .filter(doc => doc.est_favori === true)
      .slice(0, 4);
    setFavorites(favs);

    const interviewDocs = filteredDocs
      .filter(doc => {
        const sujet = doc.sujet?.toLowerCase().trim();
        return sujet === 'interview';
      })
      .sort((a, b) => new Date(b.date_importation || '').getTime() - new Date(a.date_importation || '').getTime())
      .slice(0, 4);
    setInterviews(interviewDocs);

    const podcastDocs = filteredDocs
      .filter(doc => {
        const sujet = doc.sujet?.toLowerCase().trim();
        return sujet === 'podcast';
      })
      .sort((a, b) => new Date(b.date_importation || '').getTime() - new Date(a.date_importation || '').getTime())
      .slice(0, 4);
    setPodcasts(podcastDocs);

    const fileDocs = filteredDocs
      .filter(doc => {
        const typeLower = (doc.type_fichier || '').toLowerCase().trim();
        const bucketName = (doc.bucket_name || '').toLowerCase().trim();
        const isVideo = bucketName === 'youtube' || typeLower === 'mp4';
        return !isVideo;
      })
      .sort((a, b) => new Date(b.date_importation || '').getTime() - new Date(a.date_importation || '').getTime())
      .slice(0, 4);
    setFiles(fileDocs);
  }, []);

  // Charger les documents depuis la BDD
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocuments(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedSchool) params.append('ecole', selectedSchool);
      if (searchTerm.trim()) params.append('search', searchTerm);
      params.append('sortBy', 'date_importation');
      params.append('sortOrder', sortOrder === 'plus récent' ? 'desc' : 'asc');

      const response = await fetch(`/api/bibliotheque/list?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.fichiers || []);
        }
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [selectedType, selectedSchool, searchTerm, sortOrder]);

  // Charger tous les documents pour les sections
  const loadAllDocumentsForSections = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSchoolForSections) params.append('ecole', selectedSchoolForSections);
      params.append('sortBy', 'date_importation');
      params.append('sortOrder', 'desc');

      const response = await fetch(`/api/bibliotheque/list?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.fichiers) {
          const allDocs = data.fichiers as BibliothequeFichier[];
          processDocumentsForSections(allDocs, selectedSchoolForSections);
        }
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }, [selectedSchoolForSections, processDocumentsForSections]);

  // Charger au montage
  useEffect(() => {
    loadDocuments();
    loadAllDocumentsForSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Recharger quand les filtres de la table changent
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedSchool, sortOrder]);

  // Recharger les sections quand le filtre d'école des sections change
  useEffect(() => {
    loadAllDocumentsForSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolForSections]);

  // Fonction helper pour charger un document
  const loadDocumentWithProprietaire = useCallback(async (docId: string, fallbackDoc?: BibliothequeFichier) => {
    if (fallbackDoc) {
      setSelectedDocument(fallbackDoc);
      setSelectedDocumentProprietaire("");
    }
    
    try {
      const response = await fetch(`/api/bibliotheque/document/${docId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedDocument(data.fichier);
          setSelectedDocumentProprietaire(data.proprietaire || "");
        }
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }, []);

  // Fonction pour toggle le favori avec optimistic UI et debounce
  const toggleFavori = useCallback((documentId: string, currentFavori: boolean) => {
    const newFavoriValue = !currentFavori;
    const originalValue = currentFavori;
    
    const existingTimer = favoriDebounceTimers.current.get(documentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    if (!pendingFavoriUpdates.current.has(documentId)) {
      pendingFavoriUpdates.current.set(documentId, {
        newValue: newFavoriValue,
        originalValue: originalValue
      });
    } else {
      const pending = pendingFavoriUpdates.current.get(documentId);
      if (pending) {
        pending.newValue = newFavoriValue;
      }
    }
    
    // Optimistic UI
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, est_favori: newFavoriValue }
          : doc
      )
    );
    
    setSelectedDocument(prev => {
      if (prev?.id === documentId) {
        return { ...prev, est_favori: newFavoriValue };
      }
      return prev;
    });
    
    setFavorites(prevFavs => {
      if (newFavoriValue) {
        if (!prevFavs.find(f => f.id === documentId)) {
          const doc = documentsRef.current.find(d => d.id === documentId);
          if (doc) {
            return [...prevFavs, { ...doc, est_favori: true }].slice(0, 4);
          }
        }
        return prevFavs;
      } else {
        return prevFavs.filter(f => f.id !== documentId);
      }
    });
    
    // Débouncer la sauvegarde
    const timer = setTimeout(async () => {
      const pending = pendingFavoriUpdates.current.get(documentId);
      if (!pending) return;
      
      try {
        const response = await fetch(`/api/bibliotheque/favoris/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ est_favori: pending.newValue })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            loadAllDocumentsForSections();
            pendingFavoriUpdates.current.delete(documentId);
            favoriDebounceTimers.current.delete(documentId);
            return;
          }
        }
        
        throw new Error('Erreur lors de la sauvegarde');
      } catch (error) {
        // Rollback
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === documentId 
              ? { ...doc, est_favori: pending.originalValue }
              : doc
          )
        );
        
        setSelectedDocument(prev => {
          if (prev?.id === documentId) {
            return { ...prev, est_favori: pending.originalValue };
          }
          return prev;
        });
        
        setFavorites(prevFavs => {
          if (pending.originalValue) {
            const doc = documentsRef.current.find(d => d.id === documentId);
            if (doc && !prevFavs.find(f => f.id === documentId)) {
              return [...prevFavs, { ...doc, est_favori: true }].slice(0, 4);
            }
          } else {
            return prevFavs.filter(f => f.id !== documentId);
          }
          return prevFavs;
        });
        
        pendingFavoriUpdates.current.delete(documentId);
        favoriDebounceTimers.current.delete(documentId);
        
        showModal(
          'Une erreur est survenue lors de la sauvegarde du favori.',
          'Erreur de sauvegarde',
          'error'
        );
      }
    }, 500);
    
    favoriDebounceTimers.current.set(documentId, timer);
  }, [loadAllDocumentsForSections, showModal]);

  // Cleanup des timers au démontage
  useEffect(() => {
    return () => {
      favoriDebounceTimers.current.forEach(timer => clearTimeout(timer));
      favoriDebounceTimers.current.clear();
    };
  }, []);

  // Fonction pour ouvrir un viewer
  const handleOpenViewer = useCallback(async (document: BibliothequeFichier) => {
    try {
      await fetch('/api/bibliotheque/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichier_id: document.id })
      });

      const response = await fetch(`/api/bibliotheque/file-url/${document.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          const fileType = document.type_fichier?.toLowerCase() || '';
          let viewerType: 'document' | 'audio' | 'video' = 'document';
          
          if (document.bucket_name === 'youtube' || data.isYoutube) {
            viewerType = 'video';
          } else if (fileType.includes('audio') || fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('podcast')) {
            viewerType = 'audio';
          } else if (fileType.includes('video') || fileType.includes('mp4') || fileType.includes('mov') || fileType.includes('avi') || fileType.includes('masterclass')) {
            viewerType = 'video';
          }
          
          setViewingDocument(document);
          setFileUrl(data.url);
          setViewerType(viewerType);
          setSelectedDocument(null);
        }
      }
    } catch (error) {
      // Erreur silencieuse
    }
  }, []);

  // Fonction pour télécharger un document
  const handleDocumentDownload = useCallback(async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) {
        showModal(
          'Le document que vous essayez de télécharger n\'a pas été trouvé.',
          'Document introuvable',
          'error'
        );
        return;
      }

      try {
        await fetch('/api/bibliotheque/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fichier_id: documentId })
        });
      } catch (error) {
        // Continuer même si l'enregistrement échoue
      }

      const response = await fetch(`/api/bibliotheque/file-url/${documentId}?download=true&force=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          window.open(data.url, '_blank');
          loadDocuments();
        } else {
          showModal(
            'Impossible de générer l\'URL de téléchargement.',
            'Erreur de téléchargement',
            'error'
          );
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}\n\n${errorData.details}` 
          : errorData.error || 'Une erreur est survenue lors du téléchargement.';
        showModal(errorMessage, 'Erreur de téléchargement', 'error');
      }
    } catch (error: any) {
      showModal(
        error.message || 'Une erreur inattendue est survenue.',
        'Erreur de téléchargement',
        'error'
      );
    }
  }, [documents, showModal, loadDocuments]);

  // Convertir BibliothequeFichier vers TableDocument
  const tableDocs = useMemo(() => {
    return documents
      .map((doc) => ({
        id: doc.id,
        title: doc.titre,
        organization: doc.ecole || 'Plateforme',
        type: doc.type_fichier,
        date: new Date(doc.date_importation).toLocaleDateString('fr-FR'),
        expiration: doc.date_expiration ? new Date(doc.date_expiration).toLocaleDateString('fr-FR') : '-'
      }));
  }, [documents]);

  // Mémoriser les arrays de documents
  const favoritesDocs = useMemo(() => favorites.map(doc => ({
    id: doc.id,
    title: doc.titre,
    description: doc.ecole || undefined,
    tag: mapSujetToCategory(doc.sujet)
  })), [favorites]);

  const interviewsDocs = useMemo(() => interviews.map(doc => ({
    id: doc.id,
    title: doc.titre,
    description: doc.ecole || undefined,
    tag: mapSujetToCategory(doc.sujet)
  })), [interviews]);

  const podcastsDocs = useMemo(() => podcasts.map(doc => ({
    id: doc.id,
    title: doc.titre,
    description: doc.ecole || undefined,
    tag: mapSujetToCategory(doc.sujet)
  })), [podcasts]);

  const filesDocs = useMemo(() => files.map(doc => ({
    id: doc.id,
    title: doc.titre,
    description: doc.ecole || undefined,
    tag: mapSujetToCategory(doc.sujet)
  })), [files]);

  // Mémoriser les handlers de clic
  const handleFavoritesClick = useCallback((doc: LibraryDocument) => {
    const fullDoc = favorites.find(d => d.id === doc.id);
    if (fullDoc) loadDocumentWithProprietaire(doc.id, fullDoc);
  }, [favorites, loadDocumentWithProprietaire]);

  const handleInterviewsClick = useCallback((doc: LibraryDocument) => {
    const fullDoc = interviews.find(d => d.id === doc.id);
    if (fullDoc) loadDocumentWithProprietaire(doc.id, fullDoc);
  }, [interviews, loadDocumentWithProprietaire]);

  const handlePodcastsClick = useCallback((doc: LibraryDocument) => {
    const fullDoc = podcasts.find(d => d.id === doc.id);
    if (fullDoc) loadDocumentWithProprietaire(doc.id, fullDoc);
  }, [podcasts, loadDocumentWithProprietaire]);

  const handleFilesClick = useCallback((doc: LibraryDocument) => {
    const fullDoc = files.find(d => d.id === doc.id);
    if (fullDoc) loadDocumentWithProprietaire(doc.id, fullDoc);
  }, [files, loadDocumentWithProprietaire]);

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 xl:space-y-10">
      <section className="space-y-6">
        <header className="flex items-start justify-between">
          <div className="space-y-2">
            <h1
              className="text-4xl font-bold text-[#032622]"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              BIBLIOTHÈQUE NUMÉRIQUE
            </h1>
            <p className="text-sm text-[#032622]/70 max-w-2xl">
              Consultez et téléchargez l'ensemble des ressources pédagogiques, replays et méthodologies
              pour les différentes écoles de la plateforme.
            </p>
          </div>
        </header>

        <div className="border border-[#032622] bg-[#032622] h-44" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h2
              className="text-sm font-semibold text-[#032622] tracking-wider"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DOCUMENTS PAR ÉCOLES
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 items-center gap-10">
              {schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => {
                    setSelectedSchoolForSections(selectedSchoolForSections === school.name ? null : school.name);
                  }}
                  className={`flex items-center justify-center px-2 h-16 transition-all ${
                    selectedSchoolForSections === school.name 
                      ? 'ring-4 ring-[#032622] bg-[#eae5cf] rounded-lg' 
                      : 'hover:bg-[#eae5cf]/50 rounded-lg'
                  }`}
                >
                  <Image
                    src={school.logo}
                    alt={school.name}
                    width={176}
                    height={56}
                    className="h-14 w-44 object-contain mx-auto"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DocumentShelf 
        title="FAVORIS" 
        documents={favoritesDocs} 
        onDocumentClick={handleFavoritesClick}
        onToggleFavori={toggleFavori}
        allDocuments={allDocumentsCombined}
      />
      <DocumentShelf 
        title="INTERVIEW" 
        documents={interviewsDocs} 
        onDocumentClick={handleInterviewsClick}
        onToggleFavori={toggleFavori}
        allDocuments={allDocumentsCombined}
      />
      <DocumentShelf 
        title="PODCAST" 
        documents={podcastsDocs} 
        onDocumentClick={handlePodcastsClick}
        onToggleFavori={toggleFavori}
        allDocuments={allDocumentsCombined}
      />
      <DocumentShelf 
        title="FICHIERS" 
        documents={filesDocs} 
        onDocumentClick={handleFilesClick}
        onToggleFavori={toggleFavori}
        allDocuments={allDocumentsCombined}
      />

      <section className="space-y-6">
        <div className="relative w-full max-w-xl">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Recherche"
            className="w-full border border-[#032622] bg-[#F8F5E4] px-4 py-3 text-sm text-[#032622] focus:outline-none focus:border-[#01302C]"
          />
          <Search className="w-5 h-5 text-[#032622] absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        <h2
          className="text-sm font-semibold text-[#032622] tracking-wider mb-4"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          RÉCAPITULATIF COMPLET
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#032622]">
          <FilterButton
            label={`Type${selectedType ? ` : ${selectedType}` : ""}`}
            options={["Ebook", "PDF", "Masterclass", "Présentation", "Podcast", "MP4", "MP3", "DOCX", "PPTX", "XLSX", "Interview"]}
            onSelect={(value) => setSelectedType(value === selectedType ? null : value)}
          />
          <FilterButton
            label={`École${selectedSchool ? ` : ${selectedSchool}` : ""}`}
            options={schools.map((school) => school.name)}
            onSelect={(value) => setSelectedSchool(value === selectedSchool ? null : value)}
          />
          <FilterButton
            label={`Trier par : ${sortOrder}`}
            onSelect={() => setSortOrder(sortOrder === "plus récent" ? "plus ancien" : "plus récent")}
          />
        </div>

        <LibraryTable 
          documents={tableDocs} 
          isLoading={isLoadingDocuments}
          onDocumentClick={(docId) => {
            const fullDoc = documents.find(d => d.id === docId);
            if (fullDoc) loadDocumentWithProprietaire(docId, fullDoc);
          }}
          onDownloadClick={handleDocumentDownload}
        />
      </section>

      {selectedDocument && (
        <DocumentModal 
          document={selectedDocument}
          proprietaire={selectedDocumentProprietaire}
          onClose={() => {
            setSelectedDocument(null);
            setSelectedDocumentProprietaire("");
          }}
          onRefresh={() => {
            loadDocuments();
            loadAllDocumentsForSections();
          }}
          onToggleFavori={toggleFavori}
          onView={(doc) => handleOpenViewer(doc)}
          showModal={showModal}
          isReadOnly={true}
        />
      )}

      {/* Viewers */}
      {viewingDocument && fileUrl && viewerType === 'document' && (
        <DocumentViewer
          document={viewingDocument}
          fileUrl={fileUrl}
          onClose={() => {
            setViewingDocument(null);
            setFileUrl(null);
            setViewerType(null);
            loadDocuments();
          }}
          onOptionsClick={() => {
            // Pas d'options pour les étudiants
          }}
        />
      )}

      {viewingDocument && fileUrl && viewerType === 'audio' && (
        <AudioPlayer
          document={viewingDocument}
          fileUrl={fileUrl}
          onClose={() => {
            setViewingDocument(null);
            setFileUrl(null);
            setViewerType(null);
            loadDocuments();
          }}
          onOptionsClick={() => {
            // Pas d'options pour les étudiants
          }}
        />
      )}

      {viewingDocument && fileUrl && viewerType === 'video' && (
        <VideoPlayer
          document={viewingDocument}
          fileUrl={fileUrl}
          onClose={() => {
            setViewingDocument(null);
            setFileUrl(null);
            setViewerType(null);
            loadDocuments();
          }}
          onOptionsClick={() => {
            // Pas d'options pour les étudiants
          }}
        />
      )}

      {/* Modal pour les erreurs et avertissements */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default StudentLibraryContent;

