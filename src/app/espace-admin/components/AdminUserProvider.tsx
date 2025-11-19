"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AdminUserState {
  displayName: string;
  roleLabel: string;
  initials: string;
  isLoading: boolean;
}

interface AdminUserContextValue extends AdminUserState {
  refresh: () => Promise<void>;
}

const DEFAULT_STATE: AdminUserState = {
  displayName: "Utilisateur",
  roleLabel: "Administrateur",
  initials: "U",
  isLoading: true,
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  superadmin: "Super administrateur",
  pedagogie: "Équipe pédagogique",
  commercial: "Équipe commerciale",
  adv: "Administration des ventes",
  formateur: "Formateur",
  etudiant: "Étudiant",
};

const AdminUserContext = createContext<AdminUserContextValue>({
  ...DEFAULT_STATE,
  refresh: async () => {
    /* noop */
  },
});

function computeInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "U";
}

function resolveRoleLabel(role?: string): string {
  if (!role) {
    return ROLE_LABELS.admin;
  }

  const normalized = role.toLowerCase();
  if (ROLE_LABELS[normalized]) {
    return ROLE_LABELS[normalized];
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

async function fetchAdminUserData(): Promise<AdminUserState> {
  try {
    const [sessionResponse, profileResponse] = await Promise.all([
      fetch("/api/auth/session", { credentials: "include" }),
      fetch("/api/user/ensure-profile", { credentials: "include" }),
    ]);

    let roleLabel = DEFAULT_STATE.roleLabel;
    let displayName = "";

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      roleLabel = resolveRoleLabel(sessionData?.role);

      if (sessionData?.user) {
        const metadata = sessionData.user.user_metadata ?? {};
        const metaName = [metadata.prenom, metadata.nom]
          .filter(Boolean)
          .join(" ")
          .trim();
        const fallbackName =
          metadata.full_name ||
          metadata.name ||
          sessionData.user.email?.split("@")[0] ||
          "";
        displayName = metaName || fallbackName;
      }
    }

    if (profileResponse.ok) {
      const profilePayload = await profileResponse.json();
      if (profilePayload?.profile) {
        const profileName = [profilePayload.profile.prenom, profilePayload.profile.nom]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (profileName) {
          displayName = profileName;
        }
      }
    }

    displayName = displayName.trim() || DEFAULT_STATE.displayName;
    const initials = computeInitials(displayName);

    return {
      displayName,
      roleLabel,
      initials,
      isLoading: false,
    };
  } catch (error) {
    return {
      ...DEFAULT_STATE,
      isLoading: false,
    };
  }
}

export const AdminUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AdminUserState>(DEFAULT_STATE);

  const refresh = useMemo(
    () => async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      const data = await fetchAdminUserData();
      setState(data);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchAdminUserData();
      if (isMounted) {
        setState(data);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh]
  );

  return <AdminUserContext.Provider value={value}>{children}</AdminUserContext.Provider>;
};

export const useAdminUser = () => useContext(AdminUserContext);

export default AdminUserProvider;

