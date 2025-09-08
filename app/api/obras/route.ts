import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Autor from '@/models/Autor';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const autorId = searchParams.get('autor');
    const esPublico = searchParams.get('esPublico');

    let query: any = { activo: true };
    
    if (autorId) {
      query.autor = autorId;
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
      data: obras
    });

  } catch (error) {
    console.error('Error fetching obras:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
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