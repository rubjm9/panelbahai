/**
 * Exportaciones públicas de servicios
 * 
 * Todas estas funciones son seguras para importar en Server Components.
 */

export {
  getAutorBySlug,
  listPublishedAutores,
  getCachedAutorBySlug,
  listCachedPublishedAutores,
} from './autorService';

export {
  getPublishedWorkBySlug,
  listPublishedWorksByAutor,
  getPublishedWorkComplete,
  getCachedPublishedWorkBySlug,
  getCachedPublishedWorkComplete,
} from './obraService';


