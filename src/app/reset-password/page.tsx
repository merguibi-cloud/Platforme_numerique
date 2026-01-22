"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.');
        console.error('Update password error:', updateError);
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
                    <Lock className="w-8 h-8 text-[#032622]" />
                  </div>
                </div>

                {/* Titre */}
                <h1
                  className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                >
                  NOUVEAU MOT DE PASSE
                </h1>

                {/* Description */}
                <p
                  className="text-[#032622] mb-6 text-center leading-relaxed"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Entrez votre nouveau mot de passe ci-dessous.
                </p>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#032622] mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)' }}
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent pr-12"
                        placeholder="••••••••"
                        style={{ fontFamily: 'var(--font-termina-medium)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#032622]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-[#032622] mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)' }}
                    >
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent pr-12"
                        placeholder="••••••••"
                        style={{ fontFamily: 'var(--font-termina-medium)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#032622]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm" style={{ fontFamily: 'var(--font-termina-medium)' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !password || !confirmPassword}
                    className="w-full bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {isLoading ? 'MISE À JOUR...' : 'METTRE À JOUR LE MOT DE PASSE'}
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
                  MOT DE PASSE MIS À JOUR
                </h1>

                <p
                  className="text-[#032622] mb-6 text-center leading-relaxed"
                  style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                >
                  Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>

                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-[#032622] hover:bg-[#032622]/90 text-white py-3 px-6 font-bold transition-colors duration-200 rounded-lg flex items-center justify-center"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  SE CONNECTER
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
