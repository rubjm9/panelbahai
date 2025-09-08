import mongoose, { Schema, Document } from 'mongoose';

export interface IUsuario extends Document {
  email: string;
  nombre: string;
  password: string;
  rol: 'admin' | 'editor' | 'viewer';
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const UsuarioSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
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
UsuarioSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);
