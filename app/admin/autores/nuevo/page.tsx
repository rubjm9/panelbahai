export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdminAuth } from '@/lib/auth-helpers'
import AutorForm from '@/components/admin/AutorForm'

export default async function NuevoAutorPage() {
  await requireAdminAuth()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/admin/autores"
            className="mr-4 p-2 text-primary-600 hover:text-primary-800 transition-colors"
            aria-label="Volver a autores"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
              Nuevo autor
            </h1>
            <p className="text-primary-600 font-reading">
              Añade un autor a la biblioteca. La descripción se mostrará en la página pública de autores.
            </p>
          </div>
        </div>
      </div>

      <AutorForm />
    </div>
  )
}
