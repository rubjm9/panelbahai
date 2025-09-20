'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, HelpCircle, Lightbulb } from 'lucide-react'
import { useEnhancedSearch } from './EnhancedSearchProvider'

interface EnhancedSearchBoxProps {
  onResultClick?: (result: any) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  context?: string;
  autoFocus?: boolean;
}

export default function EnhancedSearchBox({ 
  onResultClick, 
  placeholder = "Buscar en toda la biblioteca...",
  className = "",
  showFilters = true,
  context,
  autoFocus = false
}: EnhancedSearchBoxProps) {
  const { search, getDocument, isInitialized, isLoading } = useEnhancedSearch()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Debounce para búsqueda
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || !isInitialized) {
        setResults([])
        return
      }

      try {
        const searchResults = search(searchQuery)
        const enrichedResults = searchResults.map(result => ({
          ...result,
          document: getDocument(result.ref)
        })).filter(result => result.document)

        setResults(enrichedResults)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResults([])
      }
    }, 300),
    [search, getDocument, isInitialized]
  )

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query)
    } else {
      setResults([])
    }
  }, [query, debouncedSearch])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(true)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleResultClick = (result: any) => {
    if (onResultClick) {
      onResultClick(result)
    }
    setShowResults(false)
    setQuery('')
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowResults(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay para permitir clicks en resultados
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const getResultTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'titulo': return 'Obra'
      case 'seccion': return 'Sección'
      case 'parrafo': return 'Párrafo'
      default: return 'Contenido'
    }
  }

  const getResultTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'titulo': return 'bg-blue-100 text-blue-800'
      case 'seccion': return 'bg-green-100 text-green-800'
      case 'parrafo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const terms = query.toLowerCase().split(/\s+/)
    let highlightedText = text

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })

    return highlightedText
  }

  const searchExamples = [
    {
      syntax: '"frase exacta"',
      description: 'Buscar frase exacta entre comillas',
      example: '"Casa Universal de Justicia"'
    },
    {
      syntax: '+palabra',
      description: 'Término obligatorio (debe aparecer)',
      example: '+Bahá\'u\'lláh +revelación'
    },
    {
      syntax: '-palabra',
      description: 'Excluir término',
      example: 'oración -ritual'
    },
    {
      syntax: '/patrón/',
      description: 'Búsqueda con regex básica',
      example: '/revel.*ción/'
    }
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={!isInitialized || isLoading}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ayuda de búsqueda"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Sintaxis de búsqueda avanzada</h3>
          </div>
          <div className="space-y-3">
            {searchExamples.map((example, index) => (
              <div key={index} className="border-l-4 border-primary-200 pl-3">
                <div className="font-mono text-sm text-primary-600 mb-1">
                  {example.syntax}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {example.description}
                </div>
                <div className="text-xs text-gray-500 italic">
                  Ejemplo: {example.example}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Puedes combinar múltiples operadores en una sola búsqueda
            </p>
          </div>
        </div>
      )}

      {/* Resultados */}
      {showResults && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto"
        >
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm text-gray-600">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((result, index) => (
              <button
                key={result.ref}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultTypeColor(result.document.tipo)}`}>
                      {getResultTypeLabel(result.document.tipo)}
                    </span>
                    {result.document.numero && (
                      <span className="text-xs text-gray-500">
                        Párrafo {result.document.numero}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Score: {result.score.toFixed(1)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-900">
                    {result.document.titulo}
                  </h4>
                  <p className="text-sm text-gray-600">
                    por <span className="font-medium">{result.document.autor}</span>
                  </p>
                  {result.document.seccion && (
                    <p className="text-sm text-gray-500">
                      Sección: {result.document.seccion}
                    </p>
                  )}
                  <div 
                    className="text-sm text-gray-700 mt-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(result.document.texto.substring(0, 200), query) 
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer con enlace a resultados completos */}
          <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <button 
              onClick={() => {
                // Navegar a página de resultados completos
                window.location.href = `/buscar?q=${encodeURIComponent(query)}`
              }}
              className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors group"
            >
              Ver los {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''} →
            </button>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {showResults && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
          <div className="text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron resultados para "{query}"</p>
            <p className="text-xs mt-1">Intenta con términos diferentes o revisa la sintaxis</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Función debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
