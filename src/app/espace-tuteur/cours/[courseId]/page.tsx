'use client';

import { use, useEffect, useState } from 'react';
import { TutorAPI } from '@/lib/tutor-api';
import { StudentProgressTable } from '@/components/tutor/StudentProgressTable';
import type { StudentProgress } from '@/types/tutor';

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TutorAPI.getCourseStudents(courseId)
      .then(setStudents)
      .catch((err) => setError(err.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [courseId]);

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
          href="/espace-tuteur/cours"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Retour aux cours
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          Étudiants du cours
        </h1>
        <p className="text-gray-500 mt-1">{students.length} étudiant(s) inscrit(s)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <StudentProgressTable students={students} />
      </div>
    </div>
  );
}
