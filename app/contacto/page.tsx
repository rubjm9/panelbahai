import Link from 'next/link'
import { Mail, Globe, Clock, Send, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Contacto - Panel Bahá\'í',
  description: 'Contáctanos para colaborar con el Panel de Traducción de Literatura Bahá\'í al Español'
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Contacto</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">Conecta con el Panel Internacional de Traducción</p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400">/</span>
            <span className="text-primary-900 font-medium">Contacto</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold text-primary-900">
                Nos Encantaría Escuchar de Ti
              </h2>
            </div>
            <p className="text-lg text-primary-700 leading-relaxed mb-6">
              Ya sea que desees colaborar con nosotros, tengas sugerencias para mejorar 
              la plataforma, o simplemente quieras conocer más sobre nuestro trabajo, 
              estamos aquí para atenderte.
            </p>
            <p className="text-lg text-primary-700 leading-relaxed">
              El Panel Internacional de Traducción valora la participación de profesionales 
              cualificados y amigos comprometidos con la difusión de la literatura bahá'í.
            </p>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de contacto */}
          <section>
            <div className="bg-white border border-primary-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-primary-900 mb-6">Envíanos un Mensaje</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-primary-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
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
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-primary-700 mb-2">
                    Tipo de consulta *
                  </label>
                  <select
                    id="asunto"
                    name="asunto"
                    required
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                  >
                    <option value="">Selecciona el tipo de consulta</option>
                    <option value="colaboracion">Interés en colaborar</option>
                    <option value="sugerencia">Sugerencia o comentario</option>
                    <option value="tecnico">Problema técnico</option>
                    <option value="contenido">Consulta sobre contenido</option>
                    <option value="investigacion">Investigación académica</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experiencia" className="block text-sm font-medium text-primary-700 mb-2">
                    Experiencia relevante <span className="text-primary-500">(opcional)</span>
                  </label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    rows={3}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors resize-none"
                    placeholder="Describe brevemente tu experiencia en traducción, edición, investigación, o áreas relacionadas..."
                  />
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
                  <label htmlFor="privacidad" className="text-sm text-primary-600 leading-relaxed">
                    Acepto que mis datos sean utilizados únicamente para responder a mi consulta 
                    y posibles comunicaciones relacionadas con el trabajo del Panel de Traducción. *
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </section>

          {/* Información de contacto */}
          <section>
            <div className="space-y-8">
              {/* Información de contacto */}
              <div className="bg-white border border-primary-200 rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-display font-bold text-primary-900 mb-6">Información de Contacto</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Correo Electrónico</h3>
                      <p className="text-primary-700 mb-3">
                        Para consultas generales y colaboraciones:
                      </p>
                      <a 
                        href="mailto:panel@bahai-traduccion.org" 
                        className="text-accent-600 hover:text-accent-700 font-medium text-lg"
                      >
                        panel@bahai-traduccion.org
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Sitios Web Oficiales</h3>
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
                          <span className="text-primary-600 ml-2">- Sitio oficial mundial</span>
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

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">Tiempo de Respuesta</h3>
                      <p className="text-primary-700">
                        Nos esforzamos por responder a todas las consultas dentro de <strong>3-5 días hábiles</strong>. 
                        Para colaboraciones, el proceso puede tomar un poco más de tiempo debido a 
                        la consulta con el equipo y las instituciones correspondientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Áreas de colaboración */}
              <div className="bg-white border border-primary-200 rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-display font-semibold text-primary-900 mb-6">
                  Áreas de Colaboración
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      <span className="text-primary-700">Traducción de textos bahá'ís</span>
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

        {/* Proceso de colaboración */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-primary-900">
                Proceso de Colaboración
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">1. Contacto Inicial</h3>
                <p className="text-primary-700">
                  Envía tu consulta a través del formulario o correo electrónico con tu experiencia y áreas de interés.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">2. Evaluación</h3>
                <p className="text-primary-700">
                  Revisamos tu perfil y experiencia para determinar las mejores oportunidades de colaboración.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-display font-semibold text-primary-900 mb-2">3. Integración</h3>
                <p className="text-primary-700">
                  Una vez aprobado, te integras al equipo de trabajo con proyectos específicos y supervisión adecuada.
                </p>
              </div>
            </div>
            
            <div className="bg-primary-100 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-display font-semibold text-primary-900 mb-2">Nota Importante</h3>
                  <p className="text-primary-700 leading-relaxed">
                    El Panel Internacional de Traducción opera bajo la guía de las instituciones bahá'ís. 
                    Todas las colaboraciones pasan por un proceso de consulta y aprobación 
                    para asegurar la calidad y fidelidad de las traducciones. Agradecemos 
                    tu paciencia y comprensión en este proceso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
