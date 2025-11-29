"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  X,
  Link,
  Check,
} from "lucide-react";

type DocumentCategory =
  | "ebook"
  | "pdf"
  | "presentation"
  | "podcast"
  | "masterclass"
  | "replay";

interface LibraryDocument {
  id: string;
  title: string;
  description?: string;
  author?: string;
  tag: DocumentCategory;
  actionLabel?: string;
}

interface TableDocument {
  id: string;
  title: string;
  organization: string;
  type: string;
  date: string;
  expiration: string;
}

const tagConfig: Record<DocumentCategory, { label: string; color: string }> = {
  ebook: { label: "EBOOK", color: "bg-[#D96B6B]" },
  pdf: { label: "PDF", color: "bg-[#9E8DC3]" },
  presentation: { label: "PRÉSENTATION", color: "bg-[#7BC67A]" },
  podcast: { label: "PODCAST", color: "bg-[#F0C75E]" },
  masterclass: { label: "MASTERCLASS", color: "bg-[#7295C2]" },
  replay: { label: "REPLAY", color: "bg-[#032622] text-white" },
};

const schools = [
  { id: "digital", name: "Digital Legacy", logo: "/logos/digital.png" },
  { id: "leader", name: "Leaders Society", logo: "/logos/leader.png" },
  { id: "keos", name: "KEOS", logo: "/logos/keos.png" },
  { id: "talent", name: "Talent", logo: "/logos/talent.png" },
  { id: "finance", name: "Finance Society", logo: "/logos/finance.png" },
  { id: "edifice", name: "Edifice", logo: "/logos/edifice.png" },
  { id: "x1001", name: "1001", logo: "/logos/1001.png" },
];

const favorites: LibraryDocument[] = [
  {
    id: "fav-1",
    title: "Modèle Word – Plan de business plan simplifié",
    description: "Finance Society",
    tag: "ebook",
  },
  {
    id: "fav-2",
    title: "Tutoriel – Utiliser Notion pour ses révisions",
    description: "KEOS Business School",
    tag: "ebook",
  },
  {
    id: "fav-3",
    title: "Guide méthodologique : réussir une étude de cas",
    description: "Talent Business School",
    tag: "pdf",
  },
  {
    id: "fav-4",
    title: "Checklist – Préparer un entretien d'embauche",
    description: "Digital Legacy",
    tag: "presentation",
  },
];

const mostDownloaded: LibraryDocument[] = [
  {
    id: "download-1",
    title: "Comprendre le bilan comptable en 15 minutes",
    description: "Finance Society",
    tag: "podcast",
  },
  {
    id: "download-2",
    title: "Introduction à la stratégie d'entreprise",
    description: "KEOS Business School",
    tag: "masterclass",
  },
  {
    id: "download-3",
    title: "L'intelligence artificielle dans le marketing moderne",
    description: "1001",
    tag: "ebook",
  },
  {
    id: "download-4",
    title: "Modèle Excel – Plan de trésorerie sur 12 mois",
    description: "Digital Legacy",
    tag: "ebook",
  },
];

const latestReplay: LibraryDocument[] = [
  {
    id: "replay-1",
    title: "Masterclass Soft Skills avec Amélie Dubois",
    description: "Talent Business School",
    tag: "masterclass",
  },
  {
    id: "replay-2",
    title: "Entrepreneurs à impact",
    description: "Finance Society",
    tag: "masterclass",
  },
  {
    id: "replay-3",
    title: "Les bases du management d'équipe",
    description: "KEOS Business School",
    tag: "masterclass",
  },
  {
    id: "replay-4",
    title: "Infographie : les métiers du digital en 2025",
    description: "Edifice",
    tag: "masterclass",
  },
];

