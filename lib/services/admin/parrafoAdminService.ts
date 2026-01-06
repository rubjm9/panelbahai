/**
 * Servicios admin de párrafos
 * 
 * SOLO para usar en API routes o Server Actions con autenticación.
 * NO importar en Server Components públicos.
 */

import dbConnect from '@/lib/mongodb';
import Parrafo from '@/models/Parrafo';
import { revalidateTag } from 'next/cache';
import type { UpdateParrafoInput } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { createParrafoRevision } from './revisionService';

/**
 * Actualiza un párrafo existente
 * 
 * @param parrafoId - ID del párrafo
 * @param data - Datos a actualizar
 * @param userId - ID del usuario que actualiza (opcional, para revisiones)
 * @returns Párrafo actualizado o null si no existe
 * 
 * @throws Error si la actualización falla
 */
export async function updateParrafo(
  parrafoId: string,
  data: UpdateParrafoInput,
  userId?: string
) {
  await dbConnect();
  
  // Crear revisión antes de actualizar si hay userId y hay cambios en el texto
  if (userId && data.texto !== undefined) {
    try {
      await createParrafoRevision(parrafoId, userId, 'Actualización de párrafo');
    } catch (error) {
      console.warn('Error creando revisión:', error);
      // Continuar con la actualización aunque falle la revisión
    }
  }

  const parrafo = await Parrafo.findByIdAndUpdate(
    parrafoId,
    {
      ...data,
      fechaActualizacion: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('obra', 'slug')
    .lean();

  if (!parrafo) {
    return null;
  }

  // Invalidar caché relacionado
  const obraSlug = (parrafo.obra as any).slug;
  await revalidateTag(`obra-${obraSlug}`);
  await revalidateTag(`obra-${obraSlug}-completa`);
  await revalidateTag('obras');

  return {
    _id: parrafo._id.toString(),
    numero: parrafo.numero,
    texto: parrafo.texto,
    uuid: parrafo.uuid,
    orden: parrafo.orden,
    obra: (parrafo.obra as any)._id.toString(),
    seccion: parrafo.seccion?.toString(),
  };
}

/**
 * Crea un nuevo párrafo
 * 
 * @param data - Datos del párrafo
 * @param userId - ID del usuario que crea el párrafo (opcional, para revisiones)
 * @returns Párrafo creado
 */
export async function createParrafo(
  data: {
    numero: number;
    texto: string;
    obra: string; // ObjectId
    seccion?: string; // ObjectId
    orden?: number;
  },
  userId?: string
) {
  await dbConnect();
  
  // Generar UUID
  const uuid = uuidv4();

  const parrafo = new Parrafo({
    ...data,
    uuid,
    orden: data.orden ?? 0,
    activo: true,
  });

  await parrafo.save();
  await parrafo.populate('obra', 'slug');

  // Crear revisión inicial si hay userId
  if (userId) {
    try {
      await createParrafoRevision(parrafo._id.toString(), userId, 'Creación inicial de párrafo');
    } catch (error) {
      console.warn('Error creando revisión inicial:', error);
      // No fallar la creación si la revisión falla
    }
  }

  // Invalidar caché relacionado
  const obraSlug = (parrafo.obra as any).slug;
  await revalidateTag(`obra-${obraSlug}`);
  await revalidateTag(`obra-${obraSlug}-completa`);
  await revalidateTag('obras');

  return {
    _id: parrafo._id.toString(),
    numero: parrafo.numero,
    texto: parrafo.texto,
    uuid: parrafo.uuid,
    orden: parrafo.orden,
    obra: parrafo.obra.toString(),
    seccion: parrafo.seccion?.toString(),
  };
}

/**
 * Elimina (soft delete) un párrafo
 * 
 * @param parrafoId - ID del párrafo
 * @returns true si se eliminó, false si no existe
 */
export async function deleteParrafo(parrafoId: string): Promise<boolean> {
  await dbConnect();
  
  const parrafo = await Parrafo.findByIdAndUpdate(
    parrafoId,
    {
      activo: false,
      fechaActualizacion: new Date(),
    },
    { new: true }
  )
    .populate('obra', 'slug')
    .lean();

  if (!parrafo) {
    return false;
  }

  // Invalidar caché relacionado
  const obraSlug = (parrafo.obra as any).slug;
  await revalidateTag(`obra-${obraSlug}`);
  await revalidateTag(`obra-${obraSlug}-completa`);
  await revalidateTag('obras');

  return true;
}

