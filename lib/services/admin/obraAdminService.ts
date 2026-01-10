/**
 * Servicios admin de obras
 * 
 * SOLO para usar en API routes o Server Actions con autenticación.
 * NO importar en Server Components públicos.
 */

import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Autor from '@/models/Autor';
import { revalidateTag } from 'next/cache';
import type { CreateObraInput, UpdateObraInput } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createObraRevision } from './revisionService';

/**
 * Crea una nueva obra
 * 
 * @param data - Datos de la obra
 * @param userId - ID del usuario que crea la obra (opcional, para revisiones)
 * @returns Obra creada
 * 
 * @throws Error si el autor no existe o el slug ya está en uso
 */
export async function createObra(data: CreateObraInput, userId?: string) {
  await dbConnect();

  // Validar que el autor existe
  const autor = await Autor.findById(data.autor);
  if (!autor) {
    throw new Error('Autor no encontrado');
  }

  // Generar slug único
  let slug = data.titulo
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  // Verificar que el slug sea único para este autor
  let counter = 1;
  let originalSlug = slug;
  while (await Obra.findOne({ autor: data.autor, slug })) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  // Generar UUID
  const uuid = uuidv4();

  const obra = new Obra({
    ...data,
    slug,
    uuid,
    orden: data.orden ?? 0,
    activo: true,
    estado: data.esPublico ? 'publicado' : 'borrador',
  });

  await obra.save();
  await obra.populate('autor', 'nombre slug');

  // Crear revisión inicial si hay userId
  if (userId) {
    try {
      await createObraRevision(obra._id.toString(), userId, 'Creación inicial de obra');
    } catch (error) {
      console.warn('Error creando revisión inicial:', error);
      // No fallar la creación si la revisión falla
    }
  }

  // Invalidar caché
  await revalidateTag('obras');
  await revalidateTag(`autor-${autor.slug}`);
  await revalidateTag('autores');

  return {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    uuid: obra.uuid,
    descripcion: obra.descripcion,
    autor: {
      _id: (obra.autor as any)._id.toString(),
      nombre: (obra.autor as any).nombre,
      slug: (obra.autor as any).slug,
    },
    esPublico: obra.esPublico,
    estado: obra.estado,
  };
}

/**
 * Actualiza una obra existente
 * 
 * @param obraId - ID de la obra
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (opcional, para revisiones)
 * @returns Obra actualizada o null si no existe
 */
export async function updateObra(
  obraId: string,
  data: UpdateObraInput,
  userId?: string
) {
  await dbConnect();

  // Obtener obra actual antes de actualizar
  const obraActual = await Obra.findById(obraId);
  if (!obraActual) {
    return null;
  }

  // Crear revisión antes de actualizar si hay userId y hay cambios significativos
  if (userId && (data.contenido !== undefined || data.estado !== undefined || data.esPublico !== undefined)) {
    try {
      await createObraRevision(obraId, userId, 'Actualización de obra');
    } catch (error) {
      console.warn('Error creando revisión:', error);
      // Continuar con la actualización aunque falle la revisión
    }
  }

  const obra = await Obra.findByIdAndUpdate(
    obraId,
    {
      ...data,
      fechaActualizacion: new Date(),
      // Si cambia esPublico, actualizar estado
      ...(data.esPublico !== undefined && {
        estado: data.esPublico ? 'publicado' : 'borrador',
      }),
    },
    { new: true, runValidators: true }
  )
    .populate('autor', 'nombre slug')
    .lean();

  if (!obra) {
    return null;
  }

  // Type assertion para manejar el tipo de lean() con populate()
  const obraTyped = obra as any;

  // Invalidar caché
  await revalidateTag(`obra-${obraTyped.slug}`);
  await revalidateTag(`obra-${obraTyped.slug}-completa`);
  await revalidateTag('obras');
  await revalidateTag(`autor-${obraTyped.autor?.slug || ''}`);
  await revalidateTag('autores');

  return {
    _id: obraTyped._id.toString(),
    titulo: obraTyped.titulo,
    slug: obraTyped.slug,
    uuid: obraTyped.uuid,
    descripcion: obraTyped.descripcion,
    autor: {
      _id: obraTyped.autor?._id?.toString() || '',
      nombre: obraTyped.autor?.nombre || '',
      slug: obraTyped.autor?.slug || '',
    },
    esPublico: obraTyped.esPublico,
    estado: obraTyped.estado,
  };
}

/**
 * Elimina (soft delete) una obra
 * También desactiva párrafos y secciones relacionadas
 * 
 * @param obraId - ID de la obra
 * @returns true si se eliminó, false si no existe
 */
export async function deleteObra(obraId: string): Promise<boolean> {
  await dbConnect();

  const obra = await Obra.findByIdAndUpdate(
    obraId,
    {
      activo: false,
      fechaActualizacion: new Date(),
    },
    { new: true }
  )
    .populate('autor', 'slug')
    .lean();

  if (!obra) {
    return false;
  }

  const obraTyped = obra as any;

  // Desactivar párrafos y secciones relacionadas
  const { default: Parrafo } = await import('@/models/Parrafo');
  const { default: Seccion } = await import('@/models/Seccion');

  await Promise.all([
    Parrafo.updateMany(
      { obra: obraId },
      { activo: false, fechaActualizacion: new Date() }
    ),
    Seccion.updateMany(
      { obra: obraId },
      { activo: false, fechaActualizacion: new Date() }
    ),
  ]);

  // Invalidar caché
  await revalidateTag(`obra-${obraTyped.slug}`);
  await revalidateTag(`obra-${obraTyped.slug}-completa`);
  await revalidateTag('obras');
  await revalidateTag(`autor-${(obraTyped.autor as any).slug}`);
  await revalidateTag('autores');

  return true;
}

