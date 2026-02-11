import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import mongoose from 'mongoose'
import { requireAdminOnlyAPI } from '@/lib/auth-helpers'
import { hashPassword } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const current = await requireAdminOnlyAPI()
    await dbConnect()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 })
    }

    const usuario = await Usuario.findById(params.id)
    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { nombre, email, rol, nuevaContrasena } = body

    if (typeof nombre === 'string' && nombre.trim()) {
      usuario.nombre = nombre.trim()
    }
    if (typeof email === 'string' && email.trim()) {
      const emailLower = email.trim().toLowerCase()
      const existente = await Usuario.findOne({ email: emailLower, _id: { $ne: params.id } })
      if (existente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe otro usuario con ese email' },
          { status: 400 }
        )
      }
      usuario.email = emailLower
    }
    if (rol === 'admin' || rol === 'editor' || rol === 'viewer') {
      usuario.rol = rol
    }
    if (typeof nuevaContrasena === 'string' && nuevaContrasena.length >= 6) {
      usuario.password = await hashPassword(nuevaContrasena)
    }

    await usuario.save()

    return NextResponse.json({
      success: true,
      data: {
        _id: usuario._id.toString(),
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error updating usuario:', err)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const current = await requireAdminOnlyAPI()
    await dbConnect()
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Id no válido' }, { status: 400 })
    }

    if (current.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    const usuario = await Usuario.findById(params.id)
    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (usuario.rol === 'admin') {
      const adminsCount = await Usuario.countDocuments({ rol: 'admin', activo: true })
      if (adminsCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar el último administrador' },
          { status: 400 }
        )
      }
    }

    usuario.activo = false
    await usuario.save()

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error deleting usuario:', err)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
}
