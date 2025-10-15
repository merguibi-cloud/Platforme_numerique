import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Middleware pour gérer l'authentification via les cookies
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pages qui nécessitent une authentification
  const protectedRoutes = [
    '/espace-etudiant',
    '/validation',
    '/espace-admin'
  ];
  
  // Routes avec restrictions de rôle
  const roleRestrictions = {
    '/espace-admin': ['admin', 'superadmin'],
    '/espace-animateur': ['animateur', 'admin', 'superadmin'],
    '/espace-etudiant': ['etudiant', 'animateur', 'admin', 'superadmin'],
    '/validation': ['etudiant', 'animateur', 'admin', 'superadmin']
  };
  
  // Pages publiques
  const publicRoutes = [
    '/',
    '/formations',
    '/confirmation'
  ];
  
  // Si on est sur une page publique, ne pas vérifier l'authentification
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    try {
      // Créer un client Supabase avec les cookies de la requête
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const allCookies = request.cookies.getAll();
      const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            cookie: cookieString
          }
        }
      });
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Vérifier les permissions de rôle pour les routes spécifiques
      const requiredRoles = roleRestrictions[pathname as keyof typeof roleRestrictions];
      if (requiredRoles) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const userRole = profile?.role || 'etudiant';
        
        if (!requiredRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    } catch (error) {
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
