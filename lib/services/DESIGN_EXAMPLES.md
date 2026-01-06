# Ejemplos de Uso — Service Layer

## Uso en Server Components (Lectura Pública)

### Ejemplo 1: Página de Autor

```typescript
// app/autores/[autorSlug]/page.tsx
import { notFound } from 'next/navigation';
import { getAutorBySlug, listPublishedWorksByAutor } from '@/lib/services/public/autorService';
import { listPublishedWorksByAutor as listObras } from '@/lib/services/public/obraService';

export default async function AutorPage({ 
  params 
}: { 
  params: { autorSlug: string } 
}) {
  // ✅ Acceso directo a servicios (sin fetch)
  const autor = await getAutorBySlug(params.autorSlug);
  
  if (!autor) {
    notFound();
  }
  
  const obras = await listPublishedWorksByAutor(params.autorSlug);
  
  return (
    <div>
      <h1>{autor.nombre}</h1>
      {/* ... render obras */}
    </div>
  );
}
```

### Ejemplo 2: Página de Lectura (Obra Completa)

```typescript
// app/autores/[autorSlug]/[obraSlug]/page.tsx
import { notFound } from 'next/navigation';
import { getPublishedWorkComplete } from '@/lib/services/public/obraService';
import ReadingView from '@/components/reading/ReadingView';

export default async function ReadingPage({ 
  params 
}: { 
  params: { autorSlug: string; obraSlug: string } 
}) {
  // ✅ Una sola llamada obtiene todo (obra + secciones + párrafos)
  const data = await getPublishedWorkComplete(
    params.obraSlug,
    params.autorSlug
  );
  
  if (!data) {
    notFound();
  }
  
  return (
    <ReadingView 
      obra={data.obra}
      secciones={data.secciones}
      parrafos={data.parrafos}
    />
  );
}
```

### Ejemplo 3: Con Caché

```typescript
// app/autores/[autorSlug]/page.tsx
import { getCachedAutorBySlug, listCachedPublishedAutores } from '@/lib/services/public/autorService';

export default async function AutorPage({ params }: { params: { autorSlug: string } }) {
  // ✅ Versión con caché (recomendado para datos que cambian poco)
  const autor = await getCachedAutorBySlug(params.autorSlug);
  
  // ...
}
```

## Uso en API Routes (Escritura Admin)

### Ejemplo 1: Actualizar Párrafo

```typescript
// app/api/admin/parrafos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { updateParrafo } from '@/lib/services/admin/parrafoAdminService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ Verificar autenticación
  const user = await verifyAuth(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  
  try {
    // ✅ Usar servicio admin (incluye invalidación de caché)
    const parrafo = await updateParrafo(params.id, {
      texto: body.texto,
      numero: body.numero,
    });
    
    if (!parrafo) {
      return NextResponse.json(
        { error: 'Párrafo no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: parrafo });
  } catch (error) {
    console.error('Error updating parrafo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

### Ejemplo 2: Crear Obra

```typescript
// app/api/admin/obras/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createObra } from '@/lib/services/admin/obraAdminService';

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || !user.isAdmin) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  
  try {
    // ✅ Servicio admin maneja validación, slug único, y caché
    const obra = await createObra({
      titulo: body.titulo,
      autor: body.autor,
      descripcion: body.descripcion,
      esPublico: body.esPublico ?? false,
    });
    
    return NextResponse.json(
      { success: true, data: obra },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating obra:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## Invalidación Manual de Caché

```typescript
// app/api/admin/search/rebuild/route.ts
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  // Invalidar todo el caché de obras y autores
  await revalidateTag('obras');
  await revalidateTag('autores');
  
  // O invalidar una obra específica
  // await revalidateTag('obra-kitab-i-iqan');
  
  return NextResponse.json({ success: true });
}
```

## Comparación: Antes vs Después

### ❌ Antes (Anti-pattern)

```typescript
// app/autores/[autorSlug]/page.tsx
async function getAutorData(slug: string) {
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  
  const response = await fetch(`${baseUrl}/api/autores`, {
    cache: 'no-store' // ❌ Desactiva caché
  });
  
  const { data: autores } = await response.json();
  return autores.find((a: any) => a.slug === slug);
}
```

**Problemas:**
- Overhead HTTP innecesario
- Construcción frágil de URLs
- Sin caché
- Duplicación de lógica

### ✅ Después (Correcto)

```typescript
// app/autores/[autorSlug]/page.tsx
import { getCachedAutorBySlug } from '@/lib/services/public/autorService';

export default async function AutorPage({ params }: { params: { autorSlug: string } }) {
  const autor = await getCachedAutorBySlug(params.autorSlug);
  // ✅ Acceso directo, con caché, sin overhead HTTP
}
```

## Migración Gradual

1. **Fase 1**: Crear servicios públicos y migrar Server Components
2. **Fase 2**: Crear servicios admin y migrar API routes
3. **Fase 3**: Eliminar lógica duplicada de API routes
4. **Fase 4**: Implementar caché con `unstable_cache`


