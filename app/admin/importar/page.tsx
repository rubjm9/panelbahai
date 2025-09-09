export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import WordImportForm from '@/components/admin/WordImportForm';
import { FileText, Upload, BookOpen, Users } from 'lucide-react';

export const metadata = {
  title: 'Importar Documentos - Admin | Panel Bahá\'í',
  description: 'Importar documentos Word al Panel de Traducción de Literatura Bahá\'í'
}

export default async function AdminImportPage() {
  await dbConnect();
  
  const autores = await Autor.find({ activo: true })
    .sort({ orden: 1, nombre: 1 })
    .select('nombre slug');

  if (!autores.length) {
    return (
      <div className="admin-content">
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-primary-800 mb-2">
            No hay autores registrados
          </h3>
          <p className="text-primary-500 mb-6">
            Necesitas crear al menos un autor antes de importar documentos.
          </p>
          <a href="/admin/autores" className="btn-primary">
            Crear autor
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Upload className="w-8 h-8 text-accent-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-primary-900">
              Importar documentos
            </h1>
            <p className="text-primary-600 mt-1">
              Importa documentos Word y conviértelos automáticamente en obras estructuradas
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario de importación */}
        <div className="lg:col-span-2">
          <WordImportForm autores={autores} />
        </div>

        {/* Información y ayuda */}
        <div className="space-y-6">
          {/* Instrucciones */}
          <div className="card">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-accent-600 mr-2" />
              <h3 className="font-semibold text-primary-900">
                Instrucciones
              </h3>
            </div>
            <div className="space-y-3 text-sm text-primary-700">
              <div>
                <strong>1. Preparar el documento:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Usa títulos (H1, H2, H3) para las secciones</li>
                  <li>• Separa párrafos con líneas en blanco</li>
                  <li>• Guarda como .docx o .doc</li>
                </ul>
              </div>
              <div>
                <strong>2. Importar:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Selecciona el archivo Word</li>
                  <li>• Completa título y autor</li>
                  <li>• El sistema creará secciones y párrafos automáticamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="card">
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-accent-600 mr-2" />
              <h3 className="font-semibold text-primary-900">
                Estadísticas
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-600">Autores disponibles:</span>
                <span className="font-medium text-primary-900">
                  {autores.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Formatos soportados:</span>
                <span className="font-medium text-primary-900">
                  .docx, .doc
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-600">Tamaño máximo:</span>
                <span className="font-medium text-primary-900">
                  10 MB
                </span>
              </div>
            </div>
          </div>

          {/* Consejos */}
          <div className="card">
            <h3 className="font-semibold text-primary-900 mb-4">
              Consejos para mejores resultados
            </h3>
            <div className="space-y-2 text-sm text-primary-700">
              <p>• <strong>Estructura clara:</strong> Usa títulos para organizar el contenido</p>
              <p>• <strong>Párrafos separados:</strong> Deja líneas en blanco entre párrafos</p>
              <p>• <strong>Formato limpio:</strong> Evita tablas complejas o imágenes</p>
              <p>• <strong>Revisar resultado:</strong> Verifica la estructura después de importar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

