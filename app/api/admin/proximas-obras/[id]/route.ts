import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProximaObra from '@/models/ProximaObra';
import mongoose from 'mongoose';
import { requireAdminAPI } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAPI();
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 });
    }
    const raw = await ProximaObra.findById(params.id).populate('autor', 'nombre _id').lean();
    if (!raw) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    const doc = raw as unknown as { _id: unknown; titulo: string; autor?: { _id: unknown; nombre?: string }; tipo: string; orden: number };
    return NextResponse.json({
      success: true,
      data: {
        id: String(doc._id),
        titulo: doc.titulo,
        autorId: doc.autor && typeof doc.autor === 'object' ? String(doc.autor._id) : null,
        autorNombre: doc.autor && typeof doc.autor === 'object' && doc.autor.nombre != null ? doc.autor.nombre : '',
        tipo: doc.tipo,
        orden: doc.orden
      }
    });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Error al obtener la obra' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAPI();
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 });
    }
    const body = await request.json();
    const { titulo, autorId, tipo } = body;

    const update: { titulo?: string; autor?: mongoose.Types.ObjectId; tipo?: string } = {};
    if (typeof titulo === 'string') update.titulo = titulo.trim();
    if (autorId != null) update.autor = new mongoose.Types.ObjectId(autorId);
    if (tipo === 'Revisión de traducción' || tipo === 'Obra no publicada anteriormente') update.tipo = tipo;

    const raw = await ProximaObra.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    )
      .populate('autor', 'nombre _id')
      .lean();

    if (!raw) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }

    const doc = raw as unknown as { _id: unknown; titulo: string; autor?: { _id: unknown; nombre?: string }; tipo: string; orden: number };
    return NextResponse.json({
      success: true,
      data: {
        id: String(doc._id),
        titulo: doc.titulo,
        autorId: doc.autor && typeof doc.autor === 'object' ? String(doc.autor._id) : null,
        autorNombre: doc.autor && typeof doc.autor === 'object' && doc.autor.nombre != null ? doc.autor.nombre : '',
        tipo: doc.tipo,
        orden: doc.orden
      }
    });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error updating próxima obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAPI();
    await dbConnect();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 });
    }
    const result = await ProximaObra.findByIdAndDelete(params.id);
    if (!result) {
      return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Error al eliminar' },
      { status: 500 }
    );
  }
}
