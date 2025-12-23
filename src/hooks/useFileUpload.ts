import { useState, useRef } from 'react';

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  error?: string;
  filePath?: string;
  bucketName?: string;
}

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadedFilePathRef = useRef<string | null>(null);
  const uploadedBucketRef = useRef<string | null>(null);

  const uploadFile = async (
    file: File
  ): Promise<{ success: boolean; filePath?: string; bucketName?: string; error?: string }> => {
    try {
      setUploadProgress({ progress: 0, status: 'uploading' });

      // Obtenir l'URL d'upload depuis notre API
      const response = await fetch('/api/bibliotheque/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération de l\'URL d\'upload');
      }

      const data = await response.json();
      if (!data.success || !data.path || !data.bucket) {
        throw new Error('Réponse invalide du serveur');
      }

      uploadedFilePathRef.current = data.path;
      uploadedBucketRef.current = data.bucket;

      // Uploader via notre API avec progression réelle
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', data.path);
        formData.append('bucket', data.bucket);

        // Suivi de la progression
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress({
              progress: percentComplete,
              status: 'uploading',
              filePath: data.path,
              bucketName: data.bucket
            });
          }
        });

        // Gérer la fin de l'upload
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                setUploadProgress({
                  progress: 100,
                  status: 'completed',
                  filePath: data.path,
                  bucketName: data.bucket
                });
                resolve({
                  success: true,
                  filePath: data.path,
                  bucketName: data.bucket
                });
              } else {
                throw new Error(result.error || 'Erreur lors de l\'upload');
              }
            } catch (error: any) {
              setUploadProgress({
                progress: 0,
                status: 'error',
                error: error.message || 'Erreur lors du traitement de la réponse'
              });
              reject(error);
            }
          } else {
            let errorMessage = 'Erreur lors de l\'upload';
            let errorDetails = '';
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.error || errorMessage;
              errorDetails = errorData.details || '';
            } catch {
              errorMessage = `Erreur ${xhr.status}: ${xhr.statusText}`;
            }
            
            const fullErrorMessage = errorDetails 
              ? `${errorMessage}\n\n${errorDetails}`
              : errorMessage;
            
            setUploadProgress({
              progress: 0,
              status: 'error',
              error: fullErrorMessage
            });
            reject(new Error(fullErrorMessage));
          }
        });

        // Gérer les erreurs
        xhr.addEventListener('error', () => {
          setUploadProgress({
            progress: 0,
            status: 'error',
            error: 'Erreur réseau lors de l\'upload'
          });
          reject(new Error('Erreur réseau lors de l\'upload'));
        });

        // Gérer l'annulation
        xhr.addEventListener('abort', () => {
          setUploadProgress({
            progress: 0,
            status: 'idle'
          });
          reject(new Error('Upload annulé'));
        });

        // Démarrer l'upload
        xhr.open('POST', '/api/bibliotheque/upload-file');
        xhr.send(formData);
      });
    } catch (error: any) {
      setUploadProgress({
        progress: 0,
        status: 'error',
        error: error.message || 'Erreur lors de l\'upload'
      });
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'upload'
      };
    }
  };

  const cancelUpload = async () => {
    // Annuler l'upload en cours
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }

    // Supprimer le fichier uploadé si l'utilisateur annule
    if (uploadedFilePathRef.current && uploadedBucketRef.current) {
      try {
        await fetch('/api/bibliotheque/delete-temp', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: uploadedFilePathRef.current,
            bucketName: uploadedBucketRef.current
          })
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier temporaire:', error);
      }
      uploadedFilePathRef.current = null;
      uploadedBucketRef.current = null;
    }

    setUploadProgress({
      progress: 0,
      status: 'idle'
    });
  };

  const reset = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    uploadedFilePathRef.current = null;
    uploadedBucketRef.current = null;
    setUploadProgress({
      progress: 0,
      status: 'idle'
    });
  };

  return {
    uploadProgress,
    uploadFile,
    cancelUpload,
    reset
  };
}

