/**
 * Servicio de Publicación Controlada
 * Fase 3: Importación y Gestión de Datos
 * 
 * Gestiona la publicación de obras preservando el histórico
 */

import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import { createObraRevision } from './revisionService';
import { revalidateTag } from 'next/cache';

/**
 * Publica una obra sin mutar el histórico
 * 
 * @param obraId - ID de la obra
 * @param userId - ID del usuario que publica
 * @returns Obra publicada
 */
export async function publishObra(
  obraId: string,
  userId: string
) {
  await dbConnect();

  const obra = await Obra.findById(obraId);
  if (!obra) {
    throw new Error('Obra no encontrada');
  }

  // Crear revisión antes de cambiar estado
  await createObraRevision(
    obraId,
    userId,
    'Publicación de obra'
  );

  // Cambiar estado sin mutar contenido
  obra.estado = 'publicado';
  obra.esPublico = true;
  obra.fechaActualizacion = new Date();
  await obra.save();

  // Invalidar caché
  await revalidateTag(`obra-${obra.slug}`);
  await revalidateTag(`obra-${obra.slug}-completa`);
  await revalidateTag('obras');
  await revalidateTag(`autor-${(await obra.populate('autor')).slug}`);

  return {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    estado: obra.estado,
    esPublico: obra.esPublico
  };
}

/**
 * Despublica una obra sin mutar el histórico
 * 
 * @param obraId - ID de la obra
 * @param userId - ID del usuario que despublica
 * @returns Obra despublicada
 */
export async function unpublishObra(
  obraId: string,
  userId: string
) {
  await dbConnect();

  const obra = await Obra.findById(obraId);
  if (!obra) {
    throw new Error('Obra no encontrada');
  }

  // Crear revisión antes de cambiar estado
  await createObraRevision(
    obraId,
    userId,
    'Despublicación de obra'
  );

  // Cambiar estado sin mutar contenido
  obra.estado = 'borrador';
  obra.esPublico = false;
  obra.fechaActualizacion = new Date();
  await obra.save();

  // Invalidar caché
  await revalidateTag(`obra-${obra.slug}`);
  await revalidateTag(`obra-${obra.slug}-completa`);
  await revalidateTag('obras');
  await revalidateTag(`autor-${(await obra.populate('autor')).slug}`);

  return {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    estado: obra.estado,
    esPublico: obra.esPublico
  };
}

/**
 * Cambia el estado de publicación de una obra con registro
 * 
 * @param obraId - ID de la obra
 * @param estado - Nuevo estado ('publicado', 'borrador', 'archivado')
 * @param esPublico - Si debe ser público
 * @param userId - ID del usuario que hace el cambio
 * @returns Obra actualizada
 */
export async function changePublicationState(
  obraId: string,
  estado: 'publicado' | 'borrador' | 'archivado',
  esPublico: boolean,
  userId: string
) {
  await dbConnect();

  const obra = await Obra.findById(obraId);
  if (!obra) {
    throw new Error('Obra no encontrada');
  }

  // Crear revisión antes de cambiar estado
  await createObraRevision(
    obraId,
    userId,
    `Cambio de estado a: ${estado}`
  );

  // Cambiar estado
  obra.estado = estado;
  obra.esPublico = esPublico;
  obra.fechaActualizacion = new Date();
  await obra.save();

  // Invalidar caché
  await revalidateTag(`obra-${obra.slug}`);
  await revalidateTag(`obra-${obra.slug}-completa`);
  await revalidateTag('obras');
  await revalidateTag(`autor-${(await obra.populate('autor')).slug}`);

  return {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    estado: obra.estado,
    esPublico: obra.esPublico
  };
}


