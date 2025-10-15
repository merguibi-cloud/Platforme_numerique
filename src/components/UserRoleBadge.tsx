"use client";
import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { UserRole, getUserRole, getRoleDisplayName } from '@/lib/user-roles';

export const UserRoleBadge = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await getUserRole();
      setUserRole(role);
    } catch (error) {
      console.error('Erreur lors du chargement du rôle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !userRole) {
    return null;
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      'etudiant': 'bg-blue-100 text-blue-800 border-blue-200',
      'animateur': 'bg-green-100 text-green-800 border-green-200',
      'admin': 'bg-orange-100 text-orange-800 border-orange-200',
      'superadmin': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(userRole)}`}>
      <Shield className="w-3 h-3 mr-1" />
      {getRoleDisplayName(userRole)}
    </div>
  );
};
