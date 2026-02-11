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
  const items = await ProximaObra.find()
    .sort({ orden: 1 })
    .populate('autor', 'nombre')
    .lean();

  return items.map((item: { _id: unknown; titulo: string; autor: { nombre: string } | null; tipo: string }) => ({
    id: String(item._id),
    titulo: item.titulo,
    autor: item.autor && typeof item.autor === 'object' && 'nombre' in item.autor ? (item.autor as { nombre: string }).nombre : '',
    etiqueta: item.tipo as ProximaObraPublic['etiqueta']
  }));
}
