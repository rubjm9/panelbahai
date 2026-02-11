export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Autor from '@/models/Autor'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdminAuth } from '@/lib/auth-helpers'
import AutorForm from '@/components/admin/AutorForm'

export default async function EditarAutorPage({ params }: { params: { slug: string } }) {
  await requireAdminAuth()
  await dbConnect()

  const autor = await Autor.findOne({ slug: params.slug, activo: true }).lean()
  if (!autor) notFound()

  const a = autor as { _id: { toString: () => string }; nombre: string; biografia?: string; orden: number }

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
              Editar autor
            </h1>
            <p className="text-primary-600 font-reading">
              {a.nombre}
            </p>
          </div>
        </div>
      </div>

      <AutorForm
        autorId={a._id.toString()}
        initialNombre={a.nombre}
        initialBiografia={a.biografia ?? ''}
        initialOrden={a.orden}
      />
    </div>
  )
}
