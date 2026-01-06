/**
 * Modelo de Revisión de Obra
 * Fase 3: Importación y Gestión de Datos
 * 
 * Almacena el histórico de cambios de una obra (máximo 10 revisiones)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRevisionObra extends Document {
  obra: mongoose.Types.ObjectId;
  version: number;
  contenido?: string;
  estado: 'publicado' | 'borrador' | 'archivado';
  esPublico: boolean;
  autorRevision: mongoose.Types.ObjectId; // Usuario que hizo el cambio
  fechaRevision: Date;
  cambios?: string; // Descripción opcional de cambios
  activo: boolean;
}

const RevisionObraSchema: Schema = new Schema({
  obra: {
    type: Schema.Types.ObjectId,
    ref: 'Obra',
    required: true,
    index: true
  },
  version: {
    type: Number,
    required: true,
    min: 1
  },
  contenido: {
    type: String
  },
  estado: {
    type: String,
    enum: ['publicado', 'borrador', 'archivado'],
    required: true
  },
  esPublico: {
    type: Boolean,
    required: true,
    default: false
  },
  autorRevision: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fechaRevision: {
    type: Date,
    required: true,
    default: Date.now
  },
  cambios: {
    type: String,
    trim: true,
    maxlength: 500
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Índice compuesto para obra y versión
RevisionObraSchema.index({ obra: 1, version: 1 }, { unique: true });

// Índice para búsqueda por fecha
RevisionObraSchema.index({ obra: 1, fechaRevision: -1 });

export default mongoose.models.RevisionObra || mongoose.model<IRevisionObra>('RevisionObra', RevisionObraSchema);


