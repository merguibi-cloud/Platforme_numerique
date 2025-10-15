"use client";
import { useState, useEffect } from 'react';
import { User, Shield, Mail, Calendar, Edit, Save, X } from 'lucide-react';
import { Modal } from '../../validation/components/Modal';
import { useModal } from '../../validation/components/useModal';

interface UserData {
  id: string;
  user_id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role: 'etudiant' | 'animateur' | 'admin' | 'superadmin';
  created_at: string;
  auth_users?: {
    email: string;
    created_at: string;
    last_sign_in_at?: string;
  };
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const { modalState, showSuccess, showError, hideModal } = useModal();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        showError(result.error || 'Erreur lors du chargement des utilisateurs', 'Erreur');
      }
    } catch (error) {
      showError('Erreur lors du chargement des utilisateurs', 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (user: UserData) => {
    setEditingUser(user.user_id);
    setNewRole(user.role);
  };

  const handleSaveRole = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();
      
      if (result.success) {
        showSuccess('Rôle mis à jour avec succès', 'Succès');
        setEditingUser(null);
        setNewRole('');
        loadUsers(); // Recharger la liste
      } else {
        showError(result.error || 'Erreur lors de la mise à jour', 'Erreur');
      }
    } catch (error) {
      showError('Erreur lors de la mise à jour du rôle', 'Erreur');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'etudiant': 'Étudiant',
      'animateur': 'Animateur',
      'admin': 'Administrateur',
      'superadmin': 'Super Administrateur'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'etudiant': 'bg-blue-100 text-blue-800',
      'animateur': 'bg-green-100 text-green-800',
      'admin': 'bg-orange-100 text-orange-800',
      'superadmin': 'bg-red-100 text-red-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          Gestion des Utilisateurs
        </h2>
        <div className="flex items-center space-x-2 text-[#032622]">
          <User className="w-5 h-5" />
          <span className="font-medium">{users.length} utilisateur(s)</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#F8F5E4]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#032622] uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#032622] uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#032622] uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#032622] uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#032622] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#032622] flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nom && user.prenom 
                            ? `${user.prenom} ${user.nom}`
                            : 'Nom non renseigné'
                          }
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.auth_users?.email || user.email || 'Email non disponible'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.user_id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]"
                      >
                        <option value="etudiant">Étudiant</option>
                        <option value="animateur">Animateur</option>
                        <option value="admin">Administrateur</option>
                        <option value="superadmin">Super Administrateur</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.auth_users?.created_at || user.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.auth_users?.last_sign_in_at ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(user.auth_users.last_sign_in_at).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">Jamais connecté</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUser === user.user_id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveRole(user.user_id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditRole(user)}
                        className="text-[#032622] hover:text-[#032622]/80"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};
