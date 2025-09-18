'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, BookOpen, FileText, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { searchEngine, SearchResult } from '@/utils/search'
import SidebarFilters from '@/components/search/SidebarFilters'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const router = useRouter()
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    tipo: 'todos',
    autor: '',
    obra: ''
  })
  const [searchQuery, setSearchQuery] = useState(query)
  
  // Datos para los filtros (esto debería venir de la API)
  const [autores, setAutores] = useState<Array<{value: string, label: string}>>([])
  const [obras, setObras] = useState<Array<{value: string, label: string}>>([])

  // Sincronizar estado local con search params
  useEffect(() => {
    setSearchQuery(query)
  }, [query])

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

  // Construir índice una sola vez - optimizado
  const [indexReady, setIndexReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    
    // Verificar si el índice ya está construido
    if (searchEngine.index && searchEngine.documents.size > 0) {
      setIndexReady(true)
      return
    }
    
    async function initIndex() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/search?buildIndex=true')
        const data = await response.json()
        if (!cancelled && data?.success && Array.isArray(data.data) && data.data.length > 0) {
          searchEngine.buildIndex(data.data)
          setIndexReady(true)
        }
      } catch (e) {
        console.error('Error inicializando índice en /buscar:', e)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    
    initIndex()
    return () => { cancelled = true }
  }, [])

  // Realizar búsqueda cuando índice esté listo - optimizado
  useEffect(() => {
    if (!indexReady) return
    
    if (query.length >= 3) {
      // Usar setTimeout para evitar bloqueos de UI
      const searchTimeout = setTimeout(() => {
        setIsLoading(true)
        try {
          let searchResults = searchEngine.search(query, 100)
          if (filters.tipo !== 'todos') {
            searchResults = searchResults.filter(result => result.tipo === filters.tipo)
          }
          if (filters.autor) {
            searchResults = searchResults.filter(result => result.autorSlug === filters.autor)
          }
          if (filters.obra) {
            searchResults = searchResults.filter(result => result.obraSlug === filters.obra)
          }
          setResults(searchResults)
        } catch (error) {
          console.error('Error searching:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      }, 50) // Pequeño delay para permitir que la UI se actualice
      
      return () => clearTimeout(searchTimeout)
    } else {
      setResults([])
    }
  }, [query, filters, indexReady])

  const getResultUrl = (result: SearchResult): string => {
    try {
      if (query && query.length > 0) {
        sessionStorage.setItem('lastSearchQuery', query)
      }
    } catch {}
    const qParam = query && query.length >= 1 ? `&q=${encodeURIComponent(query)}` : ''
    if (result.numero) {
      return `/autores/${result.autorSlug}/${result.obraSlug}?p=${result.numero}${qParam}`
    }
    const base = `/autores/${result.autorSlug}/${result.obraSlug}`
    return qParam ? `${base}?${qParam.slice(1)}` : base
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
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center text-accent-600 hover:text-accent-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.length >= 3) {
                      router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-sm bg-white text-primary-900 focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
                  placeholder="Buscar en toda la biblioteca..."
                />
              </div>
            </div>
            
            <div className="text-sm text-primary-600">
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Resultados */}
          <div className="flex-1">
            {/* Información de búsqueda */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Resultados de búsqueda
              </h1>
              <p className="text-primary-600">
                {query ? `Buscando: "${query}"` : 'No hay término de búsqueda'}
              </p>
              {isLoading && (
                <p className="text-primary-500 mt-2">Buscando...</p>
              )}
            </div>

            {/* Resultados */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-medium text-primary-800 mb-2">
                  Cargando los resultados de la búsqueda
                </h3>
                <p className="text-primary-500">
                  Buscando "{query}" en toda la biblioteca...
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary-600">
                    {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="grid gap-6">
                  {results.map((result) => {
                    const IconComponent = getResultIcon(result.tipo)
                    return (
                      <Link
                        key={result.id}
                        href={getResultUrl(result)}
                        className="block card hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 bg-accent-100 rounded-sm flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-accent-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-display font-semibold text-primary-900 mb-1">
                                  {result.titulo}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-primary-600 mb-2">
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {result.autor}
                                  </span>
                                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-sm text-xs">
                                    {getResultTypeLabel(result.tipo)}
                                  </span>
                                  {result.numero && (
                                    <span className="text-primary-500">
                                      Párrafo {result.numero}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div 
                              className="text-primary-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: searchEngine.highlightTerms(result.fragmento, query)
                              }}
                            />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : query.length >= 3 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-primary-800 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-primary-500 mb-6">
                  No se encontraron resultados para "{query}". Intenta con otros términos o ajusta los filtros.
                </p>
                <Link href="/" className="btn-primary">
                  Volver al inicio
                </Link>
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-primary-800 mb-2">
                  Busca en la biblioteca
                </h3>
                <p className="text-primary-500 mb-6">
                  Escribe al menos 3 caracteres para buscar en toda la biblioteca bahá'í.
                </p>
                <Link href="/" className="btn-primary">
                  Ir a la página principal
                </Link>
              </div>
            )}
          </div>

          {/* Barra lateral de filtros */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white border border-primary-200 rounded-sm p-4 sticky top-8">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Refinar búsqueda
              </h3>
              
              <SidebarFilters
                onFilterChange={(newFilters) => {
                  setFilters({
                    tipo: newFilters.tipo,
                    autor: newFilters.autor || '',
                    obra: newFilters.obra || ''
                  })
                }}
                autores={autores}
                obras={obras}
                className="mb-4"
              />
              
              {/* Información de búsqueda */}
              <div className="pt-4 border-t border-primary-200">
                <h4 className="font-medium text-primary-800 mb-3">Información</h4>
                <div className="space-y-2 text-sm text-primary-600">
                  <div>
                    <span className="font-medium">Término:</span> "{query}"
                  </div>
                  <div>
                    <span className="font-medium">Resultados:</span> {results.length}
                  </div>
                  {filters.tipo !== 'todos' && (
                    <div>
                      <span className="font-medium">Tipo:</span> {filters.tipo}
                    </div>
                  )}
                  {filters.autor && (
                    <div>
                      <span className="font-medium">Autor:</span> {autores.find(a => a.value === filters.autor)?.label}
                    </div>
                  )}
                  {filters.obra && (
                    <div>
                      <span className="font-medium">Obra:</span> {obras.find(o => o.value === filters.obra)?.label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="text-center">
        <Search className="w-16 h-16 text-primary-400 mx-auto mb-4" />
        <p className="text-primary-600">Cargando búsqueda...</p>
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  )
}
