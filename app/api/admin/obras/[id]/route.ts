import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Autor from '@/models/Autor'
import mongoose from 'mongoose'

// GET /api/admin/obras/[slug] - Get specific obra for admin by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectToDatabase()

    const obra = await Obra.findOne({ slug: params.slug })
      .populate('autor')
      .lean()

    if (!obra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    return NextResponse.json(obra)
  } catch (error) {
    console.error('Error fetching obra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/admin/obras/[id] - Update specific obra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { titulo, slug, autor, descripcion, fechaPublicacion, orden, activo, esPublico } = await request.json()

    // Validate required fields
    if (!titulo || !slug || !autor) {
      return NextResponse.json({ error: 'Título, slug y autor son obligatorios' }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }

    await connectToDatabase()

    // Find the current obra
    const currentObra = await Obra.findById(params.id)
    if (!currentObra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    // Check if new slug already exists for this author (if changed)
    if (slug !== currentObra.slug || autor !== currentObra.autor.toString()) {
      const existingObra = await Obra.findOne({ autor, slug, _id: { $ne: params.id } })
      if (existingObra) {
        return NextResponse.json({ error: 'Ya existe una obra con este slug para este autor' }, { status: 400 })
      }
    }

    // Verify autor exists
    const autorExists = await Autor.findById(autor)
    if (!autorExists) {
      return NextResponse.json({ error: 'El autor seleccionado no existe' }, { status: 400 })
    }

    // Update the obra
    currentObra.titulo = titulo.trim()
    currentObra.slug = slug.trim()
    currentObra.autor = autor
    currentObra.descripcion = descripcion?.trim()
    currentObra.fechaPublicacion = fechaPublicacion
    currentObra.orden = orden || 0
    currentObra.activo = activo !== undefined ? activo : true
    currentObra.esPublico = esPublico !== undefined ? esPublico : false
    currentObra.fechaActualizacion = new Date()

    await currentObra.save()
    await currentObra.populate('autor')

    return NextResponse.json(currentObra)
  } catch (error) {
    console.error('Error updating obra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/obras/[id] - Delete specific obra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectToDatabase()

    const obra = await Obra.findById(params.id)
    if (!obra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    // Check if obra has parrafos or secciones
    const parrafosCount = await mongoose.connection.db.collection('parrafos').countDocuments({ obra: obra._id })
    const seccionesCount = await mongoose.connection.db.collection('secciones').countDocuments({ obra: obra._id })

    if (parrafosCount > 0 || seccionesCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar la obra porque tiene ${parrafosCount} párrafo(s) y ${seccionesCount} sección(es) asociada(s). Elimine el contenido primero.`
      }, { status: 400 })
    }

    await Obra.findByIdAndDelete(obra._id)

    return NextResponse.json({ message: 'Obra eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting obra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
