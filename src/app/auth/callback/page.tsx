"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Traitement de la connexion...");

  useEffect(() => {
    const handleCallback = async () => {
      if (typeof window === 'undefined') return;

      // 1. Vérifier d'abord les query params (pour le code PKCE)
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');

      if (codeParam) {
        // Si c'est un code PKCE, rediriger vers l'API qui peut l'échanger
        window.location.href = `/api/auth/exchange-code?code=${codeParam}`;
        return;
      }

      // 2. Vérifier le hash de l'URL (pour les magic links et tokens)
      const hash = window.location.hash;

      if (hash) {
        const params = new URLSearchParams(hash.substring(1));

        // Vérifier s'il y a une erreur dans le hash
        const error = params.get("error");
        const errorCode = params.get("error_code");
        const errorDescription = params.get("error_description");

        if (error || errorCode) {
          console.error('Erreur auth:', error, errorCode, errorDescription);
          const redirectUrl = new URL('/', window.location.origin);
          redirectUrl.searchParams.set('error', error || '');
          redirectUrl.searchParams.set('error_code', errorCode || '');
          redirectUrl.searchParams.set('error_description', errorDescription || '');
          router.push(redirectUrl.toString());
          return;
        }

        // Récupérer access_token et refresh_token depuis le hash (magic link)
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken && refreshToken) {
          setStatus("Configuration de la session...");

          // Pour les magic links, on a directement les tokens
          // Stocker les tokens dans les cookies
          document.cookie = `sb-access-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

          // Créer un client Supabase et définir la session
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // Définir la session avec les tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Erreur lors de la configuration de la session:', sessionError);
            router.push('/?error=session_error');
            return;
          }

          if (sessionData.user) {
            setStatus("Redirection...");

            // Pour recovery (reset password), rediriger vers la page de changement de mot de passe
            if (type === "recovery") {
              router.push('/reset-password');
              return;
            }

            // Pour les autres types (signup, magiclink), déterminer la redirection selon le rôle
            // Appeler une API pour résoudre le rôle et obtenir la redirection
            try {
              const response = await fetch('/api/auth/user');
              if (response.ok) {
                const userData = await response.json();
                if (userData.role === 'admin' || userData.role === 'superadmin') {
                  router.push('/espace-admin/dashboard');
                } else if (userData.role === 'etudiant') {
                  router.push('/espace-etudiant');
                } else {
                  // lead ou candidat -> validation
                  router.push('/validation');
                }
              } else {
                // Si pas de rôle trouvé, rediriger vers validation par défaut
                router.push('/validation');
              }
            } catch {
              // En cas d'erreur, rediriger vers validation
              router.push('/validation');
            }
            return;
          }
        }

        // Récupérer le code depuis le hash (ancien format)
        const code = params.get("code");

        if (code) {
          window.location.href = `/api/auth/exchange-code?code=${code}`;
          return;
        }
      }

      // Si aucun code/token n'est trouvé, rediriger vers la page de connexion
      console.log('Aucun token trouvé, redirection vers accueil');
      router.push('/');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#032622] text-lg">{status}</p>
      </div>
    </div>
  );
}

