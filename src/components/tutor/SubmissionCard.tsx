import type { SoumissionEtudeCas } from '@/types/grading';
import {
  getSubmissionStatusColor,
  getSubmissionStatusText,
  formatDateTime,
} from '@/lib/tutor-utils';

interface SubmissionCardProps {
  submission: SoumissionEtudeCas;
  onGrade: (submission: SoumissionEtudeCas) => void;
}

export function SubmissionCard({ submission, onGrade }: SubmissionCardProps) {
  const studentName = submission.etudiant
    ? `${submission.etudiant.prenom} ${submission.etudiant.nom}`
    : 'Étudiant inconnu';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.statut)}`}
            >
              {getSubmissionStatusText(submission.statut)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {submission.etude_cas?.titre || 'Étude de cas'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{studentName}</p>
          <p className="text-xs text-gray-400 mt-1">
            Soumis le {formatDateTime(submission.created_at)}
          </p>
          {submission.note !== null && submission.note !== undefined && (
            <p className="text-sm font-medium text-gray-700 mt-2">
              Note : {submission.note} / {submission.etude_cas?.note_maximale}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => onGrade(submission)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {submission.statut === 'en_attente' ? 'Corriger' : 'Modifier'}
          </button>
        </div>
      </div>
    </div>
  );
}
