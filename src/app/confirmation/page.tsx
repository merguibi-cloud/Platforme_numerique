"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { LoginWithFormationSelection } from '../LoginWithFormationSelection';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export default function ConfirmationPage() {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer l'email depuis les paramètres URL si disponible
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      // Ici vous pouvez ajouter une fonction pour renvoyer l'email de confirmation
      // await resendConfirmationEmail(email);
      alert('Email de confirmation renvoyé !');
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      alert('Erreur lors du renvoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Card de confirmation */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icône de confirmation */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Titre */}
            <h1 
              className="text-2xl font-bold text-[#032622] mb-4 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
            >
              UN E-MAIL DE CONFIRMATION VIENT D'ÊTRE ENVOYÉ
            </h1>

            {/* Message */}
            <p 
              className="text-[#032622] mb-6 leading-relaxed"
              style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
            >
              Appuyer sur le lien de connexion dans le mail pour accéder à votre profil
            </p>

            {/* Email affiché si disponible */}
            {email && (
              <div className="bg-[#F8F5E4] rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-5 h-5 text-[#032622]" />
                  <span 
                    className="text-[#032622] font-medium"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    {email}
                  </span>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-left mb-6">
              <h3 
                className="text-lg font-bold text-[#032622] mb-3"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Prochaines étapes :
              </h3>
              <ol className="space-y-2 text-[#032622]">
                <li className="flex items-start space-x-2">
                  <span className="bg-[#032622] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span style={{ fontFamily: 'var(--font-termina-medium)' }}>
                    Vérifiez votre boîte email (et vos spams)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-[#032622] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span style={{ fontFamily: 'var(--font-termina-medium)' }}>
                    Cliquez sur le lien de confirmation
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-[#032622] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span style={{ fontFamily: 'var(--font-termina-medium)' }}>
                    Complétez votre profil avec vos documents
                  </span>
                </li>
              </ol>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                {isLoading ? 'ENVOI EN COURS...' : 'RENVOYER L\'E-MAIL'}
              </button>

              <Link 
                href="/"
                className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] border-2 border-[#032622] py-3 px-6 font-bold transition-colors duration-200 flex items-center justify-center space-x-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>RETOUR À L'ACCUEIL</span>
              </Link>
            </div>

            {/* Message d'aide */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p 
                className="text-sm text-gray-600"
                style={{ fontFamily: 'var(--font-termina-medium)' }}
              >
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez notre support.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Login with Formation Selection Modal */}
      <LoginWithFormationSelection 
        isOpen={isLoginOpen} 
        onCloseAction={() => setIsLoginOpen(false)}
        onCompleteAction={(selectedFormations) => {
          console.log('Formations sélectionnées:', selectedFormations);
        }}
      />
    </div>
  );
}
