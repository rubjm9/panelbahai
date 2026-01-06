/**
 * Gestor de chunks para búsqueda optimizada
 * Divide documentos en chunks por obra/sección para carga lazy
 */

import { SearchDocument, SearchChunk, ChunkMetadata } from './types';

const CHUNK_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

export class ChunkManager {
  private chunks: Map<string, SearchChunk> = new Map();
  private metadata: Map<string, ChunkMetadata> = new Map();
  private baseChunk: SearchChunk | null = null; // Chunk con títulos de obras

  /**
   * Divide documentos en chunks por obra
   */
  createChunks(documents: SearchDocument[]): Map<string, SearchChunk> {
    const chunks = new Map<string, SearchChunk>();
    
    // Separar títulos de obras (chunk base)
    const titulos: SearchDocument[] = [];
    const porObra: Map<string, SearchDocument[]> = new Map();

    documents.forEach(doc => {
      if (doc.tipo === 'titulo') {
        titulos.push(doc);
      } else {
        const key = `${doc.autorSlug}/${doc.obraSlug}`;
        if (!porObra.has(key)) {
          porObra.set(key, []);
        }
        porObra.get(key)!.push(doc);
      }
    });

    // Crear chunk base con títulos
    if (titulos.length > 0) {
      this.baseChunk = {
        id: 'base',
        obraSlug: '',
        autorSlug: '',
        documents: titulos,
        loaded: true,
        timestamp: Date.now()
      };
      chunks.set('base', this.baseChunk);
    }

    // Crear chunks por obra
    porObra.forEach((docs, key) => {
      const [autorSlug, obraSlug] = key.split('/');
      const chunk: SearchChunk = {
        id: key,
        obraSlug,
        autorSlug,
        documents: docs,
        loaded: false,
        timestamp: 0
      };
      chunks.set(key, chunk);

      // Guardar metadata
      this.metadata.set(key, {
        obraSlug,
        autorSlug,
        documentCount: docs.length,
        size: this.estimateSize(docs)
      });
    });

    this.chunks = chunks;
    return chunks;
  }

  /**
   * Obtiene el chunk base (títulos)
   */
  getBaseChunk(): SearchChunk | null {
    return this.baseChunk;
  }

  /**
   * Obtiene un chunk por obra
   */
  getChunk(obraSlug: string, autorSlug: string): SearchChunk | null {
    const key = `${autorSlug}/${obraSlug}`;
    return this.chunks.get(key) || null;
  }

  /**
   * Carga un chunk (marca como cargado)
   */
  loadChunk(obraSlug: string, autorSlug: string, documents: SearchDocument[]): void {
    const key = `${autorSlug}/${obraSlug}`;
    const chunk = this.chunks.get(key);
    
    if (chunk) {
      chunk.documents = documents;
      chunk.loaded = true;
      chunk.timestamp = Date.now();
    } else {
      // Crear nuevo chunk si no existe
      const newChunk: SearchChunk = {
        id: key,
        obraSlug,
        autorSlug,
        documents,
        loaded: true,
        timestamp: Date.now()
      };
      this.chunks.set(key, newChunk);
    }
  }

  /**
   * Verifica si un chunk está cargado
   */
  isChunkLoaded(obraSlug: string, autorSlug: string): boolean {
    const key = `${autorSlug}/${obraSlug}`;
    const chunk = this.chunks.get(key);
    return chunk?.loaded || false;
  }

  /**
   * Obtiene todos los documentos de chunks cargados
   */
  getLoadedDocuments(): SearchDocument[] {
    const documents: SearchDocument[] = [];
    
    // Agregar chunk base
    if (this.baseChunk?.loaded) {
      documents.push(...this.baseChunk.documents);
    }

    // Agregar chunks cargados
    this.chunks.forEach(chunk => {
      if (chunk.loaded && chunk.id !== 'base') {
        documents.push(...chunk.documents);
      }
    });

    return documents;
  }

  /**
   * Obtiene metadata de chunks disponibles
   */
  getChunksMetadata(): ChunkMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Precarga chunks específicos
   */
  async preloadChunks(
    obraSlugs: Array<{ obraSlug: string; autorSlug: string }>,
    loadFunction: (obraSlug: string, autorSlug: string) => Promise<SearchDocument[]>
  ): Promise<void> {
    const promises = obraSlugs.map(({ obraSlug, autorSlug }) => {
      if (!this.isChunkLoaded(obraSlug, autorSlug)) {
        return loadFunction(obraSlug, autorSlug).then(docs => {
          this.loadChunk(obraSlug, autorSlug, docs);
        });
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  /**
   * Limpia chunks antiguos del cache
   */
  cleanupCache(): void {
    const now = Date.now();
    const chunksToRemove: string[] = [];

    this.chunks.forEach((chunk, key) => {
      if (chunk.id !== 'base' && chunk.loaded) {
        const age = now - chunk.timestamp;
        if (age > CHUNK_CACHE_DURATION) {
          chunksToRemove.push(key);
        }
      }
    });

    chunksToRemove.forEach(key => {
      const chunk = this.chunks.get(key);
      if (chunk) {
        chunk.loaded = false;
        chunk.documents = [];
      }
    });
  }

  /**
   * Limpia todos los chunks
   */
  clear(): void {
    this.chunks.clear();
    this.metadata.clear();
    this.baseChunk = null;
  }

  /**
   * Estima el tamaño de un conjunto de documentos
   */
  private estimateSize(documents: SearchDocument[]): number {
    return documents.reduce((size, doc) => {
      return size + JSON.stringify(doc).length;
    }, 0);
  }
}

// Instancia singleton
export const chunkManager = new ChunkManager();


