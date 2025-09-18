import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchIndex extends Document {
  version: string;
  documents: any[];
  lastUpdated: Date;
  count: number;
  obras: number;
  secciones: number;
  parrafos: number;
}

const SearchIndexSchema = new Schema<ISearchIndex>({
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  documents: {
    type: Schema.Types.Mixed,
    required: true,
    default: []
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  obras: {
    type: Number,
    required: true,
    default: 0
  },
  secciones: {
    type: Number,
    required: true,
    default: 0
  },
  parrafos: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Crear índice único para la versión
SearchIndexSchema.index({ version: 1 }, { unique: true });

export default mongoose.models.SearchIndex || mongoose.model<ISearchIndex>('SearchIndex', SearchIndexSchema);
