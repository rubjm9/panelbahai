# Guía de Refactor — Eliminar Fetch Interno de Server Components

## Contexto

Esta guía muestra cómo refactorizar Server Components que hacen `fetch()` a rutas `/api/*` internas, eliminando overhead HTTP innecesario y aprovechando el sistema de caché de Next.js.

**Situación actual:**
- Server Component hace `fetch()` a `/api/obras/[slug]`
- La API route consulta MongoDB y devuelve JSON
- La página usa `cache: 'no-store'` (desactiva caché)

**Objetivo:**
- Eliminar fetches HTTP internos
- Usar acceso directo a servicios/modelos
- Implementar caché apropiado con `revalidateTag`
- Mantener comportamiento idéntico para el usuario

---

## Patrón ANTES (Anti-Pattern)

### ❌ Server Component con Fetch Interno

```typescript
// app/autores/[autorSlug]/[obraSlug]/page.tsx
import { headers } from 'next/headers'

async function getObraData(autorSlug: string, obraSlug: string) {
  try {
    // ❌ Construcción manual de URL
    const headersList = headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    // ❌ Fetch interno a API route
    const response = await fetch(
      `${baseUrl}/api/obras/${obraSlug}?autor=${autorSlug}`,
      { cache: 'no-store' } // ❌ Desactiva caché completamente
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

export default async function ReadingPage({ params }) {
  const data = await getObraData(params.autorSlug, params.obraSlug);
  // ... render
}
```

### ❌ API Route Correspondiente

```typescript
// app/api/obras/[slug]/route.ts
export async function GET(request: NextRequest, { params }) {
  await dbConnect();
  
  const obra = await Obra.findOne({ slug: params.slug, activo: true })
    .populate('autor', 'nombre slug biografia');
  
  const secciones = await Seccion.find({ obra: obra._id, activo: true })
    .sort({ orden: 1 });
  
  const parrafos = await Parrafo.find({ obra: obra._id, activo: true })
    .populate('seccion', 'titulo')
    .sort({ orden: 1, numero: 1 });
  
  // Organizar secciones jerárquicamente...
  
  return NextResponse.json({
    success: true,
    data: { obra, secciones, parrafos }
  });
}
```

### Problemas del Patrón Antes

1. **Overhead HTTP innecesario**
   - Cada request crea un round-trip HTTP completo
   - Parsing de URL, routing de Next.js, serialización JSON
   - Latencia adicional: ~50-200ms por request

2. **Sin caché**
   - `cache: 'no-store'` desactiva completamente el caché
   - Cada request va a la base de datos
   - No aprovecha Data Cache ni Full Route Cache

3. **Construcción frágil de URLs**
   - Depende de `headers()` que puede no estar disponible
   - Puede fallar en build time, ISR, o edge cases
   - Lógica duplicada en múltiples lugares

