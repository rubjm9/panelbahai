import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Autor from '@/models/Autor';
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild';

// Datos de fallback cuando MongoDB no esté disponible
const fallbackObras = [
  {
    _id: '1',
    titulo: "El Kitab-i-Iqan",
    slug: "kitab-i-iqan",
    descripcion: "El Libro de la Certeza, una de las obras más importantes sobre temas espirituales y teológicos.",
    esPublico: true,
    orden: 1,
    autor: {
      _id: '1',
      nombre: "Bahá'u'lláh",
      slug: "bahaullah"
    },
    fechaCreacion: new Date('2023-01-01')
  },
  {
    _id: '2',
    titulo: "Pasajes de los Escritos de Bahá'u'lláh",
    slug: "pasajes-bahaullah",
    descripcion: "Selección de pasajes representativos sobre diversos temas espirituales.",
    esPublico: true,
    orden: 2,
    autor: {
      _id: '1',
      nombre: "Bahá'u'lláh",
      slug: "bahaullah"
    },
    fechaCreacion: new Date('2023-01-01')
  },
  {
    _id: '3',
    titulo: "Contestación a Unas Preguntas",
    slug: "contestacion-preguntas",
    descripcion: "Respuestas a preguntas sobre temas espirituales y filosóficos.",
    esPublico: true,
    orden: 1,
    autor: {
      _id: '3',
      nombre: "'Abdu'l-Bahá",
      slug: "abdul-baha"
    },
    fechaCreacion: new Date('2023-01-01')
  }
];

export async function GET(request: NextRequest) {
  try {
    const connection = await dbConnect();
    
    // Si la conexión está deshabilitada durante el build, usar fallback
    if (connection && connection.connected === false) {
      const { searchParams } = new URL(request.url);
      const autorSlug = searchParams.get('autor');
      
      let filteredObras = fallbackObras;
      if (autorSlug) {
        filteredObras = fallbackObras.filter(obra => obra.autor.slug === autorSlug);
      }
      
      return NextResponse.json({
        success: true,
        data: filteredObras,
        source: 'fallback'
      });
    }

    const { searchParams } = new URL(request.url);
    const autorParam = searchParams.get('autor');
    const esPublico = searchParams.get('esPublico');

    let query: any = { activo: true };
    
    if (autorParam) {
      // Verificar si es un ObjectId válido o un slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(autorParam);
      
      if (isObjectId) {
        // Es un ObjectId, usar directamente
        query.autor = autorParam;
      } else {
        // Es un slug, buscar el autor primero
        const autor = await Autor.findOne({ slug: autorParam, activo: true });
        if (autor) {
          query.autor = autor._id;
        } else {
          // Si no se encuentra el autor, devolver array vacío
          return NextResponse.json({
            success: true,
            data: [],
            source: 'database'
          });
        }
      }
    }
    
    if (esPublico !== null) {
      query.esPublico = esPublico === 'true';
    }

    const obras = await Obra.find(query)
      .populate('autor', 'nombre slug')
      .sort({ orden: 1, titulo: 1 })
      .select('titulo slug descripcion esPublico orden autor fechaCreacion');

    return NextResponse.json({
      success: true,
      data: obras,
      source: 'database'
    });

  } catch (error) {
    console.error('Error fetching obras, using fallback data:', error);
    
    // En caso de error, devolver datos de fallback filtrados
    const { searchParams } = new URL(request.url);
    const autorSlug = searchParams.get('autor');
    
    let filteredObras = fallbackObras;
    if (autorSlug) {
      filteredObras = fallbackObras.filter(obra => obra.autor.slug === autorSlug);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredObras,
      source: 'fallback'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { titulo, autor, descripcion, esPublico = false } = body;

    if (!titulo || !autor) {
      return NextResponse.json(
        { success: false, error: 'Título y autor son requeridos' },
        { status: 400 }
      );
    }

    // Generar slug único
    let slug = titulo.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Verificar que el slug sea único
    let counter = 1;
    let originalSlug = slug;
    while (await Obra.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const obra = new Obra({
      titulo,
      slug,
      autor,
      descripcion,
      esPublico,
      orden: 0,
      activo: true
    });

    await obra.save();

    // Populate autor para la respuesta
    await obra.populate('autor', 'nombre slug');

    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();

    return NextResponse.json({
      success: true,
      data: obra
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}