"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Save, User } from "lucide-react";
import { useAdminUser } from "../components/AdminUserProvider";

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

  useEffect(() => {
    loadAdminData();
  }, []);

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
          // Recharger les données
          await loadAdminData();
          // Rafraîchir le contexte utilisateur
          if (adminUser.refresh) {
            adminUser.refresh();
          }
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
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-3xl font-bold text-[#032622]"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MON COMPTE
        </h1>
      </div>

      <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-8 max-w-2xl">
        <div className="space-y-8">
          {/* Photo de profil */}
          <div>
            <label className="block text-sm font-bold text-[#032622] uppercase mb-4">
              PHOTO DE PROFIL
            </label>
            
            <div className="flex items-start gap-6">
              {/* Aperçu de la photo */}
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Photo de profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#032622]"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:opacity-90"
                      title="Supprimer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#032622] flex items-center justify-center border-4 border-[#032622]">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Bouton d'upload */}
              <div className="flex-1 space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="photo-upload"
                      className="px-6 py-3 bg-[#032622] text-white font-semibold rounded hover:opacity-90 cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      {photoPreview ? "CHANGER LA PHOTO" : "AJOUTER UNE PHOTO"}
                    </label>
                  </div>
                </label>
                <p className="text-xs text-[#032622]/70">
                  Formats acceptés : JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Informations de l'administrateur */}
          <div className="space-y-6 pt-6 border-t-2 border-[#032622]">
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">
                NOM
              </label>
              <input
                type="text"
                value={adminData?.nom || ""}
                readOnly
                className="w-full px-5 py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">
                PRÉNOM
              </label>
              <input
                type="text"
                value={adminData?.prenom || ""}
                readOnly
                className="w-full px-5 py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">
                EMAIL
              </label>
              <input
                type="email"
                value={adminData?.email || ""}
                readOnly
                className="w-full px-5 py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
              />
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-600 rounded text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 border-2 border-green-600 rounded text-green-700">
              {success}
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSave}
              disabled={isSaving || (!selectedFile && photoPreview === (adminData?.photo_profil || null))}
              className="px-8 py-4 bg-[#032622] text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? "ENREGISTREMENT..." : "ENREGISTRER"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-8 py-4 bg-gray-300 text-[#032622] font-semibold rounded hover:opacity-90"
            >
              ANNULER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


