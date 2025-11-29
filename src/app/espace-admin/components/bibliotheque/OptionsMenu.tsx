"use client";

import { useEffect, useRef } from "react";
import { Download, Save, Share2, FileText, Flag } from "lucide-react";

interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onSave: () => void;
  onShare: () => void;
  onDetails: () => void;
  onReport: () => void;
  position: { top: number; right: number };
}

export const OptionsMenu = ({ 
  isOpen, 
  onClose, 
  onDownload,
  onSave,
  onShare,
  onDetails,
  onReport,
  position 
}: OptionsMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[400] bg-[#F8F5E4] border border-[#032622] shadow-lg min-w-[200px]"
      style={{ top: `${position.top}px`, right: `${position.right}px` }}
    >
      <button
        onClick={() => {
          onDownload();
          onClose();
        }}
        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>TÉLÉCHARGER</span>
      </button>
      <button
        onClick={() => {
          onSave();
          onClose();
        }}
        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>ENREGISTRER</span>
      </button>
      <button
        onClick={() => {
          onShare();
          onClose();
        }}
        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
      >
        <Share2 className="w-4 h-4" />
        <span>PARTAGER</span>
      </button>
      <button
        onClick={() => {
          onDetails();
          onClose();
        }}
        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>DÉTAILS</span>
      </button>
      <button
        onClick={() => {
          onReport();
          onClose();
        }}
        className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors flex items-center space-x-2"
      >
        <Flag className="w-4 h-4" />
        <span>SIGNALER</span>
      </button>
    </div>
  );
};

