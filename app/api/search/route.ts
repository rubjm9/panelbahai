export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { SearchDocument } from '@/utils/search';
import SearchIndex from '@/models/SearchIndex';

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

// Datos de fallback para búsqueda cuando MongoDB no esté disponible
const fallbackSearchDocuments: SearchDocument[] = [
  {
    id: 'obra-1',
    titulo: "El Kitab-i-Iqan",
    autor: "Bahá'u'lláh",
    obraSlug: "kitab-i-iqan",
    autorSlug: "bahaullah",
    texto: "El Kitab-i-Iqan El Libro de la Certeza, una de las obras más importantes sobre temas espirituales y teológicos.",
    tipo: 'titulo'
  },
  {
    id: 'parrafo-1',
    titulo: "El Kitab-i-Iqan",
    autor: "Bahá'u'lláh",
    obraSlug: "kitab-i-iqan",
    autorSlug: "bahaullah",
    texto: "En el Nombre de Dios, el Misericordioso, el Compasivo. Alabado sea Dios, Quien ha hecho descender el Kitab sobre Su siervo, y no ha puesto en él tortuosidad.",
    numero: 1,
    tipo: 'parrafo'
  },
  {
    id: 'parrafo-2',
    titulo: "El Kitab-i-Iqan",
    autor: "Bahá'u'lláh",
    obraSlug: "kitab-i-iqan",
    autorSlug: "bahaullah",
    texto: "Este es el Libro acerca del cual no hay duda; es una guía para los temerosos de Dios, que creen en lo invisible, que observan la oración y gastan de lo que les hemos dado.",
    numero: 2,
    tipo: 'parrafo'
  },
  {
    id: 'parrafo-3',
    titulo: "El Kitab-i-Iqan",
    autor: "Bahá'u'lláh",
    obraSlug: "kitab-i-iqan",
    autorSlug: "bahaullah",
    texto: "La naturaleza de la revelación divina es un tema que ha ocupado las mentes de los buscadores de la verdad a través de las edades. En cada época, Dios ha enviado Sus Mensajeros para guiar a la humanidad.",
    numero: 3,
    tipo: 'parrafo'
  },
  {
    id: 'obra-2',
    titulo: "Contestación a Unas Preguntas",
    autor: "'Abdu'l-Bahá",
    obraSlug: "contestacion-preguntas",
    autorSlug: "abdul-baha",
    texto: "Contestación a Unas Preguntas Respuestas a preguntas sobre temas espirituales y filosóficos.",
    tipo: 'titulo'
  },
  {
    id: 'parrafo-4',
    titulo: "Contestación a Unas Preguntas",
    autor: "'Abdu'l-Bahá",
    obraSlug: "contestacion-preguntas",
    autorSlug: "abdul-baha",
    texto: "La primera pregunta que se me hace es acerca de la naturaleza de Dios. Sabed que la esencia de Dios es absolutamente incognoscible.",
    numero: 1,
    tipo: 'parrafo'
  },
  {
    id: 'parrafo-5',
    titulo: "Contestación a Unas Preguntas",
    autor: "'Abdu'l-Bahá",
    obraSlug: "contestacion-preguntas",
    autorSlug: "abdul-baha",
    texto: "El alma humana es de la esencia de Dios, y por tanto es eterna. No tiene principio ni fin.",
    numero: 2,
    tipo: 'parrafo'
  }
];

export async function GET(request: NextRequest) {
  try {
    const connection = await dbConnect();
    
    const { searchParams } = request.nextUrl;
    const buildIndex = searchParams.get('buildIndex') === 'true';

    if (buildIndex) {
      // Si la conexión está deshabilitada durante el build, usar fallback
      if (connection && connection.connected === false) {
        const response = NextResponse.json({
          success: true,
          data: fallbackSearchDocuments,
          count: fallbackSearchDocuments.length,
          source: 'fallback'
        });
        
        // Headers de cache para fallback
        response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        return response;
      }

      // Primero intentar obtener el índice de la base de datos
      const existingIndex = await SearchIndex.findOne({ version: '1.0' });
      
      if (existingIndex && existingIndex.documents.length > 0) {
        console.log(`📚 Usando índice existente con ${existingIndex.documents.length} documentos`);
        
        // Generar ETag basado en lastUpdated y count
        const etag = `"${existingIndex.lastUpdated?.getTime() || Date.now()}-${existingIndex.count}"`;
        
        // Verificar If-None-Match header para cache del cliente
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch === etag) {
          return new NextResponse(null, {
            status: 304,
            headers: {
              'ETag': etag,
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
          });
        }
        
        const response = NextResponse.json({
          success: true,
          data: existingIndex.documents,
          count: existingIndex.count,
          obras: existingIndex.obras,
          secciones: existingIndex.secciones,
          parrafos: existingIndex.parrafos,
          lastUpdated: existingIndex.lastUpdated,
          source: 'database'
        });
        
        // Headers de cache y ETag
        response.headers.set('ETag', etag);
        response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        response.headers.set('Content-Type', 'application/json; charset=utf-8');
        
        return response;
      }

      console.log('🔄 Índice no encontrado en BD, construyendo nuevo índice...');

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

      // Guardar el índice en la base de datos
      await SearchIndex.findOneAndUpdate(
        { version: '1.0' },
        {
          documents,
          lastUpdated: new Date(),
          count: documents.length,
          obras: obras.length,
          secciones: secciones.length,
          parrafos: parrafos.length
        },
        { upsert: true, new: true }
      );

      console.log(`💾 Nuevo índice guardado con ${documents.length} documentos`);

      // Generar ETag para el nuevo índice
      const lastUpdated = new Date();
      const etag = `"${lastUpdated.getTime()}-${documents.length}"`;
      
      const response = NextResponse.json({
        success: true,
        data: documents,
        count: documents.length,
        obras: obras.length,
        secciones: secciones.length,
        parrafos: parrafos.length,
        lastUpdated,
        source: 'database'
      });
      
      // Headers de cache y ETag
      response.headers.set('ETag', etag);
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      response.headers.set('Content-Type', 'application/json; charset=utf-8');
      
      return response;
    }

    return NextResponse.json({
      success: false,
      error: 'Parámetro buildIndex requerido'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in search API, using fallback data:', error);
    
    // En caso de error, devolver datos de fallback
    const { searchParams } = request.nextUrl;
    const buildIndex = searchParams.get('buildIndex') === 'true';
    
    if (buildIndex) {
      const response = NextResponse.json({
        success: true,
        data: fallbackSearchDocuments,
        count: fallbackSearchDocuments.length,
        source: 'fallback'
      });
      
      // Headers de cache para fallback
      response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      return response;
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
