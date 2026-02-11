import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProximaObra from '@/models/ProximaObra';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const items = await ProximaObra.find()
      .sort({ orden: 1 })
      .populate('autor', 'nombre')
      .lean();

    const data = items.map((item: { _id: unknown; titulo: string; autor: { nombre: string } | { _id: unknown }; tipo: string }) => ({
      id: String(item._id),
      titulo: item.titulo,
      autor: item.autor && typeof item.autor === 'object' && 'nombre' in item.autor ? item.autor.nombre : '',
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
