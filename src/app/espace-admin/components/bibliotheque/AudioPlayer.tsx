"use client";

import { useState, useEffect, useRef } from "react";
import { X, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";
import { BibliothequeFichier } from './types';

interface AudioPlayerProps {
  document: BibliothequeFichier;
  fileUrl: string;
  onClose: () => void;
  onOptionsClick: () => void;
}

export const AudioPlayer = ({ 
  document, 
  fileUrl, 
  onClose,
  onOptionsClick 
}: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[300] bg-[#F8F5E4] flex flex-col">
      {/* Header */}
      <header className="bg-[#032622] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-2 border-white flex items-center justify-center">
            <div className="w-3 h-3 bg-white transform rotate-45"></div>
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

      {/* Background Image */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#032622]/20 to-[#032622]/60">
          <div className="absolute inset-0 bg-[url('/img/audio-bg.jpg')] bg-cover bg-center blur-sm opacity-50"></div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-[#F8F5E4] px-6 py-6">
        <audio ref={audioRef} src={fileUrl} />
        
        {/* Waveform */}
        <div ref={waveformRef} className="mb-6 h-24 flex items-end space-x-1 cursor-pointer" onClick={(e) => {
          const rect = waveformRef.current?.getBoundingClientRect();
          if (rect && audioRef.current) {
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            audioRef.current.currentTime = percentage * duration;
          }
        }}>
          {Array.from({ length: 100 }).map((_, i) => {
            const height = Math.random() * 60 + 20;
            const isPlayed = i < (progress / 100) * 100;
            return (
              <div
                key={i}
                className={`flex-1 ${isPlayed ? 'bg-[#032622]' : 'bg-[#C2C6B6]'} rounded-sm transition-colors`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Timestamps and Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#032622] font-semibold">
            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
          </span>
          <div className="flex items-center space-x-4">
            <button className="text-[#032622] hover:opacity-70">
              <SkipBack className="w-5 h-5" />
            </button>
            <button className="text-[#032622] hover:opacity-70">
              <Rewind className="w-5 h-5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-[#032622] text-white rounded-full flex items-center justify-center hover:opacity-80"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button className="text-[#032622] hover:opacity-70">
              <FastForward className="w-5 h-5" />
            </button>
            <button className="text-[#032622] hover:opacity-70">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm text-[#032622] font-semibold">
            {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Marker Button */}
        <button className="w-full bg-[#032622] text-white py-2 px-4 text-sm font-semibold uppercase hover:opacity-80">
          METTRE UN MARQUEUR
        </button>
      </div>
    </div>
  );
};

