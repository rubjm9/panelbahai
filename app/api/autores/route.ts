import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const autores = await Autor.find({ activo: true })
      .sort({ orden: 1, nombre: 1 })
      .select('nombre slug biografia orden');

    return NextResponse.json({
      success: true,
      data: autores
    });
  } catch (error) {
    console.error('Error fetching autores:', error);
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
