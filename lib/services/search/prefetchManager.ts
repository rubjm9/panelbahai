/**
 * Gestor de prefetching inteligente para chunks de búsqueda
 * Precarga contenido basado en patrones de uso y proximidad del usuario
 */

import { SearchDocument } from './types';
import { chunkManager } from './chunkManager';

interface PrefetchTarget {
  obraSlug: string;
  autorSlug: string;
  priority: number;
  timestamp: number;
}

class PrefetchManager {
  private prefetchQueue: PrefetchTarget[] = [];
  private prefetching = new Set<string>();
  private readonly MAX_CONCURRENT = 3;
  private readonly MAX_QUEUE_SIZE = 20;
  private popularObras: Map<string, number> = new Map(); // obraSlug -> visit count

  /**
   * Agregar obra a la cola de prefetch
   */
  addToQueue(obraSlug: string, autorSlug: string, priority: number = 1): void {
    const key = `${autorSlug}/${obraSlug}`;
    
    // Evitar duplicados
    if (this.prefetchQueue.some(t => `${t.autorSlug}/${t.obraSlug}` === key)) {
      return;
    }

    // Si ya está cargado, no hacer nada
    if (chunkManager.isChunkLoaded(obraSlug, autorSlug)) {
      return;
    }

    // Si ya está en proceso de prefetch, no agregar
    if (this.prefetching.has(key)) {
      return;
    }

    // Agregar a la cola
    this.prefetchQueue.push({
      obraSlug,
      autorSlug,
      priority,
      timestamp: Date.now()
    });

    // Ordenar por prioridad (mayor primero)
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);

    // Limitar tamaño de cola
    if (this.prefetchQueue.length > this.MAX_QUEUE_SIZE) {
      this.prefetchQueue = this.prefetchQueue.slice(0, this.MAX_QUEUE_SIZE);
    }

    // Procesar cola
    this.processQueue();
  }

  /**
   * Procesar cola de prefetch
   */
  private async processQueue(): Promise<void> {
    // No procesar si ya hay demasiadas peticiones en curso
    if (this.prefetching.size >= this.MAX_CONCURRENT) {
      return;
    }

    // Obtener siguiente elemento de la cola
    const target = this.prefetchQueue.shift();
    if (!target) {
      return;
    }

    const key = `${target.autorSlug}/${target.obraSlug}`;
    
    // Si ya está cargado, continuar con el siguiente
    if (chunkManager.isChunkLoaded(target.obraSlug, target.autorSlug)) {
      this.processQueue();
      return;
    }

    this.prefetching.add(key);

    try {
      // Cargar chunk desde API
      const response = await fetch(`/api/search?buildIndex=true`);
      if (!response.ok) {
        throw new Error('Error al cargar chunk');
      }

      const { data: documents } = await response.json();
      
      // Filtrar documentos de la obra específica
      const obraDocuments = documents.filter(
        (doc: SearchDocument) => 
          doc.obraSlug === target.obraSlug && doc.autorSlug === target.autorSlug
      );

      if (obraDocuments.length > 0) {
        chunkManager.loadChunk(target.obraSlug, target.autorSlug, obraDocuments);
        
        // Agregar al índice usando searchEngine
        const { searchEngine } = await import('@/utils/search');
        const allLoadedDocs = chunkManager.getLoadedDocuments();
        searchEngine.buildIndex(allLoadedDocs);
        
        console.log(`📦 Chunk precargado: ${target.obraSlug} (${obraDocuments.length} documentos)`);
      }
    } catch (error) {
      console.warn(`Error precargando chunk ${key}:`, error);
    } finally {
      this.prefetching.delete(key);
      // Continuar procesando cola
      this.processQueue();
    }
  }

  /**
   * Registrar visita a una obra (para determinar popularidad)
   */
  recordVisit(obraSlug: string, autorSlug: string): void {
    const key = `${autorSlug}/${obraSlug}`;
    const currentCount = this.popularObras.get(key) || 0;
    this.popularObras.set(key, currentCount + 1);

    // Si es popular, agregar a cola de prefetch con alta prioridad
    if (currentCount >= 2) {
      this.addToQueue(obraSlug, autorSlug, 5);
    }
  }

  /**
   * Precargar obras populares
   */
  prefetchPopularObras(limit: number = 5): void {
    const sorted = Array.from(this.popularObras.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    sorted.forEach(([key, count]) => {
      const [autorSlug, obraSlug] = key.split('/');
      if (!chunkManager.isChunkLoaded(obraSlug, autorSlug)) {
        this.addToQueue(obraSlug, autorSlug, count);
      }
    });
  }

  /**
   * Precargar basado en resultados de búsqueda
   */
  prefetchFromSearchResults(results: Array<{ obraSlug: string; autorSlug: string }>): void {
    // Precargar las primeras 3 obras de los resultados
    results.slice(0, 3).forEach(result => {
      if (!chunkManager.isChunkLoaded(result.obraSlug, result.autorSlug)) {
        this.addToQueue(result.obraSlug, result.autorSlug, 3);
      }
    });
  }

  /**
   * Limpiar cola de prefetch
   */
  clearQueue(): void {
    this.prefetchQueue = [];
  }

  /**
   * Obtener estadísticas de prefetch
   */
  getStats(): {
    queueSize: number;
    prefetching: number;
    popularObras: number;
  } {
    return {
      queueSize: this.prefetchQueue.length,
      prefetching: this.prefetching.size,
      popularObras: this.popularObras.size
    };
  }
}

// Instancia singleton
export const prefetchManager = new PrefetchManager();

