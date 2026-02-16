import Link from 'next/link'
import { Users, Globe, BookOpen, CheckCircle, Award } from 'lucide-react'

export const metadata = {
  title: 'Sobre el Panel - Panel Bahá\'í',
  description: 'Conoce más sobre el Panel Internacional de Traducción de Literatura Bahá\'í al Español'
}

export default function SobreElPanelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-midnight-900 transition-colors duration-200">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 dark:bg-midnight-900 text-white">
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
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <span className="text-primary-900 dark:text-neutral-100 font-medium">Sobre el Panel</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción principal */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-midnight-900 rounded-lg p-8 border border-primary-100 dark:border-slate-700">
            <h2 className="text-3xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">
              ¿Qué es el Panel Internacional de Traducción?
            </h2>
            <p className="text-lg text-primary-700 dark:text-neutral-300 leading-relaxed mb-6">
              El Panel Internacional de Traducción es un órgano creado el <strong>6 de enero de 1993</strong> por la Casa Universal de Justicia (de la que depende para su nombramiento, financiación y renovación) para producir traducciones oficiales en español de los textos de autoridad de la Fe bahá'í, es decir, las obras de Bahá'u'lláh, del Báb, de 'Abdu'l-Bahá, los escritos de Shoghi Effendi y algunos mensajes de la Casa Universal de Justicia para todo el mundo de habla hispana.
            </p>
            <p className="text-lg text-primary-700 dark:text-neutral-300 leading-relaxed">
              El primer encargo que les realizó la Casa de Justicia fue la traducción del <strong>Kitáb-i-Aqdás</strong> (el Libro Más Sagrado) al español, trabajo que fue completado en 1999.
            </p>
          </div>
        </section>

        {/* Funciones del Panel */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-8 text-center">
            Funciones del Panel
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100">Facilitar y supervisar</h3>
              </div>
              <p className="text-primary-700 dark:text-neutral-300">
                Facilitar y supervisar la traducción de textos bahá'ís de autoridad, obras generales introductorias y materiales publicados comúnmente.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100">Obtener ayuda</h3>
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
                <h3 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100">Revisar el trabajo</h3>
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
                <h3 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100">Ofrecer traducciones</h3>
              </div>
              <p className="text-primary-700">
                Ofrecer las traducciones a Asambleas Espirituales Nacionales y Editoriales para su distribución.
              </p>
            </div>
          </div>
        </section>

        {/* Miembros del Panel */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-8 text-center">
            Quiénes componen el Panel
          </h2>
          <div className="bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-midnight-900 rounded-lg p-8 border border-primary-100 dark:border-slate-700">
            <p className="text-lg text-primary-700 dark:text-neutral-300 mb-6">
              El Panel está compuesto actualmente por:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-primary-800 dark:text-neutral-200 font-medium">Dª Malihé Sanatian (Reino Unido)</span>
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
                  <span className="text-primary-600 dark:text-neutral-400 text-sm ml-2">- Secretario</span>
                </div>
              </div>
            </div>
            <p className="text-primary-700 dark:text-neutral-300 mt-6">
              Además, el trabajo del Panel aglutina los esfuerzos de profesionales, académicos y voluntarios de todo el mundo, implicados en los procesos de traducción de los escritos sagrados bahá'ís al español.
            </p>
          </div>
        </section>

        {/* Nuevas Traducciones */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Nuevas traducciones disponibles</h2>
            <Link 
              href="/proximas-traducciones" 
              className="bg-white hover:bg-gray-100 text-accent-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
            >
              Descubra las nuevas traducciones
            </Link>
          </div>
        </section>

        {/* Contacto */}
        <section className="bg-primary-900 dark:bg-midnight-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">¿Desea colaborar con el Panel?</h2>
          <p className="text-primary-200 dark:text-neutral-300 mb-6 max-w-2xl mx-auto">
            Si tiene experiencia en traducción y siente el llamado a servir en este campo, 
            nos encantaría conocer su interés en contribuir a este importante trabajo.
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
