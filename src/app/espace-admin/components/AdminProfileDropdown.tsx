"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAdminUser } from "./AdminUserProvider";

export const AdminProfileDropdown = () => {
  const adminUser = useAdminUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayLabel = adminUser.isLoading ? "Chargement..." : adminUser.displayName;
  const roleLabel = adminUser.isLoading ? " " : adminUser.roleLabel;
  const initials = adminUser.isLoading ? "…" : adminUser.initials;
  const photoProfil = adminUser.photoProfil;

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {photoProfil ? (
          <img
            src={photoProfil}
            alt={displayLabel}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#032622]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-lg">
            {initials}
          </div>
        )}
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

      {isOpen && (
        <div className="absolute right-0 mt-3 w-52 border border-[#032622] bg-[#F8F5E4] shadow-lg z-[100]">
          <nav className="flex flex-col divide-y divide-[#032622]/20 text-sm text-[#032622]">
            <Link 
              href="/espace-admin/compte" 
              className="px-4 py-3 hover:bg-[#eae5cf] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Mon compte
            </Link>
            <Link 
              href="/espace-admin/parametres" 
              className="px-4 py-3 hover:bg-[#eae5cf] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Paramètres
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminProfileDropdown;

