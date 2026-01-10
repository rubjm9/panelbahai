/**
 * Servicios públicos de obras
 * 
 * Seguro para importar en Server Components.
 * Solo operaciones de lectura de datos públicos.
 */

import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';
import Autor from '@/models/Autor';
import { unstable_cache } from 'next/cache';
import type { PublicObra, ObraCompleta, PublicSeccion, PublicParrafo } from '../types';

/**
 * Obtiene una obra pública por slug
 * 
 * @param obraSlug - Slug de la obra
 * @param autorSlug - Slug del autor (opcional, para validación)
 * @returns Obra pública o null si no existe, no está activa o no es pública
 */
export async function getPublishedWorkBySlug(
  obraSlug: string,
  autorSlug?: string
): Promise<PublicObra | null> {
  await dbConnect();

  let obraQuery = Obra.findOne({ slug: obraSlug, activo: true, esPublico: true })
    .populate('autor', 'nombre slug biografia');

  if (autorSlug) {
    obraQuery = obraQuery.populate({
      path: 'autor',
      match: { slug: autorSlug },
      select: 'nombre slug biografia'
    });
  }

  const obra = await obraQuery.lean();

  const obraTyped = obra as any;

  if (!obraTyped || !obraTyped.autor || (autorSlug && (obraTyped.autor as any).slug !== autorSlug)) {
    return null;
  }

  return {
    _id: obraTyped._id.toString(),
    titulo: obraTyped.titulo,
    slug: obraTyped.slug,
    descripcion: obraTyped.descripcion,
    fechaPublicacion: obraTyped.fechaPublicacion,
    esPublico: obraTyped.esPublico,
    archivoDoc: obraTyped.archivoDoc,
    archivoPdf: obraTyped.archivoPdf,
    archivoEpub: obraTyped.archivoEpub,
    autor: {
      _id: (obraTyped.autor as any)._id.toString(),
      nombre: (obraTyped.autor as any).nombre,
      slug: (obraTyped.autor as any).slug,
      biografia: (obraTyped.autor as any).biografia,
    },
  };
}

/**
 * Lista obras públicas por autor
 * 
 * @param autorSlug - Slug del autor
 * @returns Array de obras públicas
 */
export async function listPublishedWorksByAutor(
  autorSlug: string
): Promise<PublicObra[]> {
  await dbConnect();

  const autor = await Autor.findOne({ slug: autorSlug, activo: true });
  if (!autor) return [];

  const obras = await Obra.find({
    autor: autor._id,
    activo: true,
    esPublico: true
  })
    .populate('autor', 'nombre slug')
    .sort({ orden: 1, titulo: 1 })
    .select('titulo slug descripcion esPublico orden autor fechaCreacion')
    .lean() as any[];

  return obras.map(obra => ({
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    descripcion: obra.descripcion,
    fechaPublicacion: obra.fechaPublicacion,
    esPublico: obra.esPublico,
    archivoDoc: obra.archivoDoc,
    archivoPdf: obra.archivoPdf,
    archivoEpub: obra.archivoEpub,
    autor: {
      _id: (obra.autor as any)._id.toString(),
      nombre: (obra.autor as any).nombre,
      slug: (obra.autor as any).slug,
    },
  }));
}

/**
 * Obtiene una obra completa con secciones y párrafos
 * 
 * @param obraSlug - Slug de la obra
 * @param autorSlug - Slug del autor (opcional, para validación)
 * @returns Obra completa o null
 */
export async function getPublishedWorkComplete(
  obraSlug: string,
  autorSlug?: string
): Promise<ObraCompleta | null> {
  await dbConnect();

  // Obtener obra
  const obra = await getPublishedWorkBySlug(obraSlug, autorSlug);
  if (!obra) return null;

  const obraId = obra._id;

  // Obtener secciones y párrafos en paralelo
  const [seccionesRaw, parrafosRaw] = await Promise.all([
    Seccion.find({ obra: obraId, activo: true })
      .sort({ orden: 1 })
      .select('titulo slug nivel orden seccionPadre')
      .lean() as Promise<any[]>,
    Parrafo.find({ obra: obraId, activo: true })
      .populate('seccion', 'titulo slug')
      .sort({ orden: 1, numero: 1 })
      .select('numero texto seccion orden')
      .lean() as Promise<any[]>
  ]);

  // Organizar secciones jerárquicamente
  const seccionesMap = new Map<string, PublicSeccion>();
  const seccionesRaiz: PublicSeccion[] = [];

  // Crear mapa de secciones
  seccionesRaw.forEach(seccion => {
    seccionesMap.set(seccion._id.toString(), {
      _id: seccion._id.toString(),
      titulo: seccion.titulo,
      slug: seccion.slug,
      nivel: seccion.nivel,
      orden: seccion.orden,
      subsecciones: [],
    });
  });

  // Construir jerarquía
  seccionesRaw.forEach(seccion => {
    const seccionObj = seccionesMap.get(seccion._id.toString())!;
    if (seccion.seccionPadre) {
      const padre = seccionesMap.get(seccion.seccionPadre.toString());
      if (padre) {
        padre.subsecciones.push(seccionObj);
      } else {
        // Si el padre no existe, poner en raíz
        seccionesRaiz.push(seccionObj);
      }
    } else {
      seccionesRaiz.push(seccionObj);
    }
  });

  // Ordenar subsecciones recursivamente
  const sortSecciones = (secciones: PublicSeccion[]) => {
    secciones.sort((a, b) => a.orden - b.orden);
    secciones.forEach(s => sortSecciones(s.subsecciones));
  };
  sortSecciones(seccionesRaiz);

  // Transformar párrafos
  const parrafos: PublicParrafo[] = parrafosRaw.map(p => ({
    _id: p._id.toString(),
    numero: p.numero,
    texto: p.texto,
    orden: p.orden,
    seccion: p.seccion ? {
      titulo: (p.seccion as any).titulo,
      slug: (p.seccion as any).slug,
    } : undefined,
  }));

  return {
    obra,
    secciones: seccionesRaiz,
    parrafos,
  };
}

/**
 * Versión con caché de getPublishedWorkBySlug
 * 
 * Nota: Los tags se generan dinámicamente basados en el slug.
 * Para invalidar: revalidateTag(`obra-${obraSlug}`) o revalidateTag('obras')
 */
export async function getCachedPublishedWorkBySlug(
  obraSlug: string,
  autorSlug?: string
): Promise<PublicObra | null> {
  return unstable_cache(
    async () => {
      return getPublishedWorkBySlug(obraSlug, autorSlug);
    },
    [`obra-${obraSlug}`, autorSlug || ''],
    {
      tags: ['obras', `obra-${obraSlug}`],
      revalidate: 3600, // 1 hora
    }
  )();
}

/**
 * Versión con caché de getPublishedWorkComplete
 * 
 * Nota: Esta función es más pesada, considerar revalidate más corto.
 * Para invalidar: revalidateTag(`obra-${obraSlug}-completa`) o revalidateTag('obras')
 */
export async function getCachedPublishedWorkComplete(
  obraSlug: string,
  autorSlug?: string
): Promise<ObraCompleta | null> {
  return unstable_cache(
    async () => {
      return getPublishedWorkComplete(obraSlug, autorSlug);
    },
    [`obra-completa-${obraSlug}`, autorSlug || ''],
    {
      tags: [
        'obras',
        `obra-${obraSlug}`,
        `obra-${obraSlug}-completa`,
      ],
      revalidate: 1800, // 30 minutos (más corto porque incluye párrafos)
    }
  )();
}

