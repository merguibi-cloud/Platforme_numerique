"use client";
import Image from 'next/image';
import Link from 'next/link';
import { User, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserFormationData, UserFormationData } from '@/lib/user-formations';

interface AccueilProps {
  userEmail: string;
  onStartApplication: () => void;
}

export const Accueil = ({ 
  userEmail,
  onStartApplication 
}: AccueilProps) => {
  const [formationData, setFormationData] = useState<UserFormationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFormationData();
  }, []);

  const loadFormationData = async () => {
    try {
      setIsLoading(true);
      const result = await getUserFormationData();
      
      if (result.success && result.data) {
        setFormationData(result.data);
      } else {
        console.error('Erreur lors du chargement des données de formation:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de formation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        
        {/* Première ligne - Photo de profil + Informations (pleine largeur) */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Photo de profil - responsive */}
            <div className="w-full sm:w-[192px] h-[120px] sm:h-[200px] border border-[#032622] flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
            </div>
            
            {/* Informations - prend tout l'espace restant */}
            <div className="flex-1 h-[120px] sm:h-[200px] shadow-lg p-4 sm:p-6 border border-[#032622]">
              <div className="h-full flex flex-col justify-between">
                <h2 
                  className="text-lg sm:text-xl font-bold text-[#032622] mb-2 sm:mb-4"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {userEmail}
                </h2>
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 
                      className="text-xs sm:text-sm font-bold text-[#032622] uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      INFORMATIONS
                    </h3>
                    <span className="text-xs sm:text-sm text-[#032622]">ÉTAPE 1 SUR 4</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 sm:h-2">
                    <div className="bg-[#032622] h-1 sm:h-2" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième ligne - Progression + Formation (parts égales) */}
        <div className="w-full mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* Progression de la candidature - responsive */}
            <div className="w-full lg:flex-1 h-[140px] sm:h-[158px] shadow-lg p-4 sm:p-6 border border-[#032622]">
              <div className="h-full flex flex-col justify-between">
                <h3 
                  className="text-base sm:text-lg font-bold text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  PROGRESSION DE LA CANDIDATURE
                </h3>
                
                <button 
                  onClick={onStartApplication}
                  className="bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-4 sm:px-6 font-bold hover:bg-[#032622]/90 transition-colors text-base sm:text-lg"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  COMMENCER
                </button>
              </div>
            </div>

            {/* Formation sélectionnée - responsive */}
            <div className="w-full lg:flex-1 h-[140px] sm:h-[158px] shadow-lg p-4 sm:p-6 border border-[#032622]">
              <div className="h-full flex flex-col justify-between">
                <h3 
                  className="text-base sm:text-lg font-bold text-[#032622]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  FORMATION SÉLECTIONNÉE
                </h3>
                
                 <div className="border border-[#032622] p-3 sm:p-4">
                   <div className="flex items-center justify-between">
                     <div className="flex-1">
                       <h4 
                         className="font-bold text-[#032622] text-xs sm:text-sm"
                         style={{ fontFamily: 'var(--font-termina-bold)' }}
                       >
                         {isLoading ? 'Chargement...' : formationData?.formation_titre || 'Formation non spécifiée'}
                       </h4>
                     </div>
                     <div className="text-right ml-2 sm:ml-4">
                       <p className="font-bold text-[#032622] text-sm sm:text-lg">
                         {isLoading ? '...' : formationData?.formation_prix ? `${formationData.formation_prix}€` : 'Prix non disponible'}
                       </p>
                     </div>
                   </div>
                 </div>
                
                <Link 
                  href="/formations"
                  className="text-[#032622] mt-2 sm:mt-4 hover:underline text-xs sm:text-sm text-left"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                >
                  CHANGER DE FORMATION
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Troisième ligne - Besoin d'aide (aligné avec la formation) */}
        <div className="w-full mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start gap-4">
            {/* Espace vide pour aligner avec la progression - masqué sur mobile */}
            <div className="hidden lg:block flex-1"></div>
            
            {/* Besoin d'aide - responsive */}
            <div className="w-full lg:flex-1 h-[200px] sm:h-[250px] shadow-lg p-4 sm:p-6 border border-[#032622] lg:ml-4">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 
                    className="text-base sm:text-lg font-bold text-[#032622] mb-3 sm:mb-4"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    BESOIN D'AIDE ?
                  </h3>
                  
                  <p 
                    className="text-xs sm:text-sm text-[#032622] mb-3 sm:mb-4"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    Besoin d'aide pour finaliser votre candidature? Contactez le référent de la formation.
                  </p>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <button className="w-full bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-3 sm:px-4 font-bold hover:bg-[#032622]/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>PAR MAIL</span>
                  </button>
                  
                  <button className="w-full bg-[#032622] text-[#F8F5E4] py-2 sm:py-3 px-3 sm:px-4 font-bold hover:bg-[#032622]/90 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>PAR TÉLÉPHONE</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
