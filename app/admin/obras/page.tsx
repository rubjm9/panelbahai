import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Autor from '@/models/Autor';
import Parrafo from '@/models/Parrafo';
import Seccion from '@/models/Seccion';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, BookOpen, FileText, Calendar, Globe } from 'lucide-react';

export default async function AdminObrasPage() {
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

  return (
    <div className="admin-content">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Gestión de Obras
          </h1>
          <p className="text-primary-600 font-reading">
            Administra las obras de la biblioteca bahá'í
          </p>
        </div>
        <Link href="/admin/obras/nueva" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Obra
        </Link>
      </div>

      <div className="grid gap-6">
        {obrasConStats.map((obra) => (
          <div key={obra._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-6 h-6 text-accent-600 mr-3" />
                  <h3 className="text-xl font-display font-semibold text-primary-900">
                    {obra.titulo}
                  </h3>
                  <div className="ml-3 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-sm">
                      Orden: {obra.orden}
                    </span>
                    {obra.esPublico ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-sm flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        Público
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-sm">
                        Borrador
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-primary-600 font-reading mb-3">
                  <strong>Autor:</strong> {obra.autor.nombre}
                </p>
                
                <p className="text-primary-600 font-reading mb-4 line-clamp-2">
                  {obra.descripcion}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-primary-500 mb-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{obra.parrafos} párrafos</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{obra.secciones} secciones</span>
                  </div>
                  {obra.fechaPublicacion && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{obra.fechaPublicacion}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Link 
                  href={`/admin/obras/${obra.slug}`}
                  className="btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link 
                  href={`/admin/obras/${obra.slug}/editar`}
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
        
        {obrasConStats.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary-800 mb-2">
              No hay obras registradas
            </h3>
            <p className="text-primary-500 mb-6">
              Comienza agregando la primera obra a la biblioteca
            </p>
            <Link href="/admin/obras/nueva" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Obra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

