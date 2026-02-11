import Link from 'next/link'
import { listProximasObras } from '@/lib/services/public/proximaObraService'

export const metadata = {
  title: 'Próximas traducciones - Panel Bahá\'í',
  description: 'Conoce las próximas traducciones y proyectos del Panel de Traducción de Literatura Bahá\'í al Español'
}

export default async function ProximasTraduccionesPage() {
  let obras: Awaited<ReturnType<typeof listProximasObras>> = []
  try {
    obras = await listProximasObras()
  } catch (e) {
    console.error('Error loading próximas obras:', e)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-midnight-900 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-primary-900 dark:bg-midnight-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Próximas traducciones</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">
              Obras en fase de traducción o revisión
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <span className="text-primary-900 dark:text-neutral-100 font-medium">Próximas traducciones</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Párrafo introductorio */}
        <p className="text-primary-700 dark:text-neutral-300 text-lg leading-relaxed mb-12">
          Actualmente, las siguientes obras se encuentran en alguna de las fases de traducción o revisión, por lo que se espera que puedan subirse a este sitio web próximamente:
        </p>

        {/* Obras en traducción o revisión */}
        <section>
          <h2 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100 mb-6">
            Obras en traducción o revisión
          </h2>
          {obras.length > 0 ? (
            <ul className="space-y-4">
              {obras.map((obra) => (
                <li
                  key={obra.id}
                  className="group rounded-xl border border-primary-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 transition-colors hover:border-primary-300 dark:hover:border-slate-600"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-primary-900 dark:text-neutral-100 text-lg leading-snug">
                        {obra.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-primary-600 dark:text-neutral-400">
                        {obra.autor}
                      </p>
                    </div>
                    <span
                      className={
                        'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ' +
                        (obra.etiqueta === 'Revisión de traducción'
                          ? 'bg-primary-200/80 text-primary-800 dark:bg-primary-900/60 dark:text-primary-200'
                          : 'bg-neutral-200/80 text-neutral-700 dark:bg-slate-600/60 dark:text-neutral-300')
                      }
                    >
                      {obra.etiqueta}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-primary-600 dark:text-neutral-400">
              No hay obras en el listado en este momento.
            </p>
          )}
        </section>

        {/* Colabora con el Panel */}
        <section className="mt-16 bg-primary-900 dark:bg-midnight-900 text-white rounded-lg p-10 text-center">
          <h2 className="text-2xl font-display font-semibold mb-5">Colabora con el Panel</h2>
          <p className="text-primary-200 dark:text-neutral-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Si tiene habilidades para la traducción o la revisión y quiere colaborar con el trabajo del Panel, escríbanos.
          </p>
          <Link
            href="/contacto"
            className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            Contacto
          </Link>
        </section>
      </main>
    </div>
  )
}
