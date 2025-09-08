import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'editor' | 'viewer';
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

// Generar hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generar JWT token
export function signJWT(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verificar JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extraer usuario del request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                request.cookies.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

// Verificar permisos de rol
export function hasPermission(userRole: string, requiredRole: 'admin' | 'editor' | 'viewer'): boolean {
  const roleHierarchy = {
    'viewer': 1,
    'editor': 2,
    'admin': 3
  };

  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole];
}

// Middleware para verificar autenticación
export function requireAuth(requiredRole: 'admin' | 'editor' | 'viewer' = 'viewer') {
  return (request: NextRequest) => {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return { error: 'No autorizado', status: 401 };
    }

    if (!hasPermission(user.rol, requiredRole)) {
      return { error: 'Permisos insuficientes', status: 403 };
    }

    return { user };
  };
}