const tableDocuments: TableDocument[] = [
  {
    id: "table-1",
    title: "Modélisation financière avancée",
    organization: "Finance Society",
    type: "Ebook",
    date: "10/09/2025",
    expiration: "11/10/2025",
  },
  {
    id: "table-2",
    title: "Créer une stratégie de contenu efficace",
    organization: "Digital Legacy",
    type: "PDF",
    date: "10/09/2025",
    expiration: "11/10/2025",
  },
  {
    id: "table-3",
    title: "L'IA au service du management humain",
    organization: "1001",
    type: "Masterclass",
    date: "10/09/2025",
    expiration: "11/10/2025",
  },
  {
    id: "table-4",
    title: "Business Model Canvas à compléter",
    organization: "Talent Business School",
    type: "Présentation",
    date: "10/09/2025",
    expiration: "11/10/2025",
  },
  {
    id: "table-5",
    title: "Rapport d'analyse – Marché de la tech 2025",
    organization: "Edifice",
    type: "Podcast",
    date: "10/09/2025",
    expiration: "11/10/2025",
  },
];

const AdminLibraryContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("plus récent");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [importStep, setImportStep] = useState(1); // 1 = upload, 2 = détails, 3 = validation
  const [fileName, setFileName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("Un guide complet expliquant comment construire des business plan dynamiques et fiables");
  const [fileType, setFileType] = useState("PDF");
  const [fileSize, setFileSize] = useState("204 MO");
  const [enableDownload, setEnableDownload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredTableDocs = useMemo(() => {
    let docs = [...tableDocuments];
    if (selectedType) {
      docs = docs.filter((doc) => doc.type === selectedType);
    }
    if (selectedSchool) {
      const target = selectedSchool.toLowerCase();
      docs = docs.filter((doc) => doc.organization.toLowerCase().includes(target));
    }
    if (!searchTerm.trim()) return docs;
    const lowerSearch = searchTerm.toLowerCase();
    return docs.filter((doc) =>
      [doc.title, doc.organization, doc.type]
        .join(" ")
        .toLowerCase()
        .includes(lowerSearch)
    );
  }, [searchTerm, selectedType, selectedSchool]);

  const sortedDocs = useMemo(() => {
    if (sortOrder === "plus récent") {
      return [...filteredTableDocs].sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return [...filteredTableDocs].sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [filteredTableDocs, sortOrder]);

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              BIBLIOTHÈQUE NUMÉRIQUE
            </h1>
            <p className="text-xs sm:text-sm text-[#032622]/70 max-w-2xl break-words">
              Centralisez et partagez l'ensemble des ressources pédagogiques, replays et méthodologies
              pour les différentes écoles de la plateforme.
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622]" />
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D96B6B]" />
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622]" />
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#01302C] text-[#032622] flex items-center justify-center text-sm sm:text-base md:text-lg">
              YF
            </div>
          </div>
        </header>

        <div className="border border-[#032622] bg-[#032622] h-32 sm:h-36 md:h-44" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 w-full sm:w-auto">
            <h2
              className="text-xs sm:text-sm font-semibold text-[#032622] tracking-wider"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DOCUMENTS PAR ÉCOLES
            </h2>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center justify-center px-1 sm:px-2">
                  <Image
                    src={school.logo}
                    alt={school.name}
                    width={180}
                    height={70}
                    className="h-10 w-28 sm:h-12 sm:w-36 md:h-14 md:w-44 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-1.5 sm:space-x-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-[#eae5cf] active:bg-[#e0dbc5] transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Nouvelle importation</span>
          </button>
        </div>
      </section>

      <DocumentShelf title="FAVORIS" documents={favorites} onDocumentClick={setSelectedDocument} />
      <DocumentShelf title="LES PLUS TÉLÉCHARGÉS" documents={mostDownloaded} onDocumentClick={setSelectedDocument} />
      <DocumentShelf title="DERNIERS REPLAY" documents={latestReplay} onDocumentClick={setSelectedDocument} />

      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="relative w-full max-w-xl">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Recherche"
            className="w-full border border-[#032622] bg-[#F8F5E4] pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm text-[#032622] focus:outline-none focus:border-[#01302C]"
          />
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] absolute right-3 sm:right-4 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-[#032622]">
          <button className="inline-flex items-center space-x-1.5 sm:space-x-2 border border-[#032622] px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-[#eae5cf] active:bg-[#e0dbc5] transition-colors">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Nouveau</span>
          </button>
          <FilterButton
            label={`Type${selectedType ? ` : ${selectedType}` : ""}`}
            options={["Ebook", "PDF", "Masterclass", "Présentation", "Podcast"]}
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

        <LibraryTable documents={sortedDocs} />
      </section>

      {selectedDocument && (
        <DocumentModal document={selectedDocument} onClose={() => setSelectedDocument(null)} />
      )}

      {showImportModal && (
        <ImportModal 
          onClose={() => {
            setShowImportModal(false);
            setImportStep(1);
          }}
          uploadProgress={uploadProgress}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
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
          enableDownload={enableDownload}
          setEnableDownload={setEnableDownload}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />
      )}
    </div>
  );
};

