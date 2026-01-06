# Fase 3: Importación y Gestión de Datos

## Resumen

La Fase 3 implementa un sistema robusto de importación de documentos Word, gestión de datos con UUIDs estables y un sistema de revisiones que preserva el histórico de cambios.

## Características Principales

### 1. Importación Segura de Word

- **Validación estricta**: Verificación de tipo MIME, tamaño y extensión
- **Detección de macros**: Rechazo automático de archivos con macros por seguridad
- **Sanitización HTML**: Limpieza estricta de HTML usando DOMPurify
- **Parsing mejorado**: Extracción estructurada de secciones y párrafos

### 2. Sistema de UUIDs

- **IDs estables**: Cada obra, párrafo y sección tiene un UUID único
- **Compatibilidad**: UUIDs como campo adicional, manteniendo ObjectIds de MongoDB
- **Enlaces permanentes**: Los UUIDs permiten enlaces estables que no cambian

### 3. Sistema de Revisiones

- **Histórico preservado**: Hasta 10 revisiones por obra/párrafo
- **Rotación automática**: Las revisiones más antiguas se desactivan cuando se alcanza el límite
- **Reversión**: Posibilidad de revertir a cualquier versión anterior
- **Registro de cambios**: Cada revisión registra autor, fecha y descripción

### 4. Publicación Controlada

- **Sin mutación de histórico**: Cambiar estado de publicación no afecta el contenido histórico
- **Registro de autor**: Cada cambio de estado se registra con usuario y timestamp
- **Invalidación de caché**: Actualización automática de caché al publicar/despublicar

## Arquitectura

### Flujo de Importación

```
Archivo Word → Validación → Detección de Macros → Parsing → Sanitización → 
Almacenamiento con UUIDs → Creación de Revisión Inicial
```

### Flujo de Revisiones

```
Edición → Crear Revisión → Verificar Límite (10) → Rotar si necesario → 
Actualizar Revisión Actual
```

### Flujo de Publicación

```
Cambio de Estado → Crear Revisión → Actualizar Estado → 
Invalidar Caché → Preservar Histórico
```

## Uso

### Importar Documento Word

```typescript
// El endpoint /api/admin/import/word maneja automáticamente:
// - Validación de archivo
// - Detección de macros
// - Parsing y sanitización
// - Generación de UUIDs
// - Creación de revisiones iniciales
```

### Crear Revisión Manualmente

```typescript
POST /api/admin/obras/[id]/revisions
{
  "cambios": "Descripción de los cambios"
}
```

### Listar Revisiones

```typescript
GET /api/admin/obras/[id]/revisions
// Retorna lista de todas las revisiones ordenadas por versión
```

### Revertir a Versión Anterior

```typescript
PUT /api/admin/obras/[id]/revisions
{
  "version": 3
}
```

### Publicar Obra

```typescript
POST /api/admin/obras/[id]/publish
```

### Despublicar Obra

```typescript
DELETE /api/admin/obras/[id]/publish
```

### Cambiar Estado de Publicación

```typescript
PUT /api/admin/obras/[id]/publish
{
  "estado": "publicado",
  "esPublico": true
}
```

## Migración de Datos Existentes

Para migrar datos existentes a UUIDs y crear revisiones iniciales:

```bash
node scripts/migrate-to-uuids.js
```

Este script:
- Genera UUIDs para todas las obras, párrafos y secciones sin UUID
- Crea revisiones iniciales para obras y párrafos existentes
- Valida que la migración fue exitosa

## Validaciones de Seguridad

### Archivos Word

