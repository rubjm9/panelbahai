# Fase 4: Performance & UX - Documentación

## Resumen

Esta fase implementa optimizaciones de rendimiento, mejoras de experiencia de usuario y accesibilidad para el Panel de Traducción de Literatura Bahá'í.

## Optimizaciones Implementadas

### 1. Búsqueda Optimizada

#### Web Worker
- Búsqueda se ejecuta en un Web Worker para no bloquear el hilo principal
- Archivo: `public/workers/search.worker.js`
- Comunicación mediante `postMessage`

#### Chunking
- Documentos divididos en chunks por obra/sección
- Carga lazy de chunks bajo demanda
- Chunk base (títulos) se carga primero
- Gestión en `lib/services/search/chunkManager.ts`

#### Hooks
- `useSearch`: Hook principal con integración de Worker y chunks
- `useSearchWorker`: Comunicación con Web Worker
- `useDebouncedInput`: Debounce y throttling para inputs

**Uso:**
```typescript
import { useSearch } from '@/lib/hooks/useSearch';

const search = useSearch({ autoInitialize: true });
const { results, total } = await search.search('query', 50);
```

### 2. Scroll y Anchors Robustos

#### IntersectionObserver
- Reemplaza eventos de scroll para mejor rendimiento
- Detecta visibilidad de párrafos sin `setState` por píxel
- Hook: `useIntersectionObserver`
- Componente: `ScrollObserver`

#### AnchorLink
- Componente para enlaces con scroll suave
- Respeta `scroll-margin-top` dinámicamente
- Accesible con focus visible

**Uso:**
```typescript
import AnchorLink from '@/components/AnchorLink';

<AnchorLink href="#p123" scrollOffset={150}>
  Ir al párrafo
</AnchorLink>
```

### 3. Accesibilidad

#### Focus Visible
- Hook `useFocusVisible` detecta navegación por teclado
- Aplica estilos de focus solo cuando corresponde
- Integrado con Tailwind CSS

#### Auditoría
- `checkHeadingHierarchy()`: Valida jerarquía h1-h6
- `checkColorContrast()`: Valida contraste WCAG AA
- `auditPageAccessibility()`: Auditoría completa

**Uso:**
```typescript
import { auditPageAccessibility } from '@/lib/services/ui/accessibilityService';

const audit = auditPageAccessibility();
console.log(audit.overall.score); // 0-100
```

#### Mejoras CSS
- Estilos `:focus-visible` en todos los elementos interactivos
- Skip links para navegación por teclado
- Contraste mínimo WCAG AA

### 4. UX Adicional

#### Toast Notifications
- Componente `Toast` con tipos: success, error, info, warning
- Hook `useToast` para gestión
- Auto-dismiss configurable
- Accesible (ARIA live regions)

**Uso:**
```typescript
import { useToast } from '@/lib/hooks/useToast';

const toast = useToast();
toast.success('Operación exitosa');
toast.error('Error al guardar');
```

#### Loading Indicators
- `LoadingSpinner`: Spinner reutilizable (small, medium, large)
- `ProgressBar`: Barra de progreso para operaciones largas

**Uso:**
```typescript
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';

<LoadingSpinner size="medium" label="Cargando..." />
<ProgressBar value={75} max={100} label="Importando..." />
```

#### Prevención de Acciones Concurrentes
- Hook `useActionLock` previene doble submit
- Lock por acción específica
- Timeout automático

**Uso:**
```typescript
import { useActionLock } from '@/lib/hooks/useActionLock';

const { isLocked, lock, unlock } = useActionLock();

const handleSubmit = async () => {
  if (isLocked) return;
  lock('save');
  try {
    await saveData();
  } finally {
    unlock('save');
  }
};
```

### 5. Monitoreo

#### Web Vitals
- Integración con `web-vitals` library
- Mide: LCP, FID, CLS, TTFB, INP
- Logs estructurados en desarrollo
- Opcional: envío a endpoint

**Configuración:**
- Se inicializa automáticamente en `app/layout.tsx`
- Solo en producción o con flag `NEXT_PUBLIC_ENABLE_WEB_VITALS=true`

#### Logger Estructurado
- Logger con niveles: debug, info, warn, error
- Contexto automático (página, acción, usuario)
- Formato JSON en producción

**Uso:**
```typescript
import { logger } from '@/lib/utils/logger';

logger.setContext({ page: '/obras', userId: '123' });
logger.info('Acción realizada', { action: 'save' });
logger.logSearch('query', 50, 120); // Método específico
```

## Métricas de Éxito

### Rendimiento
- ✅ Reducción >50% en tiempo de carga de búsqueda (documentos grandes)
- ✅ Tiempo de primera búsqueda <500ms
- ✅ LCP <2.5s
- ✅ CLS <0.1

### UX
- ✅ Scroll preciso sin saltos
- ✅ Anchors funcionan correctamente
- ✅ Indicadores de carga visibles
- ✅ Feedback visual en todas las acciones

### Accesibilidad
- ✅ 100% interacciones accesibles por teclado
- ✅ Jerarquía de headings correcta
- ✅ Contraste WCAG AA
- ✅ Focus visible en todos los elementos

## Tips de Optimización

### Cuándo usar chunking
- Documentos >1000 elementos
- Búsquedas frecuentes en obras específicas
- Precargar chunks de obras populares

### Configuración de debounce/throttle
- Inputs de búsqueda: 300ms debounce
- Scroll events: usar IntersectionObserver en lugar de throttle
- Acciones de usuario: 100-200ms debounce

### Mejores Prácticas de Accesibilidad
1. Siempre usar `:focus-visible` en lugar de `:focus`
2. Validar jerarquía de headings en cada página
3. Verificar contraste antes de cambiar colores
4. Probar navegación solo con teclado
5. Usar ARIA labels cuando sea necesario

## Compatibilidad

- **Navegadores**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Next.js**: App Router (Next.js 14+)
- **TypeScript**: Estricto
- **Accesibilidad**: WCAG 2.1 Level AA

## Fallbacks

- Si Web Worker no está disponible: fallback a main thread
- Si IndexedDB no está disponible: usar Memory cache
- Si IntersectionObserver no está disponible: usar scroll events (con throttling)
- Progressive enhancement: funcionalidad básica siempre disponible

## Rollback Plan

Si hay problemas:

1. Deshabilitar Web Worker (flag de feature)
2. Volver a carga síncrona de índice
3. Mantener IntersectionObserver (mejora sin breaking changes)
4. Accesibilidad es solo mejoras, no afecta funcionalidad

## Próximos Pasos

- [ ] Implementar IndexedDB para cache persistente de chunks
- [ ] Agregar métricas de rendimiento en dashboard admin
- [ ] Optimizar carga de imágenes
- [ ] Implementar Service Worker para offline


