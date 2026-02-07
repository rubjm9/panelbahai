import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware simplificado que solo verifica la presencia de la cookie de autenticación.
 * La verificación real del JWT se hace en las rutas protegidas que tienen acceso
 * al runtime de Node.js (necesario para jsonwebtoken que usa crypto de Node.js).
 * 
 * El middleware se ejecuta en edge runtime, por lo que no puede usar módulos de Node.js
 * como crypto que requiere jsonwebtoken.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación admin
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminAPI = pathname.startsWith('/api/admin');

  // Si es ruta admin o API admin, verificar presencia de cookie de autenticación
  if (isAdminRoute || isAdminAPI) {
    const authToken = request.cookies.get('auth-token')?.value;

    // Si no hay cookie de autenticación, redirigir/bloquear
    // La verificación real del JWT se hace en las rutas protegidas
    if (!authToken) {
      // Para rutas de página, redirigir a login
      if (isAdminRoute) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Para APIs, retornar 401 (la API hará la verificación real del JWT)
      if (isAdminAPI) {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 401 }
        );
      }
    }
  }

  // Continuar con la request
  // Las rutas protegidas verificarán el JWT usando requireAdminAuth() o requireAdminAPI()
  return NextResponse.next();
}

// Configurar matcher para optimizar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (permitir acceso sin autenticación)
     * - api/auth/logout (permitir logout)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


