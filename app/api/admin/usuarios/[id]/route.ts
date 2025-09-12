import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

// GET /api/admin/usuarios/[id] - Get specific usuario for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectToDatabase()

    const usuario = await Usuario.findById(params.id)
      .select('-password') // Don't return password
      .lean()

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error fetching usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/admin/usuarios/[id] - Update specific usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { nombre, email, password, rol, activo } = await request.json()

    // Validate required fields
    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son obligatorios' }, { status: 400 })
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Validate rol
    if (!['admin', 'editor', 'viewer'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    await connectToDatabase()

    // Find the current usuario
    const currentUsuario = await Usuario.findById(params.id)
    if (!currentUsuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if new email already exists (if changed)
    if (email.toLowerCase() !== currentUsuario.email) {
      const existingUsuario = await Usuario.findOne({ email: email.toLowerCase(), _id: { $ne: params.id } })
      if (existingUsuario) {
        return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
      }
    }

    // Update the usuario
    currentUsuario.nombre = nombre.trim()
    currentUsuario.email = email.trim().toLowerCase()

    if (password) {
      // Validate password length
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
      }
      // Hash new password
      const saltRounds = 12
      currentUsuario.password = await bcrypt.hash(password, saltRounds)
    }

    currentUsuario.rol = rol
    currentUsuario.activo = activo !== undefined ? activo : true
    currentUsuario.fechaActualizacion = new Date()

    await currentUsuario.save()

    // Return user without password
    const userResponse = currentUsuario.toObject()
    delete userResponse.password

    return NextResponse.json(userResponse)
  } catch (error) {
    console.error('Error updating usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/usuarios/[id] - Delete specific usuario (soft delete by setting activo to false)
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

    const usuario = await Usuario.findById(params.id)
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Don't allow deleting admin users
    if (usuario.rol === 'admin') {
      return NextResponse.json({ error: 'No se puede eliminar usuarios con rol de administrador' }, { status: 400 })
    }

    // Soft delete by setting activo to false
    usuario.activo = false
    usuario.fechaActualizacion = new Date()
    await usuario.save()

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
