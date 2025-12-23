"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Bookmark,
  FileText,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Modal } from "@/app/Modal";
import { BibliothequeFichier, schools, LibraryDocument } from "./bibliotheque/types";
import { mapSujetToCategory } from "./bibliotheque/utils";
import { DocumentShelf } from "./bibliotheque/DocumentShelf";
import { FilterButton } from "./bibliotheque/FilterButton";
import { LibraryTable } from "./bibliotheque/LibraryTable";
import { DocumentModal } from "./bibliotheque/DocumentModal";
import { ImportModal } from "./bibliotheque/ImportModal";
import { DocumentViewer } from "./bibliotheque/DocumentViewer";
import { AudioPlayer } from "./bibliotheque/AudioPlayer";
import { VideoPlayer } from "./bibliotheque/VideoPlayer";
import { OptionsMenu } from "./bibliotheque/OptionsMenu";

interface TableDocument {
  id: string;
  title: string;
  organization: string;
  type: string;
  date: string;
  expiration: string;
}

const AdminLibraryContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("plus récent");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null); // Pour le filtre de la table récapitulative
  const [selectedSchoolForSections, setSelectedSchoolForSections] = useState<string | null>(null); // Pour filtrer les sections (Interview, Podcast, Fichiers)
  const [selectedDocument, setSelectedDocument] = useState<BibliothequeFichier | null>(null);
  const [selectedDocumentProprietaire, setSelectedDocumentProprietaire] = useState<string>("");
  const [viewingDocument, setViewingDocument] = useState<BibliothequeFichier | null>(null);
  const [viewerType, setViewerType] = useState<'document' | 'audio' | 'video' | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [importStep, setImportStep] = useState(1); // 1 = upload, 2 = détails, 3 = validation
  const [fileName, setFileName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("");
  const [selectedSchoolImport, setSelectedSchoolImport] = useState<string>("");
  const [enableDownload, setEnableDownload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // États pour les données réelles
  const [documents, setDocuments] = useState<BibliothequeFichier[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [favorites, setFavorites] = useState<BibliothequeFichier[]>([]);
  const [interviews, setInterviews] = useState<BibliothequeFichier[]>([]);
  const [podcasts, setPodcasts] = useState<BibliothequeFichier[]>([]);
  const [files, setFiles] = useState<BibliothequeFichier[]>([]); // Fichiers non-vidéos (PDF, DOCX, etc.)
  
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
  
  // Ref pour garder une référence à jour des documents (pour éviter les dépendances)
  const documentsRef = useRef<BibliothequeFichier[]>([]);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  // État pour stocker tous les documents (sans filtres) pour les sections
  const [allDocumentsCache, setAllDocumentsCache] = useState<BibliothequeFichier[]>([]);

  // Fonction helper pour traiter les documents et extraire les sections
  const processDocumentsForSections = useCallback((allDocs: BibliothequeFichier[], schoolFilter?: string | null) => {
    // Filtrer par école si nécessaire
    let filteredDocs = allDocs;
    if (schoolFilter) {
      filteredDocs = allDocs.filter(doc => doc.ecole === schoolFilter);
    }

    // Les favoris : documents avec est_favori = true (limite à 4)
    const favs = filteredDocs
      .filter(doc => doc.est_favori === true)
      .slice(0, 4);
    setFavorites(favs);

    // Les interviews : documents avec sujet = "Interview" (limite à 4)
    const interviewDocs = filteredDocs
      .filter(doc => {
        const sujet = doc.sujet?.toLowerCase().trim();
        return sujet === 'interview';
      })
      .sort((a, b) => new Date(b.date_importation || '').getTime() - new Date(a.date_importation || '').getTime())
      .slice(0, 4);
    setInterviews(interviewDocs);

    // Les podcasts : documents avec sujet = "Podcast" (limite à 4)
    const podcastDocs = filteredDocs
      .filter(doc => {
        const sujet = doc.sujet?.toLowerCase().trim();
        return sujet === 'podcast';
      })
      .sort((a, b) => new Date(b.date_importation || '').getTime() - new Date(a.date_importation || '').getTime())
      .slice(0, 4);
    setPodcasts(podcastDocs);

    // Les fichiers : tous les fichiers non-vidéos (PDF, DOCX, PPTX, XLSX, MP3, etc.) - limite à 4
    const fileDocs = filteredDocs
      .filter(doc => {
        const typeLower = (doc.type_fichier || '').toLowerCase().trim();
        const bucketName = (doc.bucket_name || '').toLowerCase().trim();
        // Exclure les vidéos (YouTube et MP4)
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
      // Erreur silencieuse lors du chargement des documents
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [selectedType, selectedSchool, searchTerm, sortOrder]);

  // Charger tous les documents (sans filtres) pour les sections
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
          setAllDocumentsCache(allDocs);
          processDocumentsForSections(allDocs, selectedSchoolForSections);
        }
      }
    } catch (error) {
      // Erreur silencieuse lors du chargement des documents featured
    }
  }, [selectedSchoolForSections, processDocumentsForSections]);

  // Alias pour compatibilité
  const loadFeaturedDocuments = loadAllDocumentsForSections;

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

  // Recharger les sections (Interview, Podcast, Fichiers) quand le filtre d'école des sections change
  useEffect(() => {
    loadAllDocumentsForSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolForSections]);

  // Fonction helper pour charger un document (ouvre le modal immédiatement)
  const loadDocumentWithProprietaire = useCallback(async (docId: string, fallbackDoc?: BibliothequeFichier) => {
    // Ouvrir le modal immédiatement avec le document disponible
    if (fallbackDoc) {
      setSelectedDocument(fallbackDoc);
      setSelectedDocumentProprietaire(""); // Sera mis à jour une fois chargé
    }
    
    // Charger le propriétaire en arrière-plan
    try {
      const response = await fetch(`/api/bibliotheque/document/${docId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mettre à jour le document et le propriétaire une fois chargés
          setSelectedDocument(data.fichier);
          setSelectedDocumentProprietaire(data.proprietaire || "");
        }
      }
    } catch (error) {
      // Erreur silencieuse lors du chargement du propriétaire
      // Le modal reste ouvert avec le document de fallback
    }
  }, []);

  // Fonction pour toggle le favori avec optimistic UI et debounce
  const toggleFavori = useCallback((documentId: string, currentFavori: boolean) => {
    const newFavoriValue = !currentFavori;
    const originalValue = currentFavori;
    
    // Si on a déjà un pending update, on annule le timer précédent
    const existingTimer = favoriDebounceTimers.current.get(documentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Sauvegarder la valeur originale pour le rollback si nécessaire
    if (!pendingFavoriUpdates.current.has(documentId)) {
      pendingFavoriUpdates.current.set(documentId, {
        newValue: newFavoriValue,
        originalValue: originalValue
      });
    } else {
      // Si on toggle plusieurs fois rapidement, on met à jour juste la valeur cible
      const pending = pendingFavoriUpdates.current.get(documentId);
      if (pending) {
        pending.newValue = newFavoriValue;
      }
    }
    
    // Optimistic UI : Mettre à jour immédiatement l'interface
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, est_favori: newFavoriValue }
          : doc
      )
    );
    
    // Mettre à jour le document sélectionné si c'est celui-ci
    setSelectedDocument(prev => {
      if (prev?.id === documentId) {
        return { ...prev, est_favori: newFavoriValue };
      }
      return prev;
    });
    
    // Mettre à jour la liste des favoris immédiatement (optimistic)
    setFavorites(prevFavs => {
      if (newFavoriValue) {
        // Vérifier si le document est déjà dans les favoris
        if (!prevFavs.find(f => f.id === documentId)) {
          // Chercher le document dans la liste complète pour l'ajouter
          const doc = documentsRef.current.find(d => d.id === documentId);
          if (doc) {
            return [...prevFavs, { ...doc, est_favori: true }].slice(0, 4);
          }
        }
        return prevFavs;
      } else {
        // Retirer des favoris
        return prevFavs.filter(f => f.id !== documentId);
      }
    });
    
    // Débouncer la sauvegarde dans la BDD (500ms après le dernier clic)
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
            // Mettre à jour les favoris depuis la BDD pour être sûr
            loadFeaturedDocuments();
            // Retirer de la liste des pending updates
            pendingFavoriUpdates.current.delete(documentId);
            favoriDebounceTimers.current.delete(documentId);
            return;
          }
        }
        
        // Si erreur, rollback
        throw new Error('Erreur lors de la sauvegarde');
      } catch (error) {
        // Erreur silencieuse lors de la sauvegarde du favori
        
        // Rollback : restaurer l'état original
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
        
        // Nettoyer
        pendingFavoriUpdates.current.delete(documentId);
        favoriDebounceTimers.current.delete(documentId);
        
        showModal(
          'Une erreur est survenue lors de la sauvegarde du favori. Le changement a été annulé et l\'état précédent a été restauré.',
          'Erreur de sauvegarde',
          'error'
        );
      }
    }, 500);
    
    favoriDebounceTimers.current.set(documentId, timer);
  }, []);

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
      // Enregistrer une vue
      await fetch('/api/bibliotheque/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fichier_id: document.id })
      });

      // Générer une URL signée pour visualiser le fichier
      const response = await fetch(`/api/bibliotheque/file-url/${document.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          // Déterminer le type de viewer selon le type de fichier
          const fileType = document.type_fichier?.toLowerCase() || '';
          let viewerType: 'document' | 'audio' | 'video' = 'document';
          
          // Si c'est une vidéo YouTube, forcer le type video
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
          setSelectedDocument(null); // Fermer le modal de détails
        }
      }
    } catch (error) {
      // Erreur silencieuse lors de l'ouverture du viewer
    }
  }, []);

  // Position du menu dropdown
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // Fonction pour télécharger un document (utilisable depuis la table et le modal)
  const handleDocumentDownload = useCallback(async (documentId: string) => {
    try {
      // Trouver le document complet
      const doc = documents.find(d => d.id === documentId);
      if (!doc) {
        showModal(
          'Le document que vous essayez de télécharger n\'a pas été trouvé dans la bibliothèque. Veuillez rafraîchir la page et réessayer.',
          'Document introuvable',
          'error'
        );
        return;
      }

      // Enregistrer un téléchargement dans la table bibliotheque_telechargements
      try {
        await fetch('/api/bibliotheque/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fichier_id: documentId })
        });
      } catch (error) {
        // Continuer même si l'enregistrement échoue (pour permettre le téléchargement admin)
        // Erreur silencieuse lors de l'enregistrement du téléchargement
      }

      // Générer une URL signée pour télécharger
      const response = await fetch(`/api/bibliotheque/file-url/${documentId}?download=true&force=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          // Ouvrir l'URL dans un nouvel onglet
          window.open(data.url, '_blank');
          
          // Recharger uniquement les documents pour mettre à jour les compteurs (pas besoin de recharger les sections)
          loadDocuments();
        } else {
          showModal(
            'Impossible de générer l\'URL de téléchargement. Veuillez vérifier que le fichier existe toujours et réessayer.',
            'Erreur de téléchargement',
            'error'
          );
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}\n\n${errorData.details}` 
          : errorData.error || 'Une erreur est survenue lors du téléchargement du fichier.';
        showModal(errorMessage, 'Erreur de téléchargement', 'error');
      }
    } catch (error: any) {
      // Erreur silencieuse lors du téléchargement
      showModal(
        error.message || 'Une erreur inattendue est survenue lors du téléchargement du fichier. Veuillez réessayer.',
        'Erreur de téléchargement',
        'error'
      );
    }
  }, [documents, showModal, loadDocuments]);

  // Convertir BibliothequeFichier vers TableDocument
  // La table affiche TOUS les fichiers (vidéos incluses) - c'est un récapitulatif complet
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

  // Mémoriser les arrays de documents pour éviter les recalculs
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
    <div className="space-y-10">
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
              Centralisez et partagez l'ensemble des ressources pédagogiques, replays et méthodologies
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
                    // Toggle: si déjà sélectionné, désélectionner, sinon sélectionner
                    // Les logos filtrent uniquement les sections (Interview, Podcast, Fichiers)
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

          <button 
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] px-4 py-2 text-sm font-semibold hover:bg-[#eae5cf] transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Nouvelle importation</span>
          </button>
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
          <button className="inline-flex items-center space-x-2 border border-[#032622] px-4 py-2 hover:bg-[#eae5cf] transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouveau</span>
          </button>
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
            // Recharger uniquement pour mettre à jour les compteurs de vues
            loadDocuments();
          }}
          onOptionsClick={() => {
            setMenuPosition({ top: 80, right: 20 });
            setShowOptionsMenu(true);
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
            // Recharger uniquement pour mettre à jour les compteurs de vues
            loadDocuments();
          }}
          onOptionsClick={() => {
            setMenuPosition({ top: 80, right: 20 });
            setShowOptionsMenu(true);
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
            // Recharger uniquement pour mettre à jour les compteurs de vues
            loadDocuments();
          }}
          onOptionsClick={() => {
            setMenuPosition({ top: 80, right: 20 });
            setShowOptionsMenu(true);
          }}
        />
      )}

      {/* Menu dropdown des options */}
      {viewingDocument && (
        <OptionsMenu
          isOpen={showOptionsMenu}
          onClose={() => setShowOptionsMenu(false)}
          onDownload={() => {
            if (viewingDocument) {
              handleDocumentDownload(viewingDocument.id);
            }
          }}
          onSave={() => {
            // TODO: Implémenter la fonctionnalité d'enregistrement
            showModal(
              'La fonctionnalité d\'enregistrement sera bientôt disponible.',
              'Fonctionnalité à venir',
              'info'
            );
          }}
          onShare={() => {
            // TODO: Implémenter la fonctionnalité de partage
            showModal(
              'La fonctionnalité de partage sera bientôt disponible.',
              'Fonctionnalité à venir',
              'info'
            );
          }}
          onDetails={() => {
            setViewingDocument(null);
            setFileUrl(null);
            setViewerType(null);
            setShowOptionsMenu(false);
            setSelectedDocument(viewingDocument);
          }}
          onReport={() => {
            // TODO: Implémenter la fonctionnalité de signalement
            showModal(
              'La fonctionnalité de signalement sera bientôt disponible.',
              'Fonctionnalité à venir',
              'info'
            );
          }}
          position={menuPosition}
        />
      )}

      {showImportModal && (
        <ImportModal 
          onClose={() => {
            setShowImportModal(false);
            setImportStep(1);
            setSelectedFiles([]);
            setFileName("");
            setSubject("");
            setDescription("");
            setFileType("PDF");
            setFileSize("");
            setSelectedSchoolImport("");
            setEnableDownload(false);
            setUrlInput("");
            setYoutubeUrl("");
          }}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
          importStep={importStep}
          setImportStep={setImportStep}
          fileName={fileName}
          setFileName={setFileName}
          subject={subject}
          setSubject={setSubject}
          description={description}
          setDescription={setDescription}
          fileType={fileType}
          setFileType={setFileType}
          fileSize={fileSize}
          setFileSize={setFileSize}
          selectedSchoolImport={selectedSchoolImport}
          setSelectedSchoolImport={setSelectedSchoolImport}
          enableDownload={enableDownload}
          setEnableDownload={setEnableDownload}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          onImportSuccess={() => {
            loadDocuments();
            loadFeaturedDocuments();
            setShowImportModal(false);
            setImportStep(1);
          }}
          showModal={showModal}
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

export default AdminLibraryContent;
