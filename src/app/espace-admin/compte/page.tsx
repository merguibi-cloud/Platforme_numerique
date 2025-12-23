"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Save, User } from "lucide-react";
import { useAdminUser } from "../components/AdminUserProvider";
import { getSignedImageUrl } from "@/lib/storage-utils";

export default function AdminComptePage() {
  const router = useRouter();
  const adminUser = useAdminUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const photoPreviewCacheRef = useRef<string | null>(null);
  const signedUrlCacheRef = useRef<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  // Charger l'URL signée de l'image seulement si la source change
  useEffect(() => {
    // Si c'est une preview locale (data URL ou fichier sélectionné), utiliser directement
    if (selectedFile || (photoPreview && (photoPreview.startsWith('data:') || !photoPreview.startsWith('http')))) {
      photoPreviewCacheRef.current = photoPreview;
      signedUrlCacheRef.current = photoPreview;
      setImageUrl(photoPreview);
      setImageError(false);
      return;
    }

    // Si c'est une URL et qu'elle n'a pas changé, utiliser le cache
    if (photoPreview === photoPreviewCacheRef.current && signedUrlCacheRef.current) {
      setImageUrl(signedUrlCacheRef.current);
      setImageError(false);
      return;
    }

    // Si pas de preview
    if (!photoPreview) {
      photoPreviewCacheRef.current = null;
      signedUrlCacheRef.current = null;
      setImageUrl(null);
      setImageError(false);
      return;
    }

    // Nouvelle URL, obtenir une URL signée
    if (photoPreview.startsWith('http://') || photoPreview.startsWith('https://')) {
      const currentPhotoPreview = photoPreview;
      photoPreviewCacheRef.current = currentPhotoPreview;
      setImageError(false);
      
      getSignedImageUrl(currentPhotoPreview, 'photo_profil')
        .then((signedUrl) => {
          // Vérifier que la source n'a pas changé pendant le chargement
          if (photoPreviewCacheRef.current === currentPhotoPreview) {
            if (signedUrl) {
              signedUrlCacheRef.current = signedUrl;
              setImageUrl(signedUrl);
              setImageError(false);
            } else {
              signedUrlCacheRef.current = null;
              setImageError(true);
            }
          }
        })
        .catch((error) => {
          if (photoPreviewCacheRef.current === currentPhotoPreview) {
            console.error("Erreur lors de l'obtention de l'URL signée:", error);
            signedUrlCacheRef.current = null;
            setImageError(true);
          }
        });
    } else {
      // Ce n'est pas une URL HTTP, utiliser directement
      photoPreviewCacheRef.current = photoPreview;
      signedUrlCacheRef.current = photoPreview;
      setImageUrl(photoPreview);
      setImageError(false);
    }
  }, [photoPreview, selectedFile]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/me", { credentials: "include" });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.admin) {
          setAdminData(result.admin);
          if (result.admin.photo_profil) {
            setPhotoPreview(result.admin.photo_profil);
          } else {
            setPhotoPreview(null);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError("Veuillez sélectionner une image");
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setImageError(false);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
    setImageUrl(null);
    setImageError(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!adminData) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      } else if (photoPreview === null && adminData.photo_profil) {
        // Si on supprime la photo
        formData.append('removePhoto', 'true');
      }

      const response = await fetch("/api/admin/compte/photo-profil", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccess("Photo de profil mise à jour avec succès");
          setSelectedFile(null);
          
          // Si l'API retourne directement l'URL de la photo, l'utiliser
          if (result.photo_profil) {
            setPhotoPreview(result.photo_profil);
            setImageError(false);
          } else if (result.photo_profil === null) {
            // Photo supprimée
            setPhotoPreview(null);
            setImageUrl(null);
          }
          
          // Recharger les données pour synchroniser
          await loadAdminData();
          // Rafraîchir le contexte utilisateur
          if (adminUser.refresh) {
            await adminUser.refresh();
          }
          // Réinitialiser l'erreur d'image pour forcer le rechargement
          setImageError(false);
        } else {
          setError(result.error || "Erreur lors de la mise à jour");
        }
      } else {
        const result = await response.json();
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
        <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-[#032622]">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MON COMPTE
        </h1>
      </div>

      <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 max-w-2xl">
        <div className="space-y-6 sm:space-y-7 md:space-y-8">
          {/* Photo de profil */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-3 sm:mb-4">
              PHOTO DE PROFIL
            </label>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Aperçu de la photo */}
              <div className="relative flex-shrink-0">
                {imageUrl && !imageError ? (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 sm:border-4 border-[#032622]">
                    <Image
                      src={imageUrl}
                      alt="Photo de profil"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.warn("Impossible de charger l'image de profil");
                        setImageError(true);
                      }}
                      sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:opacity-90 active:opacity-75 transition-opacity z-10"
                      title="Supprimer la photo"
                      aria-label="Supprimer la photo"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#032622] flex items-center justify-center border-2 sm:border-4 border-[#032622]">
                    <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Bouton d'upload */}
              <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <div className="flex items-center gap-3 sm:gap-4">
                    <label
                      htmlFor="photo-upload"
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-white text-xs sm:text-sm md:text-base font-semibold rounded hover:opacity-90 active:opacity-80 cursor-pointer flex items-center gap-1.5 sm:gap-2 transition-opacity"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="whitespace-nowrap">{photoPreview ? "CHANGER LA PHOTO" : "AJOUTER UNE PHOTO"}</span>
                    </label>
                  </div>
                </label>
                <p className="text-[10px] sm:text-xs text-[#032622]/70">
                  Formats acceptés : JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Informations de l'administrateur */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6 pt-4 sm:pt-5 md:pt-6 border-t-2 border-[#032622]">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-2 sm:mb-3">
                NOM
              </label>
              <input
                type="text"
                value={adminData?.nom || ""}
                readOnly
                className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-sm sm:text-base text-[#032622]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-2 sm:mb-3">
                PRÉNOM
              </label>
              <input
                type="text"
                value={adminData?.prenom || ""}
                readOnly
                className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-sm sm:text-base text-[#032622]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#032622] uppercase mb-2 sm:mb-3">
                EMAIL
              </label>
              <input
                type="email"
                value={adminData?.email || ""}
                readOnly
                className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-sm sm:text-base text-[#032622] break-words"
              />
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="p-3 sm:p-4 bg-red-100 border-2 border-red-600 rounded text-xs sm:text-sm text-red-700 break-words">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 sm:p-4 bg-green-100 border-2 border-green-600 rounded text-xs sm:text-sm text-green-700 break-words">
              {success}
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving || (!selectedFile && photoPreview === (adminData?.photo_profil || null))}
              className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-[#032622] text-white text-xs sm:text-sm md:text-base font-semibold rounded hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity w-full sm:w-auto"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {isSaving ? "ENREGISTREMENT..." : "ENREGISTRER"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gray-300 text-[#032622] text-xs sm:text-sm md:text-base font-semibold rounded hover:opacity-90 active:opacity-80 transition-opacity w-full sm:w-auto"
            >
              ANNULER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}












