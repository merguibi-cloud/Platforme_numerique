"use client";

import { useState } from "react";
import { Plus, ChevronDown, Search, Pencil, Trash2, X } from "lucide-react";
import { AdminSidebar } from "../components/AdminSidebar";
import AdminTopBar from "../components/AdminTopBar";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  mail: string;
  ecole: string;
  role: string;
}

// Données de démonstration (sera remplacé par le back plus tard)
const initialAdmins: AdminUser[] = [
  {
    id: "1",
    nom: "DRAKE",
    prenom: "NATHAN",
    mail: "NDRAKE@ELITE-SOCIETY.FR",
    ecole: "LEADER SOCIETY",
    role: "ADMINISTRATEUR ADV",
  },
  {
    id: "2",
    nom: "MILLER",
    prenom: "JOEL",
    mail: "JMILLER@ELITE-SOCIETY.FR",
    ecole: "DIGITAL LEGACY",
    role: "ADMINISTRATEUR COMMERCIAL",
  },
  {
    id: "3",
    nom: "FISHER",
    prenom: "SAM",
    mail: "SFISHER@ELITE-SOCIETY.FR",
    ecole: "FINANCE SOCIETY",
    role: "FORMATEUR",
  },
  {
    id: "4",
    nom: "SNAKE",
    prenom: "LIQUID",
    mail: "LSNAKE@ELITE-SOCIETY.FR",
    ecole: "KEOS",
    role: "ADMINISTRATEUR",
  },
  {
    id: "5",
    nom: "PHILIPS",
    prenom: "TREVOR",
    mail: "TPHILIPS@ELITE-SOCIETY.FR",
    ecole: "KEOS",
    role: "ADMINISTRATEUR COMMERCIAL",
  },
  {
    id: "6",
    nom: "SAKAI",
    prenom: "JIN",
    mail: "JSAKAI@ELITE-SOCIETY.FR",
    ecole: "1001",
    role: "FORMATEUR",
  },
];

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
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    mail: "",
    ecole: "",
    role: "",
  });

  // Filtrer les administrateurs selon la recherche
  const filteredAdmins = admins.filter((admin) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.nom.toLowerCase().includes(searchLower) ||
      admin.prenom.toLowerCase().includes(searchLower) ||
      admin.mail.toLowerCase().includes(searchLower) ||
      admin.ecole.toLowerCase().includes(searchLower) ||
      admin.role.toLowerCase().includes(searchLower)
    );
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
    if (confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) {
      setAdmins(admins.filter((admin) => admin.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si le rôle est ADMINISTRATEUR, on met une valeur vide pour l'école
    const submitData = {
      ...formData,
      ecole: formData.role === "ADMINISTRATEUR" ? "" : formData.ecole,
    };
    
    if (editingAdmin) {
      // Modifier un administrateur existant
      setAdmins(
        admins.map((admin) =>
          admin.id === editingAdmin.id
            ? { ...submitData, id: editingAdmin.id }
            : admin
        )
      );
    } else {
      // Créer un nouvel administrateur
      const newAdmin: AdminUser = {
        ...submitData,
        id: Date.now().toString(),
      };
      setAdmins([...admins, newAdmin]);
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
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <AdminSidebar />
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewClick}
                className="flex items-center space-x-2 bg-[#032622] text-[#F8F5E4] px-6 py-3 font-semibold hover:bg-[#032622]/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>NOUVEAU</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border-2 border-[#032622] text-[#032622] px-6 py-3 font-semibold hover:bg-[#032622]/10 transition-colors relative"
              >
                <ChevronDown className="w-5 h-5" />
                <span>FILTRES</span>
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 bg-[#F8F5E4] border-2 border-[#032622] p-4 min-w-[200px] z-10">
                    <p className="text-sm text-[#032622] font-semibold mb-2">
                      Filtres à venir
                    </p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#032622]" />
            <input
              type="text"
              placeholder="Recherche"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-12 py-3 text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
            />
          </div>

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
                    ÉDITION
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                            className="text-[#032622] hover:text-[#D96B6B] transition-colors"
                            title="Supprimer"
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
        </div>
      </div>
  );
}

