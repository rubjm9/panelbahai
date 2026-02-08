/**
 * Web Worker para búsqueda con Lunr.js
 * Este archivo se carga directamente en el navegador
 */

// Cargar Lunr y lunr-languages desde CDN
try {
  importScripts('https://unpkg.com/lunr@2.3.9/lunr.js');

  // Verificar que Lunr se cargó
  if (typeof lunr === 'undefined') {
    throw new Error('Lunr no se cargó correctamente');
  }

  // Cargar soporte de idiomas para español
  importScripts('https://unpkg.com/lunr-languages@1.10.0/lunr.stemmer.support.js');
  importScripts('https://unpkg.com/lunr-languages@1.10.0/lunr.es.js');

  // Configurar Lunr para español
  lunr.tokenizer.separator = /[\s\-\.]+/;

  console.log('✅ Lunr con soporte de español cargado en worker');
} catch (error) {
  console.error('Error cargando Lunr en worker:', error);
  // Enviar error al main thread
  self.postMessage({
    type: 'ERROR',
    error: 'No se pudo cargar Lunr en el worker: ' + error.message
  });
}

let index = null;
let documents = new Map();

/**
 * Construir índice Lunr
 */
function buildIndex(docs) {
  documents.clear();
  docs.forEach(doc => documents.set(doc.id, doc));

  index = lunr(function () {
    // Usar idioma español para stemming y stopwords
    // TEMPORALMENTE DESHABILITADO para depuración - probando sin Spanish
    // this.use(lunr.es);
    console.log('[Worker] Building index WITHOUT lunr.es (test mode)');

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
 * Procesar query avanzada (similar a searchEngine)
 */
function processAdvancedQuery(query) {
  // Detectar búsquedas exactas con comillas
  const exactMatches = query.match(/"([^"]+)"/g);
  if (exactMatches) {
    let processedQuery = query;
    exactMatches.forEach(match => {
      const cleanTerm = match.replace(/"/g, '');
      const terms = cleanTerm.split(/\s+/).filter(t => t.length > 0);
      const requiredTerms = terms.map(term => `+${term}`).join(' ');
      processedQuery = processedQuery.replace(match, requiredTerms);
    });
    return processedQuery;
  }

  // Detectar términos con + (requeridos)
  if (query.includes('+')) {
    const terms = query.split(/\s+/);
    const processedTerms = terms.map(term => {
      if (term.startsWith('+')) {
        const cleanTerm = term.substring(1);
        return `${cleanTerm}* ${cleanTerm}~1`;
      }
      return `${term}* ${term}~1`;
    });
    return processedTerms.join(' ');
  }

  // Detectar términos con - (excluidos)
  if (query.includes('-')) {
    const terms = query.split(/\s+/);
    const includedTerms = [];
    const excludedTerms = [];

    terms.forEach(term => {
      if (term.startsWith('-')) {
        excludedTerms.push(term.substring(1));
      } else {
        includedTerms.push(term);
      }
    });

    const includedQuery = includedTerms.map(term => `${term}* ${term}~1`).join(' ');
    const excludedQuery = excludedTerms.map(term => `-${term}`).join(' ');

    return `${includedQuery} ${excludedQuery}`.trim();
  }

  // Búsqueda normal - solo términos limpios para compatibilidad con stemmer español
  const terms = query.split(/\s+/);
  const processedTerms = terms.map(term => {
    const cleanTerm = term.toLowerCase().replace(/[^\wáéíóúñü]/g, '');
    if (cleanTerm.length < 2) return '';
    // No usar wildcards ni fuzzy con lunr.es - el stemmer maneja las variaciones
    return cleanTerm;
  }).filter(term => term.length > 0);

  return processedTerms.join(' ');
}

/**
 * Extraer frases exactas de la consulta
 */
function extractExactPhrases(query) {
  const matches = query.match(/"([^"]+)"/g);
  if (!matches) return [];
  return matches.map(match => match.replace(/"/g, ''));
}

/**
 * Realizar búsqueda
 */
function search(query, limit = 50) {
  console.log('[Worker] search called with:', { query, limit, hasIndex: !!index, docCount: documents.size });

  if (!index || query.length < 3) {
    console.log('[Worker] Early return: no index or query too short');
    return { results: [], total: 0 };
  }

  try {
    // Extraer frases exactas
    const exactPhrases = extractExactPhrases(query);

    // Procesar la consulta
    const processedQuery = processAdvancedQuery(query);
    console.log('[Worker] Processed query:', processedQuery);

    let results = index.search(processedQuery);
    console.log('[Worker] Lunr raw results count:', results.length);

    // Filtrar resultados si hay búsquedas exactas con comillas
    if (exactPhrases.length > 0) {
      results = results.filter(result => {
        const doc = documents.get(result.ref);
        if (!doc) return false;

        const searchableText = `${doc.titulo} ${doc.autor} ${doc.seccion || ''} ${doc.texto}`.toLowerCase();

        return exactPhrases.every(phrase => {
          const phraseLower = phrase.toLowerCase();
          return searchableText.includes(phraseLower);
        });
      });
    }

    const total = results.length;
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

    // Ordenar resultados (similar a searchEngine.sortResults)
    searchResults.sort((a, b) => {
      const autorOrder = {
        'bahaullah': 1,
        'el-bab': 2,
        'abdul-baha': 3,
        'shoghi-effendi': 4,
        'casa-justicia': 5,
        'declaraciones-oficiales': 6,
        'recopilaciones': 7
      };

      const autorA = autorOrder[a.autorSlug] || 8;
      const autorB = autorOrder[b.autorSlug] || 8;

      const tipoOrder = { 'titulo': 1, 'seccion': 2, 'parrafo': 3 };
      const tipoA = tipoOrder[a.tipo];
      const tipoB = tipoOrder[b.tipo];

      if (tipoA !== tipoB) return tipoA - tipoB;
      if (autorA !== autorB) return autorA - autorB;
      return b.score - a.score;
    });

    return { results: searchResults, total };
  } catch (error) {
    console.error('Error en búsqueda del worker:', error);
    return { results: [], total: 0 };
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
  console.log('[Worker] Message received:', { type, id, payloadLength: Array.isArray(payload) ? payload.length : 'N/A' });

  try {
    switch (type) {
      case 'BUILD_INDEX': {
        const documents = payload;
        console.log('[Worker] BUILD_INDEX: building with', documents.length, 'documents');
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
        const { results, total } = search(query, limit);
        const response = {
          type: 'SEARCH_RESULTS',
          id,
          payload: { results, total }
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

