'use client';

import { useEffect, useState } from 'react';
import { TutorAPI } from '@/lib/tutor-api';
import type { Tuteur } from '@/types/tutor';

export default function ParametresTuteur() {
  const [profile, setProfile] = useState<Tuteur | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    specialites: '',
  });

  useEffect(() => {
    TutorAPI.getTutorProfile()
      .then((data) => {
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          specialites: (data.specialites || []).join(', '),
        });
      })
      .catch((err) => setError(err.message || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const specialitesArray = formData.specialites
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await TutorAPI.updateTutorProfile({
        bio: formData.bio,
        specialites: specialitesArray,
      });

      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        PARAMÈTRES
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* Account Info (read-only) */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black">
            <h3
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              INFORMATIONS DU COMPTE
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#032622] mb-1">NOM</label>
              <div className="px-4 py-3 border-2 border-gray-300 bg-gray-100 text-[#032622]">
                {profile?.nom || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#032622] mb-1">PRÉNOM</label>
              <div className="px-4 py-3 border-2 border-gray-300 bg-gray-100 text-[#032622]">
                {profile?.prenom || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#032622] mb-1">EMAIL</label>
              <div className="px-4 py-3 border-2 border-gray-300 bg-gray-100 text-[#032622]">
                {profile?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Editable Profile */}
        <div className="bg-[#F8F5E4] border-2 border-black overflow-hidden">
          <div className="p-4 bg-[#032622] border-b border-black">
            <h3
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              PROFIL TUTEUR
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-2 border-green-300 p-3 text-green-700 text-sm">
                Profil mis à jour avec succès.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#032622] mb-2">BIO</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none resize-none"
                placeholder="Décrivez votre parcours et votre expertise..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#032622] mb-2">
                SPÉCIALITÉS
              </label>
              <input
                type="text"
                value={formData.specialites}
                onChange={(e) => setFormData({ ...formData, specialites: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
                placeholder="Ex: Marketing, Finance, Gestion de projet"
              />
              <p className="text-xs text-[#032622]/60 mt-1">
                Séparez les spécialités par des virgules
              </p>
            </div>

            {profile?.specialites && profile.specialites.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#032622] mb-2">
                  SPÉCIALITÉS ACTUELLES
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.specialites.map((spec, i) => (
                    <span
                      key={i}
                      className="bg-[#032622] text-white text-xs px-3 py-1 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {saving ? 'ENREGISTREMENT...' : 'ENREGISTRER LES MODIFICATIONS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
