'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { searchEngine } from '@/utils/search'

interface SearchContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const SearchContext = createContext<SearchContextType>({
  isInitialized: false,
  isLoading: false,
  error: null
})

export function useSearch() {
  return useContext(SearchContext)
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export default function SearchProvider({ children }: SearchProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeSearch() {
      if (isInitialized) return

      setIsLoading(true)
      setError(null)

      try {
        // Construir el índice de búsqueda
        const response = await fetch('/api/search?buildIndex=true')
        
        if (!response.ok) {
          throw new Error('Error al obtener datos para el índice de búsqueda')
        }

        const { data: documents } = await response.json()
        
        if (documents && documents.length > 0) {
          searchEngine.buildIndex(documents)
          setIsInitialized(true)
        } else {
          console.warn('No se encontraron documentos para indexar')
        }
      } catch (err) {
        console.error('Error inicializando motor de búsqueda:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSearch()
  }, [isInitialized])

  return (
    <SearchContext.Provider value={{ isInitialized, isLoading, error }}>
      {children}
    </SearchContext.Provider>
  )
}
