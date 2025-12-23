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

  // Routes publiques - toujours autorisées
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const protectedRoute = findProtectedRoute(pathname);

  // Si ce n'est pas une route protégée, laisser passer
  if (!protectedRoute) {
    return NextResponse.next();
  }

  // VÉRIFIER L'AUTHENTIFICATION AVANT TOUT (même pour session_expired)
  const roleResult = await getRequestUserWithRole(request);

  // Si authentifié et autorisé, vérifier si c'est une requête avec session_expired pour nettoyer l'URL
  if (roleResult.success && roleResult.role && protectedRoute) {
    const sessionExpiredParam = request.nextUrl.searchParams.get("session_expired");
    const allowedRoles = protectedRoutes[protectedRoute];
    
    // Vérifier les permissions de rôle
    if (!allowedRoles.includes(roleResult.role)) {
      const redirectTarget = roleResult.redirectTo ?? "/";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }

    // Si l'utilisateur est authentifié et autorisé, et que session_expired est présent,
    // permettre l'accès (pour afficher le modal) mais on nettoiera l'URL côté client
    if (sessionExpiredParam === "true") {
      return NextResponse.next();
    }

    // Vérifier le chemin canonique
    const canonicalPath = roleResult.redirectTo;
    if (canonicalPath && !pathname.startsWith(canonicalPath)) {
      return NextResponse.redirect(new URL(canonicalPath, request.url));
    }

    return NextResponse.next();
  }

  // Non authentifié - vérifier si c'est une session expirée (token présent mais invalide)
  const hasAccessToken = request.cookies.get("sb-access-token")?.value;
  
  // Si un token existe mais est invalide, c'est une session expirée
  if (hasAccessToken && roleResult.error === "Non authentifié" && protectedRoute) {
    // Rediriger vers la page actuelle avec le paramètre pour déclencher le modal
    // MAIS seulement si on est déjà sur une route protégée (pour éviter le contournement)
    const redirectUrl = new URL(pathname, request.url);
    redirectUrl.searchParams.set("session_expired", "true");
    return NextResponse.redirect(redirectUrl);
  }
  
  // Sinon, rediriger vers la page d'accueil (utilisateur non authentifié)
  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl);

}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
