"use client";

import { useState, useRef } from "react";
import { X, MoreHorizontal, Play } from "lucide-react";
import { BibliothequeFichier } from './types';

interface VideoPlayerProps {
  document: BibliothequeFichier;
  fileUrl: string;
  onClose: () => void;
  onOptionsClick: () => void;
}

export const VideoPlayer = ({ 
  document, 
  fileUrl, 
  onClose,
  onOptionsClick 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Détecter si c'est une vidéo YouTube
  const isYoutube = document.bucket_name === 'youtube' || fileUrl.includes('youtube.com/embed') || fileUrl.includes('youtu.be');

  const togglePlay = () => {
    if (videoRef.current && !isYoutube) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#032622] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-[#F8F5E4] text-[#032622] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#032622] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-lg font-semibold uppercase">
              {document.titre}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onOptionsClick} className="hover:opacity-70">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="hover:opacity-70">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 relative flex items-center justify-center bg-[#032622] min-h-0">
          {isYoutube ? (
            // Pour les vidéos YouTube, utiliser un iframe
            <iframe
              src={fileUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={document.titre}
            />
          ) : (
            // Pour les vidéos normales, utiliser la balise video
            <>
              <video 
                ref={videoRef}
                src={fileUrl}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                controls
              />
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-[#032622]/30 hover:bg-[#032622]/40 transition-colors"
                >
                  <div className="w-24 h-24 bg-[#F8F5E4] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-[#032622] ml-2" />
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

