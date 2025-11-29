import { DocumentCategory, BibliothequeFichier } from './types';

// Fonction helper pour obtenir la miniature d'une vidéo
export const getVideoThumbnail = (document: BibliothequeFichier | null | undefined): string | null => {
  if (!document) return null;
  
  // Pour les vidéos YouTube
  if (document.bucket_name === 'youtube' && document.chemin_fichier) {
    const url = document.chemin_fichier;
    // Extraire l'ID de la vidéo
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // URL de la miniature YouTube (maxresdefault pour la meilleure qualité)
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
  }
  
  // Pour les vidéos MP4 (on pourrait utiliser une image par défaut ou générer une miniature)
  const typeLower = (document.type_fichier || '').toLowerCase();
  if (typeLower === 'mp4' || typeLower.includes('video')) {
    // Pour l'instant, on retourne null pour les MP4 (on pourrait ajouter une logique plus tard)
    return null;
  }
  
  return null;
};

// Fonction helper pour mapper le sujet vers DocumentCategory
export const mapSujetToCategory = (sujet: string | null | undefined): DocumentCategory => {
  if (!sujet) return 'pdf'; // Par défaut si pas de sujet
  const sujetLower = sujet.toLowerCase().trim();
  if (sujetLower.includes('ebook')) return 'ebook';
  if (sujetLower.includes('pdf')) return 'pdf';
  if (sujetLower.includes('présentation') || sujetLower.includes('presentation')) return 'presentation';
  if (sujetLower.includes('podcast')) return 'podcast';
  if (sujetLower.includes('masterclass')) return 'masterclass';
  if (sujetLower.includes('interview')) return 'podcast'; // Interview utilise la même couleur que podcast
  if (sujetLower.includes('replay')) return 'replay';
  return 'pdf'; // Par défaut
};

// Fonction helper pour mapper le type de fichier BDD vers DocumentCategory
export const mapTypeToCategory = (type: string): DocumentCategory => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('ebook') || typeLower.includes('doc')) return 'ebook';
  if (typeLower.includes('pdf')) return 'pdf';
  if (typeLower.includes('présentation') || typeLower.includes('presentation') || typeLower.includes('ppt')) return 'presentation';
  if (typeLower.includes('podcast') || typeLower.includes('audio')) return 'podcast';
  if (typeLower.includes('masterclass') || typeLower.includes('replay') || typeLower.includes('vidéo') || typeLower.includes('video')) return 'masterclass';
  return 'pdf';
};

