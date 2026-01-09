export const dynamic = 'force-dynamic'

import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NewObraForm from '@/components/admin/NewObraForm';
import { requireAdminAuth } from '@/lib/auth-helpers';

export default async function NewObraPage() {
  // Verificar autenticación admin
  await requireAdminAuth();
  
  await dbConnect();
  
  const autores = await Autor.find({ activo: true })
    .sort({ orden: 1, nombre: 1 })
    .select('nombre slug');

  if (!autores.length) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link 
              href="/admin/obras"
              className="mr-4 p-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Nueva obra
              </h1>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">
            No hay autores registrados. Necesitas crear al menos un autor antes de crear una obra.
          </p>
          <Link href="/admin/autores" className="btn-primary">
            Crear autor
          </Link>
        </div>
      </div>
    );
  }

  const autoresSerializados = autores.map(autor => ({
    _id: autor._id.toString(),
    nombre: autor.nombre,
    slug: autor.slug
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link 
            href="/admin/obras"
            className="mr-4 p-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Nueva obra
              </h1>
            <p className="text-primary-600 font-reading">
              Crea una nueva obra para la biblioteca bahá'í
            </p>
          </div>
        </div>
      </div>

      <NewObraForm autores={autoresSerializados} />
    </div>
  );
}


