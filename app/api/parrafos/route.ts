import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Parrafo from '@/models/Parrafo';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const obraId = searchParams.get('obra');
    const seccionId = searchParams.get('seccion');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query: any = { activo: true };
    
    if (obraId) {
      query.obra = obraId;
    }
    
    if (seccionId) {
      query.seccion = seccionId;
    }

    const parrafos = await Parrafo.find(query)
      .populate('obra', 'titulo slug')
      .populate('seccion', 'titulo slug')
      .sort({ orden: 1, numero: 1 })
      .limit(limit)
      .skip(offset)
      .select('numero texto obra seccion orden');

    const total = await Parrafo.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: parrafos,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching parrafos:', error);
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
    const { numero, texto, obraId, seccionId, orden } = body;

    if (!numero || !texto || !obraId) {
      return NextResponse.json(
        { success: false, error: 'Número, texto y obra son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la obra existe
    const obra = await Obra.findById(obraId);
    if (!obra) {
      return NextResponse.json(
        { success: false, error: 'Obra no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la sección existe si se proporciona
    if (seccionId) {
      const seccion = await Seccion.findById(seccionId);
      if (!seccion) {
        return NextResponse.json(
          { success: false, error: 'Sección no encontrada' },
          { status: 404 }
        );
      }
    }

    const parrafo = new Parrafo({
      numero,
      texto,
      obra: obraId,
      seccion: seccionId || null,
      orden: orden || numero
    });

    await parrafo.save();
    await parrafo.populate('obra', 'titulo slug');
    await parrafo.populate('seccion', 'titulo slug');

    return NextResponse.json({
      success: true,
      data: parrafo
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating parrafo:', error);
    
    // Manejar error de duplicado (número único por obra)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un párrafo con ese número en la obra' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, numero, texto, seccionId, orden } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del párrafo es requerido' },
        { status: 400 }
      );
    }

    const updateData: any = {
      fechaActualizacion: new Date()
    };

    if (numero !== undefined) updateData.numero = numero;
    if (texto !== undefined) updateData.texto = texto;
    if (seccionId !== undefined) updateData.seccion = seccionId;
    if (orden !== undefined) updateData.orden = orden;

    const parrafo = await Parrafo.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('obra', 'titulo slug')
      .populate('seccion', 'titulo slug');

    if (!parrafo) {
      return NextResponse.json(
        { success: false, error: 'Párrafo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parrafo
    });
  } catch (error) {
    console.error('Error updating parrafo:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID del párrafo es requerido' },
        { status: 400 }
      );
    }

    const parrafo = await Parrafo.findByIdAndUpdate(
      id,
      { activo: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!parrafo) {
      return NextResponse.json(
        { success: false, error: 'Párrafo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Párrafo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting parrafo:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
