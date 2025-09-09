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
  numero?: number;
  tipo: 'titulo' | 'seccion' | 'parrafo';
  score: number;
}

export class SearchEngine {
  private index: lunr.Index | null = null;
  private documents: Map<string, SearchDocument> = new Map();

  constructor() {}

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

  // Realizar búsqueda
  search(query: string, limit: number = 50): SearchResult[] {
    if (!this.index || query.length < 3) {
      return [];
    }

    try {
      // Buscar con comodines para coincidencias parciales
      const searchQuery = query
        .split(/\s+/)
        .map(term => `${term}* ${term}~1`)
        .join(' ');

      const results = this.index.search(searchQuery);
      
      // Primero filtramos los documentos nulos y luego mapeamos para asegurar que el tipo sea correcto
      const filteredResults = results
        .slice(0, limit)
        .map(result => {
          const doc = this.documents.get(result.ref);
          if (!doc) return null;

          return {
            ...doc,
            fragmento: this.extractFragment(doc.texto, query),
            score: result.score
          };
        })
        .filter((result): result is SearchResult => result !== null);
      
      // Ordenamos los resultados filtrados
      return filteredResults.sort(this.sortResults.bind(this));
        
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }

  // Extraer fragmento relevante del texto
  private extractFragment(texto: string, query: string, maxLength: number = 200): string {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const textoLower = texto.toLowerCase();
    
    // Encontrar la primera ocurrencia de cualquier término
    let startIndex = -1;
    for (const term of queryTerms) {
      const index = textoLower.indexOf(term);
      if (index !== -1 && (startIndex === -1 || index < startIndex)) {
        startIndex = index;
      }
    }

    if (startIndex === -1) {
      return texto.substring(0, maxLength) + (texto.length > maxLength ? '...' : '');
    }

    // Expandir hacia atrás y adelante para obtener contexto
    const contextStart = Math.max(0, startIndex - 50);
    const contextEnd = Math.min(texto.length, startIndex + maxLength - 50);
    
    let fragment = texto.substring(contextStart, contextEnd);
    
    if (contextStart > 0) fragment = '...' + fragment;
    if (contextEnd < texto.length) fragment = fragment + '...';

    return fragment;
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

  // Resaltar términos de búsqueda en texto
  highlightTerms(text: string, query: string): string {
    if (!query) return text;

    const terms = query.toLowerCase().split(/\s+/);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    return highlightedText;
  }
}

// Instancia global del motor de búsqueda
export const searchEngine = new SearchEngine();
