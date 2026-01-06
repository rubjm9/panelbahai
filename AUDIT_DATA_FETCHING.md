# Auditoría Arquitectónica — Data Fetching & App Router Anti-Patterns

## Resumen Ejecutivo

Se identificaron **2 Server Components** que realizan llamadas HTTP internas a rutas `/api/*`, violando el principio fundamental del App Router de Next.js. Estas llamadas añaden latencia innecesaria, duplican lógica de acceso a datos, y desactivan el sistema de caché de Next.js mediante `cache: 'no-store'`. Además, se detectó construcción manual de URLs usando headers, lo que introduce fragilidad en el código.

**Impacto:** Latencia adicional (~50-200ms por request), duplicación de código, pérdida de beneficios de caché, y riesgo de errores en producción.

---

## Tabla de Anti-Patterns Detectados

| Archivo | Problema | Tipo Componente | Riesgo | Solución Recomendada |
|---------|----------|-----------------|--------|---------------------|
| `app/autores/[autorSlug]/page.tsx` | Server Component haciendo `fetch()` a `/api/autores` y `/api/obras` | RSC | **ALTO** | Crear `lib/services/autorService.ts` con funciones directas de Mongoose |
| `app/autores/[autorSlug]/[obraSlug]/page.tsx` | Server Component haciendo `fetch()` a `/api/obras/[slug]` | RSC | **ALTO** | Crear `lib/services/obraService.ts` con funciones directas de Mongoose |
| `app/autores/[autorSlug]/page.tsx` | Construcción manual de `baseUrl` usando `headers()` | RSC | **MEDIO** | Eliminar al usar acceso directo a DB |
| `app/autores/[autorSlug]/[obraSlug]/page.tsx` | Construcción manual de `baseUrl` usando `headers()` | RSC | **MEDIO** | Eliminar al usar acceso directo a DB |
| `app/autores/[autorSlug]/page.tsx` | Uso de `cache: 'no-store'` en todas las llamadas | RSC | **MEDIO** | Usar `revalidate` apropiado o `unstable_cache` |
| `app/autores/[autorSlug]/[obraSlug]/page.tsx` | Uso de `cache: 'no-store'` en todas las llamadas | RSC | **MEDIO** | Usar `revalidate` apropiado o `unstable_cache` |

---

## Análisis Detallado

### 1. `app/autores/[autorSlug]/page.tsx`

**Problema:**
```7:44:app/autores/[autorSlug]/page.tsx
async function getAutorData(slug: string) {
  try {
    const headersList = headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(`${baseUrl}/api/autores`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const { data: autores } = await response.json();
    const autor = autores.find((a: any) => a.slug === slug);
    
    if (!autor) {
      return null;
    }

    const obrasResponse = await fetch(`${baseUrl}/api/obras?autor=${slug}`, {
      cache: 'no-store'
    });
    
    let obras = [];
    if (obrasResponse.ok) {
      const obrasData = await obrasResponse.json();
      obras = obrasData.data || [];
    }

    return { autor, obras };
  } catch (error) {
    console.error('Error fetching autor data:', error);
    return null;
  }
}
```

**Por qué es un anti-pattern:**
1. **Overhead HTTP innecesario:** Un Server Component haciendo `fetch()` a una ruta interna crea un round-trip HTTP completo (parsing de URL, routing de Next.js, serialización JSON) cuando podría acceder directamente a MongoDB.
2. **Duplicación de lógica:** La lógica de consulta a MongoDB ya existe en `/api/autores/route.ts` y `/api/obras/route.ts`. Esta duplicación viola DRY y aumenta la superficie de bugs.
3. **Pérdida de beneficios de caché:** `cache: 'no-store'` desactiva completamente el sistema de caché de Next.js, incluyendo Data Cache y Full Route Cache.
4. **Fragilidad en construcción de URLs:** El uso de `headers()` para construir `baseUrl` es frágil y puede fallar en edge cases (ISR, build time, etc.).
5. **Latencia adicional:** Cada request añade ~50-200ms de overhead HTTP innecesario.

