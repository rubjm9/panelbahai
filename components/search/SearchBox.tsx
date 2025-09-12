'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, BookOpen, FileText, Users, Clock, Star, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchEngine, SearchResult } from '@/utils/search'
import Link from 'next/link'
import AdvancedFilters from './AdvancedFilters'
import { useSearch } from '@/components/search/SearchProvider'

interface SearchBoxProps {
  onResultClick?: () => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  context?: 'homepage' | 'page';
  autoFocus?: boolean;
}

export default function SearchBox({ 
  onResultClick, 
  placeholder = "Buscar en toda la biblioteca...",
  className = "",
  showFilters = true,
  context,
  autoFocus = false
}: SearchBoxProps) {
  const { isInitialized } = useSearch()
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
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Cargar datos para filtros
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        // Cargar autores
        const autoresRes = await fetch('/api/autores')
        if (autoresRes.ok) {
          const autoresData = await autoresRes.json()
          setAutores(autoresData.data?.map((autor: any) => ({
            value: autor.slug,
            label: autor.nombre
          })) || [])
        }
        
        // Cargar obras
        const obrasRes = await fetch('/api/obras')
        if (obrasRes.ok) {
          const obrasData = await obrasRes.json()
          setObras(obrasData.data?.map((obra: any) => ({
            value: obra.slug,
            label: obra.titulo
          })) || [])
        }
      } catch (error) {
        console.error('Error loading filter data:', error)
      }
    }
    
    loadFilterData()
  }, [])

  // Memoized handler to avoid creating a new function each render (prevents effect loops in children)
  const handleAdvancedFiltersChange = useCallback((newFilters: { tipo: string; autor?: string; obra?: string }) => {
    setFilters({
      tipo: newFilters.tipo,
      autor: newFilters.autor || '',
      obra: newFilters.obra || ''
    });
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

        // No aplicar filtros adicionales por contexto; mostrar todos los resultados relevantes
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

  // If ArrowDown was pressed before results were ready, select first item when results arrive
  useEffect(() => {
    if (selectFirstWhenReady && results.length > 0) {
      setSelectedIndex(0)
      setSelectFirstWhenReady(false)
    }
  }, [results, selectFirstWhenReady])

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (!isOpen || selectedIndex < 0) return
    const container = resultsContainerRef.current
    if (!container) return
    const el = container.querySelector(`.search-result-item[data-index="${selectedIndex}"]`)
    if (el && 'scrollIntoView' in el) {
      ;(el as HTMLElement).scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
    if (e.target.value.length < 3) {
      setResults([])
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Open results with ArrowDown from the input
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) setIsOpen(true)
      if (results.length > 0) {
        setSelectedIndex(prev => (prev < 0 ? 0 : Math.min(prev + 1, results.length - 1)))
      } else if (query.length >= 3) {
        // results will arrive shortly due to debounce; mark to select first when ready
        setSelectFirstWhenReady(true)
      }
      return
    }

    // Open results and move up selection
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) setIsOpen(true)
      if (results.length > 0) {
        setSelectedIndex(prev => (prev <= 0 ? -1 : prev - 1))
      }
      return
    }

    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
      }
      return
    }

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
          const result = results[selectedIndex]
          const url = `/autores/${result.autorSlug}/${result.obraSlug}${result.numero ? `?p=${result.numero}` : ''}${query ? `${result.numero ? '&' : '?'}q=${encodeURIComponent(query)}` : ''}`
          router.push(url)
          if (onResultClick) onResultClick()
        } else if (query.trim()) {
          router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSearchClick = () => {
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
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

  return (<div className={`search-container ${showFilters && showFiltersPanel ? 'filters-open' : ''} ${className}`} ref={searchRef}>
      {/* Contenedor del input y botones */}
      <div className="flex items-stretch w-full">
        {/* Input de búsqueda - ocupa todo el espacio disponible */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={context === 'homepage' ? 'search-input-hero' : 'search-input-regular'}
            aria-label="Buscar en la biblioteca"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
            )}
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setResults([])
                  setIsOpen(false)
                  setSelectedIndex(-1)
                  inputRef.current?.focus()
                }}
                className={`${context === 'homepage' ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex ml-2 space-x-2">
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`${context === 'homepage' ? 'search-btn-hero' : 'search-btn'} flex items-center justify-center px-3 sm:px-4`}
              aria-expanded={showFiltersPanel}
              aria-controls="filters-panel"
            >
              <Filter className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">Filtros</span>
            </button>
          )}
          <button
            onClick={handleSearchClick}
            className={`${context === 'homepage' ? 'search-btn-hero' : 'search-btn'}`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && showFiltersPanel && (
        <div className="mt-4">
          <AdvancedFilters
            onFilterChange={handleAdvancedFiltersChange}
            autores={autores}
            obras={obras}
            className=""
            panelClassName={context === 'homepage' ? 'filters-panel-hero' : ''}
            embedded={true}
          />
        </div>
      )}

      {/* Resultados - aparecen debajo de filtros si están abiertos */}
      {isOpen && (
        <div ref={resultsContainerRef} className={`search-results ${showFiltersPanel ? 'mt-4' : 'mt-1'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600 mr-3"></div>
              <span className="text-primary-600">Buscando...</span>
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <div>
                  <div className="divide-y divide-neutral-100">
                    {results.map((result, index) => {
                      const url = `/autores/${result.autorSlug}/${result.obraSlug}${result.numero ? `?p=${result.numero}` : ''}${query ? `${result.numero ? '&' : '?'}q=${encodeURIComponent(query)}` : ''}`;
                      return (
                        <Link
                          key={result.id}
                          href={url}
                          onClick={onResultClick}
                          className={`search-result-item group ${index === selectedIndex ? 'selected' : ''}`}
                          data-index={index}
                        >
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
                            dangerouslySetInnerHTML={{ __html: searchEngine.highlightTerms(result.fragmento, query) }}
                          />
                        </Link>
                      )
                    })}
                  </div>
                  <div className="px-6 py-4 bg-neutral-50 text-xs text-primary-500 text-center border-t border-neutral-200">
                    {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                    <button onClick={handleSearchClick} className="block mx-auto mt-2 text-accent-600 hover:text-accent-800 font-medium">
                      Ver todos los resultados →
                    </button>
                  </div>
                </div>
              ) : (
                query.length >= 3 && (
                  <div className="px-6 py-8 text-center text-primary-500">
                    <div className="mb-4">
                      <Search className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                      <p>No se encontraron resultados para "{query}"</p>
                    </div>
                    {searchHistory.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-primary-200">
                        <h5 className="text-sm font-medium text-primary-700 mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Búsquedas recientes
                        </h5>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {searchHistory.map((term, index) => (
                            <button
                              key={index}
                              onClick={() => setQuery(term)}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}
        </div>
      )}
    </div>);
}