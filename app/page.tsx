import Link from 'next/link'
import { BookOpen, Users, Globe, ArrowRight } from 'lucide-react'
import SearchBox from '@/components/search/SearchBox'
export default function HomePage() {
  return (
      <div className="min-h-screen bg-neutral-50 dark:bg-midnight-900 transition-colors duration-200">
        {/* Hero principal con fondo azul */}
        <section className="bg-hero-gradient text-white">
          <div className="container-elegant">
            <div className="section-elegant text-center">
              <h2 className="display-title text-white mb-4">
                Panel Internacional de Traducción de 
                <br />
                Literatura Bahá'í al español
              </h2>
              <p className="display-subtitle max-w-3xl mx-auto text-primary-200">
              Traducción autorizada de las obras de Bahá'u'lláh, el Báb, <span className="whitespace-nowrap">'Abdu'l-Bahá</span>, Shoghi Effendi y algunas de la Casa Universal de Justicia.
              </p>
              {/* Buscador principal */}
              <div className="mt-10">
                <SearchBox 
                  placeholder="Buscar en toda la biblioteca..."
                  className="max-w-2xl mx-auto"
                  context="homepage"
                  autoFocus={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contenido principal */}
        <main className="section-elegant">
          <div className="container-elegant">
            {/* Navegación por Autores elegante */}
            <div className="mb-20">
              <h3 className="text-2xl font-normal text-primary-900 dark:text-neutral-100 mb-12 text-center">
                Explore por autor
              </h3>
              <div className="grid-elegant md:grid-cols-2 lg:grid-cols-3">
                <AuthorCard
                  nombre="Bahá'u'lláh"
                  slug="bahaullah"
                  descripcion="Fundador de la Fe Bahá'í y autor de numerosos textos sagrados."
                  icono={BookOpen}
                />
                <AuthorCard
                  nombre="El Báb"
                  slug="el-bab"
                  descripcion="Precursor de Bahá'u'lláh y autor de textos fundamentales."
                  icono={BookOpen}
                />
                <AuthorCard
                  nombre="'Abdu'l-Bahá"
                  slug="abdul-baha"
                  descripcion="Hijo mayor de Bahá'u'lláh e intérprete autorizado de Sus enseñanzas."
                  icono={BookOpen}
                />
                <AuthorCard
                  nombre="Shoghi Effendi"
                  slug="shoghi-effendi"
                  descripcion="Guardián de la Fe Bahá'í y traductor de textos sagrados."
                  icono={BookOpen}
                />
                <AuthorCard
                  nombre="Casa Universal de Justicia"
                  slug="casa-justicia"
                  descripcion="Cuerpo administrativo supremo de la Fe Bahá'í."
                  icono={Users}
                />
                <AuthorCard
                  nombre="Recopilaciones"
                  slug="recopilaciones"
                  descripcion="Selecciones temáticas de textos de varios autores bahá'ís."
                  icono={Globe}
                />
              </div>
            </div>

          </div>
        </main>
      </div>
  )
}

// Componente para tarjetas de autor
function AuthorCard({ nombre, slug, descripcion, icono: IconoComponente }: {
  nombre: string;
  slug: string;
  descripcion: string;
  icono: any;
}) {
  return (
    <Link href={`/autores/${slug}`} className="group block-link">
      <div className="card hover:shadow-elegant-xl transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-neutral-600">
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mr-4 group-hover:bg-primary-200 dark:group-hover:bg-slate-700 transition-colors">
            <IconoComponente className="w-6 h-6 text-primary-700 dark:text-neutral-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-primary-900 dark:text-neutral-100 mb-2 group-hover:text-primary-800 dark:group-hover:text-neutral-200 transition-colors">
              {nombre}
            </h3>
            <p className="text-primary-600 dark:text-neutral-400 text-sm leading-relaxed">
              {descripcion}
            </p>
          </div>
        </div>
        <div className="flex items-center text-primary-500 dark:text-neutral-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-neutral-300 transition-colors">
          <span>Explore las obras</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
