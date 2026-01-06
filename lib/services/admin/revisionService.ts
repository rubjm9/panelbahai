/**
 * Servicio de Revisiones
 * Fase 3: Importación y Gestión de Datos
 * 
 * Gestiona el histórico de cambios de obras y párrafos
 * Mantiene máximo 10 revisiones por documento
 */

import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Parrafo from '@/models/Parrafo';
import RevisionObra from '@/models/RevisionObra';
import RevisionParrafo from '@/models/RevisionParrafo';
import mongoose from 'mongoose';

const MAX_REVISIONS = 10;

/**
 * Crea una nueva revisión de una obra
 * 
 * @param obraId - ID de la obra
 * @param userId - ID del usuario que hace el cambio
 * @param cambios - Descripción opcional de los cambios
 * @returns Revisión creada
 */
export async function createObraRevision(
  obraId: string,
  userId: string,
  cambios?: string
) {
  await dbConnect();

  const obra = await Obra.findById(obraId);
  if (!obra) {
    throw new Error('Obra no encontrada');
  }

  // Obtener la versión actual
  const revisionesExistentes = await RevisionObra.find({ obra: obraId, activo: true })
    .sort({ version: -1 })
    .limit(1);

  const nuevaVersion = revisionesExistentes.length > 0
    ? revisionesExistentes[0].version + 1
    : 1;

  // Crear nueva revisión
  const revision = new RevisionObra({
    obra: obraId,
    version: nuevaVersion,
    contenido: obra.contenido,
    estado: obra.estado,
    esPublico: obra.esPublico,
    autorRevision: userId,
    fechaRevision: new Date(),
    cambios: cambios || `Revisión ${nuevaVersion}`,
    activo: true
  });

  await revision.save();

  // Actualizar obra con nueva revisión
  const revisiones = obra.revisiones || [];
  revisiones.push(revision._id);

  // Rotar si hay más de MAX_REVISIONS
  if (revisiones.length > MAX_REVISIONS) {
    await rotateObraRevisions(obraId);
  } else {
    obra.revisionActual = revision._id;
    obra.revisiones = revisiones;
    await obra.save();
  }

  return {
    _id: revision._id.toString(),
    version: revision.version,
    fechaRevision: revision.fechaRevision,
    cambios: revision.cambios,
    autorRevision: revision.autorRevision.toString()
  };
}

/**
 * Crea una nueva revisión de un párrafo
 * 
 * @param parrafoId - ID del párrafo
 * @param userId - ID del usuario que hace el cambio
 * @param cambios - Descripción opcional de los cambios
 * @returns Revisión creada
 */
export async function createParrafoRevision(
  parrafoId: string,
  userId: string,
  cambios?: string
) {
  await dbConnect();

  const parrafo = await Parrafo.findById(parrafoId);
  if (!parrafo) {
    throw new Error('Párrafo no encontrado');
  }

  // Obtener la versión actual
  const revisionesExistentes = await RevisionParrafo.find({ parrafo: parrafoId, activo: true })
    .sort({ version: -1 })
    .limit(1);

  const nuevaVersion = revisionesExistentes.length > 0
    ? revisionesExistentes[0].version + 1
    : 1;

  // Crear nueva revisión
  const revision = new RevisionParrafo({
    parrafo: parrafoId,
    version: nuevaVersion,
    texto: parrafo.texto,
    numero: parrafo.numero,
    autorRevision: userId,
    fechaRevision: new Date(),
    cambios: cambios || `Revisión ${nuevaVersion}`,
    activo: true
  });

  await revision.save();

  // Actualizar párrafo con nueva revisión
  const revisiones = parrafo.revisiones || [];
  revisiones.push(revision._id);

  // Rotar si hay más de MAX_REVISIONS
  if (revisiones.length > MAX_REVISIONS) {
    await rotateParrafoRevisions(parrafoId);
  } else {
    parrafo.revisionActual = revision._id;
    parrafo.revisiones = revisiones;
    await parrafo.save();
  }

  return {
    _id: revision._id.toString(),
    version: revision.version,
    fechaRevision: revision.fechaRevision,
    cambios: revision.cambios,
    autorRevision: revision.autorRevision.toString()
  };
}

