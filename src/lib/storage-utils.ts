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

