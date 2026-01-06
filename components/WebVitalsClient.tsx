/**
 * Client component para inicializar Web Vitals
 */

'use client'

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/utils/webVitals';

export default function WebVitalsClient() {
  useEffect(() => {
    // Solo inicializar en producción o con flag de desarrollo
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS === 'true') {
      initWebVitals({
        logToConsole: process.env.NODE_ENV === 'development',
        onMetric: (metric) => {
          // Opcional: enviar a endpoint de analytics
          // fetch('/api/analytics/web-vitals', { ... })
        }
      });
    }
  }, []);

  return null;
}


