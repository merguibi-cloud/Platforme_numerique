'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TutorAPI } from '@/lib/tutor-api';
import type { TuteurEtudiant } from '@/types/tutor';

export default function MesEtudiants() {
  const [tutees, setTutees] = useState<TuteurEtudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    TutorAPI.getTutees()
      .then(setTutees)
      .catch((err) => setError(err.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const filteredTutees = tutees.filter((tutee) => {
    const fullName = `${tutee.etudiant?.prenom || ''} ${tutee.etudiant?.nom || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <div className="mb-8">
        <h1
          className="text-4xl font-bold text-[#032622] mb-2"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MES ÉTUDIANTS
        </h1>
        <p className="text-sm text-[#032622]">
          {tutees.length} étudiant{tutees.length !== 1 ? 's' : ''} sous tutelle
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-[#032622] bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]" />
        </div>
      ) : error ? (
        <div className="bg-[#D96B6B] border-2 border-[#032622] p-4 text-white text-sm font-semibold">
          {error}
        </div>
      ) : filteredTutees.length === 0 ? (
        <div className="bg-[#F8F5E4] border-2 border-black p-10 text-center">
          <p className="text-sm text-[#032622]">
            {searchTerm ? 'Aucun étudiant trouvé pour cette recherche.' : 'Aucun étudiant ne vous est assigné pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutees.map((tutee) => (
            <Link
              key={tutee.id}
              href={`/espace-tuteur/etudiants/${tutee.etudiant_id}`}
              className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-14 h-14 bg-[#032622] flex items-center justify-center text-white text-lg font-bold border-2 border-[#032622]">
                  {tutee.etudiant?.prenom?.charAt(0)}{tutee.etudiant?.nom?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-bold text-[#032622] mb-1 group-hover:text-[#6B9A8E]"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {tutee.etudiant?.prenom} {tutee.etudiant?.nom}
                  </h3>
                  <p className="text-xs text-[#032622]/60">{tutee.etudiant?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 border ${
                    tutee.statut === 'actif'
                      ? 'bg-[#4CAF50] text-white border-[#032622]'
                      : tutee.statut === 'inactif'
                      ? 'bg-[#032622]/20 text-[#032622] border-[#032622]'
                      : 'bg-[#D96B6B] text-white border-[#032622]'
                  }`}
                >
                  {tutee.statut === 'actif' ? 'ACTIF' : tutee.statut === 'inactif' ? 'INACTIF' : 'TERMINÉ'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#032622] pt-3 border-t border-[#032622]/30">
                <span>
                  Depuis le {new Date(tutee.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="font-bold text-[#032622] group-hover:text-[#6B9A8E]">VOIR →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
