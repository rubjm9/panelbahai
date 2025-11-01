'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, X, Search, Quote, Plus, Minus, Asterisk, Zap } from 'lucide-react'

interface SearchHelpProps {
  className?: string
}

export default function SearchHelp({ className = "" }: SearchHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Solo montar en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const searchExamples = [
    {
      icon: <Quote className="w-4 h-4" />,
      syntax: '"frase exacta"',
      description: 'Búsqueda exacta con comillas',
      example: '"Casa Universal de Justicia"'
    },
    {
      icon: <Plus className="w-4 h-4" />,
      syntax: '+palabra',
      description: 'Término obligatorio',
      example: '+Bahá\'u\'lláh oración'
    },
    {
      icon: <Minus className="w-4 h-4" />,
      syntax: '-palabra',
      description: 'Excluir término',
      example: 'oración -meditación'
    },
    {
      icon: <Asterisk className="w-4 h-4" />,
      syntax: 'palabra*',
      description: 'Wildcard (cualquier terminación)',
      example: 'Bahá*'
    },
    {
      icon: <Zap className="w-4 h-4" />,
      syntax: 'palabra~1',
      description: 'Tolerancia a errores',
      example: 'Bahá\'u\'lláh~1'
    }
  ]

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Cerrar al hacer clic fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors ${className}`}
        title="Ayuda de búsqueda avanzada"
      >
        <HelpCircle className="w-4 h-4" />
        Búsqueda avanzada
      </button>
    )
  }

  // Renderizar modal usando Portal para evitar problemas de z-index y overflow
  if (!mounted || typeof window === 'undefined') {
    return null
  }

  const modalContent = (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ position: 'fixed' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-display font-semibold text-primary-900">
              Búsqueda Avanzada
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-400 hover:text-primary-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-primary-700">
              Usa sintaxis especial para hacer búsquedas más precisas y encontrar exactamente lo que buscas.
            </p>
          </div>

          {/* Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-primary-900">
              Sintaxis Disponible
            </h3>
            
            <div className="space-y-3">
              {searchExamples.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white border border-primary-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-mono">
                        {item.syntax}
                      </code>
                    </div>
                    <p className="text-primary-700 mb-2">{item.description}</p>
                    <p className="text-sm text-primary-600">
                      <strong>Ejemplo:</strong> <code className="bg-gray-100 px-1 rounded">{item.example}</code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-primary-900">
              Ejemplos Combinados
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-200 rounded-lg">
                <code className="block text-primary-800 font-mono mb-2">
                  "Casa Universal" AND +Bahá'u'lláh
                </code>
                <p className="text-primary-700 text-sm">
                  Busca la frase exacta "Casa Universal" Y que contenga obligatoriamente "Bahá'u'lláh"
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-200 rounded-lg">
                <code className="block text-primary-800 font-mono mb-2">
                  oración -meditación Bahá*
                </code>
                <p className="text-primary-700 text-sm">
                  Busca "oración", excluye "meditación", e incluye palabras que empiecen con "Bahá"
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-200 rounded-lg">
                <code className="block text-primary-800 font-mono mb-2">
                  justicia~2 AND universal
                </code>
                <p className="text-primary-700 text-sm">
                  Busca "justicia" con tolerancia a 2 errores tipográficos Y "universal"
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-accent-50 rounded-lg p-4">
            <h4 className="font-semibold text-accent-800 mb-2">💡 Consejos</h4>
            <ul className="text-accent-700 text-sm space-y-1">
              <li>• Empieza con búsquedas simples y refina con operadores</li>
              <li>• Usa comillas para frases exactas importantes</li>
              <li>• Combina múltiples operadores para búsquedas precisas</li>
              <li>• Usa ~1 o ~2 para tolerar errores tipográficos</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-primary-200">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
