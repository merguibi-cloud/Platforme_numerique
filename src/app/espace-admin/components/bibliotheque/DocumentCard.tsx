"use client";

import { Bookmark, MoreHorizontal, Play } from "lucide-react";
import { LibraryDocument, BibliothequeFichier, tagConfig } from './types';
import { getVideoThumbnail } from './utils';

interface DocumentCardProps {
  document: LibraryDocument;
  fullDocument?: BibliothequeFichier;
  onClick: () => void;
  onToggleFavori?: (docId: string, currentFavori: boolean) => void;
  estFavori?: boolean;
}

export const DocumentCard = ({ 
  document, 
  fullDocument,
  onClick,
  onToggleFavori,
  estFavori = false
}: DocumentCardProps) => {
  const tag = tagConfig[document.tag];
  const thumbnail = getVideoThumbnail(fullDocument || null);
  const isVideo = fullDocument && (fullDocument.bucket_name === 'youtube' || (fullDocument.type_fichier?.toLowerCase() === 'mp4'));

  const handleToggleFavori = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavori) {
      onToggleFavori(document.id, estFavori);
    }
  };

  return (
    <article 
      className="border border-[#032622] bg-[#F8F5E4] flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className={`relative h-44 p-4 flex flex-col justify-between ${thumbnail ? '' : 'bg-[#C2C6B6]'}`} style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {thumbnail && (
          <div className="absolute inset-0 bg-black/30" />
        )}
        <span
          className={`relative z-10 inline-flex items-center text-[10px] font-semibold tracking-[0.3em] text-[#032622] px-3 py-1 ${tag.color}`.trim()}
        >
          {tag.label}
        </span>
        <div className="relative z-10 flex justify-end">
          <button 
            className={`w-7 h-7 flex items-center justify-center transition-colors ${
              estFavori 
                ? 'bg-[#032622] text-[#F8F5E4]' 
                : 'text-[#032622] hover:bg-[#032622] hover:text-[#F8F5E4]'
            }`}
            onClick={handleToggleFavori}
          >
            <Bookmark className={`w-3.5 h-3.5 ${estFavori ? 'fill-current' : ''}`} />
          </button>
        </div>
        {isVideo && !thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-12 h-12 text-[#032622]/50" />
          </div>
        )}
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