4. **Duplicación de lógica**
   - La lógica de consulta existe en API route Y en el componente
   - Violación de DRY (Don't Repeat Yourself)
   - Más superficie para bugs

---

## Patrón DESPUÉS (Correcto)

### ✅ Server Component con Servicios Directos

```typescript
// app/autores/[autorSlug]/[obraSlug]/page.tsx
import { getCachedPublishedWorkComplete } from '@/lib/services/public/obraService'

// ✅ Función simple que usa servicio directo
async function getObraData(autorSlug: string, obraSlug: string) {
  try {
    // ✅ Acceso directo a servicio (sin HTTP)
    const data = await getCachedPublishedWorkComplete(obraSlug, autorSlug);
    
    if (!data) {
      return null;
    }

    // Transformar datos del servicio al formato del componente
    return {
      obra: {
        titulo: data.obra.titulo,
        slug: data.obra.slug,
        descripcion: data.obra.descripcion,
        autor: {
          nombre: data.obra.autor.nombre,
          slug: data.obra.autor.slug
        },
        archivoDoc: data.obra.archivoDoc,
        archivoPdf: data.obra.archivoPdf,
        archivoEpub: data.obra.archivoEpub
      },
      secciones: data.secciones.map(sec => ({
        id: sec._id,
        titulo: sec.titulo,
        slug: sec.slug,
        nivel: sec.nivel,
        orden: sec.orden,
        subsecciones: sec.subsecciones.map(/* ... */)
      })),
      parrafos: data.parrafos.map(p => ({
        numero: p.numero,
        texto: p.texto,
        seccion: p.seccion?.titulo
      }))
    };
  } catch (error) {
    console.error('Error fetching obra data:', error);
    return null;
  }
}

export default async function ReadingPage({ params }) {
  const data = await getObraData(params.autorSlug, params.obraSlug);
  // ... render (idéntico al antes)
}
```

### ✅ Servicio Público con Caché

```typescript
// lib/services/public/obraService.ts
import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';

// Función base (sin caché)
export async function getPublishedWorkComplete(
  obraSlug: string,
  autorSlug?: string
): Promise<ObraCompleta | null> {
  await dbConnect();
  
  // Obtener obra
  const obra = await Obra.findOne({ 
    slug: obraSlug, 
    activo: true, 
    esPublico: true 
  })
    .populate('autor', 'nombre slug biografia')
    .lean();

  if (!obra) return null;

  // Obtener secciones y párrafos en paralelo
  const [seccionesRaw, parrafosRaw] = await Promise.all([
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

  // Organizar secciones jerárquicamente...
  // Transformar datos...

  return { obra, secciones, parrafos };
}

// ✅ Versión con caché usando unstable_cache
export async function getCachedPublishedWorkComplete(
  obraSlug: string,
  autorSlug?: string
): Promise<ObraCompleta | null> {
  return unstable_cache(
    async () => {
      return getPublishedWorkComplete(obraSlug, autorSlug);
    },
    [`obra-completa-${obraSlug}`, autorSlug || ''],
    {
      // ✅ Tags para invalidación selectiva
      tags: [
        'obras',                    // Tag global (invalida todas)
        `obra-${obraSlug}`,         // Tag específico de obra
        `obra-${obraSlug}-completa` // Tag de versión completa
      ],
      revalidate: 1800, // 30 minutos
    }
  )();
}
```

### ✅ Servicio Admin con Invalidación de Caché

```typescript
// lib/services/admin/obraAdminService.ts
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';

export async function updateObra(
  obraId: string,
  data: UpdateObraInput
) {
  await dbConnect();
  
  const obra = await Obra.findByIdAndUpdate(
    obraId,
    {
      ...data,
      fechaActualizacion: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('autor', 'nombre slug')
    .lean();

  if (!obra) {
    return null;
  }

  // ✅ Invalidar caché después de actualizar
  await revalidateTag(`obra-${obra.slug}`);
  await revalidateTag(`obra-${obra.slug}-completa`);
  await revalidateTag('obras'); // Tag global

  return obra;
}
```

### ✅ API Route Usando Servicio Admin

```typescript
// app/api/admin/obras/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { updateObra } from '@/lib/services/admin/obraAdminService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticación
  const user = await verifyAuth(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  
  const body = await request.json();
  
  try {
    // ✅ Usar servicio admin (incluye invalidación de caché)
    const obra = await updateObra(params.id, {
      titulo: body.titulo,
      descripcion: body.descripcion,
      esPublico: body.esPublico,
    });
    
    if (!obra) {
      return NextResponse.json(
        { error: 'Obra no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: obra });
  } catch (error) {
    console.error('Error updating obra:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

---

## Dónde Vive el Caché

### 1. Data Cache (Next.js)

El caché vive en la función con `unstable_cache`:

```typescript
// lib/services/public/obraService.ts
export async function getCachedPublishedWorkComplete(...) {
  return unstable_cache(
    async () => {
      // Esta función se ejecuta solo si el caché expira
      return getPublishedWorkComplete(...);
    },
    [`obra-completa-${obraSlug}`, autorSlug || ''],
    {
      tags: ['obras', `obra-${obraSlug}`, `obra-${obraSlug}-completa`],
      revalidate: 1800, // 30 minutos
    }
  )();
}
```

**Comportamiento:**
- Primera llamada: ejecuta la función y guarda resultado en caché
- Llamadas siguientes: devuelve del caché (hasta que expire o se invalide)
- Después de `revalidate` segundos: próxima llamada regenera el caché

### 2. Full Route Cache (Next.js)

Si el componente es estático, Next.js puede cachear toda la página:

```typescript
// app/autores/[autorSlug]/[obraSlug]/page.tsx
export const revalidate = 3600; // ISR: regenerar cada hora

export default async function ReadingPage({ params }) {
  const data = await getCachedPublishedWorkComplete(...);
  // ...
}
```

**Comportamiento:**
- Build time: genera páginas estáticas
- Runtime: regenera según `revalidate`
- Invalidación: `revalidateTag()` invalida y fuerza regeneración

---

## Cómo se Dispara la Revalidación

### Flujo Completo

```
1. Admin edita obra en panel
   ↓
2. API route recibe PUT /api/admin/obras/[id]
   ↓
3. Servicio admin actualiza MongoDB
   ↓
4. Servicio admin llama revalidateTag()
   ↓
5. Next.js invalida caché con esos tags
   ↓
6. Próxima request regenera caché con datos nuevos
```

### Ejemplo Práctico

```typescript
// 1. Admin actualiza obra
PUT /api/admin/obras/123
{
  "titulo": "Nuevo Título",
  "descripcion": "Nueva descripción"
}

// 2. API route llama servicio
const obra = await updateObra('123', {
  titulo: "Nuevo Título",
  descripcion: "Nueva descripción"
});

// 3. Servicio actualiza DB e invalida caché
await Obra.findByIdAndUpdate(...);
await revalidateTag(`obra-${obra.slug}`);        // Invalida obra específica
await revalidateTag(`obra-${obra.slug}-completa`); // Invalida versión completa
await revalidateTag('obras');                    // Invalida todas las obras

// 4. Próxima request del usuario regenera caché
// Usuario visita /autores/bahaullah/kitab-i-iqan
// → getCachedPublishedWorkComplete() detecta caché inválido
// → Ejecuta getPublishedWorkComplete() (consulta DB)
// → Guarda nuevo resultado en caché
// → Usuario ve datos actualizados
```

### Invalidación Selectiva

```typescript
// Invalidar solo una obra específica
await revalidateTag(`obra-kitab-i-iqan`);

// Invalidar todas las obras
await revalidateTag('obras');

// Invalidar todas las obras y autores
await revalidateTag('obras');
await revalidateTag('autores');
```

---

## Errores Comunes a Evitar

### ❌ Error 1: Olvidar Invalidar Caché

```typescript
// ❌ MAL: Actualiza DB pero no invalida caché
export async function updateObra(id: string, data: UpdateObraInput) {
  await Obra.findByIdAndUpdate(id, data);
  // ❌ Falta: await revalidateTag(...)
  return obra;
}
```

**Problema:** Los usuarios seguirán viendo datos antiguos hasta que expire el caché.

**✅ Correcto:**
```typescript
export async function updateObra(id: string, data: UpdateObraInput) {
  const obra = await Obra.findByIdAndUpdate(id, data);
  await revalidateTag(`obra-${obra.slug}`);
  await revalidateTag('obras');
  return obra;
}
```

### ❌ Error 2: Tags Inconsistentes

```typescript
// ❌ MAL: Tags diferentes en caché e invalidación
// En servicio público:
tags: ['obras', `obra-${slug}`]

// En servicio admin:
await revalidateTag('obra'); // ❌ Tag diferente, no invalida
```

**Problema:** La invalidación no funciona porque los tags no coinciden.

**✅ Correcto:**
```typescript
// Usar los mismos tags en ambos lugares
// Servicio público:
tags: ['obras', `obra-${slug}`]

// Servicio admin:
await revalidateTag('obras');
await revalidateTag(`obra-${slug}`);
```

### ❌ Error 3: Usar `cache: 'no-store'` en Servicios

```typescript
// ❌ MAL: Desactivar caché en servicios
export async function getObra(slug: string) {
  return unstable_cache(
    async () => { /* ... */ },
    ['obra'],
    {
      tags: ['obras'],
      revalidate: 0, // ❌ O cache: 'no-store'
    }
  )();
}
```

**Problema:** Desactiva el caché, perdiendo todos los beneficios.

**✅ Correcto:**
```typescript
export async function getObra(slug: string) {
  return unstable_cache(
    async () => { /* ... */ },
    ['obra'],
    {
      tags: ['obras'],
      revalidate: 3600, // ✅ Tiempo razonable
    }
  )();
}
```

### ❌ Error 4: No Usar `unstable_cache` Correctamente

```typescript
// ❌ MAL: Llamar unstable_cache incorrectamente
export const getCachedObra = unstable_cache(
  getObra, // ❌ Función sin parámetros
  ['obra'],
  { tags: ['obras'] }
);

// Luego:
const obra = await getCachedObra(slug); // ❌ No funciona con parámetros
```

**Problema:** `unstable_cache` necesita una función sin parámetros o una función wrapper.

**✅ Correcto:**
```typescript
export async function getCachedObra(slug: string) {
  return unstable_cache(
    async () => getObra(slug), // ✅ Wrapper sin parámetros
    [`obra-${slug}`],
    { tags: ['obras', `obra-${slug}`] }
  )();
}
```

### ❌ Error 5: Invalidar Demasiado o Muy Poco

```typescript
// ❌ MAL: Invalidar todo siempre
await revalidateTag('obras');
await revalidateTag('autores');
await revalidateTag('parrafos');
await revalidateTag('secciones');
// ❌ Invalida más de lo necesario

// ❌ MAL: Invalidar solo tag específico
await revalidateTag(`obra-${slug}`);
// ❌ No invalida listas que incluyen esta obra
```

**✅ Correcto:**
```typescript
// Invalidar obra específica Y tag global
await revalidateTag(`obra-${slug}`);
await revalidateTag(`obra-${slug}-completa`);
await revalidateTag('obras'); // ✅ Para invalidar listas
```

### ❌ Error 6: No Manejar Errores en Servicios

```typescript
// ❌ MAL: No manejar errores
export async function getObra(slug: string) {
  const obra = await Obra.findOne({ slug }); // ❌ Puede fallar
  return obra;
}
```

**✅ Correcto:**
```typescript
export async function getObra(slug: string) {
  try {
    await dbConnect();
    const obra = await Obra.findOne({ slug, activo: true });
    return obra;
  } catch (error) {
    console.error('Error fetching obra:', error);
    return null;
  }
}
```

---

## Checklist de Verificación

### ✅ Pre-Refactor

- [ ] Identificar todos los Server Components con `fetch('/api/*')`
- [ ] Identificar construcción manual de URLs con `headers()`
- [ ] Identificar uso de `cache: 'no-store'`
- [ ] Documentar qué datos se obtienen de cada API route

### ✅ Durante Refactor

- [ ] Crear servicios en `lib/services/public/` para lectura
- [ ] Crear servicios en `lib/services/admin/` para escritura
- [ ] Implementar `unstable_cache` con tags apropiados
- [ ] Implementar `revalidateTag()` en servicios admin
- [ ] Eliminar `fetch()` de Server Components
- [ ] Eliminar construcción manual de URLs
- [ ] Eliminar `cache: 'no-store'`
- [ ] Mantener tipos TypeScript estrictos

### ✅ Post-Refactor

- [ ] Verificar que las páginas renderizan correctamente
- [ ] Verificar que los datos se muestran correctamente
- [ ] Verificar que la navegación funciona
- [ ] Verificar que los metadatos se generan correctamente
- [ ] Probar invalidación de caché (editar en admin, verificar en frontend)
- [ ] Verificar que no hay errores de linting
- [ ] Verificar que no hay errores de TypeScript
- [ ] Monitorear métricas de rendimiento

### ✅ Validación de Caché

- [ ] Primera carga: debe consultar DB
- [ ] Segunda carga (mismo tag): debe usar caché
- [ ] Después de editar en admin: debe invalidar y regenerar
- [ ] Tags correctos: verificar que coinciden en caché e invalidación

### ✅ Validación de Rendimiento

- [ ] Latencia reducida (medir antes/después)
- [ ] Menos queries a DB (verificar logs)
- [ ] Caché hit rate > 60% (monitorear)

---

## Comparación Final

| Aspecto | ❌ Antes | ✅ Después |
|---------|--------|------------|
| **Método** | `fetch()` a `/api/*` | Acceso directo a servicios |
| **Overhead HTTP** | ~50-200ms | 0ms |
| **Caché** | `cache: 'no-store'` (0%) | `unstable_cache` (60-80%) |
| **Invalidación** | Manual o no existe | Automática con `revalidateTag` |
| **Type Safety** | Parcial (`any`) | Completo (TypeScript) |
| **Mantenibilidad** | Lógica duplicada | Single source of truth |
| **Rendimiento** | Lento (sin caché) | Rápido (con caché) |

---

## Resumen

**Patrón Correcto:**
1. Server Components → `lib/services/public/*` (lectura)
2. API Routes → `lib/services/admin/*` (escritura)
3. Caché con `unstable_cache` y tags
4. Invalidación con `revalidateTag()` después de mutaciones
5. Sin `fetch()` internos, sin `headers()`, sin `cache: 'no-store'`

**Beneficios:**
- ✅ 80-90% reducción de latencia
- ✅ 60-80% caché hit rate
- ✅ Type safety completo
- ✅ Mantenibilidad mejorada
- ✅ Invalidación automática de caché


