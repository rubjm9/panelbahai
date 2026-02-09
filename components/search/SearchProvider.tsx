'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSearch as useSearchHook } from '@/lib/hooks/useSearch'

import { SearchResult } from '@/utils/search'

interface SearchContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  rebuild: () => Promise<void>;
  search: (query: string, limit?: number) => Promise<{ results: SearchResult[]; total: number }>;
}

const SearchContext = createContext<SearchContextType>({
  isInitialized: false,
  isLoading: false,
  error: null,
  rebuild: async () => { },
  search: async () => ({ results: [], total: 0 })
})

export function useSearchContext() {
  return useContext(SearchContext)
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export default function SearchProvider({ children }: SearchProviderProps) {
  const search = useSearchHook({ autoInitialize: true })

  // Exponer función de reconstrucción globalmente
  useEffect(() => {
    (window as any).rebuildSearchIndex = search.rebuild
    return () => {
      delete (window as any).rebuildSearchIndex
    }
  }, [search.rebuild])

  return (
    <SearchContext.Provider value={{
      isInitialized: search.isInitialized,
      isLoading: search.isLoading,
      error: search.error,
      rebuild: search.rebuild,
      search: search.search
    }}>
      {children}
    </SearchContext.Provider>
  )
}
