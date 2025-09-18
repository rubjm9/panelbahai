import Link from 'next/link'
import { Users, Globe, BookOpen, CheckCircle, Calendar, Award } from 'lucide-react'

export const metadata = {
  title: 'Sobre el Panel - Panel Bahá\'í',
  description: 'Conoce más sobre el Panel Internacional de Traducción de Literatura Bahá\'í al Español'
}

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Sobre el Panel</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">Panel Internacional de Traducción de Literatura Bahá'í al Español</p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400">/</span>
            <span className="text-primary-900 font-medium">Sobre el Panel</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción principal */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <h2 className="text-3xl font-display font-bold text-primary-900 mb-6">
              ¿Qué es el Panel Internacional de Traducción?
            </h2>
            <p className="text-lg text-primary-700 leading-relaxed mb-6">
              El Panel Internacional de Traducción es un órgano creado el <strong>6 de enero de 1993</strong> por la Casa Universal de Justicia para producir traducciones oficiales en español de los textos de autoridad de la Fe bahá'í, es decir, las obras de Bahá'u'lláh, del Báb, de 'Abdu'l-Bahá, los escritos de Shoghi Effendi y algunos mensajes de la Casa Universal de Justicia.
            </p>
            <p className="text-lg text-primary-700 leading-relaxed">
              El primer encargo que les realizó la Casa de Justicia fue la traducción del <strong>Kitáb-i-Aqdás</strong> (el Libro Más Sagrado) al español, trabajo que fue completado en 1999.
            </p>
          </div>
        </section>

        {/* Funciones del Panel */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Funciones del Panel
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900">Facilitar y Supervisar</h3>
              </div>
              <p className="text-primary-700">
                Facilitar y supervisar la traducción de textos bahá'ís de autoridad, obras generales introductorias y materiales publicados comúnmente.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900">Obtener Ayuda</h3>
              </div>
              <p className="text-primary-700">
                Obtener ayuda de traductores bien cualificados y asignar tareas concretas a cada uno de ellos.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900">Revisar el Trabajo</h3>
              </div>
              <p className="text-primary-700">
                Revisar el trabajo de traducción para asegurar la máxima calidad y fidelidad al texto original.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900">Ofrecer Traducciones</h3>
              </div>
              <p className="text-primary-700">
                Ofrecer las traducciones a Asambleas Espirituales Nacionales y Editoriales para su distribución.
              </p>
            </div>
          </div>
        </section>

        {/* Miembros del Panel */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Quiénes componen el Panel
          </h2>
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <p className="text-lg text-primary-700 mb-6">
              El Panel está compuesto actualmente por:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 font-medium">Dª Malihé Sanatian (Reino Unido)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 font-medium">D. Daniel Rider (España)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 font-medium">Dr. Houman Motlagh (México)</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 font-medium">Dª Leili Egea (Colombia)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 font-medium">Dr. Nabil Perdu (España)</span>
                  <span className="text-primary-600 text-sm ml-2">- Secretario</span>
                </div>
              </div>
            </div>
            <p className="text-primary-700 mt-6">
              Además, el trabajo del Panel aglutina los esfuerzos de profesionales, académicos y voluntarios de todo el mundo, implicados en los procesos de traducción de los escritos sagrados bahá'ís al español.
            </p>
          </div>
        </section>

        {/* Historia */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Historia
          </h2>
          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Línea vertical central */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-accent-500 to-accent-600 rounded-full"></div>
            
            {/* Eventos del timeline */}
            <div className="space-y-12">
              {/* Evento 1: Creación del Panel */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white border border-primary-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Creación del Panel (1993)</h3>
                    <p className="text-primary-700">
                      El Panel Internacional de Traducción fue creado el 6 de enero de 1993 por la Casa Universal de Justicia, marcando un hito en la historia de la traducción de textos bahá'ís al español.
                    </p>
                  </div>
                </div>
                
                {/* Ícono central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-lg z-10">
                  <Calendar className="w-8 h-8" />
                </div>
                
                <div className="w-1/2 pl-8">
                  {/* Espacio vacío para balance visual */}
                </div>
              </div>
              
              {/* Evento 2: Kitáb-i-Aqdás */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8">
                  {/* Espacio vacío para balance visual */}
                </div>
                
                {/* Ícono central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-lg z-10">
                  <BookOpen className="w-8 h-8" />
                </div>
                
                <div className="w-1/2 pl-8 text-left">
                  <div className="bg-white border border-primary-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Kitáb-i-Aqdás (1999)</h3>
                    <p className="text-primary-700">
                      El primer encargo de la Casa Universal de Justicia fue la traducción del Kitáb-i-Aqdás (el Libro Más Sagrado) al español, trabajo que fue completado exitosamente en 1999.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Evento 3: Expansión Continua */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-white border border-primary-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Expansión Continua</h3>
                    <p className="text-primary-700">
                      Desde entonces, el Panel ha continuado trabajando incansablemente para traducir y hacer accesibles los textos sagrados bahá'ís a las comunidades de habla hispana en todo el mundo.
                    </p>
                  </div>
                </div>
                
                {/* Ícono central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-lg z-10">
                  <Globe className="w-8 h-8" />
                </div>
                
                <div className="w-1/2 pl-8">
                  {/* Espacio vacío para balance visual */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nuevas Traducciones */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Nuevas Traducciones Disponibles</h2>
            <p className="text-accent-100 mb-6 max-w-2xl mx-auto">
              El Panel pone a disposición las traducciones más recientes aprobadas por la Casa Universal de Justicia para el uso de los amigos e instituciones.
            </p>
            <Link 
              href="/proximas-traducciones" 
              className="bg-white hover:bg-gray-100 text-accent-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
            >
              Descubre las nuevas traducciones
            </Link>
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-primary-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">¿Deseas Colaborar?</h2>
          <p className="text-primary-200 mb-6 max-w-2xl mx-auto">
            Si tienes experiencia en traducción y sientes el llamado a servir en este campo, 
            nos encantaría conocer tu interés en contribuir a este importante trabajo.
          </p>
          <Link 
            href="/contacto" 
            className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            Contáctanos
          </Link>
        </section>
      </main>
    </div>
  )
}