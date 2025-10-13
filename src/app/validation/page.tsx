"use client";
import { useState, useEffect } from 'react';
import { Navbar } from '@/app/Navbar';
import { Hero } from './components/Hero';
import { Accueil } from './components/Accueil';
import { getCurrentUser } from '@/lib/auth-api';

const ValidationContent = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🔍 Vérification de l\'utilisateur...');
      const userResult = await getCurrentUser();
      console.log('👤 Résultat getCurrentUser:', userResult);
      
      if (!userResult.success || !userResult.user) {
        console.log('❌ Utilisateur non authentifié');
        return;
      }

      setUser(userResult.user);
      console.log('✅ Utilisateur authentifié:', userResult.user.email);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#032622] mb-2">Accès refusé</h1>
          <p className="text-[#032622] mb-4">Vous devez d'abord vous connecter pour accéder à votre espace.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#032622]/90 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
        <Accueil
          userEmail={user.email}
          onStartApplication={() => console.log('Démarrer l\'application')}
        />
    </div>
  );
};

export default function ValidationPage() {
  return <ValidationContent />;
}