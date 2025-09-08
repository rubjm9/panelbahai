import Link from 'next/link'
import { ArrowLeft, Mail, Globe, MapPin, Phone, Clock, Send } from 'lucide-react'

export const metadata = {
  title: 'Contacto - Panel Bahá\'í',
  description: 'Contáctanos para colaborar con el Panel de Traducción de Literatura Bahá\'í al Español'
}

export default function ContactoPage() {
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
              <h1 className="text-2xl font-bold text-bahai-navy">Contacto</h1>
              <p className="text-bahai-darkgray">Conecta con el Panel de Traducción</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-bahai-lightgray to-white rounded-lg p-8 text-center">
            <Mail className="w-12 h-12 text-bahai-gold mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-bahai-navy mb-4">
              Nos Encantaría Escuchar de Ti
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Ya sea que desees colaborar con nosotros, tengas sugerencias para mejorar 
              la plataforma, o simplemente quieras conocer más sobre nuestro trabajo, 
              estamos aquí para atenderte.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de contacto */}
          <section>
            <h2 className="text-2xl font-bold text-bahai-navy mb-6">Envíanos un Mensaje</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="form-label">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="form-input"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="asunto" className="form-label">
                  Asunto *
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  required
                  className="form-input"
                >
                  <option value="">Selecciona un tema</option>
                  <option value="colaboracion">Interés en colaborar</option>
                  <option value="sugerencia">Sugerencia o comentario</option>
                  <option value="tecnico">Problema técnico</option>
                  <option value="contenido">Consulta sobre contenido</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="experiencia" className="form-label">
                  Experiencia relevante (opcional)
                </label>
                <textarea
                  id="experiencia"
                  name="experiencia"
                  rows={3}
                  className="form-input"
                  placeholder="Describe brevemente tu experiencia en traducción, edición, o áreas relacionadas..."
                />
              </div>

              <div>
                <label htmlFor="mensaje" className="form-label">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={5}
                  required
                  className="form-input"
                  placeholder="Comparte tus ideas, preguntas o cómo te gustaría contribuir..."
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacidad"
                  name="privacidad"
                  required
                  className="mt-1 mr-3"
                />
                <label htmlFor="privacidad" className="text-sm text-gray-600">
                  Acepto que mis datos sean utilizados únicamente para responder a mi consulta 
                  y posibles comunicaciones relacionadas con el trabajo del Panel de Traducción. *
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-bahai-gold hover:bg-bahai-darkgold text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensaje
              </button>
            </form>
          </section>

          {/* Información de contacto */}
          <section>
            <h2 className="text-2xl font-bold text-bahai-navy mb-6">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="bg-bahai-lightgray rounded-lg p-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-bahai-gold mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-bahai-navy mb-2">Correo Electrónico</h3>
                    <p className="text-gray-600 mb-2">
                      Para consultas generales y colaboraciones:
                    </p>
                    <a 
                      href="mailto:panel@bahai-traduccion.org" 
                      className="text-bahai-darkgold hover:text-bahai-navy font-medium"
                    >
                      panel@bahai-traduccion.org
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-bahai-lightgray rounded-lg p-6">
                <div className="flex items-start">
                  <Globe className="w-6 h-6 text-bahai-gold mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-bahai-navy mb-2">Sitios Web Oficiales</h3>
                    <div className="space-y-1">
                      <div>
                        <a 
                          href="https://bahai.org" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-bahai-darkgold hover:text-bahai-navy"
                        >
                          Bahá'í.org
                        </a>
                        <span className="text-gray-600 ml-2">- Sitio oficial mundial</span>
                      </div>
                      <div>
                        <a 
                          href="https://bahai.org/library" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-bahai-darkgold hover:text-bahai-navy"
                        >
                          Bahá'í Reference Library
                        </a>
                        <span className="text-gray-600 ml-2">- Biblioteca de referencia</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-bahai-lightgray rounded-lg p-6">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-bahai-gold mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-bahai-navy mb-2">Tiempo de Respuesta</h3>
                    <p className="text-gray-600">
                      Nos esforzamos por responder a todas las consultas dentro de 3-5 días hábiles. 
                      Para colaboraciones, el proceso puede tomar un poco más de tiempo debido a 
                      la consulta con el equipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Áreas de colaboración */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-bahai-navy mb-4">
                Áreas de Colaboración
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-bahai-gold rounded-full mr-3"></div>
                  <span className="text-gray-700">Traducción de textos bahá'ís</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-bahai-gold rounded-full mr-3"></div>
                  <span className="text-gray-700">Revisión y edición de traducciones</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-bahai-gold rounded-full mr-3"></div>
                  <span className="text-gray-700">Corrección de estilo y gramática</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-bahai-gold rounded-full mr-3"></div>
                  <span className="text-gray-700">Desarrollo de herramientas digitales</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-bahai-gold rounded-full mr-3"></div>
                  <span className="text-gray-700">Investigación terminológica</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Nota importante */}
        <section className="mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-bahai-navy mb-2">Nota Importante</h3>
            <p className="text-gray-700 leading-relaxed">
              El Panel de Traducción opera bajo la guía de las instituciones bahá'ís. 
              Todas las colaboraciones pasan por un proceso de consulta y aprobación 
              para asegurar la calidad y fidelidad de las traducciones. Agradecemos 
              tu paciencia y comprensión en este proceso.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
