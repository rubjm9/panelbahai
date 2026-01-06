/**
 * Servicios públicos de autores
 * 
 * Seguro para importar en Server Components.
 * Solo operaciones de lectura de datos públicos.
 */

import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import { unstable_cache } from 'next/cache';
import type { PublicAutor } from '../types';

/**
 * Obtiene un autor por su slug (público)
 * 
 * @param slug - Slug del autor
 * @returns Autor público o null si no existe o no está activo
 */
export async function getAutorBySlug(slug: string): Promise<PublicAutor | null> {
  await dbConnect();
  
  const autor = await Autor.findOne({ slug, activo: true })
    .select('nombre slug biografia orden')
    .lean();
  
  if (!autor) return null;
  
  return {
    _id: autor._id.toString(),
    nombre: autor.nombre,
    slug: autor.slug,
    biografia: autor.biografia,
    orden: autor.orden,
  };
}

/**
 * Lista todos los autores activos (públicos)
 * Ordenados por orden y nombre
 * 
 * @returns Array de autores públicos
 */
export async function listPublishedAutores(): Promise<PublicAutor[]> {
  await dbConnect();
  
  const autores = await Autor.find({ activo: true })
    .sort({ orden: 1, nombre: 1 })
    .select('nombre slug biografia orden')
    .lean();
  
  return autores.map(autor => ({
    _id: autor._id.toString(),
    nombre: autor.nombre,
    slug: autor.slug,
    biografia: autor.biografia,
    orden: autor.orden,
  }));
}

/**
 * Versión con caché de getAutorBySlug
 * 
 * Usa revalidateTag para invalidación selectiva:
 * - revalidateTag('autores') - invalida todos
 * - revalidateTag(`autor-${slug}`) - invalida uno específico
 */
export const getCachedAutorBySlug = unstable_cache(
  async (slug: string): Promise<PublicAutor | null> => {
    return getAutorBySlug(slug);
  },
  ['autor-by-slug'],
  {
    tags: ['autores', `autor-${slug}`],
    revalidate: 3600, // 1 hora
  }
);

/**
 * Versión con caché de listPublishedAutores
 */
export const listCachedPublishedAutores = unstable_cache(
  async (): Promise<PublicAutor[]> => {
    return listPublishedAutores();
  },
  ['list-published-autores'],
  {
    tags: ['autores'],
    revalidate: 3600, // 1 hora
  }
);


