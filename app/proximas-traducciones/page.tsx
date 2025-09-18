import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Próximas Traducciones - Panel Bahá\'í',
  description: 'Conoce las próximas traducciones y proyectos del Panel de Traducción de Literatura Bahá\'í al Español'
}

export default function ProximasTraduccionesPage() {
  const proximasObras = [
    {
      titulo: "Las Siete Valles",
      autor: "Bahá'u'lláh",
      estado: "En revisión final",
      progreso: 90,
      fechaEstimada: "2024 Q4",
      descripcion: "Una obra mística que describe el viaje espiritual del alma hacia Dios a través de siete valles metafóricos.",
      prioridad: "Alta"
    },
    {
      titulo: "Los Cuatro Valles", 
      autor: "Bahá'u'lláh",
      estado: "En traducción",
      progreso: 75,
      fechaEstimada: "2025 Q1",
      descripcion: "Complemento místico de Las Siete Valles, explorando cuatro estados espirituales del alma.",
      prioridad: "Alta"
    },
    {
      titulo: "El Secreto de la Civilización Divina",
      autor: "'Abdu'l-Bahá",
      estado: "En planificación",
      progreso: 25,
      fechaEstimada: "2025 Q2",
      descripcion: "Análisis profundo sobre los principios necesarios para el avance de la civilización humana.",
      prioridad: "Media"
    },
    {
      titulo: "Cartas a Martha Root",
      autor: "Shoghi Effendi",
      estado: "En preparación",
      progreso: 10,
      fechaEstimada: "2025 Q3",
      descripcion: "Correspondencia con una de las más destacadas promotoras de la Fe Bahá'í en Occidente.",
      prioridad: "Media"
    },
    {
      titulo: "Tablas de Bahá'u'lláh",
      autor: "Bahá'u'lláh",
      estado: "En investigación",
      progreso: 5,
      fechaEstimada: "2025 Q4",
      descripcion: "Colección de escritos revelados por Bahá'u'lláh dirigidos a diversos destinatarios.",
      prioridad: "Baja"
    }
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'En revisión final': return 'text-green-600 bg-green-100 border-green-200';
      case 'En traducción': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'En planificación': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'En preparación': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'En investigación': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'text-red-600 bg-red-100';
      case 'Media': return 'text-yellow-600 bg-yellow-100';
      case 'Baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'En revisión final': return <CheckCircle className="w-4 h-4" />;
      case 'En traducción': return <BookOpen className="w-4 h-4" />;
      case 'En planificación': return <Calendar className="w-4 h-4" />;
      case 'En preparación': return <Users className="w-4 h-4" />;
      case 'En investigación': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Próximas Traducciones</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">Proyectos en desarrollo y planificación del Panel Internacional de Traducción</p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400">/</span>
            <span className="text-primary-900 font-medium">Próximas Traducciones</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-primary-900">
                Trabajo en Progreso
              </h2>
            </div>
            <p className="text-lg text-primary-700 leading-relaxed mb-6">
              El Panel Internacional de Traducción trabaja continuamente en nuevos proyectos para ampliar 
              la biblioteca de literatura bahá'í disponible en español. Nuestro compromiso es hacer accesibles 
              los textos sagrados y escritos de autoridad a las comunidades de habla hispana en todo el mundo.
            </p>
            <p className="text-lg text-primary-700 leading-relaxed">
              Aquí puedes seguir el progreso de nuestras próximas publicaciones y conocer qué obras están 
              siendo preparadas para la comunidad bahá'í internacional.
            </p>
          </div>
        </section>

        {/* Estadísticas generales */}
        <section className="mb-16">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-primary-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-1">{proximasObras.length}</h3>
              <p className="text-primary-600">Proyectos Activos</p>
            </div>
            <div className="bg-white border border-primary-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-1">1</h3>
              <p className="text-primary-600">En Revisión Final</p>
            </div>
            <div className="bg-white border border-primary-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-1">1</h3>
              <p className="text-primary-600">En Traducción</p>
            </div>
            <div className="bg-white border border-primary-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-1">3</h3>
              <p className="text-primary-600">En Planificación</p>
            </div>
          </div>
        </section>

        {/* Lista de próximas obras */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8">Proyectos Actuales</h2>
          <div className="space-y-8">
            {proximasObras.map((obra, index) => (
              <div key={index} className="bg-white border border-primary-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-2xl font-display font-bold text-primary-900 mr-4">
                        {obra.titulo}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPrioridadColor(obra.prioridad)}`}>
                        {obra.prioridad}
                      </span>
                    </div>
                    <p className="text-accent-600 font-medium text-lg mb-3">
                      por {obra.autor}
                    </p>
                    <p className="text-primary-700 leading-relaxed text-lg">
                      {obra.descripcion}
                    </p>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${getEstadoColor(obra.estado)}`}>
                      {getEstadoIcon(obra.estado)}
                      <span className="ml-2">{obra.estado}</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-primary-500 mr-3" />
                    <div>
                      <span className="text-sm text-primary-500 block">Fecha Estimada</span>
                      <span className="text-lg font-medium text-primary-900">{obra.fechaEstimada}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-500">Progreso</span>
                      <span className="text-lg font-bold text-primary-900">{obra.progreso}%</span>
                    </div>
                    <div className="w-full bg-primary-100 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-500"
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
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Nuestro Proceso de Desarrollo
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary-900 mb-3">Preparación</h3>
              <p className="text-primary-700">
                Investigación exhaustiva del texto original y preparación de materiales de referencia especializados.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary-900 mb-3">Traducción</h3>
              <p className="text-primary-700">
                Trabajo colaborativo de traducción con múltiples revisiones y consultas especializadas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary-900 mb-3">Revisión</h3>
              <p className="text-primary-700">
                Proceso exhaustivo de revisión y refinamiento del texto para asegurar máxima fidelidad.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-primary-900 mb-3">Publicación</h3>
              <p className="text-primary-700">
                Aprobación final por las instituciones correspondientes y publicación en la plataforma digital.
              </p>
            </div>
          </div>
        </section>

        {/* Llamada a la colaboración */}
        <section className="bg-primary-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Únete a Nuestro Trabajo</h2>
          <p className="text-primary-200 mb-6 max-w-2xl mx-auto">
            Si tienes habilidades en traducción, revisión, o edición y deseas contribuir 
            a estos importantes proyectos, nos encantaría conocer tu interés en formar parte 
            de este noble esfuerzo.
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
