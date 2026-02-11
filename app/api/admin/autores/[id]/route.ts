import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Autor from '@/models/Autor'
import mongoose from 'mongoose'
import { requireAdminAPI } from '@/lib/auth-helpers'
import { revalidateTag } from 'next/cache'

function slugFromNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAPI()
    await dbConnect()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 })
    }

    const body = await request.json()
    const { nombre, biografia, orden } = body

    const autor = await Autor.findOne({ _id: params.id, activo: true })
    if (!autor) {
      return NextResponse.json({ success: false, error: 'Autor no encontrado' }, { status: 404 })
    }

    const update: { nombre?: string; biografia?: string; orden?: number; slug?: string } = {}
    if (typeof nombre === 'string' && nombre.trim()) {
      update.nombre = nombre.trim()
      const newSlug = slugFromNombre(nombre.trim())
      const existing = await Autor.findOne({ slug: newSlug, _id: { $ne: params.id } })
      if (existing) {
        let suffix = 1
        while (await Autor.findOne({ slug: `${newSlug}-${suffix}`, _id: { $ne: params.id } })) suffix++
        update.slug = `${newSlug}-${suffix}`
      } else {
        update.slug = newSlug
      }
    }
    if (biografia !== undefined) update.biografia = biografia == null ? '' : String(biografia).trim()
    if (typeof orden === 'number' && !Number.isNaN(orden)) update.orden = orden

    const oldSlug = autor.slug
    Object.assign(autor, update)
    await autor.save()

    revalidateTag('autores')
    revalidateTag(`autor-${oldSlug}`)
    if (autor.slug !== oldSlug) revalidateTag(`autor-${autor.slug}`)

    return NextResponse.json({
      success: true,
      data: {
        _id: autor._id.toString(),
        nombre: autor.nombre,
        slug: autor.slug,
        biografia: autor.biografia,
        orden: autor.orden,
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error updating autor:', err)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el autor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAPI()
    await dbConnect()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 })
    }

    const autor = await Autor.findById(params.id)
    if (!autor) {
      return NextResponse.json({ success: false, error: 'Autor no encontrado' }, { status: 404 })
    }

    autor.activo = false
    await autor.save()

    revalidateTag('autores')
    revalidateTag(`autor-${autor.slug}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error deleting autor:', err)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el autor' },
      { status: 500 }
    )
  }
}
