import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Autor from '@/models/Autor'
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild'
import { uploadFile, deleteFile } from '@/lib/gridfs'
import { requireAdminAPI } from '@/lib/auth-helpers'
import { adminAPIRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación admin (defensa en profundidad)
    const user = await requireAdminAPI()
    
    // Rate limiting: 100 requests por minuto por usuario
    const identifier = getRateLimitIdentifier(request, user.id);
    const rateLimitResult = await checkRateLimit(adminAPIRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }
    
    console.log('=== INICIO PUT /api/admin/obras/[id] ===')
    console.log('Params:', params)
    
    await dbConnect()
    console.log('Conexión a DB establecida')
    
    const obraId = params.id
    console.log('Obra ID:', obraId)
    
    const formData = await request.formData()
    console.log('FormData recibido')
    
    // Extraer datos del formulario
    const titulo = formData.get('titulo') as string
    const slug = formData.get('slug') as string
    const autorId = formData.get('autor') as string
    const descripcion = formData.get('descripcion') as string
    const orden = parseInt(formData.get('orden') as string) || 0
    const fechaPublicacion = formData.get('fechaPublicacion') as string
    const estado = formData.get('estado') as string
    const contenido = formData.get('contenido') as string
    const archivoDoc = formData.get('archivoDoc') as File | null
    const archivoPdf = formData.get('archivoPdf') as File | null
    const archivoEpub = formData.get('archivoEpub') as File | null
    
    console.log('Datos extraídos:', {
      titulo,
      slug,
      autorId,
      contenidoLength: contenido?.length || 0,
      contenidoPreview: contenido?.substring(0, 100),
      fechaPublicacion,
      estado,
      tieneArchivoDoc: !!archivoDoc,
      tieneArchivoPdf: !!archivoPdf,
      tieneArchivoEpub: !!archivoEpub
    })
    
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
    
    // Obtener la obra actual primero para eliminar archivos antiguos si es necesario
    const obraActual = await Obra.findById(obraId)
    console.log('Obra actual encontrada:', !!obraActual)
    
    if (!obraActual) {
      return NextResponse.json(
        { message: 'Obra no encontrada' },
        { status: 404 }
      )
    }
    
    // Preparar datos para actualizar
    const updateData: any = {
      titulo,
      slug,
      autor: autorId,
      descripcion: descripcion || '',
      orden,
      estado,
      contenido: contenido || '',
      esPublico: estado === 'publicado' // Actualizar esPublico según el estado
    }
    
    // Agregar fecha de publicación si se proporciona
    if (fechaPublicacion && fechaPublicacion.trim() !== '') {
      updateData.fechaPublicacion = new Date(fechaPublicacion)
    } else {
      // Si no se proporciona fecha, mantener la existente o establecer null
      updateData.fechaPublicacion = obraActual.fechaPublicacion || null
    }
    
    // Manejar archivos si se proporcionan y subirlos a GridFS
    // Solo procesar archivos si realmente hay archivos nuevos para subir
    if (archivoDoc || archivoPdf || archivoEpub) {
      console.log('Procesando archivos...')
      try {
        if (archivoDoc && archivoDoc instanceof File && archivoDoc.size > 0) {
          console.log('Subiendo archivo DOC:', archivoDoc.name, archivoDoc.size)
          // Eliminar archivo antiguo si existe
          if (obraActual?.archivoDoc) {
            try {
              await deleteFile(obraActual.archivoDoc)
              console.log('Archivo DOC antiguo eliminado')
            } catch (error) {
              console.error('Error eliminando archivo DOC antiguo:', error)
            }
          }
          // Subir nuevo archivo
          const fileId = await uploadFile(archivoDoc, {
            obraId: obraId,
            tipo: 'doc',
            filename: archivoDoc.name
          })
          updateData.archivoDoc = fileId
          console.log('Archivo DOC subido con ID:', fileId)
        }
        
        if (archivoPdf && archivoPdf instanceof File && archivoPdf.size > 0) {
          console.log('Subiendo archivo PDF:', archivoPdf.name, archivoPdf.size)
          // Eliminar archivo antiguo si existe
          if (obraActual?.archivoPdf) {
            try {
              await deleteFile(obraActual.archivoPdf)
              console.log('Archivo PDF antiguo eliminado')
            } catch (error) {
              console.error('Error eliminando archivo PDF antiguo:', error)
            }
          }
          // Subir nuevo archivo
          const fileId = await uploadFile(archivoPdf, {
            obraId: obraId,
            tipo: 'pdf',
            filename: archivoPdf.name
          })
          updateData.archivoPdf = fileId
          console.log('Archivo PDF subido con ID:', fileId)
        }
        
        if (archivoEpub && archivoEpub instanceof File && archivoEpub.size > 0) {
          console.log('Subiendo archivo EPUB:', archivoEpub.name, archivoEpub.size)
          // Eliminar archivo antiguo si existe
          if (obraActual?.archivoEpub) {
            try {
              await deleteFile(obraActual.archivoEpub)
              console.log('Archivo EPUB antiguo eliminado')
            } catch (error) {
              console.error('Error eliminando archivo EPUB antiguo:', error)
            }
          }
          // Subir nuevo archivo
          const fileId = await uploadFile(archivoEpub, {
            obraId: obraId,
            tipo: 'epub',
            filename: archivoEpub.name
          })
          updateData.archivoEpub = fileId
          console.log('Archivo EPUB subido con ID:', fileId)
        }
      } catch (fileError: any) {
        console.error('Error subiendo archivos:', fileError)
        console.error('Error stack:', fileError?.stack)
        // No fallar la actualización si hay error con archivos
        // Solo loguear el error
      }
    } else {
      console.log('No hay archivos nuevos para procesar')
    }
    
    // Actualizar la obra
    console.log('Actualizando obra con datos:', {
      ...updateData,
      contenidoLength: updateData.contenido?.length || 0
    })
    
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
    
    console.log('Obra actualizada:', {
      titulo: obraActualizada.titulo,
      estado: obraActualizada.estado,
      esPublico: obraActualizada.esPublico,
      fechaPublicacion: obraActualizada.fechaPublicacion,
      contenidoLength: obraActualizada.contenido?.length || 0
    })
    
    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();
    
    console.log('Obra actualizada exitosamente')
    console.log('=== FIN PUT /api/admin/obras/[id] ===')
    
    return NextResponse.json({
      message: 'Obra actualizada correctamente',
      obra: obraActualizada
    })
    
  } catch (error: any) {
    console.error('Error actualizando obra:', error)
    console.error('Stack trace:', error?.stack)
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
