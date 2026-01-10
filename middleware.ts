import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación admin
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminAPI = pathname.startsWith('/api/admin');

  // Si es ruta admin o API admin, verificar autenticación
  if (isAdminRoute || isAdminAPI) {
    const user = getUserFromRequest(request);

    // Si no hay usuario autenticado
    if (!user) {
      // Para rutas de página, redirigir a login
      if (isAdminRoute) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Para APIs, retornar 401
      if (isAdminAPI) {
        return NextResponse.json(
          { success: false, error: 'No autorizado' },
          { status: 401 }
        );
      }
    }

    // Verificar que tenga rol admin o editor (mínimo para acceder a admin)
    const requiredRole = 'admin';
    if (!hasPermission(user!.rol, requiredRole)) {
      // Para rutas de página, redirigir a login con mensaje
      if (isAdminRoute) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('error', 'insufficient_permissions');
        return NextResponse.redirect(loginUrl);
      }
      // Para APIs, retornar 403
      if (isAdminAPI) {
        return NextResponse.json(
          { success: false, error: 'Permisos insuficientes' },
          { status: 403 }
        );
      }
    }
  }

  // Continuar con la request
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


