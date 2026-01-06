# Service Layer Design — Next.js App Router

## Estructura de Carpetas

```
lib/services/
├── README.md                    # Documentación principal
├── DESIGN_EXAMPLES.md           # Ejemplos de uso
├── SERVICE_LAYER_DESIGN.md      # Este documento
├── types.ts                     # Tipos TypeScript compartidos
├── public/                       # ✅ Operaciones de lectura (RSC-safe)
│   ├── index.ts                  # Exportaciones públicas
│   ├── autorService.ts           # Servicios de autores
│   └── obraService.ts            # Servicios de obras
└── admin/                        # ⚠️ Operaciones de escritura (solo API routes)
    ├── index.ts                  # Exportaciones admin
    ├── obraAdminService.ts       # Mutaciones de obras
    └── parrafoAdminService.ts    # Mutaciones de párrafos
```

## Convenciones de Nombres

### Operaciones Públicas (Read-only)

| Patrón | Ejemplo | Uso |
|--------|---------|-----|
| `get{Entity}By{Key}` | `getAutorBySlug(slug)` | Obtener un recurso único |
| `list{Entity}` | `listPublishedAutores()` | Listar múltiples recursos |
| `list{Entity}By{Filter}` | `listPublishedWorksByAutor(autorSlug)` | Listar con filtro |
| `get{Entity}Complete` | `getPublishedWorkComplete(slug)` | Obtener con relaciones |

**Regla:** Todas las funciones públicas incluyen `Published` o `Public` en el nombre para claridad.

### Operaciones Admin (Write)

| Patrón | Ejemplo | Uso |
|--------|---------|-----|
| `create{Entity}` | `createObra(data)` | Crear nuevo recurso |
| `update{Entity}` | `updateParrafo(id, data)` | Actualizar existente |
| `delete{Entity}` | `deleteObra(id)` | Soft delete |

## Ejemplos de Implementación

### 1. Lectura: Obtener Obra Pública Completa

```typescript
// lib/services/public/obraService.ts
export async function getPublishedWorkComplete(
  obraSlug: string,
  autorSlug?: string
): Promise<ObraCompleta | null> {
  await dbConnect();
  
  // 1. Obtener obra
  const obra = await getPublishedWorkBySlug(obraSlug, autorSlug);
  if (!obra) return null;

  // 2. Obtener secciones y párrafos en paralelo
  const [seccionesRaw, parrafosRaw] = await Promise.all([
    Seccion.find({ obra: obraId, activo: true }).lean(),
    Parrafo.find({ obra: obraId, activo: true }).lean()
  ]);

  // 3. Organizar jerarquía de secciones
  // ... lógica de transformación ...

  return { obra, secciones, parrafos };
}
```

**Características:**
- ✅ Acceso directo a MongoDB (sin HTTP)
- ✅ Transformación de datos en el servicio
- ✅ Type-safe con tipos públicos
- ✅ Optimizado con `Promise.all`

### 2. Escritura: Actualizar Párrafo (Admin)

```typescript
// lib/services/admin/parrafoAdminService.ts
export async function updateParrafo(
  parrafoId: string,
  data: UpdateParrafoInput
) {
  await dbConnect();
  
  const parrafo = await Parrafo.findByIdAndUpdate(
    parrafoId,
    { ...data, fechaActualizacion: new Date() },
    { new: true, runValidators: true }
  ).populate('obra', 'slug').lean();

  if (!parrafo) return null;

  // Invalidar caché relacionado
  const obraSlug = (parrafo.obra as any).slug;
  await revalidateTag(`obra-${obraSlug}`);
  await revalidateTag(`obra-${obraSlug}-completa`);
  await revalidateTag('obras');

  return parrafo;
}
```

**Características:**
- ✅ Validación y actualización atómica
- ✅ Invalidación automática de caché
- ✅ Populate de relaciones necesarias
- ⚠️ Solo para uso en API routes con auth

## Caching Tags — Concepto y Uso

### Estrategia de Tags

Los tags permiten invalidación selectiva del caché:

```typescript
// Al crear caché
export async function getCachedPublishedWorkBySlug(
  obraSlug: string
): Promise<PublicObra | null> {
  return unstable_cache(
    async () => getPublishedWorkBySlug(obraSlug),
    [`obra-${obraSlug}`],
    {
      tags: ['obras', `obra-${obraSlug}`], // Tags
      revalidate: 3600
    }
  )();
}
```

### Jerarquía de Tags

```
obras                    # Tag global (invalida todas las obras)
├── obra-{slug}          # Tag específico de obra
└── obra-{slug}-completa # Tag de obra completa (con párrafos)

autores                  # Tag global (invalida todos los autores)
└── autor-{slug}         # Tag específico de autor
```

### Invalidación desde Admin

```typescript
// En servicio admin después de actualizar
await revalidateTag(`obra-${obraSlug}`);      // Invalida obra específica
await revalidateTag(`obra-${obraSlug}-completa`); // Invalida versión completa
await revalidateTag('obras');                // Invalida todas las obras
```

**Regla:** Siempre invalidar tags específicos Y el tag global.

### Cuándo Usar Caché

| Tipo de Dato | Caché | Revalidate | Razón |
|--------------|-------|------------|-------|
| Autores | ✅ Sí | 3600s (1h) | Cambian raramente |
| Lista de obras | ✅ Sí | 3600s (1h) | Cambian ocasionalmente |
| Obra completa | ✅ Sí | 1800s (30m) | Incluye párrafos, más pesado |
| Párrafos individuales | ❌ No | - | Cambian frecuentemente |

