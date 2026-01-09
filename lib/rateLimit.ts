import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuración de Redis (Upstash) - solo crear si las variables están configuradas
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// En desarrollo sin Redis, mostrar advertencia
if (!redis && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Rate limiting deshabilitado (Redis no configurado). Configura Upstash Redis para producción.');
}

// Rate limiters (solo se crean si Redis está disponible)
export const loginRateLimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/login',
    })
  : null;

export const adminAPIRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/admin-api',
    })
  : null;

export const publicAPIRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/public-api',
    })
  : null;

/**
 * Obtener identificador para rate limiting
 * Para login: usa IP
 * Para APIs admin: usa userId si está autenticado, sino IP
 * Para APIs públicas: usa IP
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Obtener IP del request
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Verificar rate limit y retornar resultado
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Si no hay limiter (Redis no configurado), permitir siempre
  if (!limiter) {
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };
  }
  
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}


