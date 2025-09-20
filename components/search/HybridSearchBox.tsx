'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, BookOpen, FileText, Users, Clock, Star, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { enhancedSearchEngine, SearchResult } from '@/utils/enhanced-search'
import Link from 'next/link'
import AdvancedFilters from './AdvancedFilters'
import { useEnhancedSearch } from '@/components/search/EnhancedSearchProvider'

interface HybridSearchBoxProps {
  onResultClick?: () => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  context?: 'homepage' | 'page';
  autoFocus?: boolean;
}

export default function HybridSearchBox({ 
  onResultClick, 
  placeholder = "Buscar en toda la biblioteca...",
  className = "",
  showFilters = true,
  context,
  autoFocus = false
}: HybridSearchBoxProps) {
  const { isInitialized } = useEnhancedSearch()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const loadingIndexRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState({
    tipo: 'todos',
    autor: '' as string | undefined,
    obra: '' as string | undefined
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [autores, setAutores] = useState<Array<{value: string, label: string}>>([])
  const [obras, setObras] = useState<Array<{value: string, label: string}>>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const [selectFirstWhenReady, setSelectFirstWhenReady] = useState(false)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus en homepage
  useEffect(() => {
    if (autoFocus && context === 'homepage' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus, context])

  // Cargar datos para filtros
  useEffect(() => {
    async function loadFilterData() {
      try {
        const [autoresRes, obrasRes] = await Promise.all([
          fetch('/api/autores'),
          fetch('/api/obras')
        ])
        
        if (autoresRes.ok) {
          const autoresData = await autoresRes.json()
          setAutores(autoresData.map((autor: any) => ({
            value: autor.slug,
            label: autor.nombre
          })))
        }
        
        if (obrasRes.ok) {
          const obrasData = await obrasRes.json()
          setObras(obrasData.map((obra: any) => ({
            value: obra.slug,
            label: obra.titulo
          })))
        }
      } catch (error) {
        console.error('Error cargando datos de filtros:', error)
      }
    }
    
    loadFilterData()
  }, [])

  // Debounce para búsqueda
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || !isInitialized) {
        setResults([])
        return
      }

      try {
        setIsLoading(true)
        const searchResults = enhancedSearchEngine.search(searchQuery)
        
        // Aplicar filtros
        let filteredResults = searchResults
        
        if (filters.tipo !== 'todos') {
          filteredResults = filteredResults.filter(result => {
            const doc = enhancedSearchEngine.getDocument(result.ref)
            return doc?.tipo === filters.tipo
          })
        }
        
        if (filters.autor) {
          filteredResults = filteredResults.filter(result => {
            const doc = enhancedSearchEngine.getDocument(result.ref)
            return doc?.autorSlug === filters.autor
          })
        }
        
        if (filters.obra) {
          filteredResults = filteredResults.filter(result => {
            const doc = enhancedSearchEngine.getDocument(result.ref)
            return doc?.obraSlug === filters.obra
          })
        }

        setResults(filteredResults)
        
        // Guardar en historial
        if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
          setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)])
        }
        
        if (selectFirstWhenReady && filteredResults.length > 0) {
          setSelectedIndex(0)
          setSelectFirstWhenReady(false)
        }
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [isInitialized, filters, searchHistory, selectFirstWhenReady]
  )

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query)
    } else {
      setResults([])
    }
  }, [query, debouncedSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setSelectedIndex(-1)
    setSelectFirstWhenReady(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

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
        } else if (query.trim()) {
          // Si no hay selección, ir a página de resultados
          router.push(`/buscar?q=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleResultClick = (result: SearchResult) => {
    const doc = enhancedSearchEngine.getDocument(result.ref)
    if (doc) {
      const url = `/autores/${doc.autorSlug}/${doc.obraSlug}${doc.numero ? `#parrafo-${doc.numero}` : ''}`
      router.push(url)
      setIsOpen(false)
      setQuery('')
      setSelectedIndex(-1)
      if (onResultClick) onResultClick()
    }
  }

  const handleInputFocus = () => {
    if (query.trim()) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay para permitir clicks en resultados
    setTimeout(() => {
      if (!searchRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const getResultIcon = (tipo: string) => {
    switch (tipo) {
      case 'titulo': return <BookOpen className="w-4 h-4" />
      case 'seccion': return <FileText className="w-4 h-4" />
      case 'parrafo': return <Users className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getResultTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'titulo': return 'Obra'
      case 'seccion': return 'Sección'
      case 'parrafo': return 'Párrafo'
      default: return 'Contenido'
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

  return (
    <div className={`relative ${className}`} ref={searchRef}>
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
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Filtros avanzados"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Panel de filtros */}
      {showFiltersPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <AdvancedFilters
            onFilterChange={(newFilters) => setFilters({
              tipo: newFilters.tipo,
              autor: newFilters.autor || '',
              obra: newFilters.obra || ''
            })}
            autores={autores}
            obras={obras}
          />
        </div>
      )}

      {/* Resultados */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Área de resultados scrolleable */}
            <div ref={resultsContainerRef} className="flex-1 overflow-y-auto max-h-72">
              <div className="divide-y divide-gray-100">
                {results.slice(0, 5).map((result, index) => {
                  const doc = enhancedSearchEngine.getDocument(result.ref)
                  if (!doc) return null
                  
                  return (
                    <button
                      key={result.ref}
                      onClick={() => handleResultClick(result)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        index === selectedIndex ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(doc.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                              {getResultTypeLabel(doc.tipo)}
                            </span>
                            {doc.numero && (
                              <span className="text-xs text-gray-500">
                                Párrafo {doc.numero}
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {doc.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            por <span className="font-medium">{doc.autor}</span>
                          </p>
                          {doc.seccion && (
                            <p className="text-sm text-gray-500 mb-2">
                              Sección: {doc.seccion}
                            </p>
                          )}
                          <div 
                            className="text-sm text-gray-700 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightText(doc.texto.substring(0, 150), query) 
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Footer fijo con enlace a resultados completos */}
            <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <button 
                onClick={() => {
                  router.push(`/buscar?q=${encodeURIComponent(query)}`)
                  setIsOpen(false)
                }}
                className="w-full text-center py-3 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors group"
              >
                Ver los {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {isOpen && query.trim() && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-4">
          <div className="text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron resultados para "{query}"</p>
            <p className="text-xs mt-1">Intenta con términos diferentes</p>
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
