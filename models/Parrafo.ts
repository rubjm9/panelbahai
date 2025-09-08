import mongoose, { Schema, Document } from 'mongoose';

export interface IParrafo extends Document {
  numero: number;
  texto: string;
  obra: mongoose.Types.ObjectId;
  seccion?: mongoose.Types.ObjectId;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const ParrafoSchema: Schema = new Schema({
  numero: {
    type: Number,
    required: true
  },
  texto: {
    type: String,
    required: true,
    trim: true
  },
  obra: {
    type: Schema.Types.ObjectId,
    ref: 'Obra',
    required: true
  },
  seccion: {
    type: Schema.Types.ObjectId,
    ref: 'Seccion',
    default: null
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
  }
});

// Índice compuesto para número único por obra
ParrafoSchema.index({ obra: 1, numero: 1 }, { unique: true });

// Índice para búsqueda de texto
ParrafoSchema.index({ texto: 'text' });

// Middleware para actualizar fechaActualizacion
ParrafoSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Parrafo || mongoose.model<IParrafo>('Parrafo', ParrafoSchema);
