import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Autor from '@/models/Autor'
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild'
import { uploadFile } from '@/lib/gridfs'
import { requireAdminAPI } from '@/lib/auth-helpers'
import { adminAPIRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
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
    
    await dbConnect()
    
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
    const archivoEpub = formData.get('archivoEpub') as File
    
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
    
    // Verificar unicidad del slug
    const existingObra = await Obra.findOne({ 
      slug, 
      activo: true
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
    
    // Preparar datos para crear
    const obraData: any = {
      titulo,
      slug,
      autor: autorId,
      descripcion: descripcion || '',
      orden,
      estado: estado || 'borrador',
      contenido: contenido || '',
      esPublico: estado === 'publicado',
      activo: true
    }
    
    // Agregar fecha de publicación si se proporciona
    if (fechaPublicacion) {
      obraData.fechaPublicacion = new Date(fechaPublicacion)
    }
    
    // Crear la obra primero para obtener el ID
    const nuevaObra = new Obra(obraData)
    await nuevaObra.save()
    
    // Manejar archivos si se proporcionan y subirlos a GridFS
    try {
      if (archivoDoc && archivoDoc.size > 0) {
        const fileId = await uploadFile(archivoDoc, {
          obraId: nuevaObra._id.toString(),
          tipo: 'doc',
          filename: archivoDoc.name
        })
        nuevaObra.archivoDoc = fileId
      }
      
      if (archivoPdf && archivoPdf.size > 0) {
        const fileId = await uploadFile(archivoPdf, {
          obraId: nuevaObra._id.toString(),
          tipo: 'pdf',
          filename: archivoPdf.name
        })
        nuevaObra.archivoPdf = fileId
      }
      
      if (archivoEpub && archivoEpub.size > 0) {
        const fileId = await uploadFile(archivoEpub, {
          obraId: nuevaObra._id.toString(),
          tipo: 'epub',
          filename: archivoEpub.name
        })
        nuevaObra.archivoEpub = fileId
      }
      
      // Guardar los IDs de archivos si se subieron
      if (archivoDoc || archivoPdf || archivoEpub) {
        await nuevaObra.save()
      }
    } catch (fileError) {
      console.error('Error subiendo archivos:', fileError)
      // No fallar la creación de la obra si hay error con archivos
      // pero loguear el error
    }
    
    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();
    
    return NextResponse.json({
      message: 'Obra creada correctamente',
      obra: nuevaObra
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creando obra:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH: reordenar obras. Body: { ids: string[] } con los _id en el orden deseado.
 * Ese orden se usa en la parte pública.
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAPI()
    await dbConnect()

    const body = await request.json()
    const { ids } = body as { ids?: string[] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere un array de ids (orden)' },
        { status: 400 }
      )
    }

    await Promise.all(
      ids.map((id, index) =>
        Obra.updateOne({ _id: id, activo: true }, { $set: { orden: index } })
      )
    )

    revalidateTag('obras')
    revalidateTag('autores')

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    console.error('Error reordenando obras:', err)
    return NextResponse.json(
      { success: false, error: 'Error al reordenar' },
      { status: 500 }
    )
  }
}

