export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { SearchDocument } from '@/utils/search';

// Registrar modelos explícitamente para evitar errores de schema
const AutorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  biografia: { type: String },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ObraSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  descripcion: { type: String },
  esPublico: { type: Boolean, default: false },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const SeccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  nivel: { type: Number, default: 1 },
  seccionPadre: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ParrafoSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  texto: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Crear modelos
const Autor = mongoose.models.Autor || mongoose.model('Autor', AutorSchema);
const Obra = mongoose.models.Obra || mongoose.model('Obra', ObraSchema);
const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', SeccionSchema);
const Parrafo = mongoose.models.Parrafo || mongoose.model('Parrafo', ParrafoSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = request.nextUrl;
    const buildIndex = searchParams.get('buildIndex') === 'true';

    if (buildIndex) {
      // Construir índice de búsqueda
      const documents: SearchDocument[] = [];

      // Obtener todas las obras con sus autores
      const obras = await Obra.find({ esPublico: true, activo: true })
        .populate('autor', 'nombre slug')
        .select('titulo slug descripcion autor');

      // Agregar títulos de obras al índice
      for (const obra of obras) {
        documents.push({
          id: `obra-${obra._id}`,
          titulo: obra.titulo,
          autor: (obra.autor as any).nombre,
          obraSlug: obra.slug,
          autorSlug: (obra.autor as any).slug,
          texto: `${obra.titulo} ${obra.descripcion || ''}`,
          tipo: 'titulo'
        });
      }

      // Obtener todas las secciones
      const secciones = await Seccion.find({ activo: true })
        .populate({
          path: 'obra',
          populate: {
            path: 'autor',
            select: 'nombre slug'
          },
          match: { esPublico: true, activo: true }
        })
        .select('titulo slug obra nivel');

      // Agregar secciones al índice
      for (const seccion of secciones) {
        if (seccion.obra) {
          documents.push({
            id: `seccion-${seccion._id}`,
            titulo: (seccion.obra as any).titulo,
            autor: (seccion.obra as any).autor.nombre,
            obraSlug: (seccion.obra as any).slug,
            autorSlug: (seccion.obra as any).autor.slug,
            seccion: seccion.titulo,
            texto: seccion.titulo,
            tipo: 'seccion'
          });
        }
      }

      // Obtener todos los párrafos
      const parrafos = await Parrafo.find({ activo: true })
        .populate({
          path: 'obra',
          populate: {
            path: 'autor',
            select: 'nombre slug'
          },
          match: { esPublico: true, activo: true }
        })
        .populate('seccion', 'titulo')
        .select('numero texto obra seccion')
        .limit(10000); // Limitar para evitar sobrecarga

      // Agregar párrafos al índice
      for (const parrafo of parrafos) {
        if (parrafo.obra) {
          documents.push({
            id: `parrafo-${parrafo._id}`,
            titulo: (parrafo.obra as any).titulo,
            autor: (parrafo.obra as any).autor.nombre,
            obraSlug: (parrafo.obra as any).slug,
            autorSlug: (parrafo.obra as any).autor.slug,
            seccion: parrafo.seccion ? (parrafo.seccion as any).titulo : undefined,
            texto: parrafo.texto,
            numero: parrafo.numero,
            tipo: 'parrafo'
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: documents,
        count: documents.length
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Parámetro buildIndex requerido'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
