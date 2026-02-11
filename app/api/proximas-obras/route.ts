import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProximaObra from '@/models/ProximaObra';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const raw = await ProximaObra.find()
      .sort({ orden: 1 })
      .populate('autor', 'nombre')
      .lean();

    type ItemLean = { _id: unknown; titulo: string; autor: { nombre?: string } | null; tipo: string };
    const items = raw as unknown as ItemLean[];
    const data = items.map((item) => ({
      id: String(item._id),
      titulo: item.titulo,
      autor: item.autor && typeof item.autor === 'object' && item.autor.nombre != null ? item.autor.nombre : '',
      etiqueta: item.tipo
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching próximas obras:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar las próximas obras' },
      { status: 500 }
    );
  }
}
