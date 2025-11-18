'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Download, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { CoursContenu } from '@/types/formation-detailed';
import '../TiptapEditor.css';

interface CourseContentViewerProps {
  cours: CoursContenu;
  isPreview?: boolean; // Mode prévisualisation (pas d'enregistrement)
}

export const CourseContentViewer = ({ cours, isPreview = true }: CourseContentViewerProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parser le contenu HTML pour extraire les médias
  const parseContent = (htmlContent: string) => {
    if (!htmlContent) return { text: '', images: [], videos: [] };
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const images = Array.from(doc.querySelectorAll('img')).map(img => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || ''
    }));
    
    const videos = Array.from(doc.querySelectorAll('video')).map(video => ({
      src: video.getAttribute('src') || '',
      poster: video.getAttribute('poster') || ''
    }));
    
    return { text: htmlContent, images, videos };
  };

  const { text, images, videos } = parseContent(cours.contenu || '');

  // S'assurer que les images conservent leurs styles inline après le rendu
  useEffect(() => {
    if (contentRef.current && text) {
      // Les images avec la classe image-resizer doivent conserver leurs dimensions
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        // S'assurer que les images dans un conteneur image-resizer ont les bons styles
        const container = img.closest('.image-resizer');
        if (container) {
          (container as HTMLElement).style.display = 'inline-block';
          (container as HTMLElement).style.margin = '10px 0';
          (container as HTMLElement).style.position = 'relative';
          (container as HTMLElement).style.maxWidth = '100%';
        }
        // Préserver les styles inline des images (width, height définis par ImageResize)
        const inlineStyle = img.getAttribute('style');
        if (inlineStyle) {
          // Les styles inline sont déjà présents, on les préserve
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
      });
    }
  }, [text]);

  // Formater la durée de la vidéo
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 w-full">
      {/* Vidéo principale si type video */}
      {cours.type_contenu === 'video' && cours.url_video && (
        <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden border-2 border-[#032622]">
          <video
            src={cours.url_video}
            controls
            className="w-full h-full object-cover"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
          
          {/* Overlay avec informations */}
          {!isVideoPlaying && (
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              {cours.duree_video && (
                <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                  <span className="text-[#032622] text-xs font-bold uppercase">
                    Durée: {formatDuration(cours.duree_video)}
                  </span>
                </div>
              )}
              <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                <span className="text-[#032622] text-xs font-bold uppercase">HD 1080p</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenu texte avec médias intégrés - Utilise les mêmes styles que TiptapEditor */}
      {text && (
        <div 
          ref={contentRef}
          className="ProseMirror tiptap-editor-container w-full"
          style={{
            padding: '24px',
            color: '#032622',
            fontFamily: 'var(--font-termina-bold)',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            width: '100%',
            maxWidth: '100%',
            outline: 'none'
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}

      {/* Fichiers complémentaires */}
      {cours.fichiers_complementaires && cours.fichiers_complementaires.length > 0 && (
        <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#032622] uppercase mb-4" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            SUPPORTS COMPLÉMENTAIRES
          </h3>
          <div className="space-y-2">
            {cours.fichiers_complementaires.map((fichier, index) => {
              const fileName = fichier.split('/').pop() || `Fichier ${index + 1}`;
              const isPDF = fileName.toLowerCase().endsWith('.pdf');
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
              const isVideo = /\.(mp4|webm|ogg|avi|mov)$/i.test(fileName);
              
              return (
                <a
                  key={index}
                  href={fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white border-2 border-[#032622] rounded hover:bg-[#032622]/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isPDF && <FileText className="w-5 h-5 text-red-600" />}
                    {isImage && <ImageIcon className="w-5 h-5 text-blue-600" />}
                    {isVideo && <Video className="w-5 h-5 text-purple-600" />}
                    {!isPDF && !isImage && !isVideo && <FileText className="w-5 h-5 text-[#032622]" />}
                    <span className="text-[#032622] font-bold text-sm">{fileName}</span>
                  </div>
                  <Download className="w-4 h-4 text-[#032622]" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

