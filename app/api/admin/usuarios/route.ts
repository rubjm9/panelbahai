import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import bcrypt from 'bcryptjs'

// GET /api/admin/usuarios - List all active usuarios for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await connectToDatabase()

    const usuarios = await Usuario.find({ activo: true })
      .sort({ fechaCreacion: -1 })
      .select('-password') // Don't return passwords
      .lean()

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/admin/usuarios - Create new usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { nombre, email, password, rol, activo } = await request.json()

    // Validate required fields
    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 })
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Validate rol
    if (!['admin', 'editor', 'viewer'].includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if email already exists
    const existingUsuario = await Usuario.findOne({ email: email.toLowerCase() })
    if (existingUsuario) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const usuario = new Usuario({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      rol,
      activo: activo !== undefined ? activo : true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    })

    await usuario.save()

    // Return user without password
    const userResponse = usuario.toObject()
    delete userResponse.password

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
