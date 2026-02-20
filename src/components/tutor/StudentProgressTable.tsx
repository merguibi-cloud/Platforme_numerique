import type { StudentProgress } from '@/types/tutor';
import {
  getProgressStatusColor,
  getProgressStatusText,
  formatDate,
  getRelativeTime,
} from '@/lib/tutor-utils';

interface StudentProgressTableProps {
  students: StudentProgress[];
  showCourse?: boolean;
}

export function StudentProgressTable({
  students,
  showCourse = false,
}: StudentProgressTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-sm">Aucun étudiant trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Étudiant
            </th>
            {showCourse && (
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours
              </th>
            )}
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progression
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière activité
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student, idx) => (
            <tr key={`${student.etudiant_id}-${student.cours_id}-${idx}`} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {student.prenom} {student.nom}
                  </p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
              </td>
              {showCourse && (
                <td className="py-3 px-4 text-gray-700">{student.cours_titre}</td>
              )}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${student.progression}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {student.progression}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {student.chapitres_termines}/{student.total_chapitres} chapitres
                </p>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgressStatusColor(student.statut)}`}
                >
                  {getProgressStatusText(student.statut)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs">
                {student.date_derniere_activite
                  ? getRelativeTime(student.date_derniere_activite)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
