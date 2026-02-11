import mongoose, { Schema, Document } from 'mongoose';

export type TipoProximaObra = 'Revisión de traducción' | 'Obra no publicada anteriormente';

export interface IProximaObra extends Document {
  _id: mongoose.Types.ObjectId;
  titulo: string;
  autor: mongoose.Types.ObjectId;
  tipo: TipoProximaObra;
  orden: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const ProximaObraSchema: Schema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'Autor',
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['Revisión de traducción', 'Obra no publicada anteriormente']
  },
  orden: {
    type: Number,
    required: true,
    default: 0
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

ProximaObraSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.ProximaObra || mongoose.model<IProximaObra>('ProximaObra', ProximaObraSchema);
