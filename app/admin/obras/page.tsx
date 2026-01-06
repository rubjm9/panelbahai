export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Parrafo from '@/models/Parrafo';
import Seccion from '@/models/Seccion';
import ObrasList from '@/components/admin/ObrasList';
import { requireAdminAuth } from '@/lib/auth-helpers';

export default async function AdminObrasPage() {
  // Verificar autenticación admin
  await requireAdminAuth();
  
  try {
    await dbConnect();
    
    const obras = await Obra.find({ activo: true })
      .populate('autor', 'nombre slug')
      .sort({ orden: 1, titulo: 1 });

    // Obtener estadísticas de cada obra
    const obrasConStats = await Promise.all(
      obras.map(async (obra) => {
        const parrafos = await Parrafo.countDocuments({ obra: obra._id, activo: true });
        const secciones = await Seccion.countDocuments({ obra: obra._id, activo: true });
        
        return {
          ...obra.toObject(),
          parrafos,
          secciones
        };
      })
    );

    return <ObrasList obras={obrasConStats} />;
  } catch (error) {
    console.error('Error en AdminObrasPage:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">Error al cargar las obras: {error instanceof Error ? error.message : 'Error desconocido'}</p>
      </div>
    );
  }
}

