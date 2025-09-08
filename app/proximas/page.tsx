import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, Calendar, Users } from 'lucide-react'

export const metadata = {
  title: 'Próximas Traducciones - Panel Bahá\'í',
  description: 'Conoce las próximas traducciones y proyectos del Panel de Traducción de Literatura Bahá\'í al Español'
}

export default function ProximasPage() {
  const proximasObras = [
    {
      titulo: "Las Siete Valles",
      autor: "Bahá'u'lláh",
      estado: "En revisión final",
      progreso: 85,
      fechaEstimada: "2024 Q2",
      descripcion: "Una obra mística que describe el viaje espiritual del alma hacia Dios a través de siete valles."
    },
    {
      titulo: "Los Cuatro Valles",
      autor: "Bahá'u'lláh", 
      estado: "En traducción",
      progreso: 60,
      fechaEstimada: "2024 Q3",
      descripcion: "Complemento místico de Las Siete Valles, explorando cuatro estados espirituales."
    },
    {
      titulo: "El Secreto de la Civilización Divina",
      autor: "'Abdu'l-Bahá",
      estado: "En planificación",
      progreso: 15,
      fechaEstimada: "2024 Q4",
      descripcion: "Análisis profundo sobre los principios necesarios para el avance de la civilización."
    },
    {
      titulo: "Cartas a Martha Root",
      autor: "Shoghi Effendi",
      estado: "En preparación",
      progreso: 5,
      fechaEstimada: "2025 Q1",
      descripcion: "Correspondencia con una de las más destacadas promotoras de la Fe Bahá'í."
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En revisión final': return 'text-green-600 bg-green-100';
      case 'En traducción': return 'text-blue-600 bg-blue-100';
      case 'En planificación': return 'text-yellow-600 bg-yellow-100';
      case 'En preparación': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
              <h1 className="text-2xl font-bold text-bahai-navy">Próximas Traducciones</h1>
              <p className="text-bahai-darkgray">Proyectos en desarrollo y planificación</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-bahai-lightgray to-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-bahai-gold mr-3" />
              <h2 className="text-2xl font-bold text-bahai-navy">
                Trabajo en Progreso
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              El Panel de Traducción trabaja continuamente en nuevos proyectos para ampliar 
              la biblioteca de literatura bahá'í disponible en español. Aquí puedes seguir 
              el progreso de nuestras próximas publicaciones y conocer qué obras están 
              siendo preparadas para la comunidad.
            </p>
          </div>
        </section>

        {/* Lista de próximas obras */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-bahai-navy mb-8">Proyectos Actuales</h2>
          <div className="space-y-6">
            {proximasObras.map((obra, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-bahai-navy mb-2">
                      {obra.titulo}
                    </h3>
                    <p className="text-bahai-darkgold font-medium mb-2">
                      por {obra.autor}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {obra.descripcion}
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(obra.estado)}`}>
                      {obra.estado}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-bahai-darkgray mr-2" />
                    <span className="text-sm text-bahai-darkgray">
                      Estimado: {obra.fechaEstimada}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-bahai-darkgray">Progreso</span>
                      <span className="text-sm font-medium text-bahai-navy">{obra.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-bahai-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${obra.progreso}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Proceso y metodología */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-bahai-navy mb-8 text-center">
            Nuestro Proceso de Desarrollo
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bahai-navy mb-2">Preparación</h3>
              <p className="text-sm text-gray-600">
                Investigación del texto original y preparación de materiales de referencia.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bahai-navy mb-2">Traducción</h3>
              <p className="text-sm text-gray-600">
                Trabajo colaborativo de traducción con múltiples revisiones.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bahai-navy mb-2">Revisión</h3>
              <p className="text-sm text-gray-600">
                Proceso exhaustivo de revisión y refinamiento del texto.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-bahai-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-bahai-navy mb-2">Publicación</h3>
              <p className="text-sm text-gray-600">
                Aprobación final y publicación en la plataforma digital.
              </p>
            </div>
          </div>
        </section>

        {/* Llamada a la colaboración */}
        <section className="bg-bahai-navy text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Únete a Nuestro Trabajo</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Si tienes habilidades en traducción, revisión, o edición y deseas contribuir 
            a estos importantes proyectos, nos encantaría conocer tu interés.
          </p>
          <Link 
            href="/contacto" 
            className="bg-bahai-gold hover:bg-bahai-darkgold text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            Contáctanos
          </Link>
        </section>
      </main>
    </div>
  )
}
