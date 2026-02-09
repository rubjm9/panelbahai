import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { SearchDocument } from './search';
import SearchIndex from '@/models/SearchIndex';

// Registrar modelos explícitamente para evitar errores de schema
const AutorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  biografia: { type: String },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ObraSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  descripcion: { type: String },
  esPublico: { type: Boolean, default: false },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const SeccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  nivel: { type: Number, default: 1 },
  seccionPadre: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ParrafoSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  texto: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Crear modelos
const Autor = mongoose.models.Autor || mongoose.model('Autor', AutorSchema);
const Obra = mongoose.models.Obra || mongoose.model('Obra', ObraSchema);
const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', SeccionSchema);
const Parrafo = mongoose.models.Parrafo || mongoose.model('Parrafo', ParrafoSchema);

export interface RebuildResult {
  success: boolean;
  count: number;
  obras: number;
  secciones: number;
  parrafos: number;
  error?: string;
}

/** Max paragraphs to include in the search index. Raise or remove if corpus grows; monitor memory/response size. */
export const PARRAFOS_INDEX_LIMIT = 10000;

/**
 * Builds the search documents array from the database (single source of truth for index content).
 * Caller must ensure dbConnect() has been called. Used by rebuildSearchIndex() and the search API.
 */
export async function buildSearchDocumentsFromDb(): Promise<SearchDocument[]> {
  const documents: SearchDocument[] = [];

  const obras = await Obra.find({ esPublico: true, activo: true })
    .populate('autor', 'nombre slug')
    .select('titulo slug descripcion autor');

  for (const obra of obras) {
    documents.push({
      id: `obra-${obra._id}`,
      titulo: obra.titulo,
      autor: (obra.autor as any).nombre,
      obraSlug: obra.slug,
      autorSlug: (obra.autor as any).slug,
      texto: `${obra.titulo} ${obra.descripcion || ''}`,
      tipo: 'titulo'
    });
  }

  const secciones = await Seccion.find({ activo: true })
    .populate({
      path: 'obra',
      populate: {
        path: 'autor',
        select: 'nombre slug'
      },
      match: { esPublico: true, activo: true }
    })
    .select('titulo slug obra nivel');

  for (const seccion of secciones) {
    if (seccion.obra) {
      documents.push({
        id: `seccion-${seccion._id}`,
        titulo: (seccion.obra as any).titulo,
        autor: (seccion.obra as any).autor.nombre,
        obraSlug: (seccion.obra as any).slug,
        autorSlug: (seccion.obra as any).autor.slug,
        seccion: seccion.titulo,
        texto: seccion.titulo,
        tipo: 'seccion'
      });
    }
  }

  const parrafos = await Parrafo.find({ activo: true })
    .populate({
      path: 'obra',
      populate: {
        path: 'autor',
        select: 'nombre slug'
      },
      match: { esPublico: true, activo: true }
    })
    .populate('seccion', 'titulo')
    .select('numero texto obra seccion')
    .limit(PARRAFOS_INDEX_LIMIT);

  for (const parrafo of parrafos) {
    if (parrafo.obra) {
      let textoPlano = parrafo.texto;
      if (parrafo.texto && parrafo.texto.includes('<')) {
        textoPlano = parrafo.texto
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
      }
      documents.push({
        id: `parrafo-${parrafo._id}`,
        titulo: (parrafo.obra as any).titulo,
        autor: (parrafo.obra as any).autor.nombre,
        obraSlug: (parrafo.obra as any).slug,
        autorSlug: (parrafo.obra as any).autor.slug,
        seccion: parrafo.seccion ? (parrafo.seccion as any).titulo : undefined,
        texto: textoPlano,
        numero: parrafo.numero,
        tipo: 'parrafo'
      });
    }
  }

  return documents;
}

/**
 * Reconstruye el índice de búsqueda automáticamente
 * Esta función se puede llamar desde cualquier API después de cambios en el contenido
 */
export async function rebuildSearchIndex(): Promise<RebuildResult> {
  try {
    await dbConnect();

    console.log('🔄 Reconstruyendo índice de búsqueda automáticamente...');

    const documents = await buildSearchDocumentsFromDb();

    const obrasCount = documents.filter(d => d.tipo === 'titulo').length;
    const seccionesCount = documents.filter(d => d.tipo === 'seccion').length;
    const parrafosCount = documents.filter(d => d.tipo === 'parrafo').length;

    console.log(`✅ Índice reconstruido automáticamente con ${documents.length} documentos (obras: ${obrasCount}, secciones: ${seccionesCount}, párrafos: ${parrafosCount})`);

    await SearchIndex.findOneAndUpdate(
      { version: '1.0' },
      {
        documents,
        lastUpdated: new Date(),
        count: documents.length,
        obras: obrasCount,
        secciones: seccionesCount,
        parrafos: parrafosCount
      },
      { upsert: true, new: true }
    );

    console.log('💾 Índice guardado en base de datos');

    return {
      success: true,
      count: documents.length,
      obras: obrasCount,
      secciones: seccionesCount,
      parrafos: parrafosCount
    };

  } catch (error) {
    console.error('❌ Error reconstruyendo índice automáticamente:', error);
    return {
      success: false,
      count: 0,
      obras: 0,
      secciones: 0,
      parrafos: 0,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

const REBUILD_DEBOUNCE_MS = 3000;
let rebuildTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Reconstruye el índice de búsqueda de forma asíncrona (no bloquea la respuesta).
 * Debounced: múltiples llamadas en corto tiempo coalescen en una sola reconstrucción.
 */
export async function rebuildSearchIndexAsync(): Promise<void> {
  if (rebuildTimeoutId !== null) {
    clearTimeout(rebuildTimeoutId);
  }
  rebuildTimeoutId = setTimeout(() => {
    rebuildTimeoutId = null;
    rebuildSearchIndex().catch(error => {
      console.error('❌ Error en reconstrucción asíncrona del índice:', error);
    });
  }, REBUILD_DEBOUNCE_MS);
}
