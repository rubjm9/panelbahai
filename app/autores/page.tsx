import Link from 'next/link'
import { BookOpen, Users, Globe, ArrowRight } from 'lucide-react'

export default function AutoresPage() {
  const autores = [
    {
      nombre: "Bahá'u'lláh",
      slug: "bahaullah",
      biografia: "Fundador de la Fe Bahá'í (1817-1892). Bahá'u'lláh es el título de Mírzá Husayn-'Alí, que significa 'Gloria de Dios'.",
      icono: BookOpen,
      obras: 3
    },
    {
      nombre: "El Báb",
      slug: "el-bab",
      biografia: "Precursor de Bahá'u'lláh (1819-1850). El Báb, cuyo nombre era Siyyid 'Alí-Muhammad, anunció la proximidad de una nueva Revelación divina.",
      icono: BookOpen,
      obras: 1
    },
    {
      nombre: "'Abdu'l-Bahá",
      slug: "abdul-baha",
      biografia: "Hijo mayor de Bahá'u'lláh (1844-1921) e intérprete autorizado de Sus enseñanzas. Su nombre significa 'Siervo de Bahá'.",
      icono: BookOpen,
      obras: 2
    },
    {
      nombre: "Shoghi Effendi",
      slug: "shoghi-effendi",
      biografia: "Guardián de la Fe Bahá'í (1897-1957), nieto de 'Abdu'l-Bahá y encargado de guiar a la comunidad bahá'í mundial.",
      icono: BookOpen,
      obras: 1
    },
    {
      nombre: "Casa Universal de Justicia",
      slug: "casa-justicia",
      biografia: "Cuerpo administrativo supremo de la Fe Bahá'í, establecido en 1963 en el Centro Mundial Bahá'í en Haifa, Israel.",
      icono: Users,
      obras: 1
    },
    {
      nombre: "Declaraciones Oficiales",
      slug: "declaraciones-oficiales",
      biografia: "Declaraciones y comunicados oficiales de instituciones bahá'ís.",
      icono: Globe,
      obras: 0
    },
    {
      nombre: "Compilaciones",
      slug: "compilaciones",
      biografia: "Selecciones temáticas de textos de varios autores bahá'ís organizadas por tema.",
      icono: Globe,
      obras: 1
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-midnight-900 transition-colors duration-200">
      {/* Header elegante */}
      <header className="bg-primary-900 dark:bg-midnight-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant">
            <div className="text-center">
              <h1 className="display-title text-white mb-6">Autores</h1>
              <p className="text-xl text-primary-200 max-w-3xl mx-auto leading-relaxed">
                Explora las obras de los principales autores de la literatura bahá'í
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación elegante */}
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

      {/* Contenido principal elegante */}
      <main className="section-elegant">
        <div className="container-elegant">
          <div className="grid-elegant md:grid-cols-2 lg:grid-cols-3">
            {autores.map((autor) => {
              const IconoComponente = autor.icono;
              return (
                <AuthorCard
                  key={autor.slug}
                  nombre={autor.nombre}
                  slug={autor.slug}
                  biografia={autor.biografia}
                  icono={IconoComponente}
                  obras={autor.obras}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

// Componente para tarjetas de autor
function AuthorCard({ nombre, slug, biografia, icono: IconoComponente, obras }: {
  nombre: string;
  slug: string;
  biografia: string;
  icono: any;
  obras: number;
}) {
  return (
    <Link 
      href={`/autores/${slug}`} 
      className="group author-card-link"
    >
      <div className="card hover:shadow-elegant-xl transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-neutral-600 group-hover:-translate-y-1">
        <div className="flex items-start mb-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mr-4 group-hover:bg-primary-200 dark:group-hover:bg-slate-700 transition-colors">
            <IconoComponente className="w-6 h-6 text-primary-700 dark:text-neutral-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-primary-900 dark:text-neutral-100 mb-3 group-hover:text-primary-800 dark:group-hover:text-neutral-200 transition-colors">
              {nombre}
            </h2>
            <p className="text-primary-600 dark:text-neutral-400 leading-relaxed text-sm mb-4">
              {biografia}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-primary-500 dark:text-neutral-400 text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{obras} obra{obras !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center text-primary-500 dark:text-neutral-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-neutral-300 transition-colors">
            <span>Explorar</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}