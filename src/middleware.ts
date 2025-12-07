import { NextRequest, NextResponse } from "next/server";
import { getRequestUserWithRole, ROLE_REDIRECTS, type AppUserRole } from "@/lib/auth-role";

const publicRoutes = [
  "/",
  "/formations",
  "/confirmation",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/signout",
];

const protectedRoutes: Record<string, AppUserRole[]> = {
  "/espace-admin": ["admin"],
  "/espace-etudiant": ["etudiant"],
  "/validation": ["validation"],
};

function findProtectedRoute(pathname: string): string | undefined {
  return Object.keys(protectedRoutes).find((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const protectedRoute = findProtectedRoute(pathname);

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const roleResult = await getRequestUserWithRole(request);

  if (!roleResult.success || !roleResult.role) {
    // Vérifier si c'est une session expirée (token présent mais invalide)
    const hasAccessToken = request.cookies.get("sb-access-token")?.value;
    const redirectUrl = new URL("/", request.url);
    
    // Si un token existe mais est invalide, c'est une session expirée
    if (hasAccessToken && roleResult.error === "Non authentifié") {
      redirectUrl.searchParams.set("session_expired", "true");
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  const allowedRoles = protectedRoutes[protectedRoute];

  if (!allowedRoles.includes(roleResult.role)) {
    const redirectTarget = roleResult.redirectTo ?? "/";
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  const canonicalPath = roleResult.redirectTo;

  if (canonicalPath && !pathname.startsWith(canonicalPath)) {
    return NextResponse.redirect(new URL(canonicalPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
