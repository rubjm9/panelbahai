/**
 * Hook principal para búsqueda optimizada
 * Integra Web Worker, chunks y cache
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchWorker } from './useSearchWorker';
import { chunkManager } from '@/lib/services/search/chunkManager';
import { SearchDocument, SearchResult } from '@/lib/services/search/types';

interface UseSearchOptions {
  autoInitialize?: boolean;
  cacheResults?: boolean;
  cacheDuration?: number; // en milisegundos
}

interface CachedResult {
  results: SearchResult[];
  total: number;
  timestamp: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    autoInitialize = true,
    cacheResults = true,
    cacheDuration = 5 * 60 * 1000 // 5 minutos
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // Deshabilitar Web Worker por ahora (requiere bundler para incluir lunr)
  // Usar fallback al main thread que ya funciona
  const worker = useSearchWorker({
    enabled: false, // Deshabilitado hasta que se configure bundler para el worker
    onError: (err) => setError(err)
  });

  const resultsCacheRef = useRef<Map<string, CachedResult>>(new Map());
  const initializationRef = useRef(false);

  // Inicializar índice base
  const initialize = useCallback(async () => {
    if (initializationRef.current || worker.isLoading) {
      return;
    }

    initializationRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Cargar chunk base desde API
      const response = await fetch('/api/search?buildIndex=true');
      if (!response.ok) {
        throw new Error('Error al obtener datos para el índice');
      }

      const { data: documents } = await response.json();
      
      if (!documents || documents.length === 0) {
        throw new Error('No se encontraron documentos para indexar');
      }

      // Crear chunks
      chunkManager.createChunks(documents);

      // Construir índice usando searchEngine directamente (fallback al main thread)
      // El Web Worker está deshabilitado por ahora
      const { searchEngine } = await import('@/utils/search');
      const baseChunk = chunkManager.getBaseChunk();
      if (baseChunk) {
        searchEngine.buildIndex(baseChunk.documents);
      } else {
        searchEngine.buildIndex(documents);
      }

      setIsInitialized(true);
      console.log(`✅ Índice de búsqueda inicializado con ${documents.length} documentos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error inicializando búsqueda:', err);
    } finally {
      setIsLoading(false);
      initializationRef.current = false;
    }
  }, [worker]);

  // Auto-inicializar si está habilitado
  useEffect(() => {
    if (autoInitialize && !isInitialized && !initializationRef.current) {
      initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  // Realizar búsqueda
  const search = useCallback(async (
    query: string,
    limit: number = 50
  ): Promise<{ results: SearchResult[]; total: number }> => {
    if (!isInitialized) {
      return { results: [], total: 0 };
    }

    if (query.length < 3) {
      setResults([]);
      setTotalResults(0);
      return { results: [], total: 0 };
    }

    // Verificar cache
    if (cacheResults) {
      const cached = resultsCacheRef.current.get(query);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setResults(cached.results);
        setTotalResults(cached.total);
        return cached;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usar searchEngine directamente (fallback al main thread)
      const { searchEngine } = await import('@/utils/search');
      const { results, total } = searchEngine.search(query, limit);

      // Guardar en cache
      if (cacheResults) {
        resultsCacheRef.current.set(query, {
          results,
          total,
          timestamp: Date.now()
        });
      }

      setResults(results);
      setTotalResults(total);

      return { results, total };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en búsqueda';
      setError(errorMessage);
      setResults([]);
      setTotalResults(0);
      return { results: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, cacheResults, cacheDuration]);

  // Cargar chunk adicional
  const loadChunk = useCallback(async (
    obraSlug: string,
    autorSlug: string
  ): Promise<void> => {
    if (!isInitialized || chunkManager.isChunkLoaded(obraSlug, autorSlug)) {
      return;
    }

    try {
      // Cargar documentos de la obra desde API
      // Nota: esto requeriría un endpoint específico o modificar el existente
      // Por ahora, usamos el endpoint general y filtramos
      const response = await fetch('/api/search?buildIndex=true');
      if (!response.ok) {
        throw new Error('Error al cargar chunk');
      }

      const { data: documents } = await response.json();
      const obraDocuments = documents.filter(
        (doc: SearchDocument) => 
          doc.obraSlug === obraSlug && doc.autorSlug === autorSlug
      );

      if (obraDocuments.length > 0) {
        chunkManager.loadChunk(obraSlug, autorSlug, obraDocuments);
        
        // Agregar al índice usando searchEngine directamente
        const { searchEngine } = await import('@/utils/search');
        const allLoadedDocs = chunkManager.getLoadedDocuments();
        searchEngine.buildIndex(allLoadedDocs);
      }
    } catch (err) {
      console.error('Error cargando chunk:', err);
      throw err;
    }
  }, [isInitialized, worker]);

  // Limpiar cache
  const clearCache = useCallback(() => {
    resultsCacheRef.current.clear();
    chunkManager.cleanupCache();
  }, []);

  // Reconstruir índice
  const rebuild = useCallback(async () => {
    setIsInitialized(false);
    const { searchEngine } = await import('@/utils/search');
    searchEngine.clearIndex();
    chunkManager.clear();
    resultsCacheRef.current.clear();
    await initialize();
  }, [initialize]);

  return {
    isInitialized,
    isLoading,
    error,
    results,
    totalResults,
    search,
    loadChunk,
    clearCache,
    rebuild,
    initialize
  };
}

