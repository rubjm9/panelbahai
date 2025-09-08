import mongoose, { Schema, Document } from 'mongoose';

export interface IAutor extends Document {
  nombre: string;
  slug: string;
  biografia?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const AutorSchema: Schema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  biografia: {
    type: String,
    trim: true
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

// Middleware para actualizar fechaActualizacion
AutorSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Autor || mongoose.model<IAutor>('Autor', AutorSchema);
