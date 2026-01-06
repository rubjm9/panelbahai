import mongoose, { Schema, Document } from 'mongoose';

export interface IObra extends Document {
  titulo: string;
  slug: string;
  autor: mongoose.Types.ObjectId;
  descripcion?: string;
  fechaPublicacion?: Date;
  orden: number;
  activo: boolean;
  esPublico: boolean;
  estado: 'publicado' | 'borrador' | 'archivado';
  contenido?: string;
  archivoDoc?: string;
  archivoPdf?: string;
  archivoEpub?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Fase 3: UUIDs y revisiones
  uuid?: string;
  revisionActual?: mongoose.Types.ObjectId;
  revisiones?: mongoose.Types.ObjectId[];
}

const ObraSchema: Schema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'Autor',
    required: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  fechaPublicacion: {
    type: Date
  },
  orden: {
    type: Number,
    required: true,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  esPublico: {
    type: Boolean,
    default: false
  },
  estado: {
    type: String,
    enum: ['publicado', 'borrador', 'archivado'],
    default: 'borrador'
  },
  contenido: {
    type: String
  },
  archivoDoc: {
    type: String
  },
  archivoPdf: {
    type: String
  },
  archivoEpub: {
    type: String
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  // Fase 3: UUIDs y revisiones
  uuid: {
    type: String,
    unique: true,
    sparse: true
  },
  revisionActual: {
    type: Schema.Types.ObjectId,
    ref: 'RevisionObra',
    default: null
  },
  revisiones: [{
    type: Schema.Types.ObjectId,
    ref: 'RevisionObra'
  }]
});

// Índice compuesto para slug único por autor
ObraSchema.index({ autor: 1, slug: 1 }, { unique: true });

// Índice para UUID (Fase 3)
ObraSchema.index({ uuid: 1 }, { unique: true, sparse: true });

// Middleware para actualizar fechaActualizacion
ObraSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Obra || mongoose.model<IObra>('Obra', ObraSchema);
