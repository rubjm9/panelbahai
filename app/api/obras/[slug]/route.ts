import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const autorSlug = searchParams.get('autor');

    // Buscar la obra
    let obraQuery = Obra.findOne({ slug, activo: true })
      .populate('autor', 'nombre slug biografia');

    if (autorSlug) {
      obraQuery = obraQuery.populate({
        path: 'autor',
        match: { slug: autorSlug },
        select: 'nombre slug biografia'
      });
    }

    const obra = await obraQuery;

    if (!obra || (autorSlug && !obra.autor)) {
      return NextResponse.json(
        { success: false, error: 'Obra no encontrada' },
        { status: 404 }
      );
    }

    // Obtener secciones organizadas jerárquicamente
    const secciones = await Seccion.find({ obra: obra._id, activo: true })
      .sort({ orden: 1 })
      .select('titulo slug nivel orden seccionPadre');

    // Organizar secciones jerárquicamente
    const seccionesMap = new Map();
    const seccionesRaiz: any[] = [];

    secciones.forEach(seccion => {
      seccionesMap.set(seccion._id.toString(), {
        ...seccion.toObject(),
        subsecciones: []
      });
    });

    secciones.forEach(seccion => {
      const seccionObj = seccionesMap.get(seccion._id.toString());
      if (seccion.seccionPadre) {
        const padre = seccionesMap.get(seccion.seccionPadre.toString());
        if (padre) {
          padre.subsecciones.push(seccionObj);
        }
      } else {
        seccionesRaiz.push(seccionObj);
      }
    });

    // Obtener párrafos
    const parrafos = await Parrafo.find({ obra: obra._id, activo: true })
      .populate('seccion', 'titulo')
      .sort({ orden: 1, numero: 1 })
      .select('numero texto seccion orden');

    return NextResponse.json({
      success: true,
      data: {
        obra: {
          titulo: obra.titulo,
          slug: obra.slug,
          descripcion: obra.descripcion,
          fechaPublicacion: obra.fechaPublicacion,
          autor: obra.autor,
          esPublico: obra.esPublico
        },
        secciones: seccionesRaiz,
        parrafos: parrafos.map(p => ({
          numero: p.numero,
          texto: p.texto,
          seccion: p.seccion?.titulo
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;
    const body = await request.json();
    const { titulo, descripcion, fechaPublicacion, esPublico } = body;

    const obra = await Obra.findOneAndUpdate(
      { slug, activo: true },
      {
        titulo,
        descripcion,
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : undefined,
        esPublico,
        fechaActualizacion: new Date()
      },
      { new: true }
    ).populate('autor', 'nombre slug');

    if (!obra) {
      return NextResponse.json(
        { success: false, error: 'Obra no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: obra
    });
  } catch (error) {
    console.error('Error updating obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;

    const obra = await Obra.findOneAndUpdate(
      { slug, activo: true },
      { activo: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!obra) {
      return NextResponse.json(
        { success: false, error: 'Obra no encontrada' },
        { status: 404 }
      );
    }

    // También desactivar párrafos y secciones relacionadas
    await Parrafo.updateMany(
      { obra: obra._id },
      { activo: false, fechaActualizacion: new Date() }
    );

    await Seccion.updateMany(
      { obra: obra._id },
      { activo: false, fechaActualizacion: new Date() }
    );

    return NextResponse.json({
      success: true,
      message: 'Obra eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
