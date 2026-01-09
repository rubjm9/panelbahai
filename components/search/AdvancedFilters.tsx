'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: {
    autor?: string
    obra?: string
  }) => void
  autores: FilterOption[]
  obras: FilterOption[]
  className?: string
  embedded?: boolean
  panelClassName?: string
}

export default function AdvancedFilters({ 
  onFilterChange, 
  autores, 
  obras, 
  className = "",
  embedded = false,
  panelClassName = "",
}: AdvancedFiltersProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState({
    autor: '',
    obra: ''
  })
  
  const [isOpen, setIsOpen] = useState(false)

  // Actualizar filtros cuando cambien
  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ autor: '', obra: '' })
  }

  const hasActiveFilters = filters.autor || filters.obra

  return (
    <div ref={panelRef} className={`${embedded ? '' : 'relative'} ${className}`}>
      {/* Cuando está embebido, no mostramos el botón y el panel se muestra siempre */}
      {!embedded && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-sm transition-colors ${
            hasActiveFilters
              ? 'border-accent-600 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400'
              : 'border-primary-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary-600 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-slate-600'
          }`}
        >
          <span className="text-sm font-medium">Filtros de búsqueda</span>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <span className="px-2 py-1 text-xs bg-accent-600 text-white rounded-full">
                {[filters.autor ? 1 : 0, filters.obra ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      )}

      {/* Panel de filtros */}
      {(embedded || isOpen) && (
        <div className={`${embedded ? 'relative z-40 mt-1 border rounded-sm shadow-lg p-4' : 'absolute top-full left-0 right-0 mt-1 border rounded-sm shadow-lg z-50 p-4'} ${panelClassName || (embedded ? 'bg-white dark:bg-slate-800 border-primary-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-primary-200 dark:border-slate-700')}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-primary-800 dark:text-neutral-200">Filtros de búsqueda</h4>
            <button onClick={clearFilters} className="text-xs text-primary-500 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-neutral-200">Limpiar todo</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Autor */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                Autor
              </label>
              <div className="relative">
                <select
                  value={filters.autor}
                  onChange={(e) => handleFilterChange('autor', e.target.value)}
                  className={`w-full px-3 py-2 pr-8 border rounded-sm text-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600 appearance-none ${
                    embedded 
                      ? 'border-slate-600 bg-slate-900/35 text-white' 
                      : 'border-primary-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary-700 dark:text-neutral-200'
                  }`}
                >
                  <option value="">Todos los autores</option>
                  {autores.map((autor) => (
                    <option key={autor.value} value={autor.value}>
                      {autor.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${embedded ? 'text-white' : 'text-primary-400 dark:text-neutral-500'}`} />
                {filters.autor && (
                  <button
                    onClick={() => handleFilterChange('autor', '')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-primary-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-neutral-300"
                    type="button"
                    aria-label="Limpiar filtro de autor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Obra */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 dark:text-neutral-300 mb-2">
                Obra
              </label>
              <div className="relative">
                <select
                  value={filters.obra}
                  onChange={(e) => handleFilterChange('obra', e.target.value)}
                  className={`w-full px-3 py-2 pr-8 border rounded-sm text-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600 appearance-none ${
                    embedded 
                      ? 'border-slate-600 bg-slate-900/35 text-white' 
                      : 'border-primary-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary-700 dark:text-neutral-200'
                  }`}
                >
                  <option value="">Todas las obras</option>
                  {obras.map((obra) => (
                    <option key={obra.value} value={obra.value}>
                      {obra.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${embedded ? 'text-white' : 'text-primary-400 dark:text-neutral-500'}`} />
                {filters.obra && (
                  <button
                    onClick={() => handleFilterChange('obra', '')}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-primary-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-neutral-300"
                    type="button"
                    aria-label="Limpiar filtro de obra"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
