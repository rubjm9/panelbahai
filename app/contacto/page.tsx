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
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">Contacta con el Panel Internacional de Traducción</p>
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
        {/* Introducción */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-midnight-900 rounded-lg p-8 border border-primary-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-primary-900 dark:text-neutral-100">
                Nos encantaría escuchar de ti
              </h2>
            </div>
            <p className="text-lg text-primary-700 dark:text-neutral-300 leading-relaxed mb-6">
              Ya sea que desees colaborar con nosotros, tengas sugerencias para mejorar 
              la plataforma, o simplemente quieras conocer más sobre nuestro trabajo, 
              estamos aquí para atenderte.
            </p>
            <p className="text-lg text-primary-700 dark:text-neutral-300 leading-relaxed">
              El Panel Internacional de Traducción valora la participación de profesionales 
              cualificados y amigos comprometidos con la difusión de la literatura bahá'í.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de contacto */}
          <section>
            <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">Envíanos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      className="w-full px-4 py-3 border border-primary-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors bg-white dark:bg-slate-800 text-primary-900 dark:text-neutral-100"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-primary-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors bg-white dark:bg-slate-800 text-primary-900 dark:text-neutral-100"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-primary-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                    placeholder="Comparte tus ideas, preguntas o cómo te gustaría contribuir al trabajo del Panel..."
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

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                    ¡Mensaje enviado correctamente! Te responderemos pronto.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {errorMessage || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo o envía un correo directamente a bahaipanel@gmail.com'}
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
                <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-neutral-100 mb-6">Información de Contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 dark:text-neutral-100 mb-2">Correo electrónico</h3>
                      <p className="text-primary-700 dark:text-neutral-300 mb-3">
                        Para consultas generales y colaboraciones:
                      </p>
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
                        <div>
                          <a 
                            href="https://bahai.org" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-600 hover:text-accent-700 font-medium"
                          >
                            Bahá'í.org
                          </a>
                          <span className="text-primary-600 dark:text-neutral-400 ml-2">- Sitio oficial mundial</span>
                        </div>
                        <div>
                          <a 
                            href="https://bahai.org/library" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-600 hover:text-accent-700 font-medium"
                          >
                            Bahá'í Reference Library
                          </a>
                          <span className="text-primary-600 ml-2">- Biblioteca de referencia</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Áreas de colaboración */}
              <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-display font-semibold text-primary-900 dark:text-neutral-100 mb-6">
                  Áreas de colaboración
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700 dark:text-neutral-300">Traducción de textos bahá'ís</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Revisión y edición de traducciones</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Corrección de estilo y gramática</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Desarrollo de herramientas digitales</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Investigación terminológica</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Consultoría académica</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  )
}
