'use client';

import { useState } from 'react';
import type { SoumissionEtudeCas, GradeSubmission } from '@/types/grading';
import { validateGrade } from '@/lib/grade-validator';
import { GradingAPI } from '@/lib/grading-api';

interface GradeModalProps {
  submission: SoumissionEtudeCas | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function GradeModal({ submission, onClose, onSuccess }: GradeModalProps) {
  const [note, setNote] = useState<string>(
    submission?.note?.toString() || ''
  );
  const [commentaires, setCommentaires] = useState<string>(
    submission?.commentaires || ''
  );
  const [statut, setStatut] = useState<'corrige' | 'en_revision'>(
    submission?.statut === 'en_revision' ? 'en_revision' : 'corrige'
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!submission) return null;

  const noteMaximale = submission.etude_cas?.note_maximale || 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const noteNum = parseFloat(note);
    const validation = validateGrade(noteNum, noteMaximale, commentaires);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const gradeData: GradeSubmission = {
        note: noteNum,
        commentaires,
        statut,
      };
      await GradingAPI.gradeSubmission(submission.id, gradeData);
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors([error.message || 'Une erreur est survenue']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Corriger la soumission
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {submission.etude_cas?.titre}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Student info */}
            {submission.etudiant && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                Étudiant :{' '}
                <span className="font-medium">
                  {submission.etudiant.prenom} {submission.etudiant.nom}
                </span>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note <span className="text-gray-400 font-normal">/ {noteMaximale}</span>
              </label>
              <input
                type="number"
                min="0"
                max={noteMaximale}
                step="0.5"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`0 - ${noteMaximale}`}
                required
              />
            </div>

            {/* Commentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Commentaires
              </label>
              <textarea
                value={commentaires}
                onChange={(e) => setCommentaires(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Vos commentaires sur la soumission..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {commentaires.length}/2000 caractères
              </p>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as 'corrige' | 'en_revision')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="corrige">Corrigé</option>
                <option value="en_revision">En révision</option>
              </select>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
