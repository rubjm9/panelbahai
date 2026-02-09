
import lunr from 'lunr';
require("lunr-languages/lunr.stemmer.support")(lunr)
require("lunr-languages/lunr.es")(lunr)

// Configurar Lunr para español
lunr.tokenizer.separator = /[\s\-\.]+/;

// Stopwords que Lunr elimina en español; no los enviamos en la consulta para frases entrecomilladas
// (ej. "el todopoderoso" → solo +todopoderoso, así Lunr devuelve candidatos y luego filtramos por frase exacta)
const STOPWORDS_ES = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'a', 'en', 'es', 'por', 'con', 'que', 'no',
  'se', 'su', 'sus', 'lo', 'le', 'como', 'pero', 'mas', 'para', 'son', 'ser', 'fue', 'ha', 'han', 'eso',
  'esa', 'este', 'esta', 'estos', 'estas', 'todo', 'toda', 'todos', 'todas', 'otro', 'otra', 'otros',
  'otras', 'uno', 'dos', 'y', 'o', 'si', 'ya', 'bien', 'solo', 'tan', 'asi', 'entre', 'hasta', 'desde',
  'contra', 'sin', 'sobre', 'tras', 'durante', 'mediante', 'ante', 'bajo', 'tras'
]);

export interface SearchDocument {
  id: string;
  titulo: string;
  autor: string;
  obraSlug: string;
  autorSlug: string;
  seccion?: string;
  texto: string;
  numero?: number;
  tipo: 'titulo' | 'seccion' | 'parrafo';
}

export interface SearchResult {
  id: string;
  titulo: string;
  autor: string;
  obraSlug: string;
  autorSlug: string;
  seccion?: string;
  fragmento: string;
  texto: string;
  numero?: number;
  tipo: 'titulo' | 'seccion' | 'parrafo';
  score: number;
}

export class SearchEngine {
  private index: lunr.Index | null = null;
  private documents: Map<string, SearchDocument> = new Map();

  constructor() { }

  // Limpiar índice existente
  clearIndex() {
    this.index = null;
    this.documents.clear();
  }

