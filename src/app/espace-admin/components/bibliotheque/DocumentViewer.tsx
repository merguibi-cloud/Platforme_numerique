"use client";

import { useState } from "react";
import { X, BarChart3, MoreHorizontal } from "lucide-react";
import { BibliothequeFichier } from './types';

interface DocumentViewerProps {
  document: BibliothequeFichier;
  fileUrl: string;
  onClose: () => void;
  onOptionsClick: () => void;
}

export const DocumentViewer = ({ 
  document, 
  fileUrl, 
  onClose,
  onOptionsClick 
}: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(20); // TODO: Calculer le nombre réel de pages

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#F8F5E4] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-[#032622] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-lg font-semibold uppercase">
              {document.titre}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="hover:opacity-70">
              <span className="text-xl">-</span>
            </button>
            <span className="text-sm">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="hover:opacity-70">
              <span className="text-xl">+</span>
            </button>
            <button onClick={onOptionsClick} className="hover:opacity-70">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#F8F5E4] p-8">
          <div className="max-w-full mx-auto bg-white shadow-lg" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <iframe 
              src={fileUrl}
              className="w-full h-[600px] border-0"
              title={document.titre}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#032622] text-white px-6 py-2 flex-shrink-0">
          <p className="text-sm uppercase">{pageCount} PAGES</p>
        </footer>
      </div>
    </div>
  );
};

