/**
 * Integración con Web Vitals
 */

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

interface WebVitalsOptions {
  onMetric?: (metric: Metric) => void;
  logToConsole?: boolean;
  sendToEndpoint?: string;
}

/**
 * Inicializar medición de Web Vitals
 */
export function initWebVitals(options: WebVitalsOptions = {}) {
  // Verificar si web-vitals está disponible
  if (typeof window === 'undefined') {
    return;
  }

  // Intentar importar web-vitals dinámicamente
  import('web-vitals')
    .then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      const {
        onMetric,
        logToConsole = process.env.NODE_ENV === 'development',
        sendToEndpoint
      } = options;

      const handleMetric = (metric: Metric) => {
        if (logToConsole) {
          console.log(`[Web Vitals] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id
          });
        }

        // Enviar a endpoint si está configurado
        if (sendToEndpoint && typeof fetch !== 'undefined') {
          fetch(sendToEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: metric.name,
              value: metric.value,
              rating: metric.rating,
              delta: metric.delta,
              id: metric.id,
              navigationType: metric.navigationType,
              url: window.location.href,
              timestamp: Date.now()
            }),
            keepalive: true
          }).catch(err => {
            if (logToConsole) {
              console.error('Error enviando métrica:', err);
            }
          });
        }

        onMetric?.(metric);
      };

      // Registrar todos los Web Vitals
      onCLS(handleMetric);
      onFID(handleMetric);
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
      onINP(handleMetric);
    })
    .catch((err) => {
      // Silenciosamente fallar si web-vitals no está disponible
      if (options.logToConsole) {
        console.warn('[Web Vitals] No disponible. Instala con: npm install web-vitals');
      }
    });
}

