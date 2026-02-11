import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'
import { getCachedAutorBySlug } from '@/lib/services/public/autorService'
import { listPublishedWorksByAutor } from '@/lib/services/public/obraService'

// Función para obtener datos del autor usando servicios
async function getAutorData(slug: string) {
  try {
    // Obtener autor y obras en paralelo usando servicios
    const [autor, obras] = await Promise.all([
      getCachedAutorBySlug(slug),
      listPublishedWorksByAutor(slug)
    ]);
    
    if (!autor) {
      return null;
    }

    return { autor, obras };
  } catch (error) {
    console.error('Error fetching autor data:', error);
    return null;
  }
}

export default async function AutorPage({ params }: { params: { autorSlug: string } }) {
  const { autorSlug } = params

  const data = await getAutorData(autorSlug)
  if (!data) notFound()

  const { autor, obras } = data

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-midnight-900 transition-colors duration-200">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 dark:bg-midnight-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">{autor.nombre}</h1>
          </div>
        </div>
      </section>
      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <Link href="/autores" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">Autores</Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <span className="text-primary-900 dark:text-neutral-100 font-medium">{autor.nombre}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section elegante */}
      <section className="section-elegant bg-white dark:bg-midnight-900 transition-colors duration-200">
        <div className="container-elegant">
          <div className="text-center mb-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-primary-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {autor.biografia || '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Obras Section */}
      <section className="section-elegant">
        <div className="container-elegant">
          <div className="mb-12">
            <h2 className="text-2xl font-normal text-primary-900 dark:text-neutral-100 mb-4 text-center">
              Obras disponibles
            </h2>
            {obras.length > 0 && (
              <p className="text-primary-600 dark:text-neutral-400 text-center">
                {obras.length} obra{obras.length !== 1 ? 's' : ''} disponible{obras.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {obras.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg divide-y divide-primary-100 dark:divide-slate-700">
                {obras.map((obra: any) => (
                  <ObraListItem key={obra.slug} obra={obra} autor={autor} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-primary-600 dark:text-neutral-400" />
              </div>
              <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-100 mb-3">
                No hay obras disponibles
              </h3>
              <p className="text-primary-600 dark:text-neutral-400">
                Las obras de este autor están siendo preparadas para su publicación.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// Componente para lista de obras (formato visual mejorado)
function ObraListItem({ obra, autor }: { obra: any; autor: any }) {
  return (
    <Link 
      href={`/autores/${autor.slug}/${obra.slug}`} 
      className="group block hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors duration-200 block-link"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-neutral-700 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-neutral-600 transition-colors">
                <BookOpen className="w-5 h-5 text-primary-700 dark:text-neutral-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-medium text-primary-900 dark:text-neutral-100 mb-2 group-hover:text-primary-800 dark:group-hover:text-neutral-200 transition-colors">
                  {obra.titulo}
                </h3>
                <p className="text-primary-600 dark:text-neutral-400 text-sm leading-relaxed mb-3">
                  {obra.descripcion}
                </p>
                {/* Metadatos compactos */}
                {obra.fechaPublicacion && (
                  <div className="flex items-center gap-4 text-xs text-primary-500 dark:text-neutral-500">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      <span>{obra.fechaPublicacion}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Acción */}
          <div className="flex items-center text-primary-500 dark:text-neutral-400 group-hover:text-primary-700 dark:group-hover:text-neutral-300 transition-colors flex-shrink-0">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}