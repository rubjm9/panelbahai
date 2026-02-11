import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Autor from '@/models/Autor'
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

export async function POST(request: NextRequest) {
  try {
    await requireAdminAPI()
    await dbConnect()

    const body = await request.json()
    const { nombre, biografia, orden } = body

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    let slug = slugFromNombre(nombre.trim())
    const existing = await Autor.findOne({ slug })
    if (existing) {
      let suffix = 1
      while (await Autor.findOne({ slug: `${slug}-${suffix}` })) suffix++
      slug = `${slug}-${suffix}`
    }

    const autor = new Autor({
      nombre: nombre.trim(),
      slug,
      biografia: biografia != null ? String(biografia).trim() : undefined,
      orden: typeof orden === 'number' && !Number.isNaN(orden) ? orden : 0,
    })
    await autor.save()

    revalidateTag('autores')
    revalidateTag(`autor-${slug}`)

    return NextResponse.json(
      { success: true, data: { _id: autor._id.toString(), nombre: autor.nombre, slug: autor.slug, biografia: autor.biografia, orden: autor.orden } },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'No autorizado') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Token inválido') {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error creating autor:', err)
    return NextResponse.json(
      { success: false, error: 'Error al crear el autor' },
      { status: 500 }
    )
  }
}
