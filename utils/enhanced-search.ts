import lunr from 'lunr';

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
  ref: string;
  score: number;
  matchData: lunr.MatchData;
}

export interface EnhancedSearchOptions {
  fields?: string[];
  boost?: { [key: string]: number };
  fuzzy?: boolean;
  wildcard?: boolean;
}

export interface ParsedQuery {
  originalQuery: string;
  exactPhrases: string[];
  requiredTerms: string[];
  excludedTerms: string[];
  normalTerms: string[];
  regexPatterns: string[];
  hasAdvancedSyntax: boolean;
}

export class EnhancedSearchEngine {
  private index: lunr.Index | null = null;
  private documents: Map<string, SearchDocument> = new Map();
  private searchConfig: EnhancedSearchOptions;

  constructor(config: EnhancedSearchOptions = {}) {
    this.searchConfig = {
      fields: ['titulo', 'autor', 'texto', 'seccion'],
      boost: { titulo: 3, autor: 2, seccion: 1.5, texto: 1 },
      fuzzy: true,
      wildcard: true,
      ...config
    };
  }

  /**
   * Construye el índice de búsqueda con documentos
   */
  buildIndex(documents: SearchDocument[]): void {
    this.documents.clear();
    
    // Almacenar documentos
    documents.forEach(doc => {
      this.documents.set(doc.id, doc);
    });

    // Construir índice Lunr
    this.index = lunr(function () {
      // Configurar campos
      this.ref('id');
      this.field('titulo', { boost: 3 });
      this.field('autor', { boost: 2 });
      this.field('seccion', { boost: 1.5 });
      this.field('texto', { boost: 1 });

      // Pipeline personalizado para español
      this.pipeline.add(
        // Tokenizer personalizado
        function (token: any) {
          return token.toString().toLowerCase();
        },
        // Stemmer para español (básico)
        function (token: any) {
          const str = token.toString();
          // Remover terminaciones comunes en español
          if (str.endsWith('ción')) return str.slice(0, -4) + 'cion';
          if (str.endsWith('sión')) return str.slice(0, -4) + 'sion';
          if (str.endsWith('mente')) return str.slice(0, -5);
          if (str.endsWith('ando')) return str.slice(0, -4);
          if (str.endsWith('iendo')) return str.slice(0, -5);
          if (str.endsWith('ado')) return str.slice(0, -3);
          if (str.endsWith('ido')) return str.slice(0, -3);
          return str;
        }
      );

      // Agregar documentos
      documents.forEach(doc => {
        this.add(doc);
      });
    });

    console.log(`✅ Índice mejorado construido con ${documents.length} documentos`);
  }

  /**
   * Parsea una consulta de búsqueda avanzada
   */
  private parseQuery(query: string): ParsedQuery {
    const originalQuery = query.trim();
    const exactPhrases: string[] = [];
    const requiredTerms: string[] = [];
    const excludedTerms: string[] = [];
    const normalTerms: string[] = [];
    const regexPatterns: string[] = [];

    // Detectar frases exactas entre comillas
    const quotedMatches = originalQuery.match(/"([^"]+)"/g);
    if (quotedMatches) {
      quotedMatches.forEach(match => {
        const phrase = match.slice(1, -1); // Remover comillas
        exactPhrases.push(phrase);
      });
    }

