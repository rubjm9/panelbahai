/**
 * Hook principal para búsqueda optimizada
 * Integra Web Worker, chunks y cache
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchWorker } from './useSearchWorker';
import { chunkManager } from '@/lib/services/search/chunkManager';
import { indexedDBStorage } from '@/lib/services/search/indexedDBStorage';
import { prefetchManager } from '@/lib/services/search/prefetchManager';
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
  accessCount: number;
  lastAccess: number;
}

/**
 * Calcular distancia de Levenshtein entre dos strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Encontrar términos similares en el cache
 */
function findSimilarCachedQuery(
  query: string,
  cache: Map<string, CachedResult>,
  maxDistance: number = 2
): string | null {
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  
  for (const cachedQuery of cache.keys()) {
    // Verificar si es prefijo
    if (cachedQuery.toLowerCase().startsWith(query.toLowerCase()) || 
        query.toLowerCase().startsWith(cachedQuery.toLowerCase())) {
      return cachedQuery;
    }
    
    // Calcular distancia de Levenshtein
    const distance = levenshteinDistance(query.toLowerCase(), cachedQuery.toLowerCase());
    
    if (distance <= maxDistance && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = cachedQuery;
    }
  }
  
  return bestMatch;
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

  // Habilitar Web Worker para búsquedas no bloqueantes
  const worker = useSearchWorker({
    enabled: true,
    onError: (err) => {
      setError(err);
      console.warn('Web Worker no disponible, usando fallback al main thread:', err);
    }
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
      let documents: SearchDocument[] | null = null;

      // Intentar cargar desde IndexedDB primero
      if (indexedDBStorage.isAvailable()) {
        try {
          const cachedDocuments = await indexedDBStorage.getIndex();
          if (cachedDocuments && cachedDocuments.length > 0) {
            documents = cachedDocuments;
            console.log(`📦 Índice cargado desde cache (${documents.length} documentos)`);
          }
        } catch (error) {
          console.warn('Error cargando desde IndexedDB:', error);
        }
      }

      // Si no hay cache válido, cargar desde API
      if (!documents) {
        const response = await fetch('/api/search?buildIndex=true');
        if (!response.ok) {
          throw new Error('Error al obtener datos para el índice');
        }

        const { data: fetchedDocuments, lastUpdated } = await response.json();
        
        if (!fetchedDocuments || fetchedDocuments.length === 0) {
          throw new Error('No se encontraron documentos para indexar');
        }

        documents = fetchedDocuments;

        // Guardar en IndexedDB para próxima vez
        if (indexedDBStorage.isAvailable()) {
          try {
            const version = lastUpdated ? new Date(lastUpdated).getTime().toString() : Date.now().toString();
            await indexedDBStorage.saveIndex(documents, version);
            console.log(`💾 Índice guardado en cache (${documents.length} documentos)`);
          } catch (error) {
            console.warn('Error guardando en IndexedDB:', error);
            // Continuar aunque falle el guardado
          }
        }
      }

      // Crear chunks
      chunkManager.createChunks(documents);

      // Intentar usar Web Worker, fallback a main thread si no está disponible
      const baseChunk = chunkManager.getBaseChunk();
      const documentsToIndex = baseChunk ? baseChunk.documents : documents;

      if (worker.isReady) {
        // Usar Web Worker
        await worker.buildIndex(documentsToIndex);
      } else {
        // Fallback al main thread
        const { searchEngine } = await import('@/utils/search');
        searchEngine.buildIndex(documentsToIndex);
      }

      setIsInitialized(true);
      console.log(`✅ Índice de búsqueda inicializado con ${documents.length} documentos`);
      
      // Precargar obras populares después de inicializar
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          prefetchManager.prefetchPopularObras(3);
        }, 2000); // Esperar 2 segundos para no bloquear la inicialización
      }
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

    // Verificar cache (exacto, prefijo o similar)
    if (cacheResults) {
      // 1. Buscar coincidencia exacta
      const exactMatch = resultsCacheRef.current.get(query);
      if (exactMatch && Date.now() - exactMatch.timestamp < cacheDuration) {
        exactMatch.accessCount++;
        exactMatch.lastAccess = Date.now();
        setResults(exactMatch.results);
        setTotalResults(exactMatch.total);
        return { results: exactMatch.results, total: exactMatch.total };
      }
      
      // 2. Buscar por prefijo (si la query es más corta que alguna en cache)
      if (query.length >= 3) {
        for (const [cachedQuery, cached] of resultsCacheRef.current.entries()) {
          if (cachedQuery.toLowerCase().startsWith(query.toLowerCase()) ||
              query.toLowerCase().startsWith(cachedQuery.toLowerCase())) {
            const age = Date.now() - cached.timestamp;
            if (age < cacheDuration) {
              cached.accessCount++;
              cached.lastAccess = Date.now();
              // Filtrar resultados para que coincidan con la query más corta
              const filteredResults = query.length < cachedQuery.length
                ? cached.results.filter(r => 
                    r.texto.toLowerCase().includes(query.toLowerCase()) ||
                    r.titulo.toLowerCase().includes(query.toLowerCase())
                  )
                : cached.results;
              
              setResults(filteredResults);
              setTotalResults(filteredResults.length);
              return { results: filteredResults, total: filteredResults.length };
            }
          }
        }
      }
      
      // 3. Buscar términos similares (solo para queries cortas para evitar falsos positivos)
      if (query.length >= 3 && query.length <= 10) {
        const similarQuery = findSimilarCachedQuery(query, resultsCacheRef.current, 2);
        if (similarQuery) {
          const similar = resultsCacheRef.current.get(similarQuery);
          if (similar && Date.now() - similar.timestamp < cacheDuration) {
            similar.accessCount++;
            similar.lastAccess = Date.now();
            // Usar resultados similares pero filtrar por la query actual
            const filteredResults = similar.results.filter(r => 
              r.texto.toLowerCase().includes(query.toLowerCase()) ||
              r.titulo.toLowerCase().includes(query.toLowerCase())
            );
            
            setResults(filteredResults);
            setTotalResults(filteredResults.length);
            return { results: filteredResults, total: filteredResults.length };
          }
        }
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      let results: SearchResult[];
      let total: number;

      if (worker.isReady) {
        // Usar Web Worker
        const response = await worker.search(query, limit);
        results = response.results;
        total = response.total;
      } else {
        // Fallback al main thread
        const { searchEngine } = await import('@/utils/search');
        const searchResponse = searchEngine.search(query, limit);
        results = searchResponse.results;
        total = searchResponse.total;
      }

      // Guardar en cache con metadata
      if (cacheResults) {
        resultsCacheRef.current.set(query, {
          results,
          total,
          timestamp: Date.now(),
          accessCount: 1,
          lastAccess: Date.now()
        });
        
        // Limpiar cache antiguo o poco usado (LRU)
        if (resultsCacheRef.current.size > 50) {
          const entries = Array.from(resultsCacheRef.current.entries());
          // Ordenar por último acceso y eliminar los más antiguos
          entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
          const toRemove = entries.slice(0, 10); // Eliminar los 10 más antiguos
          toRemove.forEach(([key]) => resultsCacheRef.current.delete(key));
        }
      }

      setResults(results);
      setTotalResults(total);

      // Precargar chunks de los resultados
      if (results.length > 0) {
        const prefetchTargets = results.map(r => ({
          obraSlug: r.obraSlug,
          autorSlug: r.autorSlug
        }));
        prefetchManager.prefetchFromSearchResults(prefetchTargets);
      }

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
    
    // Limpiar cache de IndexedDB
    if (indexedDBStorage.isAvailable()) {
      try {
        await indexedDBStorage.clearIndex();
      } catch (error) {
        console.warn('Error limpiando IndexedDB:', error);
      }
    }
    
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

