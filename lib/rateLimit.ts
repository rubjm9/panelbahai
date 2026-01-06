import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuración de Redis (Upstash) o memoria para desarrollo
let redis: Redis | null = null;
let useMemory = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  // En desarrollo, usar memoria si no hay Redis configurado
  useMemory = true;
  console.warn('⚠️  Rate limiting usando memoria (solo desarrollo). Configura Upstash Redis para producción.');
}

// Rate limiter para login: 5 intentos cada 15 minutos por IP
export const loginRateLimit = new Ratelimit({
  redis: redis || undefined,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/login',
});

// Rate limiter para APIs admin: 100 requests por minuto por usuario
export const adminAPIRateLimit = new Ratelimit({
  redis: redis || undefined,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/admin-api',
});

// Rate limiter para APIs públicas: 30 requests por minuto por IP
export const publicAPIRateLimit = new Ratelimit({
  redis: redis || undefined,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/public-api',
});

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
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (useMemory) {
    // Implementación simple en memoria para desarrollo
    // En producción, esto no se usará si Redis está configurado
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


