"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isRequestingNewLink, setIsRequestingNewLink] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    // Récupérer le token depuis l'URL
    // Supabase envoie le token dans les paramètres de l'URL ou dans le hash
    // Format possible : ?token=...&type=invite OU #access_token=...&type=invite OU #token_hash=...&type=invite
    
    if (typeof window === 'undefined') return;
    
    // 1. Vérifier d'abord les paramètres de l'URL (query params)
    const tokenParam = searchParams.get("token") || searchParams.get("token_hash");
    const typeParam = searchParams.get("type");
    
    if (tokenParam && (typeParam === "invite" || typeParam === "recovery")) {
      console.log('Token trouvé dans les paramètres URL:', { token: tokenParam.substring(0, 20) + '...', type: typeParam });
      setToken(tokenParam);
      return;
    }
    
    // 2. Vérifier le hash de l'URL (fragment)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      
      // Vérifier s'il y a une erreur dans le hash
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDescription = params.get("error_description");
      
      if (error || errorCode) {
        console.error('Erreur dans l\'URL:', { error, errorCode, errorDescription });
        if (errorCode === 'otp_expired') {
          setTokenExpired(true);
          setError("Le lien d'invitation a expiré. Veuillez demander un nouveau lien.");
        } else {
          setError(errorDescription || "Lien d'invitation invalide ou expiré");
        }
        return;
      }
      
      // Récupérer le token depuis le hash
      const hashToken = params.get("access_token") || params.get("token") || params.get("token_hash");
      const hashType = params.get("type");
      
      if (hashToken && (hashType === "invite" || hashType === "recovery")) {
        console.log('Token trouvé dans le hash:', { token: hashToken.substring(0, 20) + '...', type: hashType });
        setToken(hashToken);
        return;
      }
    }
    
    // 3. Si aucun token n'est trouvé, afficher une erreur
    console.warn('Aucun token trouvé dans l\'URL');
    setError("Lien d'invitation invalide ou expiré. Veuillez utiliser le lien reçu par email.");
  }, [searchParams]);

  const handleRequestNewLink = async () => {
    // Utiliser l'email de l'input si disponible, sinon celui de l'URL
    const emailToUse = emailInput || email;
    
    if (!emailToUse) {
      setShowEmailInput(true);
      setError("Veuillez saisir votre adresse email pour recevoir un nouveau lien.");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setIsRequestingNewLink(true);
    setError("");

    try {
      // Utiliser une API publique pour générer un nouveau lien
      const response = await fetch("/api/auth/generate-new-invitation-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToUse.toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de la génération du nouveau lien");
      }

      setError("");
      setTokenExpired(false);
      setShowEmailInput(false);
      setEmailInput("");
      
      // Afficher le nouveau lien ou confirmer l'envoi
      if (result.link) {
        alert(`Un nouveau lien d'invitation a été généré et envoyé à ${emailToUse}. Veuillez vérifier votre boîte de réception.`);
        // Optionnel: rediriger vers le nouveau lien
        if (result.link) {
          window.location.href = result.link;
        }
      } else {
        alert(`Un nouveau lien d'invitation a été envoyé à ${emailToUse}. Veuillez vérifier votre boîte de réception.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du nouveau lien");
    } finally {
      setIsRequestingNewLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setError("Token d'invitation manquant");
      return;
    }

    setIsLoading(true);

    try {
      // Accepter l'invitation et définir le mot de passe
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Si le token est expiré, afficher un message spécial
        if (result.expired) {
          setTokenExpired(true);
          setError(result.error || "Token expiré");
          // Essayer d'extraire l'email de l'URL si disponible
          const emailParam = searchParams.get("email");
          if (emailParam) {
            setEmail(emailParam);
          }
        } else {
          throw new Error(result.error || "Erreur lors de l'acceptation de l'invitation");
        }
        return;
      }

      // Rediriger vers le dashboard admin
      router.push("/espace-admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'acceptation de l'invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#F8F5E4] border-4 border-[#032622] p-8">
          <h1
            className="text-3xl font-bold text-[#032622] mb-6 text-center"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            CRÉER VOTRE MOT DE PASSE
          </h1>

          <p className="text-[#032622]/70 mb-6 text-center">
            Vous avez été invité à rejoindre l'équipe d'administration. Veuillez créer votre mot de passe pour continuer.
          </p>

          {error && (
            <div className={`${tokenExpired ? 'bg-[#F59E0B]' : 'bg-[#D96B6B]'} text-white p-4 mb-6 border-2 border-[#032622]`}>
              <p className="font-semibold mb-2">{error}</p>
              {tokenExpired && (
                <div className="mt-3">
                  <p className="mb-3 text-sm">Votre lien d'invitation a expiré. Vous pouvez générer un nouveau lien.</p>
                  
                  {showEmailInput && (
                    <div className="mb-3">
                      <label className="block text-sm font-semibold mb-2">VOTRE ADRESSE EMAIL</label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="votre.email@example.com"
                        className="w-full bg-white text-[#032622] border-2 border-[#032622] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRequestNewLink}
                      disabled={isRequestingNewLink}
                      className="bg-white text-[#032622] px-4 py-2 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRequestingNewLink ? "GÉNÉRATION EN COURS..." : "GÉNÉRER UN NOUVEAU LIEN"}
                    </button>
                    {!email && !showEmailInput && (
                      <button
                        type="button"
                        onClick={() => setShowEmailInput(true)}
                        className="bg-white/80 text-[#032622] px-4 py-2 font-semibold hover:bg-white transition-colors"
                      >
                        SAISIR MON EMAIL
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 pr-12 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  placeholder="Minimum 8 caractères"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] hover:text-[#032622]/70"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                CONFIRMER LE MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 pr-12 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  placeholder="Répétez le mot de passe"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] hover:text-[#032622]/70"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-[#032622] text-[#F8F5E4] px-6 py-3 font-semibold hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "CRÉATION EN COURS..." : "CRÉER MON MOT DE PASSE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement...</p>
        </div>
      </div>
    }>
      <AcceptInvitationForm />
    </Suspense>
  );
}

