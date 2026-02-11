export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdminOnlyAuth } from '@/lib/auth-helpers'
import UsuarioForm from '@/components/admin/UsuarioForm'

export default async function NuevoUsuarioPage() {
  await requireAdminOnlyAuth()

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
              Nuevo usuario
            </h1>
            <p className="text-primary-600 font-reading">
              Añade un usuario al sistema (admin, editor o visualizador)
            </p>
          </div>
        </div>
      </div>

      <UsuarioForm />
    </div>
  )
}
