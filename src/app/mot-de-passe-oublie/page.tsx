"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      });

      if (resetError) {
        setError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
        console.error('Reset password error:', resetError);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite.');
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {!isSuccess ? (
              <>
                {/* Icône */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#032622]/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#032622]" />
                  </div>
                </div>

                {/* Titre */}
                <h1
                  className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                >
                  MOT DE PASSE OUBLIÉ
                </h1>

                {/* Description */}
                <p
                  className="text-[#032622] mb-6 text-center leading-relaxed"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[#032622] mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)' }}
                    >
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                      placeholder="votre@email.com"
                      style={{ fontFamily: 'var(--font-termina-medium)' }}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {isLoading ? 'ENVOI EN COURS...' : 'ENVOYER LE LIEN'}
                  </button>
                </form>

                {/* Lien retour */}
                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-[#032622] hover:underline"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à l'accueil
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* État de succès */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>

                <h1
                  className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                >
                  EMAIL ENVOYÉ
                </h1>

                <p
                  className="text-[#032622] mb-6 text-center leading-relaxed"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
                </p>

                <div className="bg-[#F8F5E4] rounded-lg p-4 mb-6">
                  <p
                    className="text-sm text-[#032622] text-center"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    N'oubliez pas de vérifier vos spams si vous ne voyez pas l'email dans votre boîte de réception.
                  </p>
                </div>

                <Link
                  href="/"
                  className="w-full bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors duration-200 rounded-lg flex items-center justify-center"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  RETOUR À L'ACCUEIL
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