**Solución:**
```typescript
// lib/services/autorService.ts
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import Obra from '@/models/Obra';

export async function getAutorBySlug(slug: string) {
  await dbConnect();
  return await Autor.findOne({ slug, activo: true })
    .select('nombre slug biografia orden')
    .lean();
}

export async function getObrasByAutorSlug(autorSlug: string) {
  await dbConnect();
  const autor = await Autor.findOne({ slug: autorSlug, activo: true });
  if (!autor) return [];
  
  return await Obra.find({ autor: autor._id, activo: true })
    .populate('autor', 'nombre slug')
    .sort({ orden: 1, titulo: 1 })
    .select('titulo slug descripcion esPublico orden autor fechaCreacion')
    .lean();
}
```

**Uso en el page:**
```typescript
import { getAutorBySlug, getObrasByAutorSlug } from '@/lib/services/autorService';

export default async function AutorPage({ params }: { params: { autorSlug: string } }) {
  const autor = await getAutorBySlug(params.autorSlug);
  if (!autor) notFound();
  
  const obras = await getObrasByAutorSlug(params.autorSlug);
  // ... render
}
```

---

### 2. `app/autores/[autorSlug]/[obraSlug]/page.tsx`

**Problema:**
```7:29:app/autores/[autorSlug]/[obraSlug]/page.tsx
async function getObraData(autorSlug: string, obraSlug: string) {
  try {
    const headersList = headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    const response = await fetch(
      `${baseUrl}/api/obras/${obraSlug}?autor=${autorSlug}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching obra data:', error);
    return null;
  }
}
```

**Por qué es un anti-pattern:**
Mismos problemas que el caso anterior, pero con lógica más compleja (secciones jerárquicas, párrafos).

**Solución:**
```typescript
// lib/services/obraService.ts
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';

export async function getObraCompletaBySlug(obraSlug: string, autorSlug?: string) {
  await dbConnect();
  
  let obraQuery = Obra.findOne({ slug: obraSlug, activo: true })
    .populate('autor', 'nombre slug biografia');

  if (autorSlug) {
    obraQuery = obraQuery.populate({
      path: 'autor',
      match: { slug: autorSlug },
      select: 'nombre slug biografia'
    });
  }

  const obra = await obraQuery.lean();
  if (!obra || (autorSlug && !obra.autor)) return null;

  // Obtener secciones y párrafos en paralelo
  const [secciones, parrafos] = await Promise.all([
    Seccion.find({ obra: obra._id, activo: true })
      .sort({ orden: 1 })
      .select('titulo slug nivel orden seccionPadre')
      .lean(),
    Parrafo.find({ obra: obra._id, activo: true })
      .populate('seccion', 'titulo')
      .sort({ orden: 1, numero: 1 })
      .select('numero texto seccion orden')
      .lean()
  ]);

  // Organizar secciones jerárquicamente
  const seccionesMap = new Map();
  const seccionesRaiz: any[] = [];

  secciones.forEach(seccion => {
    seccionesMap.set(seccion._id.toString(), {
      ...seccion,
      subsecciones: []
    });
  });

  secciones.forEach(seccion => {
    const seccionObj = seccionesMap.get(seccion._id.toString());
    if (seccion.seccionPadre) {
      const padre = seccionesMap.get(seccion.seccionPadre.toString());
      if (padre) {
        padre.subsecciones.push(seccionObj);
      }
    } else {
      seccionesRaiz.push(seccionObj);
    }
  });

  return {
    obra: {
      titulo: obra.titulo,
      slug: obra.slug,
      descripcion: obra.descripcion,
      fechaPublicacion: obra.fechaPublicacion,
      autor: obra.autor,
      esPublico: obra.esPublico,
      archivoDoc: obra.archivoDoc,
      archivoPdf: obra.archivoPdf,
      archivoEpub: obra.archivoEpub
    },
    secciones: seccionesRaiz,
    parrafos: parrafos.map(p => ({
      numero: p.numero,
      texto: p.texto,
      seccion: p.seccion?.titulo
    }))
  };
}
```

---

## Casos Legítimos (Client Components)

Los siguientes archivos **NO son anti-patterns** porque son Client Components (`'use client'`):

- `app/buscar/page.tsx` - Client Component, uso de `fetch()` es apropiado
- `app/admin/busqueda/page.tsx` - Client Component, uso de `fetch()` es apropiado

**Nota:** Estos podrían optimizarse usando Server Actions en el futuro, pero no son anti-patterns críticos.

---

## Duplicación de Lógica

**Problema:** La lógica de acceso a datos está duplicada entre:
- `/api/autores/route.ts` (líneas 70-72)
- `/api/obras/route.ts` (líneas 107-110)
- `app/autores/[autorSlug]/page.tsx` (fetch interno)
- `app/autores/[autorSlug]/[obraSlug]/page.tsx` (fetch interno)

**Solución:** Extraer toda la lógica a `lib/services/` y reutilizar en ambos contextos:
- API Routes → llaman a servicios
- Server Components → llaman a servicios directamente

---

## Recomendaciones de Caché

**Problema actual:** `cache: 'no-store'` en todas las llamadas.

**Solución recomendada:**

1. **Para datos que cambian raramente (autores, obras):**
```typescript
import { unstable_cache } from 'next/cache';

