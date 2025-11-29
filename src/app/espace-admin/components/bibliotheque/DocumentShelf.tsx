"use client";

import { LibraryDocument, BibliothequeFichier } from './types';
import { DocumentCard } from './DocumentCard';

interface DocumentShelfProps {
  title: string;
  documents: LibraryDocument[];
  onDocumentClick: (doc: LibraryDocument) => void;
  onToggleFavori?: (docId: string, currentFavori: boolean) => void;
  allDocuments?: BibliothequeFichier[];
}

export const DocumentShelf = ({ 
  title, 
  documents, 
  onDocumentClick,
  onToggleFavori,
  allDocuments
}: DocumentShelfProps) => (
  <section className="space-y-4">
    <header className="flex items-center justify-between">
      <h3
        className="text-lg font-bold text-[#032622] uppercase"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        {title}
      </h3>
      {documents.length > 0 && (
        <button className="text-xs uppercase tracking-wide text-[#032622]/60">Tout voir</button>
      )}
    </header>

    {documents.length === 0 ? (
      <div className="text-center py-8 border border-[#032622] bg-[#F8F5E4] px-4">
        <p className="text-sm text-[#032622]/70">Aucun document n'est disponible</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const fullDoc = allDocuments?.find(d => d.id === doc.id);
          return (
            <DocumentCard 
              key={doc.id} 
              document={doc}
              fullDocument={fullDoc}
              onClick={() => onDocumentClick(doc)}
              onToggleFavori={onToggleFavori}
              estFavori={fullDoc?.est_favori || false}
            />
          );
        })}
      </div>
    )}
  </section>
);

