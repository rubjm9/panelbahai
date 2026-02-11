'use client'

import Link from 'next/link'
import Script from 'next/script'
import { Mail, Globe, Send } from 'lucide-react'
import { useState } from 'react'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeEI2QsAAAAAKq4GUFL9eK4XvqDHuLJyTg2Ze1S'

export default function ContactoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const grecaptcha = (window as { grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> } }).grecaptcha
      if (!grecaptcha) {
        setSubmitStatus('error')
        setIsSubmitting(false)
        return
      }
      await new Promise<void>((resolve) => grecaptcha.ready(resolve))
      const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' })
      formData.append('recaptchaToken', token)

      const response = await fetch('/api/contacto', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setErrorMessage(null)
        // Opcional: redirigir a mailto como fallback
        if (data.mailto) {
          window.location.href = data.mailto
        }
        // Resetear formulario
        form.reset()
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || null)
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')
      setErrorMessage(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-midnight-900 transition-colors duration-200">
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      {/* Hero azul unificado */}
      <section className="bg-primary-900 dark:bg-midnight-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Contacto</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">Contacte con el Panel Internacional de Traducción</p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-neutral-200 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400 dark:text-neutral-600">/</span>
            <span className="text-primary-900 dark:text-neutral-100 font-medium">Contacto</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de contacto */}
          <section>
            <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">Envíenos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                      Nombre y apellidos *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      className="w-full px-0 pt-1 pb-1.5 bg-transparent border-0 border-b border-primary-300 dark:border-slate-600 rounded-none focus:ring-0 focus:border-accent-500 focus:outline-none transition-colors text-primary-900 dark:text-neutral-100 placeholder:text-primary-400 dark:placeholder:text-neutral-500"
                      placeholder="Ej.: María García López"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-0 pt-1 pb-1.5 bg-transparent border-0 border-b border-primary-300 dark:border-slate-600 rounded-none focus:ring-0 focus:border-accent-500 focus:outline-none transition-colors text-primary-900 dark:text-neutral-100 placeholder:text-primary-400 dark:placeholder:text-neutral-500"
                      placeholder="Ej.: nombre@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    required
                    className="w-full px-0 pt-1 pb-1.5 bg-transparent border-0 border-b border-primary-300 dark:border-slate-600 rounded-none focus:ring-0 focus:border-accent-500 focus:outline-none transition-colors resize-none text-primary-900 dark:text-neutral-100 placeholder:text-primary-400 dark:placeholder:text-neutral-500"
                    placeholder="Escriba su mensaje en este espacio"
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacidad"
                    name="privacidad"
                    required
                    className="mt-1 w-4 h-4 text-accent-600 border-primary-300 rounded focus:ring-accent-500"
                  />
                  <label htmlFor="privacidad" className="text-sm text-primary-600 dark:text-neutral-400 leading-relaxed">
                    He leído y acepto la{' '}
                    <Link href="/politica-privacidad" className="text-accent-600 hover:text-accent-700 underline" target="_blank" rel="noopener noreferrer">
                      política de privacidad
                    </Link>
                    {' '}y acepto que mis datos sean utilizados únicamente para responder a mi consulta y posibles comunicaciones relacionadas con el trabajo del Panel de Traducción. *
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="suscribirse_novedades"
                    name="suscribirse_novedades"
                    value="1"
                    className="mt-1 w-4 h-4 text-accent-600 border-primary-300 rounded focus:ring-accent-500"
                  />
                  <label htmlFor="suscribirse_novedades" className="text-sm text-primary-600 dark:text-neutral-400 leading-relaxed">
                    Suscríbase para recibir las nuevas traducciones
                  </label>
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                    ¡Mensaje enviado correctamente! Le responderemos pronto.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {errorMessage || 'Error al enviar el mensaje. Por favor, inténtelo de nuevo o envíe un correo directamente a bahaipanel@gmail.com'}
                  </div>
                )}
                <p className="text-xs text-primary-500 dark:text-neutral-500">
                  Este formulario está protegido por reCAPTCHA. Se aplican la{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-700">política de privacidad</a>
                  {' '}y los{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-700">términos de servicio</a>
                  {' '}de Google.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            </div>
          </section>

          {/* Información de contacto */}
          <section>
            <div className="space-y-8">
              {/* Información de contacto */}
              <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">Datos de contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 dark:text-neutral-100 mb-2">Correo electrónico</h3>
                      <a 
                        href="mailto:bahaipanel@gmail.com" 
                        className="text-accent-600 hover:text-accent-700 font-medium text-lg"
                      >
                        bahaipanel@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 dark:text-neutral-100 mb-2">Sitios web oficiales</h3>
                      <div className="space-y-2">
                        <a 
                          href="https://bahai.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-accent-600 hover:text-accent-700 font-medium"
                        >
                          Sitio web de la comunidad mundial bahá'í
                        </a>
                        <a 
                          href="https://www.bahai.org/library/"
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block text-accent-600 hover:text-accent-700 font-medium"
                        >
                          Bahá'í Reference Library
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Ámbitos de colaboración */}
              <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">
                  Ámbitos de colaboración
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-primary-700 dark:text-neutral-300">Traducción</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-primary-700 dark:text-neutral-300">Revisión</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-primary-700 dark:text-neutral-300">Corrección de estilo</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-primary-700 dark:text-neutral-300">Uso de herramientas de traducción asistida</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-primary-700 dark:text-neutral-300">Investigación terminológica</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  )
}
