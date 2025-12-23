"use client";

import { FileText, Download } from "lucide-react";
import { TableDocument } from './types';

interface LibraryTableProps {
  documents: TableDocument[];
  isLoading?: boolean;
  onDocumentClick?: (docId: string) => void;
  onDownloadClick?: (docId: string) => void;
}

export const LibraryTable = ({ 
  documents, 
  isLoading,
  onDocumentClick,
  onDownloadClick
}: LibraryTableProps) => (
  <div className="border border-[#032622]">
    <div className="grid grid-cols-12 bg-[#F8F5E4] text-[#032622] border-b border-[#032622] text-xs uppercase tracking-widest">
      <div className="col-span-4 px-4 py-3">Titre</div>
      <div className="col-span-2 px-4 py-3">Type</div>
      <div className="col-span-2 px-4 py-3">Date</div>
      <div className="col-span-2 px-4 py-3">Date d'expiration</div>
      <div className="col-span-2 px-4 py-3 text-right">Actions</div>
    </div>

    <div className="divide-y divide-[#032622]/30">
      {isLoading ? (
        <div className="bg-[#F8F5E4] text-center py-12 text-[#032622]">
          <p className="text-sm">Chargement des documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-[#F8F5E4] text-center py-12 text-[#032622]">
          <p className="text-sm">Aucun document dans la bibliothèque</p>
        </div>
      ) : (
        documents.map((doc) => (
          <div key={doc.id} className="grid grid-cols-12 items-center bg-[#F8F5E4] text-sm text-[#032622]">
            <div className="col-span-4 px-4 py-4 space-y-1">
              <p className="font-semibold">{doc.title}</p>
              <p className="text-xs uppercase text-[#032622]/60">{doc.organization}</p>
            </div>
            <div className="col-span-2 px-4 py-4 text-sm">{doc.type}</div>
            <div className="col-span-2 px-4 py-4 text-sm">{doc.date}</div>
            <div className="col-span-2 px-4 py-4 text-sm">{doc.expiration}</div>
            <div className="col-span-2 px-4 py-4 flex flex-col items-end space-y-2 text-xs font-semibold">
              <button 
                onClick={() => onDocumentClick?.(doc.id)}
                className="inline-flex items-center space-x-2 border border-[#032622] px-3 py-1 hover:bg-[#eae5cf] transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>OUVRIR</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadClick?.(doc.id);
                }}
                className="inline-flex items-center space-x-2 border border-[#032622] px-3 py-1 hover:bg-[#eae5cf] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>TÉLÉCHARGER</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

