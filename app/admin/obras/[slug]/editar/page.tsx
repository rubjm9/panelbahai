export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Obra from '@/models/Obra';
import Autor from '@/models/Autor';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditObraForm from '@/components/admin/EditObraForm';

interface EditObraPageProps {
  params: {
    slug: string;
  };
}

export default async function EditObraPage({ params }: EditObraPageProps) {
  await dbConnect();
  
  const obra = await Obra.findOne({ slug: params.slug, activo: true })
    .populate('autor', 'nombre slug');

  if (!obra) {
    notFound();
  }

  // Obtener el contenido real de la obra desde párrafos y secciones
  const secciones = await Seccion.find({ obra: obra._id, activo: true })
    .sort({ orden: 1 })
    .lean();

  const parrafos = await Parrafo.find({ obra: obra._id, activo: true })
    .populate('seccion', 'titulo')
    .sort({ orden: 1, numero: 1 })
    .lean();

  // Construir el contenido HTML desde párrafos y secciones
  let contenidoHTML = '';
  
  // Agregar secciones como títulos
  secciones.forEach(seccion => {
    const nivel = seccion.nivel || 2; // H2 por defecto
    contenidoHTML += `<h${nivel}>${seccion.titulo}</h${nivel}>\n\n`;
  });

  // Agregar párrafos
  parrafos.forEach(parrafo => {
    contenidoHTML += `<p>${parrafo.texto}</p>\n\n`;
  });

  // Si no hay contenido estructurado, usar el campo contenido si existe
  if (!contenidoHTML.trim() && obra.contenido) {
    contenidoHTML = obra.contenido;
  }

  const autores = await Autor.find({ activo: true })
    .sort({ orden: 1, nombre: 1 })
    .select('nombre slug');

  // Debug: verificar qué datos tenemos de la obra
  console.log('=== DEBUG OBRA EN SERVIDOR ===')
  console.log('Obra completa:', obra)
  console.log('Campo contenido original:', obra.contenido)
  console.log('Contenido construido desde párrafos/secciones:', contenidoHTML.substring(0, 200))
  console.log('Número de secciones:', secciones.length)
  console.log('Número de párrafos:', parrafos.length)
  console.log('=== FIN DEBUG ===')
  
  // Serializar los datos para evitar problemas de hidratación
  const obraSerializada = {
    _id: obra._id.toString(),
    titulo: obra.titulo,
    slug: obra.slug,
    descripcion: obra.descripcion,
    orden: obra.orden,
    fechaPublicacion: obra.fechaPublicacion?.toString(),
    estado: obra.estado,
    contenido: contenidoHTML, // Usar el contenido construido desde párrafos/secciones
    autor: {
      _id: obra.autor._id.toString(),
      nombre: obra.autor.nombre,
      slug: obra.autor.slug
    }
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
              Editar Obra
            </h1>
            <p className="text-primary-600 font-reading">
              Modifica los detalles de "{obra.titulo}"
            </p>
          </div>
        </div>
      </div>

      <EditObraForm obra={obraSerializada} autores={autoresSerializados} />
    </div>
  );
}
