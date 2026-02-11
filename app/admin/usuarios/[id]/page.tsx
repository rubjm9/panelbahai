export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, UserCheck, UserX, Edit } from 'lucide-react'
import { requireAdminOnlyAuth } from '@/lib/auth-helpers'
import mongoose from 'mongoose'

function getRoleLabel(rol: string) {
  switch (rol) {
    case 'admin':
      return 'Administrador'
    case 'editor':
      return 'Editor'
    default:
      return 'Visualizador'
  }
}

function getRoleIcon(rol: string) {
  switch (rol) {
    case 'admin':
      return Shield
    case 'editor':
      return UserCheck
    default:
      return UserX
  }
}

export default async function VerUsuarioPage({ params }: { params: { id: string } }) {
  await requireAdminOnlyAuth()
  await dbConnect()

  if (!mongoose.Types.ObjectId.isValid(params.id)) notFound()
  const usuario = await Usuario.findOne({ _id: params.id, activo: true }).lean()
  if (!usuario) notFound()

  const u = usuario as unknown as { nombre: string; email: string; rol: string; fechaCreacion: Date; fechaActualizacion: Date }
  const Icon = getRoleIcon(u.rol)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/admin/usuarios"
            className="mr-4 p-2 text-primary-600 hover:text-primary-800 transition-colors"
            aria-label="Volver a usuarios"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
              {u.nombre}
            </h1>
            <p className="text-primary-600 font-reading">
              Vista del usuario
            </p>
          </div>
        </div>
        <Link
          href={`/admin/usuarios/${params.id}/editar`}
          className="btn-primary flex items-center"
        >
          <Edit className="w-5 h-5 mr-2" />
          Editar
        </Link>
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-start mb-4">
          <Users className="w-6 h-6 text-accent-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-700">Rol: {getRoleLabel(u.rol)}</p>
            <div className="flex items-center mt-2 text-primary-600">
              <Icon className="w-5 h-5 mr-2" />
              <span>{u.email}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-primary-500 border-t border-gray-200 pt-4">
          <p><strong>Registrado:</strong> {new Date(u.fechaCreacion).toLocaleDateString('es-ES')}</p>
          <p><strong>Última actualización:</strong> {new Date(u.fechaActualizacion).toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </div>
  )
}
