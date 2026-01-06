'use client'

import { createContext, useContext, useEffect } from 'react'
import { useSearch as useSearchHook } from '@/lib/hooks/useSearch'

interface SearchContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  rebuild: () => Promise<void>;
}

const SearchContext = createContext<SearchContextType>({
  isInitialized: false,
  isLoading: false,
  error: null,
  rebuild: async () => {}
})

export function useSearch() {
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
      rebuild: search.rebuild
    }}>
      {children}
    </SearchContext.Provider>
  )
}
