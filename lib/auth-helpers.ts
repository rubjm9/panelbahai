import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT, hasPermission, JWTPayload } from '@/lib/auth';

/**
 * Helper para proteger Server Components admin
 * Redirige a /admin/login si no está autenticado o no tiene permisos
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

  // Verificar que tenga rol admin o editor
  if (!hasPermission(user.rol, 'admin')) {
    redirect('/admin/login?error=insufficient_permissions');
  }

  return user;
}

/**
 * Helper para proteger API Routes admin
 * Retorna el usuario autenticado o lanza error
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

  // Verificar que tenga rol admin o editor
  if (!hasPermission(user.rol, 'admin')) {
    throw new Error('Permisos insuficientes');
  }

  return user;
}


