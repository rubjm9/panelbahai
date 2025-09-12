import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Autor from '@/models/Autor'
import { requireAuth } from '@/lib/auth'

// GET /api/admin/autores - List all authors for admin
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth('editor')(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    await connectToDatabase()

    const autores = await Autor.find({})
      .sort({ orden: 1, nombre: 1 })
      .populate('obras')
      .lean()

    return NextResponse.json(autores)
  } catch (error) {
    console.error('Error fetching autores:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/admin/autores - Create new author
export async function POST(request: NextRequest) {
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

    // Check if slug already exists
    const existingAutor = await Autor.findOne({ slug })
    if (existingAutor) {
      return NextResponse.json({ error: 'Ya existe un autor con este slug' }, { status: 400 })
    }

    const autor = new Autor({
      nombre: nombre.trim(),
      slug: slug.trim(),
      biografia: biografia.trim(),
      orden: orden || 0,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })

    await autor.save()

    return NextResponse.json(autor, { status: 201 })
  } catch (error) {
    console.error('Error creating autor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
