import Link from 'next/link'
import { ArrowLeft, Users, Globe, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Acerca del Panel - Panel Bahá\'í',
  description: 'Conoce más sobre el Panel de Traducción de Literatura Bahá\'í al Español'
}

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link 
              href="/"
              className="flex items-center text-bahai-darkgold hover:text-bahai-navy transition-colors mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-bahai-navy">Acerca del Panel</h1>
              <p className="text-bahai-darkgray">Panel de Traducción de Literatura Bahá'í al Español</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-bahai-lightgray to-white rounded-lg p-8">
            <h2 className="text-3xl font-bold text-bahai-navy mb-6">
              Nuestra Misión
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              El Panel de Traducción de Literatura Bahá'í al Español es un organismo oficial 
              dedicado a hacer accesible la rica literatura bahá'í a los hablantes de español 
              en todo el mundo. Nuestro trabajo se centra en proporcionar traducciones precisas, 
              elegantes y fieles al espíritu original de los textos sagrados y escritos bahá'ís.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Esta plataforma digital representa nuestro compromiso de utilizar la tecnología 
              moderna para facilitar el acceso a estos textos transformadores, ofreciendo 
              herramientas avanzadas de búsqueda, navegación y lectura.
            </p>
          </div>
        </section>

        {/* Características del trabajo */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-bahai-navy mb-8 text-center">
            Nuestro Enfoque de Trabajo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-bahai-navy mb-4">Fidelidad al Original</h3>
              <p className="text-gray-600">
                Cada traducción es revisada meticulosamente para preservar tanto el significado 
                literal como el espíritu de los textos originales.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-bahai-navy mb-4">Trabajo Colaborativo</h3>
              <p className="text-gray-600">
                Nuestro equipo de traductores, revisores y editores trabaja en estrecha 
                colaboración para asegurar la más alta calidad.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-bahai-navy mb-4">Alcance Universal</h3>
              <p className="text-gray-600">
                Trabajamos para servir a todas las comunidades de habla hispana, considerando 
                las variaciones regionales del idioma.
              </p>
            </div>
          </div>
        </section>

        {/* Proceso de Traducción */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-bahai-navy mb-8 text-center">
            Proceso de Traducción
          </h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-bahai-gold text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bahai-navy mb-2">Selección y Preparación</h3>
                <p className="text-gray-600">
                  Los textos se seleccionan cuidadosamente basándose en las necesidades de la comunidad 
                  y las prioridades institucionales.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-bahai-gold text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bahai-navy mb-2">Traducción Inicial</h3>
                <p className="text-gray-600">
                  Traductores experimentados realizan la primera versión, prestando especial atención 
                  a la precisión terminológica y la fluidez del texto.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-bahai-gold text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bahai-navy mb-2">Revisión y Consulta</h3>
                <p className="text-gray-600">
                  El texto pasa por múltiples revisiones y procesos de consulta para asegurar 
                  la máxima fidelidad al original.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-bahai-gold text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-bahai-navy mb-2">Aprobación y Publicación</h3>
                <p className="text-gray-600">
                  Una vez aprobado por las instituciones correspondientes, el texto se publica 
                  y se hace disponible para la comunidad mundial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-bahai-navy text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Deseas Colaborar?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Si tienes experiencia en traducción y sientes el llamado a servir en este campo, 
            nos encantaría conocer tu interés en contribuir a este importante trabajo.
          </p>
          <Link href="/contacto" className="bg-bahai-gold hover:bg-bahai-darkgold text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block">
            Contáctanos
          </Link>
        </section>
      </main>
    </div>
  )
}
