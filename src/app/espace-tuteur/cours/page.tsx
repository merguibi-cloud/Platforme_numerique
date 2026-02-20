'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TutorAPI } from '@/lib/tutor-api';
import { StudentProgressTable } from '@/components/tutor/StudentProgressTable';
import type { TuteurCours } from '@/types/tutor';

export default function TutorCoursPage() {
  const [courses, setCourses] = useState<TuteurCours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TutorAPI.getAssignedCourses()
      .then(setCourses)
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
        <h1 className="text-2xl font-bold text-gray-900">Mes cours</h1>
        <p className="text-gray-500 mt-1">{courses.length} cours assignés</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">Aucun cours ne vous est assigné pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((tuteurCours) => (
            <Link
              key={tuteurCours.id}
              href={`/espace-tuteur/cours/${tuteurCours.cours_id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {tuteurCours.cours?.titre || 'Cours sans titre'}
              </h3>
              {tuteurCours.cours?.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {tuteurCours.cours.description}
                </p>
              )}
              <p className="text-xs text-blue-600 font-medium mt-3">
                Voir les étudiants →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
