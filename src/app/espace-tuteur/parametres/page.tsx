"use client";
import { useState } from 'react';

export default function ParametresTuteur() {
  const [formData, setFormData] = useState({
    nom: 'Fritz',
    prenom: 'Ymir',
    email: 'ymir.fritz@example.com',
    telephone: '06 12 34 56 78'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de sauvegarde
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1 
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        PARAMÈTRES
      </h1>

      <div className="max-w-2xl">
        <div className="bg-[#F8F5E4] border-2 border-black p-8">
          <h2 
            className="text-2xl font-bold text-[#032622] mb-6"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            INFORMATIONS PERSONNELLES
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#032622] mb-2">
                NOM
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] mb-2">
                PRÉNOM
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#032622] mb-2">
                TÉLÉPHONE
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors"
            >
              ENREGISTRER LES MODIFICATIONS
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

