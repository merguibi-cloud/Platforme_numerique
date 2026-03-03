'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { TutorAPI } from '@/lib/tutor-api';
import { StudentProgressTable } from '@/components/tutor/StudentProgressTable';
import type { StudentProgress } from '@/types/tutor';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TutorAPI.getTuteeProgress(studentId)
      .then(setProgress)
      .catch((err: Error) => setError(err.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const student = progress[0];

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
        <a
          href="/espace-tuteur/etudiants"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Retour aux étudiants
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {student ? `${student.prenom} ${student.nom}` : 'Étudiant'}
        </h1>
        {student && (
          <p className="text-gray-500 mt-1">{student.email}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Progression par cours</h2>
        </div>
        <StudentProgressTable students={progress} showCourse />
      </div>
    </div>
  );
}