- **Tipo MIME**: Solo acepta `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Tamaño máximo**: 10MB
- **Extensión**: Solo `.docx` (no `.doc` antiguo)
- **Macros**: Rechazo automático si se detectan macros
- **Magic numbers**: Verificación de tipo real del archivo

### HTML Sanitizado

- **Whitelist estricto**: Solo tags permitidos (`p`, `strong`, `em`, `blockquote`, etc.)
- **Atributos limitados**: Solo `href`, `class`, `id`
- **Eliminación de scripts**: Todos los scripts y event handlers son removidos
- **Validación de enlaces**: Solo `http`, `https`, `mailto`, `tel`

## Modelos de Datos

### Obra

```typescript
{
  _id: ObjectId,
  uuid: String,              // UUID único
  titulo: String,
  slug: String,
  autor: ObjectId,
  contenido: String,
  estado: 'publicado' | 'borrador' | 'archivado',
  esPublico: Boolean,
  revisionActual: ObjectId,  // Referencia a RevisionObra
  revisiones: [ObjectId]     // Array de revisiones (máx 10)
}
```

### Parrafo

```typescript
{
  _id: ObjectId,
  uuid: String,              // UUID único
  numero: Number,
  texto: String,
  obra: ObjectId,
  seccion: ObjectId,
  revisionActual: ObjectId,  // Referencia a RevisionParrafo
  revisiones: [ObjectId]     // Array de revisiones (máx 10)
}
```

### Seccion

```typescript
{
  _id: ObjectId,
  uuid: String,              // UUID único
  titulo: String,
  slug: String,
  obra: ObjectId,
  nivel: Number
}
```

### RevisionObra

```typescript
{
  _id: ObjectId,
  obra: ObjectId,
  version: Number,
  contenido: String,
  estado: String,
  esPublico: Boolean,
  autorRevision: ObjectId,   // Usuario que hizo el cambio
  fechaRevision: Date,
  cambios: String,            // Descripción opcional
  activo: Boolean
}
```

### RevisionParrafo

```typescript
{
  _id: ObjectId,
  parrafo: ObjectId,
  version: Number,
  texto: String,
  numero: Number,
  autorRevision: ObjectId,
  fechaRevision: Date,
  cambios: String,
  activo: Boolean
}
```

## Servicios

### wordParserService

- `parseWordDocument(file, options)`: Parsea un documento Word

### revisionService

- `createObraRevision(obraId, userId, cambios)`: Crea nueva revisión de obra
- `createParrafoRevision(parrafoId, userId, cambios)`: Crea nueva revisión de párrafo
- `listObraRevisions(obraId)`: Lista revisiones de una obra
- `getObraRevision(obraId, version)`: Obtiene revisión específica
- `revertObraToRevision(obraId, version, userId)`: Revierte a versión anterior

### publicationService

- `publishObra(obraId, userId)`: Publica una obra
- `unpublishObra(obraId, userId)`: Despublica una obra
- `changePublicationState(obraId, estado, esPublico, userId)`: Cambia estado

## Consideraciones de Rendimiento

1. **Rotación de revisiones**: La rotación puede ser costosa en obras grandes. Se ejecuta automáticamente cuando se alcanza el límite de 10 revisiones.

2. **Espacio de almacenamiento**: 10 revisiones por obra/párrafo aumenta el uso de almacenamiento. Considerar compresión o archivado de revisiones antiguas.

3. **Índices**: Los UUIDs están indexados para búsquedas rápidas. Los índices compuestos optimizan queries de revisiones.

## Troubleshooting

### Error: "El archivo contiene macros"

**Solución**: El archivo Word tiene macros. Abre el archivo en Word, elimina las macros y vuelve a guardar como `.docx`.

### Error: "No se pudo extraer contenido del documento"

**Solución**: Verifica que el documento tenga contenido y que los estilos de título estén correctamente aplicados.

### Error: "UUID duplicado"

**Solución**: Extremadamente raro. Ejecuta el script de migración nuevamente o verifica la integridad de la base de datos.

### Las revisiones no se crean automáticamente

**Solución**: Verifica que el `userId` se esté pasando correctamente a las funciones de creación/actualización.

## Próximos Pasos

- [ ] Compresión de revisiones antiguas
- [ ] Exportación de revisiones a archivos
- [ ] Comparación visual entre revisiones
- [ ] Notificaciones de cambios
- [ ] Historial de publicación/despublicación

---

**Última actualización**: Fase 3 completada


