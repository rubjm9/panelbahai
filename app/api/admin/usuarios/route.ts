import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import { requireAdminOnlyAPI } from '@/lib/auth-helpers'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdminOnlyAPI()
    await dbConnect()

    const body = await request.json()
    const { nombre, email, password, rol } = body

    if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      )
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'El email es requerido' },
        { status: 400 }
      )
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña es requerida y debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const rolValido = rol === 'admin' || rol === 'editor' || rol === 'viewer' ? rol : 'viewer'
    const emailLower = email.trim().toLowerCase()

    const existente = await Usuario.findOne({ email: emailLower })
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(password)
    const usuario = new Usuario({
      nombre: nombre.trim(),
      email: emailLower,
      password: hashed,
      rol: rolValido,
    })
    await usuario.save()

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: usuario._id.toString(),
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    if (err instanceof Error && (err.message === 'No autorizado' || err.message === 'Token inválido')) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }
    if (err instanceof Error && err.message === 'Permisos insuficientes') {
      return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 })
    }
    console.error('Error creating usuario:', err)
    return NextResponse.json(
      { success: false, error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}
