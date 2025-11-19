"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-api";
import { useAdminUser } from "./AdminUserProvider";

export const AdminProfileDropdown = () => {
  const router = useRouter();
  const adminUser = useAdminUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.success) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayLabel = adminUser.isLoading ? "Chargement..." : adminUser.displayName;
  const roleLabel = adminUser.isLoading ? " " : adminUser.roleLabel;
  const initials = adminUser.isLoading ? "…" : adminUser.initials;

  return (
    <div className="relative group">
      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-lg">
          {initials}
        </div>
        <div>
          <p
            className="text-[#032622] font-semibold text-sm"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            {displayLabel}
          </p>
          <p className="text-xs text-[#032622]/70">{roleLabel}</p>
        </div>
      </div>

      <div className="absolute right-0 mt-3 w-52 border border-[#032622] bg-[#F8F5E4] shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
        <nav className="flex flex-col divide-y divide-[#032622]/20 text-sm text-[#032622]">
          <Link href="/espace-admin/compte" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
            Mon compte
          </Link>
          <Link href="/espace-admin/parametres" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
            Paramètres
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-3 text-left hover:bg-[#eae5cf] transition-colors disabled:opacity-60"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminProfileDropdown;

