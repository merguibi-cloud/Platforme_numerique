"use client";

import { useState, useEffect } from "react";
import { X, Bookmark, FileText, Play, Edit, Trash2, Save } from "lucide-react";
import { BibliothequeFichier, tagConfig, schools } from './types';
import { mapSujetToCategory, getVideoThumbnail } from './utils';
import { Modal } from "@/app/Modal";

interface DocumentModalProps {
  document: BibliothequeFichier;
  proprietaire?: string;
  onClose: () => void;
  onRefresh?: () => void;
  onToggleFavori?: (docId: string, currentFavori: boolean) => void;
  onView?: (doc: BibliothequeFichier) => void;
  showModal: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const DocumentModal = ({ 
  document, 
  proprietaire: initialProprietaire = "",
  onClose,
  onRefresh,
  onToggleFavori,
  onView,
  showModal
}: DocumentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [proprietaire, setProprietaire] = useState<string>(initialProprietaire || "");
  const [editForm, setEditForm] = useState({
    titre: document.titre,
    description: document.description || '',
    sujet: document.sujet || '',
    ecole: document.ecole || '',
    visibilite: document.visibilite || 'plateforme',
    activer_telechargement: document.activer_telechargement !== undefined ? document.activer_telechargement : true,
  });
  const tag = tagConfig[mapSujetToCategory(document.sujet)];

  const handleToggleFavori = () => {
    if (onToggleFavori) {
      onToggleFavori(document.id, document.est_favori || false);
    }
  };

  // Mettre à jour le propriétaire si il change (chargé en arrière-plan)
  useEffect(() => {
    if (initialProprietaire) {
      setProprietaire(initialProprietaire);
    } else {
      // Si le propriétaire n'est pas encore chargé, le charger en arrière-plan
      const loadProprietaire = async () => {
        try {
          const response = await fetch(`/api/bibliotheque/document/${document.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.proprietaire) {
              setProprietaire(data.proprietaire);
            }
          }
        } catch (error) {
          // Erreur silencieuse lors du chargement du propriétaire
        }
      };
      loadProprietaire();
    }
  }, [initialProprietaire, document.id]);

  // Mettre à jour le formulaire quand le document change
  useEffect(() => {
    setEditForm({
      titre: document.titre,
      description: document.description || '',
      sujet: document.sujet || '',
      ecole: document.ecole || '',
      visibilite: (document.visibilite || 'plateforme') as 'plateforme' | 'ecole',
      activer_telechargement: document.activer_telechargement !== undefined ? document.activer_telechargement : true,
    });
  }, [document]);

  const handleView = async () => {
    if (onView) {
      setIsLoading(true);
      try {
        await onView(document);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Enregistrer un téléchargement dans la table bibliotheque_telechargements
      try {
        const downloadResponse = await fetch('/api/bibliotheque/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fichier_id: document.id })
        });

        if (!downloadResponse.ok) {
          // Logger l'erreur mais continuer pour permettre le téléchargement admin
          const errorData = await downloadResponse.json().catch(() => ({}));
          // Erreur silencieuse lors de l'enregistrement du téléchargement
        }
      } catch (error) {
        // Continuer même si l'enregistrement échoue
        // Erreur silencieuse lors de l'enregistrement du téléchargement
      }

      // Générer une URL signée pour télécharger (avec force=true pour les admins)
      const response = await fetch(`/api/bibliotheque/file-url/${document.id}?download=true&force=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.url) {
          // Ouvrir l'URL dans un nouvel onglet
          window.open(data.url, '_blank');
          
          if (onRefresh) {
            onRefresh();
          }
        } else {
          throw new Error('Erreur lors de la génération de l\'URL de téléchargement');
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.details 
          ? `${errorData.error}\n\n${errorData.details}` 
          : errorData.error || 'Erreur lors de la génération de l\'URL de téléchargement';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // Erreur silencieuse lors du téléchargement
      showModal(
        error.message || 'Une erreur est survenue lors du téléchargement du fichier. Veuillez réessayer.',
        'Erreur de téléchargement',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Réinitialiser le formulaire
    setEditForm({
      titre: document.titre,
      description: document.description || '',
      sujet: document.sujet || '',
      ecole: document.ecole || '',
      visibilite: (document.visibilite || 'plateforme') as 'plateforme' | 'ecole',
      activer_telechargement: document.activer_telechargement !== undefined ? document.activer_telechargement : true,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/bibliotheque/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          ecole: editForm.ecole || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du fichier');
      }

      const data = await response.json();
      if (data.success) {
        showModal(
          'Les modifications ont été enregistrées avec succès.',
          'Modification réussie',
          'success'
        );
        setIsEditing(false);
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error: any) {
      // Erreur silencieuse lors de la mise à jour
      showModal(
        error.message || 'Une erreur est survenue lors de la mise à jour du fichier. Veuillez réessayer.',
        'Erreur de mise à jour',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bibliotheque/${document.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du fichier');
      }

      const data = await response.json();
      if (data.success) {
        showModal(
          'Le fichier a été supprimé avec succès.',
          'Suppression réussie',
          'success'
        );
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      }
    } catch (error: any) {
      // Erreur silencieuse lors de la suppression
      showModal(
        error.message || 'Une erreur est survenue lors de la suppression du fichier. Veuillez réessayer.',
        'Erreur de suppression',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      
      {/* Modal sidebar */}
      <div 
        className="fixed right-0 top-0 h-full bg-[#F8F5E4] w-full max-w-md overflow-y-auto border-l-2 border-[#032622] shadow-2xl z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="sticky top-0 bg-[#F8F5E4] border-b border-[#032622] p-4 flex items-start justify-between z-10">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onClose}
              className="w-7 h-7 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
            >
              <X className="w-4 h-4 text-[#032622]" />
            </button>
            <h2 
              className="text-sm font-bold text-[#032622] uppercase"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DÉTAILS DU FICHIER
            </h2>
          </div>
          <button
            onClick={handleToggleFavori}
            className={`p-1 transition-colors ${
              document.est_favori 
                ? 'text-[#032622]' 
                : 'text-[#032622] hover:text-[#032622]'
            }`}
          >
            <Bookmark 
              className={`w-5 h-5 transition-colors ${
                document.est_favori ? 'fill-[#032622]' : ''
              }`}
            />
          </button>
        </div>

        {/* Contenu de la modale */}
        <div className="p-4 space-y-4">
          {/* Aperçu du document */}
          {(() => {
            const thumbnail = getVideoThumbnail(document);
            const isVideo = document.bucket_name === 'youtube' || (document.type_fichier?.toLowerCase() === 'mp4');
            return (
              <div 
                className={`relative h-48 flex items-center justify-center ${thumbnail ? '' : 'bg-[#C2C6B6]'}`}
                style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {thumbnail && (
                  <div className="absolute inset-0 bg-black/30" />
                )}
                <span
                  className={`absolute top-3 left-3 z-10 inline-flex items-center text-[9px] font-semibold tracking-[0.3em] text-[#032622] px-2 py-1 ${tag.color}`.trim()}
                >
                  {tag.label}
                </span>
                {thumbnail ? (
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-4">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="flex items-center justify-center">
                    <div className="bg-black/30 rounded-full p-4">
                      <Play className="w-12 h-12 text-[#032622]/70" />
                    </div>
                  </div>
                ) : (
                  <FileText className="w-16 h-16 text-[#032622]/30" />
                )}
              </div>
            );
          })()}

          {/* Titre du document */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.titre}
                onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                className="w-full text-lg font-bold text-[#032622] leading-tight px-3 py-2 border border-[#032622] bg-white focus:outline-none focus:border-[#01302C]"
                style={{ fontFamily: "var(--font-termina-bold)" }}
                placeholder="Titre du fichier"
              />
            ) : (
              <h3 
                className="text-lg font-bold text-[#032622] leading-tight"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                {document.titre}
              </h3>
            )}
          </div>

          {/* Informations du document */}
          <div className="space-y-3 text-sm">
            {isEditing ? (
              <>
                <div>
                  <label className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1 block">SUJET</label>
                  <select
                    value={editForm.sujet}
                    onChange={(e) => setEditForm({ ...editForm, sujet: e.target.value })}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C] text-sm"
                  >
                    <option value="">Sélectionner un sujet</option>
                    {["Masterclass", "Ebook", "Présentation", "Podcast", "Interview", "PDF"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1 block">ÉCOLE</label>
                  <select
                    value={editForm.ecole || ''}
                    onChange={(e) => setEditForm({ ...editForm, ecole: e.target.value })}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C] text-sm"
                  >
                    <option value="">Aucune école</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.name}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1 block">VISIBILITÉ</label>
                  <select
                    value={editForm.visibilite}
                    onChange={(e) => setEditForm({ ...editForm, visibilite: e.target.value as 'plateforme' | 'ecole' })}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C] text-sm"
                  >
                    <option value="plateforme">Plateforme</option>
                    <option value="ecole">École</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.activer_telechargement}
                      onChange={(e) => setEditForm({ ...editForm, activer_telechargement: e.target.checked })}
                      className="w-4 h-4 border border-[#032622] text-[#032622] focus:ring-[#032622]"
                    />
                    <span className="text-[#032622]/60 uppercase text-[10px] font-semibold">ACTIVER LE TÉLÉCHARGEMENT</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                {document.ecole && (
                  <div>
                    <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">ÉCOLE</p>
                    <p className="text-[#032622] font-semibold">{document.ecole}</p>
                  </div>
                )}
                {document.sujet && (
                  <div>
                    <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">SUJET</p>
                    <p className="text-[#032622] font-semibold">{document.sujet}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">TYPE</p>
                  <p className="text-[#032622] font-semibold">{document.type_fichier}</p>
                </div>
                <div>
                  <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">TAILLE</p>
                  <p className="text-[#032622] font-semibold">
                    {document.taille_fichier > 0 
                      ? `${(document.taille_fichier / (1024 * 1024)).toFixed(1)} MO`
                      : 'Non applicable'}
                  </p>
                </div>
                {proprietaire && (
                  <div>
                    <p className="text-[#032622]/60 uppercase text-[10px] font-semibold mb-1">PROPRIÉTAIRE</p>
                    <p className="text-[#032622] font-semibold">{proprietaire}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <button 
                onClick={handleView}
                disabled={isLoading || isEditing}
                className="flex-1 bg-[#F8F5E4] text-[#032622] border border-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                VOIR
              </button>
              <button 
                onClick={handleDownload}
                disabled={isLoading || isEditing}
                className="flex-1 border border-[#032622] text-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                TÉLÉCHARGER
              </button>
            </div>
            {/* Boutons admin : Modifier et Supprimer */}
            <div className="flex space-x-2 pt-2 border-t border-[#032622]">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEdit}
                    disabled={isLoading || isDeleting}
                    className="flex-1 flex items-center justify-center space-x-1 border border-[#032622] text-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-3 h-3" />
                    <span>MODIFIER</span>
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    disabled={isLoading || isSaving || isDeleting}
                    className="flex-1 flex items-center justify-center space-x-1 border border-red-600 text-red-600 py-2.5 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>SUPPRIMER</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || isDeleting}
                    className="flex-1 flex items-center justify-center space-x-1 bg-[#032622] text-[#F8F5E4] py-2.5 text-xs font-semibold hover:bg-[#01302C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSaving ? 'ENREGISTREMENT...' : 'ENREGISTRER'}</span>
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    disabled={isSaving || isDeleting}
                    className="flex-1 border border-[#032622] text-[#032622] py-2.5 text-xs font-semibold hover:bg-[#eae5cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ANNULER
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Activité du fichier */}
          <div>
            <h4 
              className="text-xs font-bold text-[#032622] uppercase mb-2"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              ACTIVITÉ DU FICHIER
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">VUE TOTAL</span>
                <span className="text-[#032622] font-semibold">{document.nombre_vues || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">TÉLÉCHARGEMENT</span>
                <span className="text-[#032622] font-semibold">{document.nombre_telechargements || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#032622]/60 uppercase">ENREGISTREMENT</span>
                <span className="text-[#032622] font-semibold">0</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 
              className="text-xs font-bold text-[#032622] uppercase mb-2"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DESCRIPTION
            </h4>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C] resize-none text-xs"
                placeholder="Description du fichier"
              />
            ) : (
              <div className="border border-[#032622] p-3 bg-[#F8F5E4]">
                <p className="text-xs text-[#032622] leading-relaxed">
                  {document.description || 'Aucune description'}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div>
              <h4 
                className="text-xs font-bold text-[#032622] uppercase mb-2"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                TAGS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-[#C2C6B6] text-[#032622] text-[9px] uppercase font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le fichier "${document.titre}" ?\n\nCette action est irréversible.`}
        type="warning"
        isConfirm={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

