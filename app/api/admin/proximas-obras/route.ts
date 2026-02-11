import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProximaObra from '@/models/ProximaObra';
import { requireAdminAPI } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminAPI();
    await dbConnect();
    const items = await ProximaObra.find()
      .sort({ orden: 1 })
      .populate('autor', 'nombre _id')
      .lean();

    const data = items.map((item: { _id: unknown; titulo: string; autor: { _id: unknown; nombre: string } | null; tipo: string; orden: number }) => ({
      id: String(item._id),
      titulo: item.titulo,
      autorId: item.autor && typeof item.autor === 'object' && item.autor !== null ? String((item.autor as { _id: unknown })._id) : null,
      autorNombre: item.autor && typeof item.autor === 'object' && 'nombre' in item.autor ? (item.autor as { nombre: string }).nombre : '',
      tipo: item.tipo,
      orden: item.orden
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error fetching próximas obras admin:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar las próximas obras' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAPI();
    await dbConnect();
    const body = await request.json();
    const { titulo, autorId, tipo } = body;

    if (!titulo || !autorId || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Faltan título, autor o tipo' },
        { status: 400 }
      );
    }
    if (tipo !== 'Revisión de traducción' && tipo !== 'Obra no publicada anteriormente') {
      return NextResponse.json(
        { success: false, error: 'Tipo no válido' },
        { status: 400 }
      );
    }

    const maxOrden = await ProximaObra.findOne().sort({ orden: -1 }).select('orden').lean();
    const orden = (maxOrden?.orden ?? -1) + 1;

    const doc = new ProximaObra({
      titulo: String(titulo).trim(),
      autor: autorId,
      tipo,
      orden
    });
    await doc.save();

    const populated = await ProximaObra.findById(doc._id).populate('autor', 'nombre _id').lean();
    return NextResponse.json({
      success: true,
      data: {
        id: String(populated!._id),
        titulo: populated!.titulo,
        autorId: populated!.autor && typeof populated!.autor === 'object' ? String((populated!.autor as { _id: unknown })._id) : null,
        autorNombre: populated!.autor && typeof populated!.autor === 'object' && 'nombre' in populated!.autor ? (populated!.autor as { nombre: string }).nombre : '',
        tipo: populated!.tipo,
        orden: populated!.orden
      }
    }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error creating próxima obra:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la obra' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAPI();
    await dbConnect();
    const body = await request.json();
    const { ids } = body as { ids?: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere un array de ids (orden)' },
        { status: 400 }
      );
    }

    await Promise.all(
      ids.map((id, index) =>
        ProximaObra.updateOne({ _id: id }, { $set: { orden: index } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === 'No autorizado' || (error as Error).message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error reordering próximas obras:', error);
    return NextResponse.json(
      { success: false, error: 'Error al reordenar' },
      { status: 500 }
    );
  }
}
