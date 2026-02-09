/**
 * Hook para comunicación con Web Worker de búsqueda
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { SearchWorkerMessage, SearchWorkerResponse, SearchDocument, SearchResult } from '@/lib/services/search/types';

interface UseSearchWorkerOptions {
  enabled?: boolean;
  onError?: (error: string) => void;
}

export function useSearchWorker(options: UseSearchWorkerOptions = {}) {
  const { enabled = true, onError } = options;
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pendingRequestsRef = useRef<Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  // Inicializar Worker
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    // Verificar soporte de Web Workers
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers no están disponibles, usando fallback');
      setIsReady(false);
      return;
    }

    // Prevenir múltiples inicializaciones
    if (workerRef.current) {
      return;
    }

    let worker: Worker | null = null;
    let hasErrored = false;

    try {
      worker = new Worker('/workers/search.worker.js');
      
      worker.onmessage = (event: MessageEvent<SearchWorkerResponse>) => {
        const { type, payload, id, error } = event.data;

        if (error) {
          const request = pendingRequestsRef.current.get(id || '');
          if (request) {
            request.reject(new Error(error));
            pendingRequestsRef.current.delete(id || '');
          }
          onError?.(error);
          return;
        }

        if (id && pendingRequestsRef.current.has(id)) {
          const request = pendingRequestsRef.current.get(id)!;
          request.resolve(payload);
          pendingRequestsRef.current.delete(id);
        }

        if (type === 'INDEX_BUILT') {
          setIsReady(true);
          setIsLoading(false);
        }
      };

      worker.onerror = (error) => {
        if (!hasErrored) {
          hasErrored = true;
          console.warn('Web Worker no disponible, usando fallback al main thread');
          setIsReady(false);
          setIsLoading(false);
          
          // Limpiar worker
          if (worker) {
            worker.terminate();
            worker = null;
            workerRef.current = null;
          }
        }
      };

      workerRef.current = worker;
      setIsReady(true);

      return () => {
        if (worker) {
          worker.terminate();
        }
        workerRef.current = null;
        pendingRequestsRef.current.clear();
      };
    } catch (error) {
      console.warn('Error inicializando Web Worker, usando fallback:', error);
      setIsReady(false);
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    }
  }, [enabled, onError]);

  // Enviar mensaje al Worker
  const sendMessage = useCallback(<T = any>(
    type: SearchWorkerMessage['type'],
    payload?: any
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker no está disponible'));
        return;
      }

      const id = `${type}-${Date.now()}-${Math.random()}`;
      const message: SearchWorkerMessage = {
        type,
        payload,
        id
      };

      pendingRequestsRef.current.set(id, { resolve, reject });

      // Timeout después de 30 segundos
      setTimeout(() => {
        if (pendingRequestsRef.current.has(id)) {
          pendingRequestsRef.current.delete(id);
          reject(new Error('Timeout esperando respuesta del Worker'));
        }
      }, 30000);

      workerRef.current.postMessage(message);
    });
  }, [isReady]);

  // Construir índice
  const buildIndex = useCallback(async (documents: SearchDocument[]): Promise<void> => {
    setIsLoading(true);
    try {
      await sendMessage('BUILD_INDEX', documents);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [sendMessage]);

  // Realizar búsqueda
  const search = useCallback(async (
    query: string,
    limit: number = 50
  ): Promise<{ results: SearchResult[]; total: number }> => {
    if (!isReady) {
      return { results: [], total: 0 };
    }

    try {
      const response = await sendMessage<{ results: SearchResult[]; total: number }>(
        'SEARCH',
        { query, limit }
      );
      return response;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return { results: [], total: 0 };
    }
  }, [isReady, sendMessage]);

  // Cargar chunk
  const loadChunk = useCallback(async (documents: SearchDocument[]): Promise<void> => {
    if (!isReady) {
      throw new Error('Worker no está disponible');
    }
    await sendMessage('LOAD_CHUNK', documents);
  }, [isReady, sendMessage]);

  // Limpiar índice
  const clearIndex = useCallback(async (): Promise<void> => {
    if (!isReady) {
      return;
    }
    setIsReady(false);
    await sendMessage('CLEAR_INDEX');
  }, [isReady, sendMessage]);

  return {
    isReady,
    isLoading,
    buildIndex,
    search,
    loadChunk,
    clearIndex
  };
}

