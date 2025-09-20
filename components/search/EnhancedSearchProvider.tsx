'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { enhancedSearchEngine, SearchDocument as EnhancedSearchDocument } from '@/utils/enhanced-search'

interface EnhancedSearchContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  search: (query: string) => any[];
  getDocument: (id: string) => EnhancedSearchDocument | undefined;
  getSuggestions: (query: string) => string[];
  rebuildIndex: () => Promise<void>;
}

const EnhancedSearchContext = createContext<EnhancedSearchContextType | null>(null)

interface EnhancedSearchProviderProps {
  children: React.ReactNode;
}

export default function EnhancedSearchProvider({ children }: EnhancedSearchProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rebuildIndex = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Limpiar índice existente
      enhancedSearchEngine.clearIndex()
      setIsInitialized(false)

      // Reconstruir el índice de búsqueda
      const response = await fetch('/api/search?buildIndex=true')
      
      if (!response.ok) {
        throw new Error('Error al obtener datos para el índice de búsqueda')
      }

      const { data: documents } = await response.json()
      
      if (documents && documents.length > 0) {
        // Convertir documentos al formato mejorado
        const enhancedDocuments: EnhancedSearchDocument[] = documents.map((doc: any) => ({
          id: doc.id,
          titulo: doc.titulo || '',
          autor: doc.autor || '',
          obraSlug: doc.obraSlug || '',
          autorSlug: doc.autorSlug || '',
          seccion: doc.seccion || undefined,
          texto: doc.texto || '',
          numero: doc.numero || undefined,
          tipo: doc.tipo || 'parrafo'
        }))

        enhancedSearchEngine.buildIndex(enhancedDocuments)
        setIsInitialized(true)
        console.log(`✅ Índice de búsqueda mejorado reconstruido con ${enhancedDocuments.length} documentos`)
      } else {
        console.warn('No se encontraron documentos para indexar')
      }
    } catch (err) {
      console.error('Error reconstruyendo motor de búsqueda mejorado:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const search = (query: string) => {
    if (!isInitialized) {
      console.warn('Motor de búsqueda no inicializado')
      return []
    }

    try {
      return enhancedSearchEngine.search(query)
    } catch (error) {
      console.error('Error en búsqueda:', error)
      return []
    }
  }

  const getDocument = (id: string) => {
    return enhancedSearchEngine.getDocument(id)
  }

  const getSuggestions = (query: string) => {
    if (!isInitialized) return []
    return enhancedSearchEngine.getSuggestions(query)
  }

  useEffect(() => {
    async function initializeSearch() {
      if (isInitialized) return

      await rebuildIndex()
    }

    initializeSearch()
  }, [isInitialized])

  // Exponer función de reconstrucción globalmente
  useEffect(() => {
    (window as any).rebuildEnhancedSearchIndex = rebuildIndex
    return () => {
      delete (window as any).rebuildEnhancedSearchIndex
    }
  }, [])

  return (
    <EnhancedSearchContext.Provider value={{ 
      isInitialized, 
      isLoading, 
      error, 
      search, 
      getDocument, 
      getSuggestions,
      rebuildIndex 
    }}>
      {children}
    </EnhancedSearchContext.Provider>
  )
}

export function useEnhancedSearch() {
  const context = useContext(EnhancedSearchContext)
  if (!context) {
    throw new Error('useEnhancedSearch debe usarse dentro de EnhancedSearchProvider')
  }
  return context
}