  // Construir índice con documentos
  buildIndex(documents: SearchDocument[]) {
    this.documents.clear();
    documents.forEach(doc => this.documents.set(doc.id, doc));

    this.index = lunr(function () {
      // Usar idioma español
      this.use((lunr as any).es);

      // Configurar campos con diferentes pesos
      this.field('titulo', { boost: 10 });
      this.field('autor', { boost: 8 });
      this.field('seccion', { boost: 6 });
      this.field('texto', { boost: 1 });

      this.ref('id');

      // Agregar documentos al índice
      documents.forEach(doc => {
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

  // Realizar búsqueda con soporte para sintaxis avanzada
  search(query: string, limit: number = 50): { results: SearchResult[]; total: number } {
    if (!this.index || query.length < 3) {
      return { results: [], total: 0 };
    }

    try {
      // Extraer frases exactas de la consulta (para filtrado posterior)
      const exactPhrases = this.extractExactPhrases(query);

      // Procesar la consulta para detectar sintaxis avanzada
      const processedQuery = this.processAdvancedQuery(query);

      let results = this.index.search(processedQuery);

      // Filtrar resultados si hay búsquedas exactas con comillas (frase literal, normalizando espacios)
      if (exactPhrases.length > 0) {
        results = results.filter(result => {
          const doc = this.documents.get(result.ref);
          if (!doc) return false;

          const searchableText = `${doc.titulo} ${doc.autor} ${doc.seccion || ''} ${doc.texto}`.toLowerCase();
          const normalizedText = this.normalizeTextForPhraseMatch(searchableText);

          return exactPhrases.every(phrase => {
            const phraseNorm = this.normalizeTextForPhraseMatch(phrase.toLowerCase());
            return phraseNorm.length > 0 && normalizedText.includes(phraseNorm);
          });
        });
      }

      // Para párrafos: solo mantener si el término aparece en el texto del párrafo, no solo en sección/título
      results = results.filter(result => {
        const doc = this.documents.get(result.ref);
        if (!doc || doc.tipo !== 'parrafo') return true;

        return this.queryMatchesInParagraphText(doc, query, exactPhrases);
      });

      // Guardar el total antes de aplicar el límite
      const total = results.length;

      // Primero filtramos los documentos nulos y luego mapeamos para asegurar que el tipo sea correcto
      const searchResults = results
        .slice(0, limit)
        .map(result => {
          const doc = this.documents.get(result.ref);
          if (!doc) return null;

          // Creamos un objeto que cumple con la interfaz SearchResult
          const searchResult: SearchResult = {
            id: doc.id,
            titulo: doc.titulo,
            autor: doc.autor,
            obraSlug: doc.obraSlug,
            autorSlug: doc.autorSlug,
            seccion: doc.seccion,
            texto: doc.texto,
            fragmento: this.extractFragment(doc.texto, query),
            numero: doc.numero,
            tipo: doc.tipo,
            score: result.score
          };

          return searchResult;
        })
        .filter((result): result is SearchResult => result !== null)
        .sort(this.sortResults.bind(this));

      return { results: searchResults, total };

    } catch (error) {
      console.error('Error en búsqueda:', error);
      return { results: [], total: 0 };
    }
  }

  // Normalizar texto para comparación de frase exacta: colapsar espacios y recortar
  private normalizeTextForPhraseMatch(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Comprueba si la consulta aparece en el texto del párrafo (no solo en sección/título).
   * Así evitamos listar todos los párrafos de un epígrafe cuando el término solo coincide con el título de la sección.
   */
  private queryMatchesInParagraphText(
    doc: SearchDocument,
    query: string,
    exactPhrases: string[]
  ): boolean {
    const textoNorm = this.normalizeTextForPhraseMatch(doc.texto.toLowerCase());
    if (textoNorm.length === 0) return false;

    if (exactPhrases.length > 0) {
      return exactPhrases.some(phrase => {
        const phraseNorm = this.normalizeTextForPhraseMatch(phrase.toLowerCase());
        return phraseNorm.length > 0 && textoNorm.includes(phraseNorm);
      });
    }

    const cleanQuery = this.extractSearchTerms(query);
    const terms = cleanQuery.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    return terms.some(term => textoNorm.includes(term));
  }

  // Extraer frases exactas de la consulta (texto entre comillas)
  private extractExactPhrases(query: string): string[] {
    const matches = query.match(/"([^"]+)"/g);
    if (!matches) return [];

    return matches.map(match => match.replace(/"/g, ''));
  }

  // Procesar consulta avanzada con soporte para sintaxis especial
  private processAdvancedQuery(query: string): string {
    // Detectar búsquedas exactas con comillas
    const exactMatches = query.match(/"([^"]+)"/g);
    if (exactMatches) {
      // Construir consulta Lunr solo con términos que no son stopwords (Lunr los elimina y puede devolver 0 resultados)
      // El filtrado por frase exacta se hace después en search()
      let processedQuery = query;
      exactMatches.forEach(match => {
        const cleanTerm = match.replace(/"/g, '');
        const terms = cleanTerm.split(/\s+/).filter(t => t.length > 0);
        const termsForLunr = terms.filter(term => !STOPWORDS_ES.has(term.toLowerCase()));
        const requiredTerms = (termsForLunr.length > 0 ? termsForLunr : terms).map(term => `+${term}`).join(' ');
        processedQuery = processedQuery.replace(match, requiredTerms);
      });
      return processedQuery;
    }

    // Detectar operadores booleanos básicos
    if (query.includes(' AND ')) {
      return this.processBooleanQuery(query, 'AND');
    }

    if (query.includes(' OR ')) {
      return this.processBooleanQuery(query, 'OR');
    }

    // Detectar términos con + (requeridos)
    if (query.includes('+')) {
      return this.processRequiredTerms(query);
    }

    // Detectar términos con - (excluidos)
    if (query.includes('-')) {
      return this.processExcludedTerms(query);
    }

    // Detectar wildcards básicos (*)
    if (query.includes('*')) {
      return this.processWildcards(query);
    }

    // Detectar regex básico (patrones simples)
    if (query.includes('~')) {
      return this.processRegex(query);
    }

    // Búsqueda normal con mejoras
    return this.processNormalQuery(query);
  }

  // Procesar consultas booleanas
  private processBooleanQuery(query: string, operator: 'AND' | 'OR'): string {
    const parts = query.split(` ${operator} `);
    const processedParts = parts.map(part => {
      const cleanPart = part.trim();
      // Aplicar procesamiento normal a cada parte
      return this.processNormalQuery(cleanPart);
    });

    if (operator === 'AND') {
      return processedParts.join(' ');
    } else {
      // Para OR, Lunr usa espacios como OR implícito
      return processedParts.join(' ');
    }
  }

  // Procesar términos requeridos (+)
  private processRequiredTerms(query: string): string {
    const terms = query.split(/\s+/);
    const processedTerms = terms.map(term => {
      if (term.startsWith('+')) {
        const cleanTerm = term.substring(1);
        // Para Lunr, los términos requeridos se pueden marcar con boost
        return `${cleanTerm}* ${cleanTerm}~1`;
      }
      return `${term}* ${term}~1`;
    });
    return processedTerms.join(' ');
  }

  // Procesar términos excluidos (-)
  private processExcludedTerms(query: string): string {
    const terms = query.split(/\s+/);
    const includedTerms: string[] = [];
    const excludedTerms: string[] = [];

    terms.forEach(term => {
      if (term.startsWith('-')) {
        excludedTerms.push(term.substring(1));
      } else {
        includedTerms.push(term);
      }
    });

    // Construir consulta con términos incluidos y excluidos
    const includedQuery = includedTerms.map(term => `${term}* ${term}~1`).join(' ');
    const excludedQuery = excludedTerms.map(term => `-${term}`).join(' ');

    return `${includedQuery} ${excludedQuery}`.trim();
  }

  // Procesar wildcards (*)
  private processWildcards(query: string): string {
    const terms = query.split(/\s+/);
    const processedTerms = terms.map(term => {
      if (term.includes('*')) {
        // Lunr soporta wildcards nativamente
        return term;
      }
      return `${term}* ${term}~1`;
    });
    return processedTerms.join(' ');
  }

  // Procesar regex básico (~)
  private processRegex(query: string): string {
    const terms = query.split(/\s+/);
    const processedTerms = terms.map(term => {
      if (term.includes('~')) {
        // Para regex básico, usar fuzzy matching de Lunr
        const parts = term.split('~');
        if (parts.length === 2) {
          const baseTerm = parts[0];
          const distance = parseInt(parts[1]) || 1;
          return `${baseTerm}~${distance}`;
        }
        return term;
      }
      return `${term}* ${term}~1`;
    });
    return processedTerms.join(' ');
  }

  // Procesar consulta normal con mejoras
  private processNormalQuery(query: string): string {
    const terms = query.split(/\s+/);
    const processedTerms = terms.map(term => {
      // Limpiar término
      const cleanTerm = term.toLowerCase().replace(/[^\wáéíóúñü]/g, '');
      if (cleanTerm.length < 2) return '';

      // Aplicar fuzzy matching y wildcards para mejor matching
      return `${cleanTerm}* ${cleanTerm}~1`;
    }).filter(term => term.length > 0);

    return processedTerms.join(' ');
  }

  // Extraer fragmento relevante del texto con soporte para búsquedas avanzadas
  private extractFragment(texto: string, query: string, maxLength: number = 200): string {
    // Limpiar la consulta para extraer términos de búsqueda
    const cleanQuery = this.extractSearchTerms(query);
    const queryTerms = cleanQuery.toLowerCase().split(/\s+/);
    const textoLower = texto.toLowerCase();

    // Encontrar la mejor coincidencia
    let bestMatch = this.findBestMatch(textoLower, queryTerms);

    if (bestMatch.index === -1) {
      return texto.substring(0, maxLength) + (texto.length > maxLength ? '...' : '');
    }

    // Expandir hacia atrás y adelante para obtener contexto
    const contextStart = Math.max(0, bestMatch.index - 50);
    const contextEnd = Math.min(texto.length, bestMatch.index + maxLength - 50);

    let fragment = texto.substring(contextStart, contextEnd);

    if (contextStart > 0) fragment = '...' + fragment;
    if (contextEnd < texto.length) fragment = fragment + '...';

    return fragment;
  }

  // Extraer términos de búsqueda limpios de la consulta
  private extractSearchTerms(query: string): string {
    // Remover sintaxis especial para obtener términos limpios
    return query
      .replace(/"[^"]+"/g, (match) => match.replace(/"/g, '')) // Remover comillas de búsquedas exactas
      .replace(/\+/g, '') // Remover símbolos +
      .replace(/-/g, '') // Remover símbolos -
      .replace(/\*/g, '') // Remover wildcards
      .replace(/~[\d]*/g, '') // Remover fuzzy matching
      .replace(/\b(AND|OR)\b/gi, '') // Remover operadores booleanos
      .trim();
  }

  // Encontrar la mejor coincidencia en el texto
  private findBestMatch(texto: string, terms: string[]): { index: number; score: number } {
    let bestMatch = { index: -1, score: 0 };

    for (let i = 0; i < texto.length; i++) {
      let score = 0;
      let foundTerms = 0;

      for (const term of terms) {
        if (term.length < 2) continue;

        // Buscar término exacto
        if (texto.substring(i, i + term.length) === term) {
          score += 10;
          foundTerms++;
        }
        // Buscar término como palabra completa
        else if (this.isWordMatch(texto, i, term)) {
          score += 8;
          foundTerms++;
        }
        // Buscar término parcial
        else if (texto.substring(i, i + term.length) === term.substring(0, Math.min(term.length, texto.length - i))) {
          score += 3;
        }
      }

      // Bonus por encontrar múltiples términos cerca
      if (foundTerms > 1) {
        score += foundTerms * 2;
      }

      if (score > bestMatch.score) {
        bestMatch = { index: i, score };
      }
    }

    return bestMatch;
  }

  // Verificar si un término coincide como palabra completa
  private isWordMatch(texto: string, startIndex: number, term: string): boolean {
    const endIndex = startIndex + term.length;

    // Verificar límites de palabra
    const prevChar = startIndex > 0 ? texto[startIndex - 1] : ' ';
    const nextChar = endIndex < texto.length ? texto[endIndex] : ' ';

    const isWordBoundary = !/\w/.test(prevChar) && !/\w/.test(nextChar);

    return isWordBoundary && texto.substring(startIndex, endIndex) === term;
  }

  // Ordenar resultados según prioridad
  private sortResults(a: SearchResult, b: SearchResult): number {
    // Orden de prioridad por autor
    const autorOrder = {
      'bahaullah': 1,
      'el-bab': 2,
      'abdul-baha': 3,
      'shoghi-effendi': 4,
      'casa-justicia': 5,
      'declaraciones-oficiales': 6,
      'recopilaciones': 7
    };

    const autorA = autorOrder[a.autorSlug as keyof typeof autorOrder] || 8;
    const autorB = autorOrder[b.autorSlug as keyof typeof autorOrder] || 8;

    // Prioridad por tipo de documento
    const tipoOrder = { 'titulo': 1, 'seccion': 2, 'parrafo': 3 };
    const tipoA = tipoOrder[a.tipo];
    const tipoB = tipoOrder[b.tipo];

    // Ordenar por tipo primero, luego por autor, luego por score
    if (tipoA !== tipoB) return tipoA - tipoB;
    if (autorA !== autorB) return autorA - autorB;
    return b.score - a.score;
  }

  // Resaltar términos de búsqueda en texto. Si la consulta tiene frases entrecomilladas,
  // solo se resalta la frase exacta (no cada palabra por separado).
  highlightTerms(text: string, query: string): string {
    if (!query) return text;

    const isInsideHtmlTag = (text: string, pos: number): boolean => {
      const before = text.substring(0, pos);
      const lastOpenTag = before.lastIndexOf('<');
      const lastCloseTag = before.lastIndexOf('>');
      return lastOpenTag > lastCloseTag;
    };
    const isInsideMark = (text: string, pos: number): boolean => {
      const before = text.substring(0, pos);
      const openMarks = (before.match(/<mark[^>]*>/gi) || []).length;
      const closeMarks = (before.match(/<\/mark>/gi) || []).length;
      return openMarks > closeMarks;
    };

    const exactPhrases = this.extractExactPhrases(query);
    if (exactPhrases.length > 0) {
      let highlightedText = text;
      for (const phrase of exactPhrases) {
        const trimmed = phrase.trim();
        if (trimmed.length === 0) continue;
        const phraseRegex = this.buildPhraseHighlightRegex(trimmed);
        highlightedText = highlightedText.replace(phraseRegex, (match, offset) => {
          if (isInsideHtmlTag(highlightedText, offset) || isInsideMark(highlightedText, offset)) {
            return match;
          }
          return '<mark class="search-highlight">' + match + '</mark>';
        });
      }
      return highlightedText;
    }

    const cleanQuery = this.extractSearchTerms(query);
    const terms = cleanQuery.toLowerCase().split(/\s+/).filter(term => term.length >= 2);
    let highlightedText = text;
    const sortedTerms = terms.sort((a, b) => b.length - a.length);

    sortedTerms.forEach(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      highlightedText = highlightedText.replace(wordBoundaryRegex, (match, p1, offset) => {
        if (isInsideHtmlTag(highlightedText, offset) || isInsideMark(highlightedText, offset)) {
          return match;
        }
        return '<mark class="search-highlight">' + match + '</mark>';
      });
      const partialRegex = new RegExp(`(${escapedTerm})`, 'gi');
      highlightedText = highlightedText.replace(partialRegex, (match, p1, offset) => {
        if (isInsideHtmlTag(highlightedText, offset) || isInsideMark(highlightedText, offset)) {
          return match;
        }
        return '<mark class="search-highlight">' + match + '</mark>';
      });
    });

    return highlightedText;
  }

  // Regex para resaltar una frase permitiendo espacios variables entre palabras
  private buildPhraseHighlightRegex(phrase: string): RegExp {
    const parts = phrase.split(/\s+/).filter(p => p.length > 0);
    const escaped = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp('(' + escaped.join('\\s+') + ')', 'gi');
  }
}

// Instancia global del motor de búsqueda
export const searchEngine = new SearchEngine();
