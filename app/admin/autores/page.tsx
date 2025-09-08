import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import Obra from '@/models/Obra';
import Parrafo from '@/models/Parrafo';
import Seccion from '@/models/Seccion';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Users, BookOpen, FileText, Settings } from 'lucide-react';

export default async function AdminAutoresPage() {
  await dbConnect();
  
  const autores = await Autor.find({ activo: true })
    .sort({ orden: 1, nombre: 1 });

  // Obtener obras para cada autor
  const autoresConObras = await Promise.all(
    autores.map(async (autor) => {
      const obras = await Obra.find({ autor: autor._id, activo: true });
      return {
        ...autor.toObject(),
        obras
      };
    })
  );

  return (
    <div className="admin-content">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Gestión de Autores
          </h1>
          <p className="text-primary-600 font-reading">
            Administra los autores de la biblioteca bahá'í
          </p>
        </div>
        <Link href="/admin/autores/nuevo" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Autor
        </Link>
      </div>

      <div className="grid gap-6">
        {autoresConObras.map((autor) => (
          <div key={autor._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-accent-600 mr-3" />
                  <h3 className="text-xl font-display font-semibold text-primary-900">
                    {autor.nombre}
                  </h3>
                  <span className="ml-3 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-sm">
                    Orden: {autor.orden}
                  </span>
                </div>
                
                <p className="text-primary-600 font-reading mb-4 line-clamp-3">
                  {autor.biografia}
                </p>
                
                <div className="flex items-center text-sm text-primary-500 mb-4">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{autor.obras?.length || 0} obra{(autor.obras?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Link 
                  href={`/admin/autores/${autor.slug}`}
                  className="btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link 
                  href={`/admin/autores/${autor.slug}/editar`}
                  className="btn-secondary"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button className="btn-secondary text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {autoresConObras.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary-800 mb-2">
              No hay autores registrados
            </h3>
            <p className="text-primary-500 mb-6">
              Comienza agregando el primer autor a la biblioteca
            </p>
            <Link href="/admin/autores/nuevo" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Autor
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
