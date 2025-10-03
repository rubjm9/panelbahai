import lunr from 'lunr';

// Configurar Lunr para español
lunr.tokenizer.separator = /[\s\-\.]+/;

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
  texto: string; // Añadido para mantener compatibilidad con SearchDocument
  numero?: number;
  tipo: 'titulo' | 'seccion' | 'parrafo';
  score: number;
}

export class SearchEngine {
  private index: lunr.Index | null = null;
  private documents: Map<string, SearchDocument> = new Map();

  constructor() {}

  // Limpiar índice existente
  clearIndex() {
    this.index = null;
    this.documents.clear();
  }

  // Construir índice con documentos
  buildIndex(documents: SearchDocument[]) {
    this.documents.clear();
    documents.forEach(doc => this.documents.set(doc.id, doc));

    this.index = lunr(function() {
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
  search(query: string, limit: number = 50): SearchResult[] {
    if (!this.index || query.length < 3) {
      return [];
    }

    try {
      // Procesar la consulta para detectar sintaxis avanzada
      const processedQuery = this.processAdvancedQuery(query);
      
      const results = this.index.search(processedQuery);
      
      // Primero filtramos los documentos nulos y luego mapeamos para asegurar que el tipo sea correcto
      return results
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
        
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }

  // Procesar consulta avanzada con soporte para sintaxis especial
  private processAdvancedQuery(query: string): string {
    // Detectar búsquedas exactas con comillas
    const exactMatches = query.match(/"([^"]+)"/g);
    if (exactMatches) {
      // Para búsquedas exactas, convertir a términos requeridos con fuzzy matching
      // esto proporciona mejor compatibilidad con Lunr
      let processedQuery = query;
      exactMatches.forEach(match => {
        const cleanTerm = match.replace(/"/g, '');
        // Convertir cada término de la frase en un término requerido con fuzzy matching
        const terms = cleanTerm.split(/\s+/).filter(t => t.length > 0);
        const requiredTerms = terms.map(term => `+${term} ${term}~1`).join(' ');
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
      'compilaciones': 7
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

  // Resaltar términos de búsqueda en texto con soporte para sintaxis avanzada
  highlightTerms(text: string, query: string): string {
    if (!query) return text;

    // Extraer términos limpios de la consulta
    const cleanQuery = this.extractSearchTerms(query);
    const terms = cleanQuery.toLowerCase().split(/\s+/).filter(term => term.length >= 2);
    let highlightedText = text;

    // Resaltar términos en orden de importancia (más largos primero)
    const sortedTerms = terms.sort((a, b) => b.length - a.length);

    sortedTerms.forEach(term => {
      // Escapar caracteres especiales para regex
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Crear regex que busca el término como palabra completa
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      
      // Verificar si ya está resaltado para evitar anidamiento
      const alreadyHighlighted = new RegExp(`<mark[^>]*>.*?${escapedTerm}.*?</mark>`, 'gi');
      
      if (!alreadyHighlighted.test(highlightedText)) {
        highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
      }
    });

    return highlightedText;
  }
}

// Instancia global del motor de búsqueda
export const searchEngine = new SearchEngine();
