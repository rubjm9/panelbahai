/**
 * Servicio principal de búsqueda optimizado
 * Soporta chunks, Web Worker y compatibilidad con API existente
 */

import { SearchEngine as BaseSearchEngine } from '@/utils/search';
import { chunkManager } from './chunkManager';
import { SearchDocument, SearchResult } from './types';

export class OptimizedSearchEngine extends BaseSearchEngine {
  private useWorker: boolean = false;
  private workerReady: boolean = false;

  constructor(useWorker: boolean = true) {
    super();
    this.useWorker = useWorker && typeof window !== 'undefined' && typeof Worker !== 'undefined';
  }

  /**
   * Construir índice con soporte para chunks
   */
  buildIndex(documents: SearchDocument[]): void {
    // Crear chunks
    chunkManager.createChunks(documents);

    // Construir índice base con chunk base
    const baseChunk = chunkManager.getBaseChunk();
    if (baseChunk) {
      super.buildIndex(baseChunk.documents);
    } else {
      // Fallback: construir con todos los documentos
      super.buildIndex(documents);
    }
  }

  /**
   * Cargar chunk adicional
   */
  loadChunk(obraSlug: string, autorSlug: string, documents: SearchDocument[]): void {
    chunkManager.loadChunk(obraSlug, autorSlug, documents);

    // Reconstruir índice con todos los documentos cargados
    const allLoadedDocs = chunkManager.getLoadedDocuments();
    super.buildIndex(allLoadedDocs);
  }

  /**
   * Precargar chunks
   */
  async preloadChunks(
    obraSlugs: Array<{ obraSlug: string; autorSlug: string }>
  ): Promise<void> {
    const loadFunction = async (obraSlug: string, autorSlug: string): Promise<SearchDocument[]> => {
      // Cargar desde API
      const response = await fetch('/api/search?buildIndex=true');
      if (!response.ok) {
        throw new Error('Error al cargar chunk');
      }
      const { data: documents } = await response.json();
      return documents.filter(
        (doc: SearchDocument) =>
          doc.obraSlug === obraSlug && doc.autorSlug === autorSlug
      );
    };

    await chunkManager.preloadChunks(obraSlugs, loadFunction);

    // Reconstruir índice con todos los documentos cargados
    const allLoadedDocs = chunkManager.getLoadedDocuments();
    if (allLoadedDocs.length > 0) {
      super.buildIndex(allLoadedDocs);
    }
  }

  /**
   * Realizar búsqueda (compatible con API existente)
   */
  search(query: string, limit: number = 50): { results: SearchResult[]; total: number } {
    // Usar método base que ya tiene toda la lógica de búsqueda
    return super.search(query, limit);
  }

  /**
   * Limpiar índice y chunks
   */
  clearIndex(): void {
    super.clearIndex();
    chunkManager.clear();
  }

  /**
   * Obtener metadata de chunks
   */
  getChunksMetadata() {
    return chunkManager.getChunksMetadata();
  }

  /**
   * Verificar si un chunk está cargado
   */
  isChunkLoaded(obraSlug: string, autorSlug: string): boolean {
    return chunkManager.isChunkLoaded(obraSlug, autorSlug);
  }
}

// Exportar instancia para compatibilidad
export const optimizedSearchEngine = new OptimizedSearchEngine();

// Re-exportar tipos y clase base
export type { SearchDocument, SearchResult } from './types';
export { SearchEngine } from '@/utils/search';


