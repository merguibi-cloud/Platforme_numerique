/**
 * Utilitaires pour valider la taille du contenu avant l'envoi
 * Limite Vercel : 4.5 MB pour le body des requêtes
 * On utilise 4 MB comme limite sécurisée
 */

// Limites en bytes
// IMPORTANT: Vercel limite le body des requêtes à 4.5 MB
// Pour les vidéos, on utilise 4 MB comme limite sécurisée
// Pour les vidéos plus grandes, utiliser une URL externe ou un upload direct vers Supabase Storage
export const MAX_CONTENT_SIZE = 4 * 1024 * 1024; // 4 MB
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB (limite Vercel)
export const MAX_VIDEO_SIZE = 4 * 1024 * 1024; // 4 MB (limite Vercel - utiliser URL externe pour vidéos plus grandes)
export const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB (limite Vercel)

/**
 * Calcule la taille d'une chaîne de caractères en bytes
 */
export function getStringSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Calcule la taille d'un objet JSON en bytes
 */
export function getJsonSize(obj: any): number {
  return getStringSize(JSON.stringify(obj));
}

/**
 * Formate une taille en bytes en format lisible
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Vérifie si un contenu texte dépasse la limite
 */
export function isContentTooLarge(content: string): {
  tooLarge: boolean;
  size: number;
  maxSize: number;
  formattedSize: string;
  formattedMaxSize: string;
} {
  const size = getStringSize(content);
  const tooLarge = size > MAX_CONTENT_SIZE;
  
  return {
    tooLarge,
    size,
    maxSize: MAX_CONTENT_SIZE,
    formattedSize: formatSize(size),
    formattedMaxSize: formatSize(MAX_CONTENT_SIZE)
  };
}

/**
 * Vérifie si un fichier dépasse la limite selon son type
 */
export function isFileTooLarge(
  file: File,
  type: 'image' | 'video' | 'file'
): {
  tooLarge: boolean;
  size: number;
  maxSize: number;
  formattedSize: string;
  formattedMaxSize: string;
} {
  let maxSize: number;
  
  switch (type) {
    case 'image':
      maxSize = MAX_IMAGE_SIZE;
      break;
    case 'video':
      maxSize = MAX_VIDEO_SIZE;
      break;
    case 'file':
      maxSize = MAX_FILE_SIZE;
      break;
    default:
      maxSize = MAX_FILE_SIZE;
  }
  
  const tooLarge = file.size > maxSize;
  
  return {
    tooLarge,
    size: file.size,
    maxSize,
    formattedSize: formatSize(file.size),
    formattedMaxSize: formatSize(maxSize)
  };
}

/**
 * Extrait le texte brut d'un contenu HTML (pour estimation de taille)
 */
export function extractTextFromHtml(html: string): string {
  // Créer un élément temporaire pour extraire le texte
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Estime la taille finale d'un contenu HTML après sérialisation JSON
 * Prend en compte que le HTML sera dans un JSON.stringify
 */
export function estimateFinalSize(content: string): number {
  // La taille finale sera : taille du JSON.stringify du body
  // On simule un body typique : { chapitreId: X, contenu: "...", ... }
  const estimatedBody = {
    chapitreId: 1,
    contenu: content,
    cours_id: 1,
    titre: 'Titre',
    statut: 'en_cours_examen'
  };
  
  return getJsonSize(estimatedBody);
}

