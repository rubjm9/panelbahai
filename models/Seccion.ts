import mongoose, { Schema, Document } from 'mongoose';

export interface ISeccion extends Document {
  titulo: string;
  slug: string;
  obra: mongoose.Types.ObjectId;
  seccionPadre?: mongoose.Types.ObjectId;
  nivel: number; // 1 = sección, 2 = subsección, 3 = sub-subsección
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  // Fase 3: UUIDs
  uuid?: string;
}

const SeccionSchema: Schema = new Schema({
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
  obra: {
    type: Schema.Types.ObjectId,
    ref: 'Obra',
    required: true
  },
  seccionPadre: {
    type: Schema.Types.ObjectId,
    ref: 'Seccion',
    default: null
  },
  nivel: {
    type: Number,
    required: true,
    min: 1,
    max: 3
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
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  // Fase 3: UUIDs
  uuid: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Índice compuesto para slug único por obra
SeccionSchema.index({ obra: 1, slug: 1 }, { unique: true });

// Índice para UUID (Fase 3)
SeccionSchema.index({ uuid: 1 }, { unique: true, sparse: true });

// Middleware para actualizar fechaActualizacion
SeccionSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Seccion || mongoose.model<ISeccion>('Seccion', SeccionSchema);