## Qué NO debe ir en `lib/services`

### ❌ NO incluir:

1. **Lógica de autenticación/autorización**
   - ✅ Va en: `lib/auth.ts`
   - ❌ Ejemplo incorrecto:
   ```typescript
   export async function getObra(id: string) {
     const user = await getCurrentUser(); // ❌ NO
     if (!user) throw new Error('Unauthorized');
     // ...
   }
   ```

2. **Validación de formularios**
   - ✅ Va en: Componentes o API routes
   - ❌ Ejemplo incorrecto:
   ```typescript
   export async function createObra(data: any) {
     if (!data.titulo || data.titulo.length < 3) { // ❌ NO
       throw new Error('Invalid');
     }
   }
   ```

3. **Transformaciones de UI**
   - ✅ Va en: Componentes
   - ❌ Ejemplo incorrecto:
   ```typescript
   export async function getObra(id: string) {
     const obra = await Obra.findById(id);
     return {
       ...obra,
       tituloFormateado: `<h1>${obra.titulo}</h1>` // ❌ NO
     };
   }
   ```

4. **Configuración de MongoDB**
   - ✅ Ya existe en: `lib/mongodb.ts`
   - ❌ No duplicar conexiones

5. **Utilidades generales**
   - ✅ Va en: `lib/utils/`
   - ❌ Ejemplo incorrecto:
   ```typescript
   export function formatDate(date: Date) { // ❌ NO
     return date.toLocaleDateString();
   }
   ```

### ✅ SÍ incluir:

- ✅ Consultas a MongoDB/Mongoose
- ✅ Transformaciones de datos del dominio (ej: jerarquías)
- ✅ Filtros y ordenamiento
- ✅ Populate de relaciones
- ✅ Invalidación de caché

## Principios de Diseño

### 1. Separación Clara

```
public/   → Solo lectura, RSC-safe
admin/    → Solo escritura, requiere auth
```

### 2. Server Component Safe

Todas las funciones en `public/` son:
- ✅ Sincrónicas (async/await)
- ✅ Sin efectos secundarios
- ✅ Sin dependencias de runtime (headers, cookies)
- ✅ Type-safe

### 3. Encapsulación

Todas las consultas Mongoose viven en servicios:
- ✅ No hay queries en componentes
- ✅ No hay queries en API routes (solo llaman a servicios)
- ✅ Single source of truth

### 4. Type Safety

```typescript
// Tipos públicos (sin campos internos)
export type PublicObra = Pick<IObra, 'titulo' | 'slug' | ...> & {
  _id: string;
  autor: { nombre: string; slug: string; };
};
```

### 5. Caching Ready

Todas las funciones públicas tienen versión con caché:
- `getAutorBySlug()` → `getCachedAutorBySlug()`
- `getPublishedWorkBySlug()` → `getCachedPublishedWorkBySlug()`

## Flujo de Datos

```
┌─────────────────┐
│ Server Component│
│  (RSC)          │
└────────┬────────┘
         │
         │ import { getAutorBySlug } from '@/lib/services/public'
         │
         ▼
┌─────────────────┐
│ autorService.ts │
│  (public/)      │
└────────┬────────┘
         │
         │ await dbConnect()
         │ await Autor.findOne(...)
         │
         ▼
┌─────────────────┐
│   MongoDB       │
└─────────────────┘

┌─────────────────┐
│   API Route     │
│  (Admin)         │
└────────┬────────┘
         │
         │ import { updateObra } from '@/lib/services/admin'
         │
         ▼
┌─────────────────┐
│ obraAdminService│
│  (admin/)       │
└────────┬────────┘
         │
         │ await Obra.findByIdAndUpdate(...)
         │ await revalidateTag(...)
         │
         ▼
┌─────────────────┐
│   MongoDB       │
└─────────────────┘
```

## Migración desde Anti-Patterns

### Antes (❌ Anti-pattern)

```typescript
// app/autores/[autorSlug]/page.tsx
async function getAutorData(slug: string) {
  const baseUrl = `${protocol}://${host}`;
  const response = await fetch(`${baseUrl}/api/autores`, {
    cache: 'no-store'
  });
  return await response.json();
}
```

**Problemas:**
- Overhead HTTP innecesario
- Sin caché
- Construcción frágil de URLs
- Duplicación de lógica

### Después (✅ Correcto)

```typescript
// app/autores/[autorSlug]/page.tsx
import { getCachedAutorBySlug } from '@/lib/services/public';

export default async function AutorPage({ params }) {
  const autor = await getCachedAutorBySlug(params.autorSlug);
  // ✅ Directo, con caché, type-safe
}
```

## Checklist de Implementación

- [ ] Crear estructura de carpetas (`public/`, `admin/`)
- [ ] Definir tipos en `types.ts`
- [ ] Implementar servicios públicos (read-only)
- [ ] Implementar servicios admin (write)
- [ ] Añadir versiones con caché usando `unstable_cache`
- [ ] Implementar invalidación de caché en servicios admin
- [ ] Migrar Server Components para usar servicios públicos
- [ ] Migrar API routes para usar servicios admin
- [ ] Eliminar lógica duplicada de API routes
- [ ] Documentar tags de caché y estrategia de invalidación

## Referencias

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [unstable_cache API](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [revalidateTag API](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)


