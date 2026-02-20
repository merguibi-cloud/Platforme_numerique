'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TutorAPI } from '@/lib/tutor-api';
import { formatDate } from '@/lib/tutor-utils';
import type { TuteurEtudiant } from '@/types/tutor';

export default function TutorEtudiantsPage() {
  const [tutees, setTutees] = useState<TuteurEtudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TutorAPI.getTutees()
      .then(setTutees)
      .catch((err) => setError(err.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes étudiants</h1>
        <p className="text-gray-500 mt-1">{tutees.length} étudiant(s) sous tutelle</p>
      </div>

      {tutees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">Aucun étudiant ne vous est assigné pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tutees.map((tutee) => (
                <tr key={tutee.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {tutee.etudiant?.prenom} {tutee.etudiant?.nom}
                      </p>
                      <p className="text-xs text-gray-500">{tutee.etudiant?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(tutee.date_debut)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tutee.statut === 'actif'
                          ? 'bg-green-100 text-green-800'
                          : tutee.statut === 'inactif'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tutee.statut === 'actif'
                        ? 'Actif'
                        : tutee.statut === 'inactif'
                        ? 'Inactif'
                        : 'Terminé'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/espace-tuteur/etudiants/${tutee.etudiant_id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir la progression →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
