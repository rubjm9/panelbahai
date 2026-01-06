/**
 * Web Worker para búsqueda con Lunr.js
 * Este archivo se carga directamente en el navegador
 * 
 * NOTA: Este worker requiere que Lunr.js esté disponible.
 * Por ahora, deshabilitamos el worker y usamos fallback al main thread.
 * Para habilitarlo, necesitarías usar un bundler como webpack o vite para incluir lunr.
 */

// Deshabilitado temporalmente - usar fallback al main thread
// importScripts('https://unpkg.com/lunr@2.3.9/lunr.js');

// Por ahora, el worker no hace nada y retorna errores para forzar fallback
self.postMessage({
  type: 'ERROR',
  error: 'Web Worker deshabilitado. Usando fallback al main thread.'
});

// Configurar Lunr para español
lunr.tokenizer.separator = /[\s\-\.]+/;

let index = null;
let documents = new Map();

/**
 * Construir índice Lunr
 */
function buildIndex(docs) {
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
function search(query, limit = 50) {
  if (!index || query.length < 3) {
    return [];
  }

  try {
    const results = index.search(query);
    const searchResults = [];

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
function extractFragment(texto, query, maxLength = 200) {
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
function isWordMatch(texto, startIndex, term) {
  const endIndex = startIndex + term.length;
  const prevChar = startIndex > 0 ? texto[startIndex - 1] : ' ';
  const nextChar = endIndex < texto.length ? texto[endIndex] : ' ';
  const isWordBoundary = !/\w/.test(prevChar) && !/\w/.test(nextChar);
  return isWordBoundary && texto.substring(startIndex, endIndex) === term;
}

/**
 * Manejar mensajes del main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload, id } = event.data;

  try {
    switch (type) {
      case 'BUILD_INDEX': {
        const documents = payload;
        buildIndex(documents);
        const response = {
          type: 'INDEX_BUILT',
          id,
          payload: { count: documents.length }
        };
        self.postMessage(response);
        break;
      }

      case 'SEARCH': {
        const { query, limit } = payload;
        const results = search(query, limit);
        const response = {
          type: 'SEARCH_RESULTS',
          id,
          payload: { results, total: results.length }
        };
        self.postMessage(response);
        break;
      }

      case 'LOAD_CHUNK': {
        const documents = payload;
        // Para chunks, reconstruimos el índice con todos los documentos
        const allDocs = Array.from(documents.values());
        buildIndex(allDocs);
        const response = {
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
        const response = {
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
    const response = {
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    self.postMessage(response);
  }
});

