/**
 * Modelo de Revisión de Párrafo
 * Fase 3: Importación y Gestión de Datos
 * 
 * Almacena el histórico de cambios de un párrafo (máximo 10 revisiones)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRevisionParrafo extends Document {
  parrafo: mongoose.Types.ObjectId;
  version: number;
  texto: string;
  numero: number;
  autorRevision: mongoose.Types.ObjectId; // Usuario que hizo el cambio
  fechaRevision: Date;
  cambios?: string; // Descripción opcional de cambios
  activo: boolean;
}

const RevisionParrafoSchema: Schema = new Schema({
  parrafo: {
    type: Schema.Types.ObjectId,
    ref: 'Parrafo',
    required: true,
    index: true
  },
  version: {
    type: Number,
    required: true,
    min: 1
  },
  texto: {
    type: String,
    required: true,
    trim: true
  },
  numero: {
    type: Number,
    required: true
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

// Índice compuesto para párrafo y versión
RevisionParrafoSchema.index({ parrafo: 1, version: 1 }, { unique: true });

// Índice para búsqueda por fecha
RevisionParrafoSchema.index({ parrafo: 1, fechaRevision: -1 });

export default mongoose.models.RevisionParrafo || mongoose.model<IRevisionParrafo>('RevisionParrafo', RevisionParrafoSchema);


