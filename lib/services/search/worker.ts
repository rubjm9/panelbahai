/**
 * Código del Web Worker para búsqueda
 * Este archivo se importa en el worker compilado
 */

import lunr from 'lunr';
import { SearchDocument, SearchResult, SearchWorkerMessage, SearchWorkerResponse } from './types';

// Configurar Lunr para español
lunr.tokenizer.separator = /[\s\-\.]+/;

let index: lunr.Index | null = null;
let documents: Map<string, SearchDocument> = new Map();

/**
 * Construir índice Lunr
 */
function buildIndex(docs: SearchDocument[]): void {
  documents.clear();
  docs.forEach(doc => documents.set(doc.id, doc));

  index = lunr(function() {
    this.field('titulo', { boost: 10 });
    this.field('autor', { boost: 8 });
    this.field('seccion', { boost: 6 });
    this.field('texto', { boost: 1 });
    
    this.ref('id');

    docs.forEach(doc => {
      this.add({
        id: doc.id,
        titulo: doc.titulo,
        autor: doc.autor,
        seccion: doc.seccion || '',
        texto: doc.texto
      });
    });
  });
}

/**
 * Realizar búsqueda
 */
function search(query: string, limit: number = 50): SearchResult[] {
  if (!index || query.length < 3) {
    return [];
  }

  try {
    const results = index.search(query);
    const searchResults: SearchResult[] = [];

    for (let i = 0; i < Math.min(results.length, limit); i++) {
      const result = results[i];
      const doc = documents.get(result.ref);
      
      if (!doc) continue;

      searchResults.push({
        id: doc.id,
        titulo: doc.titulo,
        autor: doc.autor,
        obraSlug: doc.obraSlug,
        autorSlug: doc.autorSlug,
        seccion: doc.seccion,
        texto: doc.texto,
        fragmento: extractFragment(doc.texto, query),
        numero: doc.numero,
        tipo: doc.tipo,
        score: result.score
      });
    }

    return searchResults;
  } catch (error) {
    console.error('Error en búsqueda del worker:', error);
    return [];
  }
}

/**
 * Extraer fragmento relevante del texto
 */
function extractFragment(texto: string, query: string, maxLength: number = 200): string {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
  const textoLower = texto.toLowerCase();
  
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < textoLower.length; i++) {
    let score = 0;
    for (const term of queryTerms) {
      if (textoLower.substring(i, i + term.length) === term) {
        score += 10;
      } else if (isWordMatch(textoLower, i, term)) {
        score += 8;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) {
    return texto.substring(0, maxLength) + (texto.length > maxLength ? '...' : '');
  }

  const contextStart = Math.max(0, bestIndex - 50);
  const contextEnd = Math.min(texto.length, bestIndex + maxLength - 50);
  
  let fragment = texto.substring(contextStart, contextEnd);
  
  if (contextStart > 0) fragment = '...' + fragment;
  if (contextEnd < texto.length) fragment = fragment + '...';

  return fragment;
}

/**
 * Verificar si un término coincide como palabra completa
 */
function isWordMatch(texto: string, startIndex: number, term: string): boolean {
  const endIndex = startIndex + term.length;
  const prevChar = startIndex > 0 ? texto[startIndex - 1] : ' ';
  const nextChar = endIndex < texto.length ? texto[endIndex] : ' ';
  const isWordBoundary = !/\w/.test(prevChar) && !/\w/.test(nextChar);
  return isWordBoundary && texto.substring(startIndex, endIndex) === term;
}

/**
 * Manejar mensajes del main thread
 */
self.addEventListener('message', (event: MessageEvent<SearchWorkerMessage>) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'BUILD_INDEX': {
        const documents = payload as SearchDocument[];
        buildIndex(documents);
        const response: SearchWorkerResponse = {
          type: 'INDEX_BUILT',
          id,
          payload: { count: documents.length }
        };
        self.postMessage(response);
        break;
      }

      case 'SEARCH': {
        const { query, limit } = payload as { query: string; limit?: number };
        const results = search(query, limit);
        const response: SearchWorkerResponse = {
          type: 'SEARCH_RESULTS',
          id,
          payload: { results, total: results.length }
        };
        self.postMessage(response);
        break;
      }

      case 'LOAD_CHUNK': {
        const documents = payload as SearchDocument[];
        // Agregar documentos al índice existente
        if (index) {
          // Lunr no soporta agregar documentos después de construir
          // Necesitamos reconstruir con todos los documentos
          const allDocs = Array.from(documents.values()).concat(
            Array.from(documents.values())
          );
          buildIndex(allDocs);
        } else {
          buildIndex(documents);
        }
        const response: SearchWorkerResponse = {
          type: 'CHUNK_LOADED',
          id,
          payload: { count: documents.length }
        };
        self.postMessage(response);
        break;
      }

      case 'CLEAR_INDEX': {
        index = null;
        documents.clear();
        const response: SearchWorkerResponse = {
          type: 'INDEX_BUILT',
          id,
          payload: { count: 0 }
        };
        self.postMessage(response);
        break;
      }

      default:
        throw new Error(`Tipo de mensaje desconocido: ${type}`);
    }
  } catch (error) {
    const response: SearchWorkerResponse = {
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    self.postMessage(response);
  }
});

// Exportar tipos para uso en main thread
export type { SearchWorkerMessage, SearchWorkerResponse };


