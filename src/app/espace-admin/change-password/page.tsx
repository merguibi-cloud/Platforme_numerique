"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (!result.success || !result.user) {
          router.replace("/");
          return;
        }

        // Vérifier si l'utilisateur a vraiment besoin de changer son mot de passe
        const requiresPasswordChange = result.user.user_metadata?.requires_password_change;
        if (!requiresPasswordChange) {
          // Si le changement n'est plus requis, rediriger vers le dashboard
          router.replace("/espace-admin/dashboard");
          return;
        }
      } catch (error) {
        router.replace("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du changement de mot de passe");
      }

      // Rediriger vers le dashboard après succès
      router.push("/espace-admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F5E4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Vérification...</p>
        </div>
      </div>
    );
  }

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
            Pour des raisons de sécurité, vous devez créer un nouveau mot de passe pour accéder à votre espace administrateur.
          </p>

          {error && (
            <div className="bg-[#D96B6B] text-white p-4 mb-6 border-2 border-[#032622]">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#032622] uppercase tracking-wide mb-2">
                CRÉER UN MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#F8F5E4] border-2 border-[#032622] px-4 py-2 pr-12 text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  placeholder="Minimum 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] hover:text-[#032622]/70"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  placeholder="Répétez le nouveau mot de passe"
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
              disabled={isLoading}
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

