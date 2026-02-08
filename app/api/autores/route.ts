import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';

// Datos de fallback cuando MongoDB no esté disponible
const fallbackAutores = [
  {
    _id: '1',
    nombre: "Bahá'u'lláh",
    slug: "bahaullah",
    biografia: "Fundador de la Fe Bahá'í y autor de numerosos textos sagrados.",
    orden: 1,
    activo: true
  },
  {
    _id: '2',
    nombre: "El Báb",
    slug: "el-bab",
    biografia: "Precursor de Bahá'u'lláh y autor de textos fundamentales.",
    orden: 2,
    activo: true
  },
  {
    _id: '3',
    nombre: "'Abdu'l-Bahá",
    slug: "abdul-baha",
    biografia: "Hijo mayor de Bahá'u'lláh e intérprete autorizado de Sus enseñanzas.",
    orden: 3,
    activo: true
  },
  {
    _id: '4',
    nombre: "Shoghi Effendi",
    slug: "shoghi-effendi",
    biografia: "Guardián de la Fe Bahá'í, nieto de 'Abdu'l-Bahá.",
    orden: 4,
    activo: true
  },
  {
    _id: '5',
    nombre: "Casa Universal de Justicia",
    slug: "casa-justicia",
    biografia: "Cuerpo administrativo supremo de la Fe Bahá'í.",
    orden: 5,
    activo: true
  },
  {
    _id: '6',
    nombre: "Recopilaciones",
    slug: "recopilaciones",
    biografia: "Selecciones temáticas de textos de varios autores bahá'ís.",
    orden: 6,
    activo: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const connection = await dbConnect();
    
    // Si la conexión está deshabilitada durante el build, usar fallback
    if (connection && connection.connected === false) {
      return NextResponse.json({
        success: true,
        data: fallbackAutores,
        source: 'fallback'
      });
    }
    
    const autores = await Autor.find({ activo: true })
      .sort({ orden: 1, nombre: 1 })
      .select('nombre slug biografia orden');

    return NextResponse.json({
      success: true,
      data: autores,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching autores, using fallback data:', error);
    
    // En caso de error, devolver datos de fallback
    return NextResponse.json({
      success: true,
      data: fallbackAutores,
      source: 'fallback'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { nombre, biografia, orden } = body;

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Generar slug
    const slug = nombre
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const autor = new Autor({
      nombre,
      slug,
      biografia,
      orden: orden || 0
    });

    await autor.save();

    return NextResponse.json({
      success: true,
      data: autor
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating autor:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
