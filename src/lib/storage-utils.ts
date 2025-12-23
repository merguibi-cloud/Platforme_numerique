/**
 * Utilitaires pour la gestion des fichiers dans Supabase Storage
 */

/**
 * Extrait le bucket et le chemin depuis une URL Supabase Storage
 */
export function extractStorageInfo(url: string): { bucket: string; path: string } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Format Supabase Storage URL: /storage/v1/object/public/{bucket}/{path}
    // ou /storage/v1/object/sign/{bucket}/{path}?...
    const match = pathname.match(/\/storage\/v1\/object\/(public|sign)\/([^\/]+)\/(.+)/);
    
    if (match) {
      return {
        bucket: match[2],
        path: match[3]
      };
    }
    
    // Si c'est déjà un chemin (sans URL complète)
    // On essaie de deviner le bucket selon le format du chemin
    if (pathname.includes('etudes-cas-consignes')) {
      return {
        bucket: 'etudes-cas-consignes',
        path: pathname.replace(/^\/+/, '')
      };
    }
    
    if (pathname.includes('cours-media')) {
      return {
        bucket: 'cours-media',
        path: pathname.replace(/^\/+/, '')
      };
    }
    
    if (pathname.includes('cours-fichiers-complementaires')) {
      return {
        bucket: 'cours-fichiers-complementaires',
        path: pathname.replace(/^\/+/, '')
      };
    }
    
    return null;
  } catch (e) {
    // Si ce n'est pas une URL valide, traiter comme un chemin direct
    return null;
  }
}

/**
 * Obtient une URL signée pour une image depuis une URL publique ou un chemin
 * @param urlOrPath URL publique Supabase ou chemin du fichier
 * @param defaultBucket Bucket par défaut si le chemin ne peut pas être extrait de l'URL
 * @returns URL signée ou null en cas d'erreur
 */
export async function getSignedImageUrl(urlOrPath: string | null, defaultBucket: string = 'photo_profil'): Promise<string | null> {
  if (!urlOrPath) return null;

  try {
    // Si c'est déjà une data URL (preview locale), la retourner telle quelle
    if (urlOrPath.startsWith('data:')) {
      return urlOrPath;
    }

    // Si c'est déjà une URL signée, la retourner telle quelle
    if (urlOrPath.includes('/storage/v1/object/sign/')) {
      return urlOrPath;
    }

    // Extraire le bucket et le chemin depuis l'URL
    let filePath: string;
    let fileBucket: string = defaultBucket;

    const storageInfo = extractStorageInfo(urlOrPath);
    
    if (storageInfo) {
      fileBucket = storageInfo.bucket;
      filePath = storageInfo.path;
    } else if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      // Si c'est une URL mais qu'on ne peut pas l'extraire, essayer de la retourner telle quelle
      console.warn('Impossible d\'extraire les informations de l\'URL, utilisation directe:', urlOrPath);
      return urlOrPath;
    } else {
      // C'est probablement un chemin direct
      filePath = urlOrPath;
    }

    // Appeler l'API pour obtenir une URL signée
    const response = await fetch(
      `/api/photo-url?path=${encodeURIComponent(filePath)}&bucket=${encodeURIComponent(fileBucket)}`,
      {
        credentials: 'include',
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.url) {
        return result.url;
      }
    }

    // Si l'API échoue, retourner l'URL originale en dernier recours
    console.warn('Impossible d\'obtenir une URL signée, utilisation de l\'URL originale');
    return urlOrPath;
  } catch (error) {
    console.error('Erreur lors de l\'obtention de l\'URL signée:', error);
    // En cas d'erreur, retourner l'URL originale
    return urlOrPath;
  }
}

/**
 * Supprime un fichier du storage Supabase
 */
export async function deleteFileFromStorage(fileUrlOrPath: string, bucket?: string): Promise<boolean> {
  try {
    let filePath: string;
    let fileBucket: string;
    
    // Extraire le bucket et le chemin depuis l'URL
    const storageInfo = extractStorageInfo(fileUrlOrPath);
    
    if (storageInfo) {
      fileBucket = storageInfo.bucket;
      filePath = storageInfo.path;
    } else if (bucket) {
      // Si le bucket est fourni et que c'est un chemin direct
      fileBucket = bucket;
      filePath = fileUrlOrPath;
    } else {
      console.error('Impossible d\'extraire les informations du fichier:', fileUrlOrPath);
      return false;
    }
    
    // Appeler l'API de suppression
    const response = await fetch(`/api/delete-file?path=${encodeURIComponent(filePath)}&bucket=${encodeURIComponent(fileBucket)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.success === true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    return false;
  }
}