const DocumentShelf = ({ 
  title, 
  documents, 
  onDocumentClick 
}: { 
  title: string; 
  documents: LibraryDocument[];
  onDocumentClick: (doc: LibraryDocument) => void;
}) => (
  <section className="space-y-4">
    <header className="flex items-center justify-between">
      <h3
        className="text-lg font-bold text-[#032622] uppercase"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        {title}
      </h3>
      <button className="text-xs uppercase tracking-wide text-[#032622]/60">Tout voir</button>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onClick={() => onDocumentClick(doc)} />
      ))}
    </div>
  </section>
);

const DocumentCard = ({ 
  document, 
  onClick 
}: { 
  document: LibraryDocument;
  onClick: () => void;
}) => {
  const tag = tagConfig[document.tag];

  return (
    <article 
      className="border border-[#032622] bg-[#F8F5E4] flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative h-44 bg-[#C2C6B6] p-4 flex flex-col justify-between">
        <span
          className={`inline-flex items-center text-[10px] font-semibold tracking-[0.3em] text-[#032622] px-3 py-1 ${tag.color}`.trim()}
        >
          {tag.label}
        </span>
        <div className="flex justify-end">
          <button 
            className="w-7 h-7 bg-[#F8F5E4] text-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Logique pour ajouter aux favoris
            }}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <footer className="bg-[#F8F5E4] text-[#032622] border-t border-[#032622] px-4 py-3 flex items-start justify-between gap-4 flex-grow">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-semibold leading-snug">{document.title}</p>
          {document.description && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#032622]/70">
              {document.description}
            </p>
          )}
        </div>
        <button 
          className="text-[#032622]/70 hover:text-[#032622] transition-colors flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            // Logique pour plus d'options
          }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </footer>
    </article>
  );
};

