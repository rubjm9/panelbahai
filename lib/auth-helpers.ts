import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT, hasPermission, JWTPayload } from '@/lib/auth';

/**
 * Helper para proteger Server Components del panel admin.
 * Permite acceso a admin y editor. Redirige a /admin/login si no está autenticado o no tiene permisos.
 */
export async function requireAdminAuth(): Promise<JWTPayload> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/admin/login?error=not_authenticated');
  }

  const user = verifyJWT(token);

  if (!user) {
    redirect('/admin/login?error=invalid_token');
  }

  if (!hasPermission(user.rol, 'editor')) {
    redirect('/admin/login?error=insufficient_permissions');
  }

  return user;
}

/**
 * Helper para proteger API Routes del panel admin.
 * Permite acceso a admin y editor.
 */
export async function requireAdminAPI(): Promise<JWTPayload> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    throw new Error('No autorizado');
  }

  const user = verifyJWT(token);

  if (!user) {
    throw new Error('Token inválido');
  }

  if (!hasPermission(user.rol, 'editor')) {
    throw new Error('Permisos insuficientes');
  }

  return user;
}

/**
 * Solo administradores. Para páginas de gestión de usuarios.
 */
export async function requireAdminOnlyAuth(): Promise<JWTPayload> {
  const user = await requireAdminAuth();
  if (!hasPermission(user.rol, 'admin')) {
    redirect('/admin/login?error=insufficient_permissions');
  }
  return user;
}

/**
 * Solo administradores. Para APIs de gestión de usuarios.
 */
export async function requireAdminOnlyAPI(): Promise<JWTPayload> {
  const user = await requireAdminAPI();
  if (!hasPermission(user.rol, 'admin')) {
    throw new Error('Permisos insuficientes');
  }
  return user;
}


