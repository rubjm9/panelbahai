export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import dbConnect from '@/lib/mongodb'
import Autor from '@/models/Autor'
import Obra from '@/models/Obra'
import Link from 'next/link'
import { ArrowLeft, Users, BookOpen, Edit } from 'lucide-react'
import { requireAdminAuth } from '@/lib/auth-helpers'

export default async function VerAutorPage({ params }: { params: { slug: string } }) {
  await requireAdminAuth()
  await dbConnect()

  const autor = await Autor.findOne({ slug: params.slug, activo: true }).lean()
  if (!autor) notFound()

  const obras = await Obra.find({ autor: (autor as any)._id, activo: true })
    .select('titulo slug orden')
    .sort({ orden: 1, titulo: 1 })
    .lean()

  const autorObj = autor as { _id: unknown; nombre: string; slug: string; biografia?: string; orden: number }

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
              {autorObj.nombre}
            </h1>
            <p className="text-primary-600 font-reading">
              Vista del autor
            </p>
          </div>
        </div>
        <Link
          href={`/admin/autores/${autorObj.slug}/editar`}
          className="btn-primary"
        >
          <Edit className="w-5 h-5 mr-2" />
          Editar
        </Link>
      </div>

      <div className="card max-w-3xl">
        <div className="flex items-start mb-4">
          <Users className="w-6 h-6 text-accent-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-600">Orden: {autorObj.orden}</p>
            <p className="text-sm text-primary-600 mt-1">Slug: {autorObj.slug}</p>
          </div>
        </div>
        {autorObj.biografia ? (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-primary-700 mb-2">Descripción</h2>
            <p className="text-primary-600 font-reading whitespace-pre-wrap">
              {autorObj.biografia}
            </p>
          </div>
        ) : (
          <p className="text-primary-500 text-sm mt-2">Sin descripción.</p>
        )}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-display font-semibold text-primary-900 mb-3 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Obras ({obras.length})
          </h2>
          {obras.length === 0 ? (
            <p className="text-primary-500 text-sm">Este autor no tiene obras aún.</p>
          ) : (
            <ul className="space-y-2">
              {(obras as { titulo: string; slug: string }[]).map((obra) => (
                <li key={obra.slug}>
                  <Link
                    href={`/admin/obras/${obra.slug}/editar`}
                    className="text-primary-700 hover:text-primary-900 hover:underline"
                  >
                    {obra.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
