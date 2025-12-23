"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Lire le hash et les query params de l'URL (côté client uniquement)
    if (typeof window === 'undefined') return;

    // 1. Vérifier d'abord les query params (pour le code)
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
      // Si c'est un code, rediriger vers l'API qui peut l'échanger
      window.location.href = `/api/auth/exchange-code?code=${codeParam}`;
      return;
    }
    
    // 2. Vérifier le hash de l'URL
    const hash = window.location.hash;
    
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      
      // Vérifier s'il y a une erreur dans le hash
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDescription = params.get("error_description");
      
      if (error || errorCode) {
        // Rediriger vers la page de connexion avec l'erreur
        const redirectUrl = new URL('/', window.location.origin);
        redirectUrl.searchParams.set('error', error || '');
        redirectUrl.searchParams.set('error_code', errorCode || '');
        redirectUrl.searchParams.set('error_description', errorDescription || '');
        router.push(redirectUrl.toString());
        return;
      }
      
      // Récupérer le code depuis le hash
      const code = params.get("code");
      
      if (code) {
        // Si c'est un code dans le hash, rediriger vers l'API qui peut l'échanger
        // Le code sera échangé contre une session et l'email sera confirmé
        window.location.href = `/api/auth/exchange-code?code=${code}`;
        return;
      }
      
      // Pour les tokens de récupération de mot de passe
      const token = params.get("access_token") || params.get("token") || params.get("token_hash");
      const type = params.get("type");
      
      if (token && type === "recovery") {
        // Rediriger vers la page de réinitialisation de mot de passe
        const redirectUrl = new URL('/reset-password', window.location.origin);
        redirectUrl.searchParams.set('token', token);
        router.push(redirectUrl.toString());
        return;
      }
    }
    
    // Si aucun code/token n'est trouvé, rediriger vers la page de connexion
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#032622] text-lg">Traitement de la connexion...</p>
      </div>
    </div>
  );
}

