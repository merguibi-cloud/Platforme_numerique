import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export type AppUserRole = "admin" | "etudiant" | "validation";

export const ROLE_REDIRECTS: Record<AppUserRole, string> = {
  admin: "/espace-admin/dashboard",
  etudiant: "/espace-etudiant",
  validation: "/validation",
};

interface RoleResolution {
  role?: AppUserRole;
  redirectTo?: string;
}

export interface SessionRoleResult extends RoleResolution {
  success: boolean;
  user?: User;
  error?: string;
}

export function isAppUserRole(value: unknown): value is AppUserRole {
  return value === "admin" || value === "etudiant" || value === "validation";
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let cachedServiceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (!cachedServiceClient) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service credentials are not configured.");
    }

    cachedServiceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedServiceClient;
}

export async function resolveRoleForUser(userId: string): Promise<RoleResolution> {
  const serviceClient = getServiceClient();

  const { data: adminMatch } = await serviceClient
    .from("administrateurs")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminMatch) {
    return {
      role: "admin",
      redirectTo: ROLE_REDIRECTS.admin,
    };
  }

  const { data: studentMatch } = await serviceClient
    .from("etudiants")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (studentMatch) {
    return {
      role: "etudiant",
      redirectTo: ROLE_REDIRECTS.etudiant,
    };
  }

  const { data: profileMatch } = await serviceClient
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileMatch) {
    return {
      role: "validation",
      redirectTo: ROLE_REDIRECTS.validation,
    };
  }

  return {};
}

function getAuthClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public credentials are not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

async function getUserRoleFromAccessToken(accessToken: string): Promise<SessionRoleResult> {
  const authClient = getAuthClient(accessToken);

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error || !user) {
    return {
      success: false,
      error: "Non authentifié",
    };
  }

  const { role, redirectTo } = await resolveRoleForUser(user.id);

  if (!role || !redirectTo) {
    return {
      success: false,
      user,
      error: "Rôle introuvable",
    };
  }

  return {
    success: true,
    user,
    role,
    redirectTo,
  };
}

export async function getSessionUserWithRole(): Promise<SessionRoleResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "Non authentifié",
    };
  }

  return getUserRoleFromAccessToken(accessToken);
}

export async function getRequestUserWithRole(request: NextRequest): Promise<SessionRoleResult> {
  const accessToken = request.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "Non authentifié",
    };
  }

  return getUserRoleFromAccessToken(accessToken);
}

