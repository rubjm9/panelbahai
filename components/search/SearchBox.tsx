'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, BookOpen, FileText, Users, Clock, Star, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { searchEngine, SearchResult } from '@/utils/search'
import Link from 'next/link'
import AdvancedFilters from './AdvancedFilters'
import { useSearchContext } from '@/components/search/SearchProvider'

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
  const { isInitialized, isLoading: searchIsLoading, search } = useSearchContext()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState({
    autor: '' as string | undefined,
    obra: '' as string | undefined
  })
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [autores, setAutores] = useState<Array<{ value: string, label: string }>>([])
  const [obras, setObras] = useState<Array<{ value: string, label: string }>>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const [selectFirstWhenReady, setSelectFirstWhenReady] = useState(false)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus en homepage
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Cargar datos para filtros desde cache compartido
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const { filterDataCache } = await import('@/lib/services/search/filterDataCache')
        const [autoresData, obrasData] = await Promise.all([
          filterDataCache.getAutores(),
          filterDataCache.getObras()
        ])
        setAutores(autoresData)
        setObras(obrasData)
      } catch (error) {
        console.error('Error loading filter data:', error)
      }
    }

    loadFilterData()
  }, [])

  // Memoized handler to avoid creating a new function each render (prevents effect loops in children)
  const handleAdvancedFiltersChange = useCallback((newFilters: { autor?: string; obra?: string }) => {
    setFilters({
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

  // Realizar búsqueda con debounce adaptativo y filtros
  useEffect(() => {
    // Calcular debounce según longitud de query
    const getDebounceTime = (queryLength: number): number => {
      if (queryLength < 5) return 200; // Queries cortas: 200ms
      if (queryLength <= 10) return 300; // Queries medias: 300ms
      return 500; // Queries largas: 500ms
    };

    const debounceTime = query.length >= 3 ? getDebounceTime(query.length) : 0;

    const timeoutId = setTimeout(async () => {
      if (query.length >= 3) {
        // #region agent log
        fetch('/api/debug-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchBox.tsx:search-attempt',message:'SearchBox debounce fired',data:{query,isInitialized,searchIsLoading,context},timestamp:Date.now(),hypothesisId:'H4,H5'})}).catch(()=>{});
        // #endregion
        // Solo buscar si el índice está inicializado
        if (!isInitialized) {
          setIsLoading(true)
          // Esperar a que el índice se inicialice (el SearchProvider lo hace)
          return
        }

        // Mostrar loading si el índice aún se está inicializando
        if (searchIsLoading) {
          setIsLoading(true)
          return
        }

        setIsLoading(true)

        try {
          // Usar la función de búsqueda del contexto (unificada con Web Worker)
          const { results: searchResults, total } = await search(query, 20)

          // Aplicar filtros
          let filteredResults = searchResults

          if (filters.autor) {
            filteredResults = filteredResults.filter(result =>
              result.autorSlug === filters.autor
            )
          }

          if (filters.obra) {
            filteredResults = filteredResults.filter(result =>
              result.obraSlug === filters.obra
            )
          }

          setResults(filteredResults)
          setTotalResults(total)
          setIsOpen(true)

          // Guardar en historial
          if (!searchHistory.includes(query)) {
            setSearchHistory(prev => [query, ...prev.slice(0, 4)])
          }
        } catch (error) {
          console.error('Error en búsqueda:', error)
          setResults([])
          setTotalResults(0)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
        setTotalResults(0)
        setIsOpen(false)
      }
    }, debounceTime)

    return () => clearTimeout(timeoutId)
  }, [query, filters, context, isInitialized, searchIsLoading, search])

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
      ; (el as HTMLElement).scrollIntoView({ block: 'nearest' })
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
          // Construir URL de manera más robusta
          let url = `/autores/${result.autorSlug}/${result.obraSlug}`;
          const params = new URLSearchParams();

          if (result.numero) {
            params.set('p', result.numero.toString());
          }

          if (query) {
            params.set('q', query);
          }

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

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
    } catch { }
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
        {(isLoading || searchIsLoading || !isInitialized) ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600 mr-3"></div>
            <span className="text-primary-600 dark:text-neutral-400">Buscando...</span>
          </div>
        ) : (
          <>
            {results.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Área scrolleable de resultados */}
                <div className="flex-1 overflow-y-auto max-h-72">
                  <div className="divide-y divide-neutral-100">
                    {results.map((result, index) => {
                      // Construir URL de manera más robusta
                      let url = `/autores/${result.autorSlug}/${result.obraSlug}`;
                      const params = new URLSearchParams();

                      if (result.numero) {
                        params.set('p', result.numero.toString());
                      }

                      if (query) {
                        params.set('q', query);
                      }

                      if (params.toString()) {
                        url += `?${params.toString()}`;
                      }

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
                              <h4 className="font-medium text-primary-900 dark:text-neutral-100 text-sm mb-1 group-hover:text-primary-800 dark:group-hover:text-neutral-200 transition-colors">
                                {result.titulo}
                              </h4>
                              <p className="text-xs text-accent-600">
                                {result.autor} • {getResultTypeLabel(result.tipo)}
                                {result.numero && ` • Párrafo ${result.numero}`}
                              </p>
                            </div>
                          </div>
                          <p
                            className="text-sm text-primary-600 dark:text-neutral-400 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: searchEngine.highlightTerms(result.fragmento, query) }}
                          />
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Contador siempre visible en la parte inferior */}
                <button
                  onClick={handleSearchClick}
                  className="px-6 py-3 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-slate-800 dark:to-slate-700 text-sm text-primary-600 dark:text-neutral-300 text-center border-t border-neutral-200 dark:border-slate-700 flex-shrink-0 hover:from-neutral-200 hover:to-neutral-300 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:text-primary-800 dark:hover:text-neutral-100 transition-all duration-200 cursor-pointer w-full group"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">
                      Ver los {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                    </span>
                    <span className="text-accent-600 group-hover:text-accent-700 transition-colors">
                      →
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              query.length >= 3 && (
                <div className="px-6 py-8 text-center text-primary-500 dark:text-neutral-400">
                  <div className="mb-4">
                    <Search className="w-8 h-8 mx-auto mb-2 text-primary-400 dark:text-neutral-600" />
                    <p>No se encontraron resultados para "{query}"</p>
                  </div>
                  {searchHistory.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-primary-200 dark:border-slate-700">
                      <h5 className="text-sm font-medium text-primary-700 dark:text-neutral-300 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Búsquedas recientes
                      </h5>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {searchHistory.map((term, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1 bg-primary-100 dark:bg-slate-800 text-primary-700 dark:text-neutral-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-slate-700 transition-colors"
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