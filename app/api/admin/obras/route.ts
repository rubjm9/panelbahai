import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Autor from '@/models/Autor'
import mongoose from 'mongoose'

// GET /api/admin/obras - List all obras for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectToDatabase()

    const obras = await Obra.find({})
      .populate('autor')
      .sort({ autor: 1, orden: 1, titulo: 1 })
      .lean()

    // Add stats for each obra
    const obrasConStats = await Promise.all(
      obras.map(async (obra) => {
        const parrafosCount = await mongoose.connection.db.collection('parrafos').countDocuments({ obra: obra._id })
        const seccionesCount = await mongoose.connection.db.collection('secciones').countDocuments({ obra: obra._id })

        return {
          ...obra,
          parrafos: parrafosCount,
          secciones: seccionesCount
        }
      })
    )

    return NextResponse.json(obrasConStats)
  } catch (error) {
    console.error('Error fetching obras:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/admin/obras - Create new obra
export async function POST(request: NextRequest) {
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

    // Check if slug already exists for this author
    const existingObra = await Obra.findOne({ autor, slug })
    if (existingObra) {
      return NextResponse.json({ error: 'Ya existe una obra con este slug para este autor' }, { status: 400 })
    }

    // Verify autor exists
    const autorExists = await Autor.findById(autor)
    if (!autorExists) {
      return NextResponse.json({ error: 'El autor seleccionado no existe' }, { status: 400 })
    }

    const obra = new Obra({
      titulo: titulo.trim(),
      slug: slug.trim(),
      autor,
      descripcion: descripcion?.trim(),
      fechaPublicacion,
      orden: orden || 0,
      activo: activo !== undefined ? activo : true,
      esPublico: esPublico !== undefined ? esPublico : false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })

    await obra.save()
    await obra.populate('autor')

    return NextResponse.json(obra, { status: 201 })
  } catch (error) {
    console.error('Error creating obra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
