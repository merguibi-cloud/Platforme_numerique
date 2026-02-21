'use client';

import { useEffect, useState } from 'react';
import { TutorAPI } from '@/lib/tutor-api';
import { GradingAPI } from '@/lib/grading-api';
import type { TutorDashboardStats, Tuteur, TuteurEtudiant } from '@/types/tutor';
import type { SoumissionEtudeCas } from '@/types/grading';
import Link from 'next/link';

export default function TutorDashboard() {
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [profile, setProfile] = useState<Tuteur | null>(null);
  const [tutees, setTutees] = useState<TuteurEtudiant[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<SoumissionEtudeCas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, profileData, tuteesData, submissionsData] = await Promise.all([
          TutorAPI.getDashboardStats(),
          TutorAPI.getTutorProfile(),
          TutorAPI.getTutees(),
          GradingAPI.getSubmissions({ statut: 'en_attente', limit: 5 }),
        ]);
        setStats(statsData);
        setProfile(profileData);
        setTutees(tuteesData);
        setPendingSubmissions(submissionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-2 border-red-300 p-4 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-bold text-[#032622] mb-2"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          TABLEAU DE BORD
        </h1>
        <p className="text-sm text-[#032622]">
          Bienvenue, {profile?.prenom} {profile?.nom}
        </p>
        {stats?.derniere_activite && (
          <p className="text-xs text-[#032622]/60 mt-1">
            Dernière activité : {new Date(stats.derniere_activite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link href="/espace-tuteur/mes-etudiants" className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all group">
          <div className="text-xs text-[#032622] font-bold mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>ÉTUDIANTS ASSIGNÉS</div>
          <div className="text-5xl font-bold text-[#032622] group-hover:text-[#6B9A8E] transition-colors" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {stats?.total_etudiants ?? 0}
          </div>
        </Link>

        <Link href="/espace-tuteur/cours" className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all group">
          <div className="text-xs text-[#032622] font-bold mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>COURS ASSIGNÉS</div>
          <div className="text-5xl font-bold text-[#032622] group-hover:text-[#6B9A8E] transition-colors" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {stats?.total_cours ?? 0}
          </div>
        </Link>

        <Link href="/espace-tuteur/corrections" className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all group">
          <div className="text-xs text-[#032622] font-bold mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>CORRECTIONS EN ATTENTE</div>
          <div className="text-5xl font-bold text-[#032622] group-hover:text-[#6B9A8E] transition-colors" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {stats?.total_soumissions_en_attente ?? 0}
          </div>
          {(stats?.total_soumissions_en_attente ?? 0) > 0 && (
            <div className="mt-2 text-xs font-bold text-orange-600">À CORRIGER</div>
          )}
        </Link>

        <div className="bg-[#F8F5E4] border-2 border-black p-6">
          <div className="text-xs text-[#032622] font-bold mb-3" style={{ fontFamily: 'var(--font-termina-bold)' }}>TAUX DE RÉUSSITE</div>
          <div className="text-5xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
            {stats?.taux_reussite_moyen ?? 0}%
          </div>
        </div>
      </div>

      {/* Main content grid: Pending submissions + Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Submissions */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black flex items-center justify-between">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              CORRECTIONS EN ATTENTE
            </h3>
            <Link href="/espace-tuteur/corrections" className="text-xs text-white/70 hover:text-white transition-colors">
              VOIR TOUT →
            </Link>
          </div>
          <div className="divide-y divide-gray-300">
            {pendingSubmissions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#032622]/60">Aucune correction en attente.</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 hover:bg-[#032622]/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#032622]">
                        {submission.etudiant?.prenom} {submission.etudiant?.nom}
                      </p>
                      <p className="text-xs text-[#032622]/60 mt-1">
                        {submission.etude_cas?.titre || 'Étude de cas'}
                      </p>
                      <p className="text-xs text-[#032622]/40 mt-1">
                        Soumis le {new Date(submission.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <Link
                      href="/espace-tuteur/corrections"
                      className="text-xs font-bold text-[#032622] hover:text-[#6B9A8E] transition-colors"
                    >
                      CORRIGER →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student Overview */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black flex items-center justify-between">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              MES ÉTUDIANTS
            </h3>
            <Link href="/espace-tuteur/mes-etudiants" className="text-xs text-white/70 hover:text-white transition-colors">
              VOIR TOUT →
            </Link>
          </div>
          <div className="divide-y divide-gray-300">
            {tutees.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#032622]/60">Aucun étudiant assigné.</p>
              </div>
            ) : (
              tutees.slice(0, 5).map((tutee) => (
                <Link
                  key={tutee.id}
                  href={`/espace-tuteur/etudiants/${tutee.etudiant_id}`}
                  className="flex items-center justify-between p-4 hover:bg-[#032622]/5 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#032622] flex items-center justify-center text-white text-sm font-bold">
                      {tutee.etudiant?.prenom?.charAt(0)}{tutee.etudiant?.nom?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#032622] group-hover:text-[#6B9A8E]">
                        {tutee.etudiant?.prenom} {tutee.etudiant?.nom}
                      </p>
                      <p className="text-xs text-[#032622]/60">{tutee.etudiant?.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 ${
                      tutee.statut === 'actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {tutee.statut === 'actif' ? 'ACTIF' : tutee.statut === 'inactif' ? 'INACTIF' : 'TERMINÉ'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profile + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              MON PROFIL
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#032622] flex items-center justify-center text-white text-xl font-bold border-2 border-[#032622]">
                {profile?.prenom?.charAt(0)}{profile?.nom?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>{profile?.prenom} {profile?.nom}</div>
                <div className="text-sm text-[#032622]/60">{profile?.email}</div>
              </div>
            </div>

            {profile?.specialites && profile.specialites.length > 0 && (
              <div>
                <div className="text-xs text-[#032622] font-bold mb-2">SPÉCIALITÉS</div>
                <div className="flex flex-wrap gap-2">
                  {profile.specialites.map((spec, i) => (
                    <span key={i} className="bg-[#032622] text-white text-xs px-3 py-1 font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile?.bio && (
              <div>
                <div className="text-xs text-[#032622] font-bold mb-1">BIO</div>
                <p className="text-sm text-[#032622]">{profile.bio}</p>
              </div>
            )}

            <div className="text-xs text-[#032622]/60 pt-2 border-t border-gray-300">
              Membre depuis le {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black">
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              ACCÈS RAPIDE
            </h3>
          </div>
          <div className="divide-y divide-gray-300">
            <Link
              href="/espace-tuteur/cours"
              className="flex items-center justify-between p-5 hover:bg-[#032622]/5 transition-colors group"
            >
              <div>
                <div className="text-sm font-bold text-[#032622] group-hover:text-[#6B9A8E]" style={{ fontFamily: 'var(--font-termina-bold)' }}>MES COURS</div>
                <div className="text-xs text-[#032622]/60">{stats?.total_cours ?? 0} cours assignés</div>
              </div>
              <span className="text-[#032622] font-bold">→</span>
            </Link>

            <Link
              href="/espace-tuteur/mes-etudiants"
              className="flex items-center justify-between p-5 hover:bg-[#032622]/5 transition-colors group"
            >
              <div>
                <div className="text-sm font-bold text-[#032622] group-hover:text-[#6B9A8E]" style={{ fontFamily: 'var(--font-termina-bold)' }}>MES ÉTUDIANTS</div>
                <div className="text-xs text-[#032622]/60">{stats?.total_etudiants ?? 0} étudiants assignés</div>
              </div>
              <span className="text-[#032622] font-bold">→</span>
            </Link>

            <Link
              href="/espace-tuteur/corrections"
              className="flex items-center justify-between p-5 hover:bg-[#032622]/5 transition-colors group"
            >
              <div>
                <div className="text-sm font-bold text-[#032622] group-hover:text-[#6B9A8E]" style={{ fontFamily: 'var(--font-termina-bold)' }}>CORRECTIONS</div>
                <div className="text-xs text-[#032622]/60">
                  {(stats?.total_soumissions_en_attente ?? 0) > 0
                    ? `${stats?.total_soumissions_en_attente} en attente`
                    : 'Aucune correction en attente'}
                </div>
              </div>
              <span className="text-[#032622] font-bold">→</span>
            </Link>

            <Link
              href="/espace-tuteur/parametres"
              className="flex items-center justify-between p-5 hover:bg-[#032622]/5 transition-colors group"
            >
              <div>
                <div className="text-sm font-bold text-[#032622] group-hover:text-[#6B9A8E]" style={{ fontFamily: 'var(--font-termina-bold)' }}>PARAMÈTRES</div>
                <div className="text-xs text-[#032622]/60">Gérer votre profil tuteur</div>
              </div>
              <span className="text-[#032622] font-bold">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