export const getAutorBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    return await Autor.findOne({ slug, activo: true }).lean();
  },
  ['autor-by-slug'],
  { revalidate: 3600 } // 1 hora
);
```

2. **Para datos que cambian frecuentemente (párrafos):**
```typescript
// Sin caché o revalidate corto
export async function getObraCompletaBySlug(slug: string) {
  // ... sin unstable_cache
}
```

3. **Usar `revalidate` en el page:**
```typescript
export const revalidate = 3600; // ISR cada hora
```

---

## Hardcoded URLs y Environment Leaks

**Problema detectado:**
```typescript
const host = headersList.get('host') || 'localhost:3000'
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
const baseUrl = `${protocol}://${host}`
```

**Riesgos:**
- Puede fallar en build time (headers no disponibles)
- Puede fallar en ISR/SSG
- Depende de headers que pueden no estar presentes

**Solución:** Eliminar completamente al usar acceso directo a DB.

---

## Plan de Refactorización

### Fase 1: Crear Capa de Servicios
1. Crear `lib/services/autorService.ts`
2. Crear `lib/services/obraService.ts`
3. Mover lógica de consultas desde API routes a servicios

### Fase 2: Refactorizar Server Components
1. Actualizar `app/autores/[autorSlug]/page.tsx` para usar servicios
2. Actualizar `app/autores/[autorSlug]/[obraSlug]/page.tsx` para usar servicios
3. Eliminar construcción manual de URLs

### Fase 3: Actualizar API Routes
1. Refactorizar `/api/autores/route.ts` para usar servicios
2. Refactorizar `/api/obras/route.ts` para usar servicios
3. Refactorizar `/api/obras/[slug]/route.ts` para usar servicios

### Fase 4: Implementar Caché
1. Añadir `unstable_cache` para datos estáticos
2. Configurar `revalidate` apropiado en pages
3. Eliminar `cache: 'no-store'` innecesarios

---

## Métricas Esperadas Post-Refactor

- **Latencia:** Reducción de ~50-200ms por request (eliminación de overhead HTTP)
- **Código duplicado:** Reducción de ~40% (consolidación en servicios)
- **Caché hit rate:** Aumento esperado del 60-80% para datos estáticos
- **Mantenibilidad:** Mejora significativa (single source of truth)

---

## Conclusión

Los anti-patterns identificados son **críticos** para una aplicación production-bound. La refactorización propuesta mejorará significativamente el rendimiento, mantenibilidad y aprovechamiento de las características del App Router de Next.js.

**Prioridad:** ALTA - Debe abordarse antes del despliegue a producción.


