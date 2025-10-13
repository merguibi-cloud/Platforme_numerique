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
          <div className="flex items-center space-x-4">
            <Bookmark className="w-6 h-6 text-[#032622]" />
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D96B6B]" />
              <FileText className="w-6 h-6 text-[#032622]" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[#01302C] text-white flex items-center justify-center text-lg">
              YF
            </div>
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
            <div className="flex flex-wrap items-center gap-10">
              {schools.map((school) => (
                <div key={school.id} className="flex items-center justify-center px-2">
                  <Image
                    src={school.logo}
                    alt={school.name}
                    width={180}
                    height={70}
                    className="h-14 w-44 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="inline-flex items-center space-x-2 border border-[#032622] bg-[#032622] text-white px-4 py-2 text-sm font-semibold hover:bg-[#01302C] transition-colors">
            <Upload className="w-4 h-4" />
            <span>Nouvelle importation</span>
          </button>
        </div>
      </section>

      <DocumentShelf title="FAVORIS" documents={favorites} onDocumentClick={setSelectedDocument} />
      <DocumentShelf title="LES PLUS TÉLÉCHARGÉS" documents={mostDownloaded} onDocumentClick={setSelectedDocument} />
      <DocumentShelf title="DERNIERS REPLAY" documents={latestReplay} onDocumentClick={setSelectedDocument} />

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

        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#032622]">
          <button className="inline-flex items-center space-x-2 border border-[#032622] px-4 py-2 hover:bg-[#eae5cf] transition-colors">
            <Plus className="w-4 h-4" />
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

      <footer className="bg-[#032622] text-white px-4 py-3 flex items-start justify-between gap-4 flex-grow">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-semibold leading-snug">{document.title}</p>
          {document.description && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
              {document.description}
            </p>
          )}
        </div>
        <button 
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
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
    <div className="grid grid-cols-12 bg-[#032622] text-white text-xs uppercase tracking-widest">
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
            <button className="w-full bg-[#032622] text-white py-2.5 text-xs font-semibold hover:bg-[#01302C] transition-colors">
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
            <div className="border border-[#032622] p-3 bg-white/30">
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

export default AdminLibraryContent;

