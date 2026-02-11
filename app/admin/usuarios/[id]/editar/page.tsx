export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Usuario from '@/models/Usuario'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdminOnlyAuth } from '@/lib/auth-helpers'
import UsuarioForm from '@/components/admin/UsuarioForm'
import mongoose from 'mongoose'

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  await requireAdminOnlyAuth()
  await dbConnect()

  if (!mongoose.Types.ObjectId.isValid(params.id)) notFound()
  const usuario = await Usuario.findOne({ _id: params.id, activo: true }).lean()
  if (!usuario) notFound()

  const u = usuario as { _id: { toString: () => string }; nombre: string; email: string; rol: string }

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
              Editar usuario
            </h1>
            <p className="text-primary-600 font-reading">
              {u.nombre}
            </p>
          </div>
        </div>
      </div>

      <UsuarioForm
        usuarioId={u._id.toString()}
        initialNombre={u.nombre}
        initialEmail={u.email}
        initialRol={u.rol}
      />
    </div>
  )
}
