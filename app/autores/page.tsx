import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'
import { listCachedPublishedAutores } from '@/lib/services/public/autorService'

export const dynamic = 'force-dynamic'

export default async function AutoresPage() {
  const autores = await listCachedPublishedAutores()
  await dbConnect()

  const autoresConObras = await Promise.all(
    autores.map(async (autor) => {
      const obras = await Obra.countDocuments({
        autor: autor._id,
        activo: true,
        esPublico: true,
      })
      return { ...autor, obras }
    })
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-midnight-900 transition-colors duration-200">
      <header className="bg-primary-900 dark:bg-midnight-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant">
            <div className="text-center">
              <h1 className="display-title text-white mb-6">Autores</h1>
              <p className="text-xl text-primary-200 max-w-3xl mx-auto leading-relaxed">
                Explore las obras de los principales autores de la literatura bahá'í
              </p>
            </div>
          </div>
        </div>
      </header>

      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">
              Inicio
            </Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <span className="text-primary-900 dark:text-neutral-100 font-medium">Autores</span>
          </div>
        </div>
      </nav>

      <main className="section-elegant">
        <div className="container-elegant">
          {autoresConObras.length === 0 ? (
            <p className="text-primary-600 dark:text-neutral-400 text-center py-12">
              No hay autores publicados en este momento.
            </p>
          ) : (
            <div className="grid-elegant md:grid-cols-2 lg:grid-cols-3">
              {autoresConObras.map((autor) => (
                <AuthorCard
                  key={autor.slug}
                  nombre={autor.nombre}
                  slug={autor.slug}
                  biografia={autor.biografia ?? ''}
                  obras={autor.obras}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function AuthorCard({ nombre, slug, biografia, obras }: {
  nombre: string
  slug: string
  biografia: string
  obras: number
}) {
  return (
    <Link
      href={`/autores/${slug}`}
      className="group author-card-link"
    >
      <div className="card hover:shadow-elegant-xl transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-neutral-600 group-hover:-translate-y-1">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mr-4 group-hover:bg-primary-200 dark:group-hover:bg-slate-700 transition-colors">
            <BookOpen className="w-6 h-6 text-primary-700 dark:text-neutral-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-primary-900 dark:text-neutral-100 mb-3 group-hover:text-primary-800 dark:group-hover:text-neutral-200 transition-colors">
              {nombre}
            </h2>
            <p className="text-primary-600 dark:text-neutral-400 leading-relaxed text-sm mb-4">
              {biografia || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-primary-500 dark:text-neutral-400 text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{obras} obra{obras !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center text-primary-500 dark:text-neutral-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-neutral-300 transition-colors">
            <span>Explore</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
