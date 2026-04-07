'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { TutorAPI } from '@/lib/tutor-api';
import type { StudentProgress } from '@/types/tutor';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const router = useRouter();
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
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#032622]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] p-6">
        <div className="bg-[#D96B6B] border-2 border-[#032622] p-4 text-white text-sm font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/espace-tuteur/mes-etudiants')}
          className="text-sm font-semibold text-[#032622] hover:underline mb-4 inline-block uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          ← RETOUR AUX ÉTUDIANTS
        </button>
        <h1
          className="text-4xl font-bold text-[#032622] mb-1"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          {student ? `${student.prenom} ${student.nom}`.toUpperCase() : 'ÉTUDIANT'}
        </h1>
        {student && (
          <p className="text-sm text-[#032622]/60">{student.email}</p>
        )}
      </div>

      {/* Progress section */}
      <div className="border-2 border-[#032622]">
        <div className="bg-[#032622] px-4 py-3">
          <h2
            className="text-white text-sm font-bold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            PROGRESSION PAR COURS
          </h2>
        </div>

        {progress.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-[#032622]">Aucune progression enregistrée.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#032622] bg-[#F8F5E4]">
                <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}>COURS</th>
                <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}>PROGRESSION</th>
                <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}>STATUT</th>
                <th className="text-left p-3 text-xs font-bold uppercase tracking-wider text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}>DERNIÈRE ACTIVITÉ</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((item, idx) => (
                <tr
                  key={`${item.cours_id}-${idx}`}
                  className="border-b border-[#032622]/20 last:border-b-0"
                >
                  <td className="p-3 text-sm font-semibold text-[#032622]">{item.cours_titre}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#032622]/10 h-2 min-w-[100px]">
                        <div
                          className="bg-[#032622] h-2 transition-all"
                          style={{ width: `${item.progression}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#032622] whitespace-nowrap">
                        {item.progression}%
                      </span>
                    </div>
                    <p className="text-xs text-[#032622]/50 mt-1">
                      {item.chapitres_termines}/{item.total_chapitres} chapitres
                    </p>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 border-2 border-[#032622] ${
                        item.statut === 'termine'
                          ? 'bg-[#4CAF50] text-white'
                          : item.statut === 'en_cours'
                          ? 'bg-[#032622] text-white'
                          : 'bg-[#F8F5E4] text-[#032622]'
                      }`}
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {item.statut === 'termine'
                        ? 'TERMINÉ'
                        : item.statut === 'en_cours'
                        ? 'EN COURS'
                        : 'NON COMMENCÉ'}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[#032622]/60">
                    {item.date_derniere_activite
                      ? new Date(item.date_derniere_activite).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