const FilterButton = ({
  label,
  options,
  onSelect,
}: {
  label: string;
  options?: string[];
  onSelect?: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value: string) => {
    onSelect?.(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => (options ? setIsOpen((prev) => !prev) : onSelect?.(label))}
        className="inline-flex items-center space-x-2 border border-[#032622] px-4 py-2 hover:bg-[#eae5cf] transition-colors"
      >
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && options && (
        <div className="absolute z-20 mt-2 w-48 border border-[#032622] bg-[#F8F5E4] shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left px-4 py-2 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LibraryTable = ({ documents }: { documents: TableDocument[] }) => (
  <div className="border border-[#032622]">
    <div className="grid grid-cols-12 bg-[#F8F5E4] text-[#032622] border-b border-[#032622] text-xs uppercase tracking-widest">
      <div className="col-span-4 px-4 py-3">Titre</div>
      <div className="col-span-2 px-4 py-3">Type</div>
      <div className="col-span-2 px-4 py-3">Date</div>
      <div className="col-span-2 px-4 py-3">Date d'expiration</div>
      <div className="col-span-2 px-4 py-3 text-right">Actions</div>
    </div>

    <div className="divide-y divide-[#032622]/30">
      {documents.map((doc) => (
        <div key={doc.id} className="grid grid-cols-12 items-center bg-[#F8F5E4] text-sm text-[#032622]">
          <div className="col-span-4 px-4 py-4 space-y-1">
            <p className="font-semibold">{doc.title}</p>
            <p className="text-xs uppercase text-[#032622]/60">{doc.organization}</p>
          </div>
          <div className="col-span-2 px-4 py-4 text-sm">{doc.type}</div>
          <div className="col-span-2 px-4 py-4 text-sm">{doc.date}</div>
          <div className="col-span-2 px-4 py-4 text-sm">{doc.expiration}</div>
          <div className="col-span-2 px-4 py-4 flex flex-col items-end space-y-2 text-xs font-semibold">
            <button className="inline-flex items-center space-x-2 border border-[#032622] px-3 py-1 hover:bg-[#eae5cf] transition-colors">
              <FileText className="w-4 h-4" />
              <span>OUVRIR</span>
            </button>
            <button className="inline-flex items-center space-x-2 border border-[#032622] px-3 py-1 hover:bg-[#eae5cf] transition-colors">
              <Download className="w-4 h-4" />
              <span>TÉLÉCHARGER</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DocumentModal = ({ 
  document, 
  onClose 
}: { 
  document: LibraryDocument; 
  onClose: () => void;
}) => {
  const tag = tagConfig[document.tag];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 h-full bg-[#F8F5E4] w-full max-w-md overflow-y-auto border-l-2 border-[#032622] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="sticky top-0 bg-[#F8F5E4] border-b border-[#032622] p-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="w-7 h-7 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
            >
              <X className="w-4 h-4 text-[#032622]" />
            </button>
            <h2 
              className="text-sm font-bold text-[#032622] uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DÉTAILS DU FICHIER
            </h2>
          </div>
          <Bookmark className="w-5 h-5 text-[#032622] cursor-pointer hover:fill-[#032622] transition-colors" />
        </div>

        {/* Contenu de la modale */}
        <div className="p-4 space-y-4">
          {/* Aperçu du document */}
          <div className="relative h-48 bg-[#C2C6B6] flex items-center justify-center">
            <span
              className={`absolute top-3 left-3 inline-flex items-center text-[9px] font-semibold tracking-[0.3em] text-[#032622] px-2 py-1 ${tag.color}`.trim()}
            >
              {tag.label}
            </span>
            <FileText className="w-16 h-16 text-[#032622]/30" />
          </div>

          {/* Titre du document */}
          <div>
            <h3 
              className="text-lg font-bold text-[#032622] leading-tight"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              {document.title}
            </h3>
          </div>

          {/* Informations du document */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">ÉCOLE</p>
              <p className="text-[#032622] font-semibold">{document.description || "LEADER SOCIETY"}</p>
            </div>
            <div>
              <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">TYPE</p>
              <p className="text-[#032622] font-semibold">PDF MULTIPAGE</p>
            </div>
            <div>
              <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">TAILLE</p>
              <p className="text-[#032622] font-semibold">27,4 MO</p>
            </div>
            <div>
              <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">PROPRIÉTAIRE</p>
              <p className="text-[#032622] font-semibold">JACQUES POTE</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2">
            <button className="w-full bg-[#F8F5E4] text-[#032622] border border-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors">
              VOIR
            </button>
            <button className="w-full border border-[#032622] text-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors">
              TÉLÉCHARGER
            </button>
          </div>

          {/* Activité du fichier */}
          <div>
            <h4 
              className="text-xs font-bold text-[#032622] uppercase mb-2"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              ACTIVITÉ DU FICHIER
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">VUE TOTAL</span>
                <span className="text-[#032622] font-semibold">96</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">TÉLÉCHARGEMENT</span>
                <span className="text-[#032622] font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">ENREGISTREMENT</span>
                <span className="text-[#032622] font-semibold">10</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 
              className="text-xs font-bold text-[#032622] uppercase mb-2"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DESCRIPTION
            </h4>
            <div className="border border-[#032622] p-3 bg-[#F8F5E4]">
              <p className="text-xs text-[#032622] leading-relaxed">
                Un guide complet expliquant comment construire des business plan dynamiques et faciles à utiliser.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 
              className="text-xs font-bold text-[#032622] uppercase mb-2"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              TAGS
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                BUSINESS MODEL
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                FINANCE
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                COMMUNICATION
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                STORYTELLING
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                LEADERSHIP
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                PERSONAL BRANDING
              </span>
              <span className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold">
                MINDSET
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImportModal = ({ 
  onClose, 
  uploadProgress, 
  urlInput, 
  setUrlInput,
  importStep,
  setImportStep,
  fileName,
  setFileName,
  subject,
  setSubject,
  description,
  setDescription,
  fileType,
  setFileType,
  fileSize,
  setFileSize,
  enableDownload,
  setEnableDownload,
  selectedFiles,
  setSelectedFiles,
  isDragOver,
  setIsDragOver
}: { 
  onClose: () => void;
  uploadProgress: number;
  urlInput: string;
  setUrlInput: (value: string) => void;
  importStep: number;
  setImportStep: (step: number) => void;
  fileName: string;
  setFileName: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  fileType: string;
  setFileType: (value: string) => void;
  fileSize: string;
  setFileSize: (value: string) => void;
  enableDownload: boolean;
  setEnableDownload: (value: boolean) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  isDragOver: boolean;
  setIsDragOver: (value: boolean) => void;
}) => {
  const handleFileUpload = () => {
    // Créer un input file caché
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.mp4,.mp3,.ppt,.pptx';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      handleFiles(files);
    };
    
    input.click();
  };

  const handleFiles = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      const firstFile = files[0];
      setFileName(firstFile.name);
      
      // Déterminer le type de fichier
      const extension = firstFile.name.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf':
          setFileType('PDF');
          break;
        case 'doc':
        case 'docx':
          setFileType('DOCUMENT');
          break;
        case 'mp4':
          setFileType('VIDÉO');
          break;
        case 'mp3':
          setFileType('AUDIO');
          break;
        case 'ppt':
        case 'pptx':
          setFileType('PRÉSENTATION');
          break;
        default:
          setFileType('FICHIER');
      }
      
      // Formater la taille
      const sizeInMB = (firstFile.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMB} MO`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleUrlImport = () => {
    console.log('Import depuis URL:', urlInput);
    // Logique pour importer depuis URL
  };

  const handleNext = () => {
    setImportStep(2);
  };

  const handleBack = () => {
    setImportStep(1);
  };

  const handleImport = () => {
    console.log('Import final:', { fileName, subject, description, fileType, fileSize, enableDownload });
    setImportStep(3); // Passer à l'étape de validation
  };

  // Étape 1 : Upload
  if (importStep === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div 
          className="bg-[#F8F5E4] w-full max-w-2xl border-2 border-[#032622] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête de la modale */}
          <div className="flex items-start justify-between mb-8">
            <h2 
              className="text-2xl font-bold text-[#032622] uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              FICHIER À IMPORTER
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
            >
              <X className="w-5 h-5 text-[#032622]" />
            </button>
          </div>

          {/* Section Import depuis appareil */}
          <div className="mb-8">
            <h3 
              className="text-lg font-bold text-[#032622] uppercase mb-4"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              IMPORTER DEPUIS SON APPAREIL
            </h3>
            
            {/* Zone de drop */}
            <div 
              className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-[#032622] bg-[#032622]/10' 
                  : 'border-[#032622] bg-[#F8F5E4] hover:bg-[#eae5cf]'
              }`}
              onClick={handleFileUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-[#032622] mx-auto mb-4" />
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[#032622] font-semibold">
                    {selectedFiles.length} fichier(s) sélectionné(s)
                  </p>
                  {selectedFiles.slice(0, 3).map((file, index) => (
                    <p key={index} className="text-sm text-[#032622]/70">
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MO)
                    </p>
                  ))}
                  {selectedFiles.length > 3 && (
                    <p className="text-sm text-[#032622]/70">
                      ... et {selectedFiles.length - 3} autre(s)
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#032622] font-semibold mb-2">
                    Déposez les fichiers ici ou
                  </p>
                  <button className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-6 py-2 text-sm font-semibold hover:bg-[#eae5cf] transition-colors">
                    Sélectionner des fichiers
                  </button>
                </>
              )}
            </div>

            {/* Barre de progression */}
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#032622] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-[#032622]/60 mt-2 text-center">{uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#032622]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#F8F5E4] text-[#032622] font-semibold">OU</span>
            </div>
          </div>

          {/* Section Import depuis URL */}
          <div className="mb-8">
            <h3 
              className="text-lg font-bold text-[#032622] uppercase mb-4"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              IMPORTER DEPUIS UNE URL
            </h3>
            
            <div className="flex space-x-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-4 py-3 border border-r-0 border-[#032622] bg-[#C2C6B6] text-[#032622] text-sm font-semibold">
                  http://
                </span>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="drive.google.com"
                  className="flex-1 px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-gray-500 focus:outline-none focus:border-[#01302C]"
                />
              </div>
              <button 
                onClick={handleUrlImport}
                className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-6 py-3 text-sm font-semibold hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>IMPORTER</span>
              </button>
            </div>
          </div>

          {/* Bouton Suivant */}
          <div className="text-center">
            <button 
              onClick={handleNext}
              className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-12 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors"
            >
              SUIVANT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Étape 2 : Formulaire de détails
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#F8F5E4] w-full max-w-4xl border-2 border-[#032622] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="flex items-start justify-between mb-8">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            FICHIER À IMPORTER
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <X className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        {/* Formulaire en deux colonnes */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                NOM DU FICHIER
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                SUJET
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#032622]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C] resize-none"
              />
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                TYPE DE FICHIER
              </label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-2">
                TAILLE DU FICHIER
              </label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#01302C]"
              />
            </div>
          </div>
        </div>

        {/* Section Tags */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-[#032622] uppercase mb-4">
            TAGS
          </label>
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 min-h-[120px]">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#C2C6B6] text-[#032622] text-sm uppercase font-semibold rounded">
                COMMUNICATION
              </span>
              <span className="px-3 py-1 bg-[#C2C6B6] text-[#032622] text-sm uppercase font-semibold rounded">
                STORYTELLING
              </span>
              <span className="px-3 py-1 bg-[#C2C6B6] text-[#032622] text-sm uppercase font-semibold rounded">
                LEADERSHIP
              </span>
              <span className="px-3 py-1 bg-[#C2C6B6] text-[#032622] text-sm uppercase font-semibold rounded">
                PERSONAL BRANDING
              </span>
            </div>
          </div>
        </div>

        {/* Case à cocher */}
        <div className="mb-8">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableDownload}
              onChange={(e) => setEnableDownload(e.target.checked)}
              className="w-5 h-5 border border-[#032622] text-[#032622] focus:ring-[#032622]"
            />
            <span className="text-sm font-semibold text-[#032622] uppercase">
              ACTIVER LE TÉLÉCHARGEMENT
            </span>
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-4 justify-center">
          <button 
            onClick={handleBack}
            className="border border-[#032622] text-[#032622] px-8 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors"
          >
            RETOUR
          </button>
          <button 
            onClick={handleImport}
            className="bg-[#F8F5E4] text-[#032622] border border-[#032622] px-8 py-4 text-lg font-semibold hover:bg-[#eae5cf] transition-colors"
          >
            IMPORTER
          </button>
        </div>
      </div>
    </div>
  );

  // Étape 3 : Validation de succès
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#F8F5E4] w-full max-w-md border-2 border-[#032622] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="flex justify-end mb-6">
          <button 
            onClick={onClose}
            className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <X className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        {/* Icône de succès */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-[#F8F5E4] border-4 border-[#032622] rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-[#032622]" />
          </div>
        </div>

        {/* Message de succès */}
        <div className="mb-8">
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase mb-4"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            VOTRE FICHIER À BIEN ÉTÉ IMPORTÉ
          </h2>
          <p className="text-sm text-[#032622]/70 leading-relaxed">
            Un guide complet expliquant comment construire des business plan dynamiques et fiables
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLibraryContent;

