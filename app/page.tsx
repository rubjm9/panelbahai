import Link from 'next/link'
import { Search, BookOpen, Users, Globe, ArrowRight } from 'lucide-react'
import SearchBox from '@/components/search/SearchBox'
import SearchProvider from '@/components/search/SearchProvider'

export default function HomePage() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-neutral-50">
        {/* Header elegante */}
        <header className="header-elegant">
          <div className="container-elegant">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-800 rounded-sm flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-primary-900">Panel Bahá'í</h1>
                  <p className="text-sm text-primary-600">Literatura Traducida al Español</p>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/acerca" className="nav-link">Acerca del Panel</Link>
                <Link href="/proximas" className="nav-link">Próximas Traducciones</Link>
                <Link href="/contacto" className="nav-link">Contacto</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section elegante */}
        <main className="section-elegant">
          <div className="container-elegant">
            <div className="text-center mb-20">
              <h2 className="display-title">
                Biblioteca Digital de Literatura Bahá'í
              </h2>
              <p className="display-subtitle max-w-3xl mx-auto">
                Accede a textos sagrados y literatura bahá'í traducida al español por el 
                Panel de Traducción oficial, con herramientas avanzadas de búsqueda y lectura.
              </p>
              
              {/* Buscador principal elegante */}
              <div className="mb-16">
                <SearchBox 
                  placeholder="Buscar en toda la biblioteca..."
                  className="max-w-2xl mx-auto"
                />
              </div>
            </div>

            {/* Navegación por Autores elegante */}
            <div className="mb-20">
              <h3 className="text-2xl font-normal text-primary-900 mb-12 text-center">
                Explora por Autor
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
                  nombre="Compilaciones"
                  slug="compilaciones"
                  descripcion="Selecciones temáticas de textos de varios autores bahá'ís."
                  icono={Globe}
                />
              </div>
            </div>

            {/* Características elegantes */}
            <div className="card">
              <h3 className="text-2xl font-normal text-primary-900 mb-12 text-center">
                Características de la Plataforma
              </h3>
              <div className="grid-elegant md:grid-cols-3">
                <FeatureCard
                  icono={Search}
                  titulo="Búsqueda Avanzada"
                  descripcion="Encuentra cualquier texto con búsqueda en tiempo real y resultados priorizados."
                />
                <FeatureCard
                  icono={BookOpen}
                  titulo="Modo Lectura"
                  descripcion="Párrafos numerados con anclajes directos e índice de navegación lateral."
                />
                <FeatureCard
                  icono={Globe}
                  titulo="Multilingüe"
                  descripcion="Interfaz disponible en español e inglés, optimizada para todos los dispositivos."
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer elegante */}
        <footer className="bg-primary-900 text-white py-16">
          <div className="container-elegant">
            <div className="grid-elegant md:grid-cols-3">
              <div>
                <h4 className="font-medium mb-6 text-white">Panel de Traducción</h4>
                <p className="text-primary-200 leading-relaxed">
                  Dedicado a hacer accesible la literatura bahá'í en español con la más alta calidad.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-6 text-white">Enlaces</h4>
                <ul className="space-y-3 text-primary-200">
                  <li><Link href="/acerca" className="hover:text-white transition-colors">Acerca del Panel</Link></li>
                  <li><Link href="/proximas" className="hover:text-white transition-colors">Próximas Traducciones</Link></li>
                  <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-6 text-white">Recursos Oficiales</h4>
                <ul className="space-y-3 text-primary-200">
                  <li><a href="https://bahai.org" className="hover:text-white transition-colors">Bahá'í.org</a></li>
                  <li><a href="https://bahai.org/library" className="hover:text-white transition-colors">Bahá'í Reference Library</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-primary-800 mt-12 pt-8 text-center text-primary-300">
              <p>&copy; 2024 Panel de Traducción de Literatura Bahá'í al Español</p>
            </div>
          </div>
        </footer>
      </div>
    </SearchProvider>
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
    <Link href={`/autores/${slug}`} className="group">
      <div className="card hover:shadow-elegant-xl transition-all duration-300 group-hover:border-primary-200">
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-sm flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
            <IconoComponente className="w-6 h-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-primary-900 mb-2 group-hover:text-primary-800 transition-colors">
              {nombre}
            </h3>
            <p className="text-primary-600 text-sm leading-relaxed">
              {descripcion}
            </p>
          </div>
        </div>
        <div className="flex items-center text-primary-500 text-sm font-medium group-hover:text-primary-700 transition-colors">
          <span>Explorar obras</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}

// Componente para características
function FeatureCard({ icono: IconoComponente, titulo, descripcion }: {
  icono: any;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-sm flex items-center justify-center mx-auto mb-6">
        <IconoComponente className="w-8 h-8 text-primary-700" />
      </div>
      <h4 className="font-medium text-primary-900 mb-3">{titulo}</h4>
      <p className="text-primary-600 leading-relaxed">
        {descripcion}
      </p>
    </div>
  )
}