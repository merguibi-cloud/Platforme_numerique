'use client';

import { useEffect, useState } from 'react';
import { GradingAPI } from '@/lib/grading-api';
import { SubmissionCard } from '@/components/tutor/SubmissionCard';
import { GradeModal } from '@/components/tutor/GradeModal';
import type { SoumissionEtudeCas } from '@/types/grading';

type FilterStatus = 'tous' | 'en_attente' | 'corrige' | 'en_revision';

export default function CorrectionsPage() {
  const [submissions, setSubmissions] = useState<SoumissionEtudeCas[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('en_attente');
  const [selectedSubmission, setSelectedSubmission] = useState<SoumissionEtudeCas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'tous' ? { statut: filter } : {};
      const data = await GradingAPI.getSubmissions(params);
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'En attente', value: 'en_attente' },
    { label: 'Corrigé', value: 'corrige' },
    { label: 'En révision', value: 'en_revision' },
    { label: 'Tous', value: 'tous' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <div className="mb-8">
        <h1
          className="text-4xl font-bold text-[#032622] mb-2"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          CORRECTIONS
        </h1>
        <p className="text-sm text-[#032622]">Gérez les soumissions des étudiants</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-5 py-2.5 text-sm font-bold transition-colors ${
              filter === f.value
                ? 'bg-[#032622] text-white'
                : 'bg-[#F8F5E4] text-[#032622] border-2 border-[#032622] hover:bg-[#032622]/5'
            }`}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-300 p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-[#F8F5E4] border-2 border-black p-10 text-center">
          <p className="text-sm text-[#032622]">Aucune soumission trouvée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onGrade={setSelectedSubmission}
            />
          ))}
        </div>
      )}

      {/* Grade Modal */}
      {selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={fetchSubmissions}
        />
      )}
    </div>
  );
}
