import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Middleware pour gérer l'authentification, les rôles et les redirections intelligentes
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pages publiques (pas d'authentification requise)
  const publicRoutes = [
    '/',
    '/formations',
    '/confirmation',
    '/api/auth/signin',
    '/api/auth/signup',
    '/api/auth/signout'
  ];
  
  // Routes protégées avec restrictions de rôle
  const protectedRoutes = {
    '/espace-superadmin': ['superadmin'],
    '/espace-admin': ['pedagogie', 'commercial', 'adv', 'admin', 'superadmin'],
    '/espace-animateur': ['formateur', 'admin', 'superadmin'],
    '/espace-etudiant': ['etudiant', 'admin', 'superadmin'],
    '/validation': ['lead', 'candidat'] // Étudiants n'ont plus accès à /validation
  };
  
  // Vérifier si la route est publique
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Vérifier si la route est protégée
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (protectedRoute) {
    try {
      // Récupérer le token d'authentification depuis les cookies
      const accessToken = request.cookies.get('sb-access-token')?.value;
      
      if (!accessToken) {
        // Rediriger vers la page de connexion si pas de token
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Créer un client Supabase pour vérifier l'authentification
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      });
      
      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      
      if (authError || !user) {
        // Token invalide, rediriger vers la connexion
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Récupérer le profil utilisateur avec plus d'informations
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        // Profil non trouvé, rediriger vers la connexion
        return NextResponse.redirect(new URL('/', request.url));
      }

      const userRole = profile.role;
      
      // Fonction pour déterminer la redirection selon le rôle
      const getRedirectForRole = async (role: string, currentPath: string): Promise<string | null> => {
        // Si l'utilisateur est déjà sur la bonne page, ne pas rediriger
        if (currentPath.startsWith(`/espace-${role}`) || 
            (role === 'etudiant' && currentPath.startsWith('/espace-etudiant')) ||
            (role === 'lead' && currentPath.startsWith('/validation')) ||
            (role === 'candidat' && currentPath.startsWith('/validation'))) {
          return null;
        }
        
        switch (role) {
          case 'superadmin':
            return '/espace-superadmin';
          case 'admin':
            return '/espace-admin/dashboard';
          case 'pedagogie':
          case 'commercial':
          case 'adv':
            return '/espace-admin/dashboard';
          case 'formateur':
            return '/espace-animateur';
          case 'etudiant':
            // Les étudiants vont directement vers leur espace
            return '/espace-etudiant';
          case 'candidat':
          case 'lead':
            return '/validation';
          default:
            return '/';
        }
      };
      
      // Vérifier les permissions pour la route demandée
      const requiredRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes];
      
      if (!requiredRoles.includes(userRole)) {
        // Rôle insuffisant, rediriger vers la page appropriée
        const redirectTo = await getRedirectForRole(userRole, pathname);
        if (redirectTo) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Si l'utilisateur a le bon rôle mais n'est pas sur la bonne page, rediriger
      const redirectTo = await getRedirectForRole(userRole, pathname);
      if (redirectTo && redirectTo !== pathname) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
      
    } catch (error) {
      // Erreur lors de la vérification, rediriger vers la connexion
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
