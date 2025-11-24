"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, Search, Pencil, Trash2, X } from "lucide-react";
import AdminTopBar from "../components/AdminTopBar";
import { Modal } from "@/app/Modal";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  mail: string;
  ecole: string;
  role: string;
  status?: "pending" | "actif";
}

const roles = [
  "ADMINISTRATEUR",
  "ADMINISTRATEUR ADV",
  "ADMINISTRATEUR COMMERCIAL",
  "FORMATEUR",
];

const ecoles = [
  "LEADER SOCIETY",
  "DIGITAL LEGACY",
  "FINANCE SOCIETY",
  "KEOS",
  "1001",
];

export default function AttributionPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterEcole, setFilterEcole] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    mail: "",
    ecole: "",
    role: "",
  });

  // Charger l'ID de l'administrateur connecté
  useEffect(() => {
    const loadCurrentAdmin = async () => {
      try {
        const response = await fetch("/api/admin/me", {
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.admin) {
            setCurrentAdminId(result.admin.id);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'administrateur connecté:", err);
      }
    };
    loadCurrentAdmin();
  }, []);

  // Charger les administrateurs depuis l'API
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/administrateurs", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des administrateurs");
      }

      const result = await response.json();
      if (result.success) {
        setAdmins(result.administrateurs || []);
      } else {
        setError(result.error || "Erreur lors du chargement");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les administrateurs selon la recherche (nom et prénom uniquement) et les filtres
  const filteredAdmins = admins.filter((admin) => {
    // Recherche par nom et prénom uniquement
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      (admin.nom?.toLowerCase() || '').includes(searchLower) ||
      (admin.prenom?.toLowerCase() || '').includes(searchLower);

    // Filtre par école
    const matchesEcole = filterEcole === "" || admin.ecole === filterEcole;

    // Filtre par rôle
    const matchesRole = filterRole === "" || admin.role === filterRole;

    // Filtre par statut
    const matchesStatus = filterStatus === "" || admin.status === filterStatus;

    return matchesSearch && matchesEcole && matchesRole && matchesStatus;
  });

  const handleNewClick = () => {
    setEditingAdmin(null);
    setFormData({
      nom: "",
      prenom: "",
      mail: "",
      ecole: "",
      role: "",
    });
    setShowForm(true);
  };

  const handleEditClick = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      nom: admin.nom,
      prenom: admin.prenom,
      mail: admin.mail,
      ecole: admin.ecole,
      role: admin.role,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    // Empêcher la suppression de l'administrateur connecté
    if (currentAdminId === id) {
      setError("Vous ne pouvez pas vous supprimer vous-même");
      return;
    }
    setAdminToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;

    // Double vérification : empêcher la suppression de l'administrateur connecté
    if (currentAdminId === adminToDelete) {
      setError("Vous ne pouvez pas vous supprimer vous-même");
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
      return;
    }

    try {
      const response = await fetch(`/api/admin/administrateurs/${adminToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      // Recharger la liste
      await loadAdmins();
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      setShowDeleteConfirm(false);
      setAdminToDelete(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingAdmin) {
        // Modifier un administrateur existant
        const response = await fetch(`/api/admin/administrateurs/${editingAdmin.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.mail,
            role: formData.role,
            ecole: formData.role === "ADMINISTRATEUR" ? "" : formData.ecole,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erreur lors de la modification");
        }

        // Recharger la liste
        await loadAdmins();
      } else {
        // Inviter un nouvel administrateur
        const response = await fetch("/api/admin/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.mail,
            role: formData.role,
            ecole: formData.role === "ADMINISTRATEUR" ? "" : formData.ecole,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erreur lors de la création de l'administrateur");
        }

        // Recharger la liste
        await loadAdmins();
        
        // Afficher le modal avec les identifiants si disponibles
        if (result.credentials) {
          setCredentials(result.credentials);
          setShowCredentialsModal(true);
        } else {
          setSuccessMessage("Administrateur créé avec succès. L'email sera confirmé après la première connexion.");
          setTimeout(() => setSuccessMessage(""), 5000);
        }
      }

      setShowForm(false);
      setEditingAdmin(null);
      setFormData({
        nom: "",
        prenom: "",
        mail: "",
        ecole: "",
        role: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAdmin(null);
    setFormData({
      nom: "",
      prenom: "",
      mail: "",
      ecole: "",
      role: "",
    });
  };

  return (
    <div className="flex-1 p-10">
        <AdminTopBar notificationCount={0} className="mb-6" />
        <div className="space-y-6">
          {/* Titre */}
          <h1
            className="text-4xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            ESPACE D'ATTRIBUTION
          </h1>

          {/* Boutons d'action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 relative">
              <button
                onClick={handleNewClick}
                className="flex items-center space-x-2 bg-[#032622] text-[#F8F5E4] px-6 py-3 font-semibold hover:bg-[#032622]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>NOUVEAU</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 border-2 border-[#032622] text-[#032622] px-6 py-3 font-semibold hover:bg-[#032622]/10 transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  <span>FILTRES</span>
                </button>
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 bg-[#F8F5E4] border-2 border-[#032622] p-4 min-w-[250px] z-10 shadow-lg">
                    <div className="space-y-4">
                      {/* Filtre École */}
                      <div>
                        <label className="block text-sm font-semibold text-[#032622] mb-2">
                          École
                        </label>
                        <select
                          value={filterEcole}
                          onChange={(e) => setFilterEcole(e.target.value)}
                          className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-3 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                        >
                          <option value="">Toutes les écoles</option>
                          {ecoles.map((ecole) => (
                            <option key={ecole} value={ecole}>
                              {ecole}
                            </option>
                          ))}
                          <option value="TOUTES LES ÉCOLES">TOUTES LES ÉCOLES</option>
                        </select>
                      </div>

                      {/* Filtre Rôle */}
                      <div>
                        <label className="block text-sm font-semibold text-[#032622] mb-2">
                          Rôle
                        </label>
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-3 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                        >
                          <option value="">Tous les rôles</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filtre Statut */}
                      <div>
                        <label className="block text-sm font-semibold text-[#032622] mb-2">
                          Statut
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-3 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="actif">Actif</option>
                          <option value="pending">En attente</option>
                        </select>
                      </div>

                      {/* Bouton Réinitialiser */}
                      <button
                        onClick={() => {
                          setFilterEcole("");
                          setFilterRole("");
                          setFilterStatus("");
                        }}
                        className="w-full bg-[#032622] text-[#F8F5E4] px-4 py-2 font-semibold hover:bg-[#032622]/90 transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#032622]" />
            <input
              type="text"
              placeholder="Recherche par nom ou prénom"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-12 py-3 text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-[#D96B6B] text-white p-4 border-2 border-[#032622]">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Message de succès */}
          {successMessage && (
            <div className="bg-[#4CAF50] text-white p-4 border-2 border-[#032622]">
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Tableau */}
          <div className="border-2 border-[#032622] bg-[#F8F5E4]">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#032622]">
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    NOM/PRÉNOM
                  </th>
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    MAIL
                  </th>
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    ÉCOLE
                  </th>
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    ROLE
                  </th>
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    STATUT
                  </th>
                  <th className="text-left py-4 px-6 text-[#032622] font-bold uppercase tracking-wide">
                    ÉDITION
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-[#032622]/70"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-[#032622]/70"
                    >
                      Aucun administrateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-b border-[#032622]/30 hover:bg-[#F8F5E4]/80"
                    >
                      <td className="py-4 px-6 text-[#032622] font-semibold uppercase">
                        {admin.nom} {admin.prenom}
                      </td>
                      <td className="py-4 px-6 text-[#032622]">{admin.mail}</td>
                      <td className="py-4 px-6 text-[#032622]">
                        {admin.role === "ADMINISTRATEUR" ? "TOUTES LES ÉCOLES" : admin.ecole}
                      </td>
                      <td className="py-4 px-6 text-[#032622]">{admin.role}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 text-xs uppercase font-semibold ${
                            admin.status === "pending"
                              ? "bg-[#F0C75E] text-[#032622]"
                              : "bg-[#4CAF50] text-white"
                          }`}
                        >
                          {admin.status === "pending" ? "EN ATTENTE" : "ACTIF"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditClick(admin)}
                            className="text-[#032622] hover:text-[#032622]/70 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(admin.id)}
                            disabled={currentAdminId === admin.id}
                            className={`transition-colors ${
                              currentAdminId === admin.id
                                ? "text-[#032622]/30 cursor-not-allowed"
                                : "text-[#032622] hover:text-[#D96B6B]"
                            }`}
                            title={
                              currentAdminId === admin.id
                                ? "Vous ne pouvez pas vous supprimer vous-même"
                                : "Supprimer"
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal des identifiants */}
        {showCredentialsModal && credentials && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#F8F5E4] border-4 border-[#032622] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-2xl font-bold text-[#032622] uppercase"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  IDENTIFIANTS ADMINISTRATEUR
                </h2>
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setCredentials(null);
                  }}
                  className="text-[#032622] hover:text-[#032622]/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-[#032622] font-semibold text-center">
                  Veuillez transmettre ces identifiants à l'administrateur :
                </p>
                
                <div className="bg-white border-2 border-[#032622] p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                      ADRESSE EMAIL
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={credentials.email}
                        readOnly
                        className="flex-1 bg-[#F8F5E4] border-2 border-[#032622] px-4 py-3 text-[#032622] font-mono text-lg"
                      />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(credentials.email);
                            setCopyMessage('Email copié dans le presse-papiers !');
                            setShowCopySuccess(true);
                          } catch (err) {
                            // Fallback pour les navigateurs qui ne supportent pas clipboard API
                            const input = document.createElement('input');
                            input.value = credentials.email;
                            document.body.appendChild(input);
                            input.select();
                            document.execCommand('copy');
                            document.body.removeChild(input);
                            setCopyMessage('Email copié dans le presse-papiers !');
                            setShowCopySuccess(true);
                          }
                        }}
                        className="px-6 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors whitespace-nowrap"
                        title="Copier l'email"
                      >
                        COPIER
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                      MOT DE PASSE TEMPORAIRE
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={credentials.password}
                        readOnly
                        className="flex-1 bg-[#F8F5E4] border-2 border-[#032622] px-4 py-3 text-[#032622] font-mono text-lg font-bold"
                      />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(credentials.password);
                            setCopyMessage('Mot de passe copié dans le presse-papiers !');
                            setShowCopySuccess(true);
                          } catch (err) {
                            // Fallback pour les navigateurs qui ne supportent pas clipboard API
                            const input = document.createElement('input');
                            input.value = credentials.password;
                            document.body.appendChild(input);
                            input.select();
                            document.execCommand('copy');
                            document.body.removeChild(input);
                            setCopyMessage('Mot de passe copié dans le presse-papiers !');
                            setShowCopySuccess(true);
                          }
                        }}
                        className="px-6 py-3 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors whitespace-nowrap"
                        title="Copier le mot de passe"
                      >
                        COPIER
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F0C75E] border-2 border-[#032622] p-4">
                  <p className="text-[#032622] text-sm font-semibold text-center">
                    ⚠️ IMPORTANT : L'administrateur peut se connecter avec ces identifiants. L'email sera confirmé automatiquement lors de la première connexion.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t-2 border-[#032622]">
                <button
                  onClick={async () => {
                    try {
                      const textToCopy = `Email: ${credentials.email}\nMot de passe: ${credentials.password}`;
                      await navigator.clipboard.writeText(textToCopy);
                      setCopyMessage('Identifiants copiés dans le presse-papiers !');
                      setShowCopySuccess(true);
                    } catch (err) {
                      // Fallback pour les navigateurs qui ne supportent pas clipboard API
                      const textarea = document.createElement('textarea');
                      textarea.value = `Email: ${credentials.email}\nMot de passe: ${credentials.password}`;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textarea);
                      setCopyMessage('Identifiants copiés dans le presse-papiers !');
                      setShowCopySuccess(true);
                    }
                  }}
                  className="px-6 py-2 border-2 border-[#032622] text-[#032622] font-semibold hover:bg-[#032622]/10 transition-colors"
                >
                  TOUT COPIER
                </button>
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setCredentials(null);
                  }}
                  className="px-6 py-2 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors"
                >
                  FERMER
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#F8F5E4] border-4 border-[#032622] p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-2xl font-bold text-[#032622]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {editingAdmin ? "MODIFIER" : "NOUVEAU"} ADMINISTRATEUR
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-[#032622] hover:text-[#032622]/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                      NOM
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value.toUpperCase() })
                      }
                      required
                      className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                      PRÉNOM
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) =>
                        setFormData({ ...formData, prenom: e.target.value.toUpperCase() })
                      }
                      required
                      className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                    MAIL
                  </label>
                  <input
                    type="email"
                    value={formData.mail}
                    onChange={(e) =>
                      setFormData({ ...formData, mail: e.target.value.toUpperCase() })
                    }
                    required
                    className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                    ROLE
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setFormData({ 
                        ...formData, 
                        role: newRole,
                        // Réinitialiser l'école si on passe à ADMINISTRATEUR
                        ecole: newRole === "ADMINISTRATEUR" ? "" : formData.ecole
                      });
                    }}
                    required
                    className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.role && formData.role !== "ADMINISTRATEUR" && (
                  <div>
                    <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                      ÉCOLE
                    </label>
                    <select
                      value={formData.ecole}
                      onChange={(e) =>
                        setFormData({ ...formData, ecole: e.target.value })
                      }
                      required
                      className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                    >
                      <option value="">Sélectionner une école</option>
                      {ecoles.map((ecole) => (
                        <option key={ecole} value={ecole}>
                          {ecole}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className="px-6 py-2 border-2 border-[#032622] text-[#032622] font-semibold hover:bg-[#032622]/10 transition-colors"
                  >
                    ANNULER
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#032622] text-[#F8F5E4] font-semibold hover:bg-[#032622]/90 transition-colors"
                  >
                    {editingAdmin ? "MODIFIER" : "CRÉER"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setAdminToDelete(null);
          }}
          title="Confirmation de suppression"
          message="Êtes-vous sûr de vouloir supprimer cet administrateur ?"
          type="warning"
          isConfirm={true}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setAdminToDelete(null);
          }}
        />

        {/* Modal de succès pour la copie */}
        <Modal
          isOpen={showCopySuccess}
          onClose={() => setShowCopySuccess(false)}
          title="Succès"
          message={copyMessage}
          type="success"
        />
        </div>
        
  );
}

