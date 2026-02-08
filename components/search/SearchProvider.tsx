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

  // #region agent log
  useEffect(() => {
    fetch('/api/debug-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchProvider.tsx:mount',message:'SearchProvider mounted',data:{isInitialized:search.isInitialized,isLoading:search.isLoading,error:search.error},timestamp:Date.now(),hypothesisId:'H4,H5'})}).catch(()=>{});
  }, [search.isInitialized, search.isLoading, search.error]);
  // #endregion

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