/**
 * Obtiene una revisión específica de una obra
 * 
 * @param obraId - ID de la obra
 * @param version - Número de versión
 * @returns Revisión o null si no existe
 */
export async function getObraRevision(
  obraId: string,
  version: number
) {
  await dbConnect();

  const revision = await RevisionObra.findOne({
    obra: obraId,
    version,
    activo: true
  })
    .populate('autorRevision', 'nombre email')
    .lean();

  if (!revision) {
    return null;
  }

  return {
    _id: revision._id.toString(),
    version: revision.version,
    contenido: revision.contenido,
    estado: revision.estado,
    esPublico: revision.esPublico,
    fechaRevision: revision.fechaRevision,
    cambios: revision.cambios,
    autorRevision: revision.autorRevision
  };
}

/**
 * Obtiene una revisión específica de un párrafo
 * 
 * @param parrafoId - ID del párrafo
 * @param version - Número de versión
 * @returns Revisión o null si no existe
 */
export async function getParrafoRevision(
  parrafoId: string,
  version: number
) {
  await dbConnect();

  const revision = await RevisionParrafo.findOne({
    parrafo: parrafoId,
    version,
    activo: true
  })
    .populate('autorRevision', 'nombre email')
    .lean();

  if (!revision) {
    return null;
  }

  return {
    _id: revision._id.toString(),
    version: revision.version,
    texto: revision.texto,
    numero: revision.numero,
    fechaRevision: revision.fechaRevision,
    cambios: revision.cambios,
    autorRevision: revision.autorRevision
  };
}

/**
 * Lista todas las revisiones de una obra
 * 
 * @param obraId - ID de la obra
 * @returns Lista de revisiones ordenadas por versión descendente
 */
export async function listObraRevisions(obraId: string) {
  await dbConnect();

  const revisiones = await RevisionObra.find({
    obra: obraId,
    activo: true
  })
    .sort({ version: -1 })
    .populate('autorRevision', 'nombre email')
    .lean();

  return revisiones.map(rev => ({
    _id: rev._id.toString(),
    version: rev.version,
    estado: rev.estado,
    esPublico: rev.esPublico,
    fechaRevision: rev.fechaRevision,
    cambios: rev.cambios,
    autorRevision: rev.autorRevision
  }));
}

/**
 * Lista todas las revisiones de un párrafo
 * 
 * @param parrafoId - ID del párrafo
 * @returns Lista de revisiones ordenadas por versión descendente
 */
export async function listParrafoRevisions(parrafoId: string) {
  await dbConnect();

  const revisiones = await RevisionParrafo.find({
    parrafo: parrafoId,
    activo: true
  })
    .sort({ version: -1 })
    .populate('autorRevision', 'nombre email')
    .lean();

  return revisiones.map(rev => ({
    _id: rev._id.toString(),
    version: rev.version,
    numero: rev.numero,
    fechaRevision: rev.fechaRevision,
    cambios: rev.cambios,
    autorRevision: rev.autorRevision
  }));
}

/**
 * Revierte una obra a una versión anterior
 * 
 * @param obraId - ID de la obra
 * @param version - Versión a la que revertir
 * @param userId - ID del usuario que hace la reversión
 * @returns Obra actualizada
 */
export async function revertObraToRevision(
  obraId: string,
  version: number,
  userId: string
) {
  await dbConnect();

  const revision = await RevisionObra.findOne({
    obra: obraId,
    version,
    activo: true
  });

  if (!revision) {
    throw new Error(`Revisión ${version} no encontrada`);
  }

  const obra = await Obra.findById(obraId);
  if (!obra) {
    throw new Error('Obra no encontrada');
  }

  // Crear nueva revisión con el estado revertido
  const nuevaRevision = await createObraRevision(
    obraId,
    userId,
    `Reversión a versión ${version}`
  );

  // Restaurar contenido y estado de la revisión
  obra.contenido = revision.contenido;
  obra.estado = revision.estado;
  obra.esPublico = revision.esPublico;
  obra.revisionActual = nuevaRevision._id;
  await obra.save();

  return {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    estado: obra.estado,
    esPublico: obra.esPublico,
    revisionActual: obra.revisionActual?.toString()
  };
}