    // Detectar términos requeridos (+) y excluidos (-)
    const terms = originalQuery
      .replace(/"([^"]+)"/g, '') // Remover frases exactas
      .split(/\s+/)
      .filter(term => term.length > 0);

    terms.forEach(term => {
      if (term.startsWith('+')) {
        requiredTerms.push(term.slice(1));
      } else if (term.startsWith('-')) {
        excludedTerms.push(term.slice(1));
      } else if (term.startsWith('/') && term.endsWith('/')) {
        // Regex básica
        regexPatterns.push(term.slice(1, -1));
      } else {
        normalTerms.push(term);
      }
    });

    const hasAdvancedSyntax = 
      exactPhrases.length > 0 || 
      requiredTerms.length > 0 || 
      excludedTerms.length > 0 || 
      regexPatterns.length > 0;

    return {
      originalQuery,
      exactPhrases,
      requiredTerms,
      excludedTerms,
      normalTerms,
      regexPatterns,
      hasAdvancedSyntax
    };
  }

  /**
   * Busca documentos usando sintaxis avanzada
   */
  search(query: string, options: EnhancedSearchOptions = {}): SearchResult[] {
    if (!this.index) {
      console.warn('Índice no construido');
      return [];
    }

    const parsedQuery = this.parseQuery(query);
    const config = { ...this.searchConfig, ...options };

    try {
      if (parsedQuery.hasAdvancedSyntax) {
        return this.advancedSearch(parsedQuery, config);
      } else {
        // Búsqueda normal con Lunr
        return this.index.search(query);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      // Fallback a búsqueda simple
      return this.index.search(query.split(' ').join(' '));
    }
  }

  /**
   * Realiza búsqueda avanzada con sintaxis personalizada
   */
  private advancedSearch(parsedQuery: ParsedQuery, config: EnhancedSearchOptions): SearchResult[] {
    const results: SearchResult[] = [];
    const allDocuments = Array.from(this.documents.values());

    // Filtrar documentos por criterios avanzados
    const filteredDocs = allDocuments.filter(doc => {
      const docText = this.getDocumentText(doc).toLowerCase();

      // Verificar frases exactas
      for (const phrase of parsedQuery.exactPhrases) {
        if (!docText.includes(phrase.toLowerCase())) {
          return false;
        }
      }

      // Verificar términos requeridos
      for (const term of parsedQuery.requiredTerms) {
        if (!docText.includes(term.toLowerCase())) {
          return false;
        }
      }

      // Verificar términos excluidos
      for (const term of parsedQuery.excludedTerms) {
        if (docText.includes(term.toLowerCase())) {
          return false;
        }
      }

      // Verificar regex básica
      for (const pattern of parsedQuery.regexPatterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (!regex.test(docText)) {
            return false;
          }
        } catch (error) {
          console.warn(`Regex inválida: ${pattern}`, error);
        }
      }

      return true;
    });

    // Calcular scores para documentos filtrados
    filteredDocs.forEach(doc => {
      let score = 0;
      const docText = this.getDocumentText(doc).toLowerCase();

      // Score por frases exactas (mayor peso)
      parsedQuery.exactPhrases.forEach(phrase => {
        const phraseLower = phrase.toLowerCase();
        if (docText.includes(phraseLower)) {
          score += 10;
          // Bonus si aparece en título
          if (doc.titulo.toLowerCase().includes(phraseLower)) {
            score += 5;
          }
        }
      });

      // Score por términos requeridos
      parsedQuery.requiredTerms.forEach(term => {
        const termLower = term.toLowerCase();
        if (docText.includes(termLower)) {
          score += 3;
          if (doc.titulo.toLowerCase().includes(termLower)) {
            score += 2;
          }
        }
      });

      // Score por términos normales
      parsedQuery.normalTerms.forEach(term => {
        const termLower = term.toLowerCase();
        if (docText.includes(termLower)) {
          score += 1;
          if (doc.titulo.toLowerCase().includes(termLower)) {
            score += 1;
          }
        }
      });

      if (score > 0) {
        results.push({
          ref: doc.id,
          score,
          matchData: {} as lunr.MatchData
        });
      }
    });

    // Ordenar por score descendente
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Obtiene el texto completo de un documento para búsqueda
   */
  private getDocumentText(doc: SearchDocument): string {
    return `${doc.titulo} ${doc.autor} ${doc.seccion || ''} ${doc.texto}`.trim();
  }

  /**
   * Obtiene un documento por ID
   */
  getDocument(id: string): SearchDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Limpia el índice
   */
  clearIndex(): void {
    this.index = null;
    this.documents.clear();
  }

  /**
   * Obtiene estadísticas del índice
   */
  getStats(): { documents: number; fields: string[] } {
    return {
      documents: this.documents.size,
      fields: this.searchConfig.fields || []
    };
  }

  /**
   * Obtiene sugerencias de búsqueda basadas en términos comunes
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!this.index) return [];

    const suggestions: string[] = [];
    const terms = query.toLowerCase().split(/\s+/);
    const lastTerm = terms[terms.length - 1];

    if (lastTerm.length < 2) return suggestions;

    // Buscar términos que empiecen con el último término
    const allTerms = new Set<string>();
    this.documents.forEach(doc => {
      const text = this.getDocumentText(doc).toLowerCase();
      const words = text.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2 && word.startsWith(lastTerm)) {
          allTerms.add(word);
        }
      });
    });

    return Array.from(allTerms).slice(0, limit);
  }
}

// Instancia global del motor de búsqueda mejorado
export const enhancedSearchEngine = new EnhancedSearchEngine();
