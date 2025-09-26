"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Login = ({ isOpen, onClose }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-2 sm:mx-4 bg-white shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] sm:min-h-[600px]">
          
          {/* Section gauche - Image avec logo */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900">
            {/* Image de fond */}
            <div className="absolute inset-0">
              <Image
                src="/img/login/background.jpg"
                alt="Connexion"
                fill
                className="object-cover opacity-60"
              />
            </div>
            
            {/* Contenu overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8 text-center">
              {/* Logo */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <Image src="/img/accueil/logo_elite_society_online_blanc.png" alt="ELITE SOCIETY" width={300} height={300} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain" />
              </div>
              
              {/* Texte */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wide">
                Première connexion ?
              </h2>
              
              {/* Bouton */}
              <Link
                href="/inscription"
                className="bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 text-[#032622] px-6 py-3 sm:px-8 sm:py-4 font-bold text-base sm:text-lg transition-colors duration-200"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
              >
                COMMENCER
              </Link>
            </div>
          </div>

          {/* Section droite - Formulaire */}
          <div className="bg-[#F8F5E4] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Titre */}
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] mb-2 uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
              >
                Accédez à votre espace
              </h1>
              
              <p 
                className="text-[#032622] mb-6 sm:mb-8 text-sm sm:text-base"
                style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
              >
                Connectez-vous si vous avez déjà un compte
              </p>

              {/* Formulaire */}
              <form className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div>
                  <label 
                    className="block text-[#032622] text-xs sm:text-sm font-medium mb-2"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    E-MAIL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#032622]/10 text-[#032622] border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent text-sm sm:text-base"
                    placeholder="Email"
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <label 
                    className="block text-[#032622] text-xs sm:text-sm font-medium mb-2"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    MOT DE PASSE
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#032622]/10 text-[#032622] border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent text-sm sm:text-base"
                    placeholder="Mot de passe"
                  />
                </div>

                {/* Se souvenir de moi */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-[#032622]/10 border-[#032622] focus:ring-[#032622]"
                  />
                  <label 
                    htmlFor="remember" 
                    className="ml-2 text-[#032622] text-xs sm:text-sm"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    Se souvenir de moi
                  </label>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  className="w-full bg-[#032622] hover:bg-[#032622]/90 text-[#F8F5E4] py-3 sm:py-4 font-bold text-base sm:text-lg transition-colors duration-200"
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                >
                  ME CONNECTER
                </button>

                 {/* Connexions sociales */}
                 <div className="space-y-2 sm:space-y-3">
                   <button
                     type="button"
                     className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-2 sm:py-3 px-3 sm:px-4 font-medium transition-colors duration-200 border border-gray-300 flex items-center justify-center"
                     style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                   >
                     <div className="flex items-center space-x-2 sm:space-x-3">
                       <Image src="/img/login/icon_google.png" alt="Google" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                       <span className="text-xs sm:text-sm">CONNEXION AVEC GOOGLE</span>
                     </div>
                   </button>

                   <button
                     type="button"
                     className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-2 sm:py-3 px-3 sm:px-4 font-medium transition-colors duration-200 border border-gray-300 flex items-center justify-center"
                     style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                   >
                     <div className="flex items-center space-x-2 sm:space-x-3">
                       <Image src="/img/login/icon_facebook.png" alt="Facebook" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                       <span className="text-xs sm:text-sm">CONNEXION AVEC FACEBOOK</span>
                     </div>
                   </button>
                 </div>

                {/* Liens du bas */}
                <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                  <Link 
                    href="/mot-de-passe-oublie"
                    className="text-[#032622] hover:underline text-center sm:text-left"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    Mot de passe oublié
                  </Link>
                  <Link 
                    href="/formateur"
                    className="text-[#032622] hover:underline text-center sm:text-right"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    Je suis formateur
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
