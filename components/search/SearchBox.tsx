'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, BookOpen, FileText, Users, Clock, Star } from 'lucide-react'
import { searchEngine, SearchResult } from '@/utils/search'
import Link from 'next/link'
import AdvancedFilters from './AdvancedFilters'
import { useSearch } from '@/components/search/SearchProvider'

interface SearchBoxProps {
  onResultClick?: () => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  context?: {
    autor?: string;
    obra?: string;
    seccion?: string;
  };
}

export default function SearchBox({ 
  onResultClick, 
  placeholder = "Buscar en toda la biblioteca...",
  className = "",
  showFilters = true,
  context
}: SearchBoxProps) {
  const { isInitialized } = useSearch()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const loadingIndexRef = useRef(false)
  const [filters, setFilters] = useState({
    tipo: 'todos',
    autor: '' as string | undefined,
    obra: '' as string | undefined
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [autores, setAutores] = useState<Array<{value: string, label: string}>>([])
  const [obras, setObras] = useState<Array<{value: string, label: string}>>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Cargar datos para filtros
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [autoresRes, obrasRes] = await Promise.all([
          fetch('/api/autores'),
          fetch('/api/obras')
        ])
        
        const autoresData = await autoresRes.json()
        const obrasData = await obrasRes.json()
        
        setAutores(autoresData.data?.map((autor: any) => ({
          value: autor.slug,
          label: autor.nombre
        })) || [])
        
        setObras(obrasData.data?.map((obra: any) => ({
          value: obra.slug,
          label: obra.titulo
        })) || [])
      } catch (error) {
        console.error('Error loading filter data:', error)
      }
    }
    
    loadFilterData()
  }, [])

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Realizar búsqueda con debounce y filtros
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true)

        // Asegurar que el índice esté construido si el provider aún no lo hizo
        if (!isInitialized && !loadingIndexRef.current) {
          try {
            loadingIndexRef.current = true
            const res = await fetch('/api/search?buildIndex=true')
            if (res.ok) {
              const { data } = await res.json()
              if (Array.isArray(data) && data.length > 0) {
                searchEngine.buildIndex(data)
              }
            }
          } catch (e) {
            console.error('No se pudo construir el índice de búsqueda on-demand:', e)
          } finally {
            loadingIndexRef.current = false
          }
        }

        let searchResults = searchEngine.search(query, 20)

        // Aplicar filtros
        if (filters.tipo !== 'todos') {
          searchResults = searchResults.filter(result => result.tipo === filters.tipo)
        }

        if (filters.autor) {
          searchResults = searchResults.filter(result =>
            result.autorSlug === filters.autor
          )
        }

        if (filters.obra) {
          searchResults = searchResults.filter(result =>
            result.obraSlug === filters.obra
          )
        }

        // Aplicar contexto si está disponible
        if (context?.autor) {
          searchResults = searchResults.filter(result =>
            result.autorSlug === context.autor
          )
        }

        if (context?.obra) {
          searchResults = searchResults.filter(result =>
            result.obraSlug === context.obra
          )
        }

        setResults(searchResults)
        setIsOpen(true)
        setIsLoading(false)

        // Guardar en historial
        if (!searchHistory.includes(query)) {
          setSearchHistory(prev => [query, ...prev.slice(0, 4)])
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, filters, context, isInitialized])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length >= 3) {
      handleSearchSubmit()
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const handleResultClick = () => {
    try {
      if (query && query.length > 0) {
        sessionStorage.setItem('lastSearchQuery', query)
      }
    } catch {}
    setIsOpen(false)
    onResultClick?.()
  }

  const handleSearchSubmit = () => {
    if (query.length >= 3) {
      window.location.href = `/buscar?q=${encodeURIComponent(query)}`
    }
  }

  const getResultUrl = (result: SearchResult): string => {
    if (result.numero) {
      return `/autores/${result.autorSlug}/${result.obraSlug}?p=${result.numero}`
    }
    return `/autores/${result.autorSlug}/${result.obraSlug}`
  }

  const getResultTypeLabel = (tipo: string): string => {
    switch (tipo) {
      case 'titulo': return 'Título de obra'
      case 'seccion': return 'Sección'
      case 'parrafo': return 'Párrafo'
      default: return 'Texto'
    }
  }

  const getResultIcon = (tipo: string) => {
    switch (tipo) {
      case 'titulo': return BookOpen
      case 'seccion': return FileText
      case 'parrafo': return FileText
      default: return BookOpen
    }
  }

  return (
    <div ref={searchRef} className={`search-container ${className}`}>
      {/* Campo de búsqueda */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input pl-12 pr-12"
          onFocus={() => query.length >= 3 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <AdvancedFilters
          onFilterChange={(newFilters) => {
            setFilters({
              tipo: newFilters.tipo,
              autor: newFilters.autor || '',
              obra: newFilters.obra || ''
            });
          }}
          autores={autores}
          obras={obras}
          className="mb-4"
        />
      )}

      {/* Resultados */}
      {isOpen && (
        <div className="search-results">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-primary-500">
              <div className="loading-spinner mx-auto mb-3"></div>
              <span>Buscando...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((result) => {
                const IconComponent = getResultIcon(result.tipo)
                return (
                  <Link
                    key={result.id}
                    href={getResultUrl(result)}
                    onClick={handleResultClick}
                    className="search-result-item group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-primary-100 rounded-sm flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                          <IconComponent className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-primary-900 text-sm mb-1 group-hover:text-primary-800 transition-colors">
                              {result.titulo}
                            </h4>
                            <p className="text-xs text-accent-600">
                              {result.autor} • {getResultTypeLabel(result.tipo)}
                              {result.numero && ` • Párrafo ${result.numero}`}
                            </p>
                          </div>
                        </div>
                        <p
                          className="text-sm text-primary-600 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: searchEngine.highlightTerms(result.fragmento, query)
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
              <div className="px-6 py-4 bg-neutral-50 text-xs text-primary-500 text-center border-t border-neutral-200">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                <button
                  onClick={handleSearchSubmit}
                  className="block mx-auto mt-2 text-accent-600 hover:text-accent-800 font-medium"
                >
                  Ver todos los resultados →
                </button>
              </div>
            </>
          ) : query.length >= 3 ? (
            <div className="px-6 py-8 text-center text-primary-500">
              <div className="mb-4">
                <Search className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                <p>No se encontraron resultados para "{query}"</p>
              </div>

              {/* Historial de búsquedas */}
              {searchHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-primary-200">
                  <h5 className="text-sm font-medium text-primary-700 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Búsquedas recientes
                  </h5>
                  <div className="space-y-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(term)}
                        className="block w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-sm transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-primary-500">
              <div className="mb-4">
                <Search className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                <p>Escribe al menos 3 caracteres para buscar</p>
              </div>

              {/* Sugerencias de búsqueda */}
              <div className="mt-6 pt-4 border-t border-primary-200">
                <h5 className="text-sm font-medium text-primary-700 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Sugerencias
                </h5>
                <div className="space-y-2">
                  {['Dios', 'revelación', 'unidad', 'amor', 'justicia'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="block w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}