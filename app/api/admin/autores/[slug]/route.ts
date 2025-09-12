import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Autor from '@/models/Autor'
import { requireAuth } from '@/lib/auth'

// GET /api/admin/autores/[slug] - Get specific author for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = requireAuth('editor')(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    await connectToDatabase()

    const autor = await Autor.findOne({ slug: params.slug })
      .populate('obras')
      .lean()

    if (!autor) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    return NextResponse.json(autor)
  } catch (error) {
    console.error('Error fetching autor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/admin/autores/[slug] - Update specific author
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = requireAuth('editor')(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { nombre, slug, biografia, orden } = await request.json()

    // Validate required fields
    if (!nombre || !slug || !biografia) {
      return NextResponse.json({ error: 'Nombre, slug y biografía son obligatorios' }, { status: 400 })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }

    await connectToDatabase()

    // Find the current author
    const currentAutor = await Autor.findOne({ slug: params.slug })
    if (!currentAutor) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    // Check if new slug already exists (if changed)
    if (slug !== params.slug) {
      const existingAutor = await Autor.findOne({ slug })
      if (existingAutor) {
        return NextResponse.json({ error: 'Ya existe un autor con este slug' }, { status: 400 })
      }
    }

    // Update the author
    currentAutor.nombre = nombre.trim()
    currentAutor.slug = slug.trim()
    currentAutor.biografia = biografia.trim()
    currentAutor.orden = orden || 0
    currentAutor.fechaActualizacion = new Date()

    await currentAutor.save()

    return NextResponse.json(currentAutor)
  } catch (error) {
    console.error('Error updating autor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/autores/[slug] - Delete specific author
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = requireAuth('admin')(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    await connectToDatabase()

    const autor = await Autor.findOne({ slug: params.slug })
    if (!autor) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 })
    }

    // Check if author has obras
    const obrasCount = await autor.obras?.length || 0
    if (obrasCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar el autor porque tiene ${obrasCount} obra(s) asociada(s). Elimine las obras primero.`
      }, { status: 400 })
    }

    await Autor.findByIdAndDelete(autor._id)

    return NextResponse.json({ message: 'Autor eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting autor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
