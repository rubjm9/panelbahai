import Link from 'next/link'
import { Search, Quote, Plus, Minus, Code, Lightbulb, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Búsqueda Avanzada - Panel Bahá\'í',
  description: 'Aprende a usar la búsqueda avanzada con sintaxis especial para encontrar contenido específico'
}

export default function BusquedaAvanzadaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">Búsqueda Avanzada</h1>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">
              Descubre cómo usar la sintaxis avanzada para encontrar exactamente lo que buscas en la biblioteca bahá'í
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400">/</span>
            <span className="text-primary-900 font-medium">Búsqueda Avanzada</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-primary-50 to-white rounded-lg p-8 border border-primary-100">
            <div className="flex items-center mb-4">
              <Search className="w-8 h-8 text-primary-600 mr-3" />
              <h2 className="text-2xl font-display font-bold text-primary-900">¿Qué es la Búsqueda Avanzada?</h2>
            </div>
            <p className="text-lg text-primary-700 leading-relaxed mb-4">
              La búsqueda avanzada te permite usar operadores especiales para refinar tus consultas y encontrar contenido más específico. 
              Puedes combinar múltiples operadores en una sola búsqueda para obtener resultados precisos.
            </p>
            <div className="bg-accent-100 border border-accent-200 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-accent-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-accent-800">
                  <strong>Tip:</strong> Todos estos operadores funcionan tanto en la búsqueda principal como en la página de resultados completos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sintaxis de Búsqueda */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Sintaxis de Búsqueda Avanzada
          </h2>
          
          <div className="space-y-8">
            {/* Búsqueda Exacta */}
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Quote className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-display font-semibold text-primary-900">Búsqueda Exacta</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-primary-700 mb-2">
                    Usa comillas dobles para buscar frases exactas. Esto es útil cuando quieres encontrar una cita específica o una frase completa.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-mono text-sm text-gray-800 mb-2">Sintaxis:</div>
                    <code className="text-blue-600 font-mono">"frase exacta"</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ejemplos:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">"Casa Universal de Justicia"</code> - Encuentra esta frase exacta</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">"Dios ha creado"</code> - Busca esta frase específica</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">"la unidad de la humanidad"</code> - Encuentra esta expresión completa</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Términos Requeridos */}
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Plus className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-display font-semibold text-primary-900">Términos Requeridos</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-primary-700 mb-2">
                    Usa el símbolo <code className="bg-gray-100 px-1 rounded">+</code> antes de una palabra para hacer que sea obligatoria en los resultados.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-mono text-sm text-gray-800 mb-2">Sintaxis:</div>
                    <code className="text-green-600 font-mono">+palabra</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ejemplos:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">+Bahá'u'lláh +revelación</code> - Ambos términos deben aparecer</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">+oración +meditación</code> - Busca contenido que contenga ambos conceptos</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">+unidad +humanidad</code> - Encuentra textos sobre la unidad de la humanidad</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Términos Excluidos */}
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Minus className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-xl font-display font-semibold text-primary-900">Términos Excluidos</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-primary-700 mb-2">
                    Usa el símbolo <code className="bg-gray-100 px-1 rounded">-</code> antes de una palabra para excluirla de los resultados.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-mono text-sm text-gray-800 mb-2">Sintaxis:</div>
                    <code className="text-red-600 font-mono">-palabra</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ejemplos:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">oración -ritual</code> - Busca oración pero excluye ritual</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">fe -superstición</code> - Encuentra fe pero no superstición</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">amor -sentimental</code> - Busca amor espiritual, no sentimental</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Regex Básica */}
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Code className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-display font-semibold text-primary-900">Expresiones Regulares</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-primary-700 mb-2">
                    Usa barras <code className="bg-gray-100 px-1 rounded">/</code> para buscar patrones con expresiones regulares básicas.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="font-mono text-sm text-gray-800 mb-2">Sintaxis:</div>
                    <code className="text-purple-600 font-mono">/patrón/</code>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ejemplos:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><code className="bg-gray-100 px-2 py-1 rounded">/revel.*ción/</code> - Encuentra "revelación", "revelaciones", etc.</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">/^Dios/</code> - Busca textos que empiecen con "Dios"</li>
                    <li><code className="bg-gray-100 px-2 py-1 rounded">/amor.*humanidad/</code> - Encuentra "amor" seguido de "humanidad"</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Las expresiones regulares son básicas. Para patrones complejos, usa búsquedas exactas con comillas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Combinaciones */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Combinando Operadores
          </h2>
          
          <div className="bg-gradient-to-r from-accent-50 to-white rounded-lg p-8 border border-accent-100">
            <h3 className="text-xl font-display font-semibold text-primary-900 mb-4">
              Puedes combinar múltiples operadores en una sola búsqueda:
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Ejemplo 1:</p>
                <code className="text-primary-600 font-mono text-sm">
                  "Casa Universal de Justicia" +traducción -borrador
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  Busca la frase exacta "Casa Universal de Justicia" que contenga "traducción" pero excluya "borrador"
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Ejemplo 2:</p>
                <code className="text-primary-600 font-mono text-sm">
                  +Bahá'u'lláh +revelación /revel.*ción/ -interpretación
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  Busca textos de Bahá'u'lláh sobre revelación (con variaciones) pero excluye interpretaciones
                </p>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Ejemplo 3:</p>
                <code className="text-primary-600 font-mono text-sm">
                  "unidad de la humanidad" +fe +amor -política
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  Busca la frase exacta sobre unidad que contenga fe y amor pero excluya política
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Consejos */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-8 text-center">
            Consejos para Mejores Resultados
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-display font-semibold text-primary-900 mb-3">
                💡 Usa términos específicos
              </h3>
              <p className="text-primary-700 text-sm">
                En lugar de buscar "Dios", prueba "Creador" o "Supremo". Los términos más específicos dan mejores resultados.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-display font-semibold text-primary-900 mb-3">
                🔍 Combina operadores
              </h3>
              <p className="text-primary-700 text-sm">
                Usa + para términos importantes y - para excluir contenido irrelevante. Esto refina mucho los resultados.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-display font-semibold text-primary-900 mb-3">
                📝 Frases exactas
              </h3>
              <p className="text-primary-700 text-sm">
                Si recuerdas una frase específica, úsala entre comillas. Es la forma más precisa de encontrar contenido.
              </p>
            </div>
            
            <div className="bg-white border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-display font-semibold text-primary-900 mb-3">
                🎯 Experimenta
              </h3>
              <p className="text-primary-700 text-sm">
                Prueba diferentes combinaciones. La búsqueda avanzada es una herramienta poderosa que mejora con la práctica.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-primary-900 text-white rounded-lg p-8">
            <h2 className="text-2xl font-display font-bold mb-4">¡Prueba la Búsqueda Avanzada!</h2>
            <p className="text-primary-200 mb-6 max-w-2xl mx-auto">
              Ahora que conoces la sintaxis avanzada, ve a la página principal y prueba estos operadores en la búsqueda.
            </p>
            <Link 
              href="/" 
              className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center"
            >
              Ir a la Búsqueda Principal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
