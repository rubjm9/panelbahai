/**
 * Servicio público de próximas obras (traducción/revisión)
 */

import dbConnect from '@/lib/mongodb';
import ProximaObra from '@/models/ProximaObra';

export type ProximaObraPublic = {
  id: string;
  titulo: string;
  autor: string;
  etiqueta: 'Revisión de traducción' | 'Obra no publicada anteriormente';
};

export async function listProximasObras(): Promise<ProximaObraPublic[]> {
  await dbConnect();
  const raw = await ProximaObra.find()
    .sort({ orden: 1 })
    .populate('autor', 'nombre')
    .lean();

  type ItemLean = { _id: unknown; titulo: string; autor: { nombre?: string } | null; tipo: string };
  const items = raw as unknown as ItemLean[];
  return items.map((item) => ({
    id: String(item._id),
    titulo: item.titulo,
    autor: item.autor && typeof item.autor === 'object' && item.autor.nombre != null ? item.autor.nombre : '',
    etiqueta: item.tipo as ProximaObraPublic['etiqueta']
  }));
}
