# Service Layer — Design Document

## Estructura de Carpetas

```
lib/services/
├── README.md                    # Este documento
├── public/                      # Operaciones de lectura pública (RSC-safe)
│   ├── autorService.ts          # Servicios de autores (públicos)
│   ├── obraService.ts           # Servicios de obras (públicos)
│   └── parrafoService.ts        # Servicios de párrafos (públicos)
├── admin/                       # Operaciones de escritura admin (solo API routes)
│   ├── autorAdminService.ts     # Mutaciones de autores
│   ├── obraAdminService.ts      # Mutaciones de obras
│   └── parrafoAdminService.ts   # Mutaciones de párrafos
└── types.ts                     # Tipos compartidos
```

## Convenciones de Nombres

### Operaciones Públicas (Read-only)
- **Prefijo `get`**: Obtener un recurso único
  - `getAutorBySlug(slug: string)`
  - `getPublishedWorkBySlug(slug: string, autorSlug?: string)`
  
- **Prefijo `list`**: Obtener múltiples recursos
  - `listPublishedAutores()`
  - `listPublishedWorksByAutor(autorSlug: string)`

- **Prefijo `find`**: Búsquedas con criterios
  - `findPublishedParagraphsByWork(obraId: string)`

### Operaciones Admin (Write)
- **Prefijo `create`**: Crear nuevo recurso
  - `createObra(data: CreateObraInput)`
  
- **Prefijo `update`**: Actualizar recurso existente
  - `updateParrafo(parrafoId: string, data: UpdateParrafoInput)`
  
- **Prefijo `delete`**: Eliminar (soft delete)
  - `deleteObra(obraId: string)`

## Principios de Diseño

1. **Separación clara**: `public/` para lectura, `admin/` para escritura
2. **Server Component safe**: Todo en `public/` es seguro para importar en RSC
3. **Encapsulación**: Todas las consultas Mongoose viven aquí
4. **Caching tags**: Preparado para `revalidateTag` (Next.js 14+)
5. **Type safety**: Tipos TypeScript estrictos

## Caching Tags

Los servicios públicos deben usar `unstable_cache` con tags para invalidación selectiva:

```typescript
import { unstable_cache } from 'next/cache';

export const getAutorBySlug = unstable_cache(
  async (slug: string) => {
    // ... query
  },
  ['autor-by-slug'],
  {
    tags: ['autores', `autor-${slug}`],
    revalidate: 3600 // 1 hora
  }
);
```

**Tags recomendados:**
- `autores` - Invalidar todos los autores
- `autor-{slug}` - Invalidar autor específico
- `obras` - Invalidar todas las obras
- `obra-{slug}` - Invalidar obra específica
- `obra-{obraId}-parrafos` - Invalidar párrafos de una obra

**Invalidación desde admin:**
```typescript
import { revalidateTag } from 'next/cache';

// En admin service después de actualizar
await revalidateTag(`obra-${obraSlug}`);
await revalidateTag('obras');
```

## Qué NO debe ir en `lib/services`

❌ **NO incluir:**
- Lógica de autenticación/autorización (va en `lib/auth.ts`)
- Validación de formularios (va en componentes o API routes)
- Transformaciones de UI (va en componentes)
- Lógica de negocio compleja (va en casos de uso separados si crece)
- Configuración de MongoDB (ya está en `lib/mongodb.ts`)
- Utilidades generales (va en `lib/utils/`)

✅ **SÍ incluir:**
- Consultas a MongoDB/Mongoose
- Transformaciones de datos para el dominio
- Organización de datos (ej: jerarquías de secciones)
- Filtros y ordenamiento


