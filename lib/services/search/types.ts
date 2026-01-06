/**
 * Tipos para el sistema de búsqueda optimizado
 */

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

export interface SearchChunk {
  id: string;
  obraSlug: string;
  autorSlug: string;
  documents: SearchDocument[];
  loaded: boolean;
  timestamp: number;
}

export interface ChunkMetadata {
  obraSlug: string;
  autorSlug: string;
  documentCount: number;
  size: number; // tamaño aproximado en bytes
}

export interface SearchWorkerMessage {
  type: 'BUILD_INDEX' | 'SEARCH' | 'LOAD_CHUNK' | 'CLEAR_INDEX' | 'ERROR';
  payload?: any;
  id?: string; // para correlacionar request/response
}

export interface SearchWorkerResponse {
  type: 'INDEX_BUILT' | 'SEARCH_RESULTS' | 'CHUNK_LOADED' | 'ERROR';
  payload?: any;
  id?: string;
  error?: string;
}


