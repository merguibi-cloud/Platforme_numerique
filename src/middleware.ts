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
    '/espace-admin': ['admin', 'superadmin'],
    '/espace-animateur': ['animateur', 'admin', 'superadmin'],
    '/espace-etudiant': ['etudiant', 'animateur', 'admin', 'superadmin'],
    '/validation': ['etudiant', 'animateur', 'admin', 'superadmin']
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
            (role === 'etudiant' && (currentPath.startsWith('/validation') || currentPath.startsWith('/espace-etudiant')))) {
          return null;
        }
        
        switch (role) {
          case 'admin':
          case 'superadmin':
            return '/espace-admin/dashboard';
          case 'animateur':
            return '/espace-animateur';
          case 'etudiant':
            // Pour les étudiants, vérifier le statut de candidature
            try {
              const { data: candidature, error: candidatureError } = await supabase
                .from('candidatures')
                .select('status')
                .eq('user_id', user.id)
                .maybeSingle();

              if (candidatureError || !candidature) {
                // Pas de candidature, rediriger vers validation
                return '/validation';
              }

              // Si la candidature est validée, rediriger vers espace-etudiant
              if (candidature.status === 'validated' || candidature.status === 'approved') {
                return '/espace-etudiant';
              }

              // Sinon, rester sur validation
              return '/validation';
            } catch (error) {
              // En cas d'erreur, rediriger vers validation par défaut
              return '/validation';
            }
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
