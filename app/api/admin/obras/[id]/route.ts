import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Autor from '@/models/Autor'
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const obraId = params.id
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const titulo = formData.get('titulo') as string
    const slug = formData.get('slug') as string
    const autorId = formData.get('autor') as string
    const descripcion = formData.get('descripcion') as string
    const orden = parseInt(formData.get('orden') as string) || 0
    const fechaPublicacion = formData.get('fechaPublicacion') as string
    const estado = formData.get('estado') as string
    const contenido = formData.get('contenido') as string
    const archivoDoc = formData.get('archivoDoc') as File
    const archivoPdf = formData.get('archivoPdf') as File
    
    // Validar datos requeridos
    if (!titulo || !autorId || !slug) {
      return NextResponse.json(
        { message: 'Título, autor y slug son requeridos' },
        { status: 400 }
      )
    }
    
    // Validar formato del slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { message: 'Formato de slug inválido. Solo letras minúsculas, números y guiones.' },
        { status: 400 }
      )
    }
    
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return NextResponse.json(
        { message: 'El slug no puede empezar o terminar con guión' },
        { status: 400 }
      )
    }
    
    // Verificar unicidad del slug (excluyendo la obra actual)
    const existingObra = await Obra.findOne({ 
      slug, 
      activo: true, 
      _id: { $ne: obraId } 
    })
    
    if (existingObra) {
      return NextResponse.json(
        { message: 'Este slug ya está en uso por otra obra' },
        { status: 400 }
      )
    }
    
    // Verificar que el autor existe
    const autor = await Autor.findById(autorId)
    if (!autor) {
      return NextResponse.json(
        { message: 'Autor no encontrado' },
        { status: 400 }
      )
    }
    
    // Preparar datos para actualizar
    const updateData: any = {
      titulo,
      slug,
      autor: autorId,
      descripcion,
      orden,
      estado,
      contenido
    }
    
    // Agregar fecha de publicación si se proporciona
    if (fechaPublicacion) {
      updateData.fechaPublicacion = new Date(fechaPublicacion)
    }
    
    // Manejar archivos si se proporcionan
    if (archivoDoc && archivoDoc.size > 0) {
      // Aquí podrías procesar y guardar el archivo DOC
      // Por ahora solo guardamos el nombre del archivo
      updateData.archivoDoc = archivoDoc.name
    }
    
    if (archivoPdf && archivoPdf.size > 0) {
      // Aquí podrías procesar y guardar el archivo PDF
      // Por ahora solo guardamos el nombre del archivo
      updateData.archivoPdf = archivoPdf.name
    }
    
    // Actualizar la obra
    const obraActualizada = await Obra.findByIdAndUpdate(
      obraId,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!obraActualizada) {
      return NextResponse.json(
        { message: 'Obra no encontrada' },
        { status: 404 }
      )
    }
    
    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();
    
    return NextResponse.json({
      message: 'Obra actualizada correctamente',
      obra: obraActualizada
    })
    
  } catch (error) {
    console.error('Error actualizando obra:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