/**
 * Revierte un párrafo a una versión anterior
 * 
 * @param parrafoId - ID del párrafo
 * @param version - Versión a la que revertir
 * @param userId - ID del usuario que hace la reversión
 * @returns Párrafo actualizado
 */
export async function revertParrafoToRevision(
  parrafoId: string,
  version: number,
  userId: string
) {
  await dbConnect();

  const revision = await RevisionParrafo.findOne({
    parrafo: parrafoId,
    version,
    activo: true
  });

  if (!revision) {
    throw new Error(`Revisión ${version} no encontrada`);
  }

  const parrafo = await Parrafo.findById(parrafoId);
  if (!parrafo) {
    throw new Error('Párrafo no encontrado');
  }

  // Crear nueva revisión con el estado revertido
  const nuevaRevision = await createParrafoRevision(
    parrafoId,
    userId,
    `Reversión a versión ${version}`
  );

  // Restaurar texto de la revisión
  parrafo.texto = revision.texto;
  parrafo.revisionActual = nuevaRevision._id;
  await parrafo.save();

  return {
    _id: parrafo._id.toString(),
    numero: parrafo.numero,
    texto: parrafo.texto,
    revisionActual: parrafo.revisionActual?.toString()
  };
}

/**
 * Rota las revisiones de una obra manteniendo máximo MAX_REVISIONS
 * 
 * @param obraId - ID de la obra
 */
async function rotateObraRevisions(obraId: string) {
  await dbConnect();

  const obra = await Obra.findById(obraId);
  if (!obra) return;

  // Obtener todas las revisiones ordenadas por versión
  const todasRevisiones = await RevisionObra.find({
    obra: obraId,
    activo: true
  })
    .sort({ version: -1 })
    .limit(MAX_REVISIONS + 1);

  if (todasRevisiones.length <= MAX_REVISIONS) {
    return;
  }

  // Desactivar las más antiguas
  const revisionesAMantener = todasRevisiones.slice(0, MAX_REVISIONS);
  const revisionesAEliminar = todasRevisiones.slice(MAX_REVISIONS);

  // Desactivar revisiones antiguas
  const idsAEliminar = revisionesAEliminar.map(r => r._id);
  await RevisionObra.updateMany(
    { _id: { $in: idsAEliminar } },
    { activo: false }
  );

  // Actualizar obra con solo las revisiones mantenidas
  obra.revisiones = revisionesAMantener.map(r => r._id);
  obra.revisionActual = revisionesAMantener[0]._id;
  await obra.save();
}

/**
 * Rota las revisiones de un párrafo manteniendo máximo MAX_REVISIONS
 * 
 * @param parrafoId - ID del párrafo
 */
async function rotateParrafoRevisions(parrafoId: string) {
  await dbConnect();

  const parrafo = await Parrafo.findById(parrafoId);
  if (!parrafo) return;

  // Obtener todas las revisiones ordenadas por versión
  const todasRevisiones = await RevisionParrafo.find({
    parrafo: parrafoId,
    activo: true
  })
    .sort({ version: -1 })
    .limit(MAX_REVISIONS + 1);

  if (todasRevisiones.length <= MAX_REVISIONS) {
    return;
  }

  // Desactivar las más antiguas
  const revisionesAMantener = todasRevisiones.slice(0, MAX_REVISIONS);
  const revisionesAEliminar = todasRevisiones.slice(MAX_REVISIONS);

  // Desactivar revisiones antiguas
  const idsAEliminar = revisionesAEliminar.map(r => r._id);
  await RevisionParrafo.updateMany(
    { _id: { $in: idsAEliminar } },
    { activo: false }
  );

  // Actualizar párrafo con solo las revisiones mantenidas
  parrafo.revisiones = revisionesAMantener.map(r => r._id);
  parrafo.revisionActual = revisionesAMantener[0]._id;
  await parrafo.save();
}


