'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: {
    tipo: string
    autor?: string
    obra?: string
  }) => void
  autores: FilterOption[]
  obras: FilterOption[]
  className?: string
}

export default function AdvancedFilters({ 
  onFilterChange, 
  autores, 
  obras, 
  className = "" 
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    tipo: 'todos',
    autor: '',
    obra: ''
  })
  
  const [isOpen, setIsOpen] = useState(false)
  const [autorSearch, setAutorSearch] = useState('')
  const [obraSearch, setObraSearch] = useState('')
  const [showAutorDropdown, setShowAutorDropdown] = useState(false)
  const [showObraDropdown, setShowObraDropdown] = useState(false)

  // Filtrar opciones basadas en búsqueda
  const filteredAutores = autores.filter(autor =>
    autor.label.toLowerCase().includes(autorSearch.toLowerCase())
  )
  
  const filteredObras = obras.filter(obra =>
    obra.label.toLowerCase().includes(obraSearch.toLowerCase())
  )

  // Actualizar filtros cuando cambien
  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ tipo: 'todos', autor: '', obra: '' })
    setAutorSearch('')
    setObraSearch('')
  }

  const hasActiveFilters = filters.tipo !== 'todos' || filters.autor || filters.obra

  return (
    <div className={`relative ${className}`}>
      {/* Botón de filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-sm transition-colors ${
          hasActiveFilters
            ? 'border-accent-600 bg-accent-50 text-accent-700'
            : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300'
        }`}
      >
        <span className="text-sm font-medium">Filtros de búsqueda</span>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-accent-600 text-white rounded-full">
              {[filters.tipo !== 'todos' ? 1 : 0, filters.autor ? 1 : 0, filters.obra ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-sm shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-primary-800">Filtros de búsqueda</h4>
            <button
              onClick={clearFilters}
              className="text-xs text-primary-500 hover:text-primary-700"
            >
              Limpiar todo
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de contenido */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Tipo de contenido
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-primary-200 rounded-sm text-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
              >
                <option value="todos">Todos</option>
                <option value="titulo">Títulos de obras</option>
                <option value="seccion">Secciones</option>
                <option value="parrafo">Párrafos</option>
              </select>
            </div>
            
            {/* Autor */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Autor
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={autorSearch}
                  onChange={(e) => {
                    setAutorSearch(e.target.value)
                    setShowAutorDropdown(true)
                  }}
                  onFocus={() => setShowAutorDropdown(true)}
                  placeholder="Buscar autor..."
                  className="w-full px-3 py-2 border border-primary-200 rounded-sm text-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
                />
                {filters.autor && (
                  <button
                    onClick={() => {
                      handleFilterChange('autor', '')
                      setAutorSearch('')
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Dropdown de autores */}
                {showAutorDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-sm shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredAutores.length > 0 ? (
                      filteredAutores.map((autor) => (
                        <button
                          key={autor.value}
                          onClick={() => {
                            handleFilterChange('autor', autor.value)
                            setAutorSearch(autor.label)
                            setShowAutorDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                            filters.autor === autor.value ? 'bg-accent-50 text-accent-700' : 'text-primary-700'
                          }`}
                        >
                          {autor.label}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-primary-500">
                        No se encontraron autores
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Obra */}
            <div className="relative">
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Obra
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={obraSearch}
                  onChange={(e) => {
                    setObraSearch(e.target.value)
                    setShowObraDropdown(true)
                  }}
                  onFocus={() => setShowObraDropdown(true)}
                  placeholder="Buscar obra..."
                  className="w-full px-3 py-2 border border-primary-200 rounded-sm text-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
                />
                {filters.obra && (
                  <button
                    onClick={() => {
                      handleFilterChange('obra', '')
                      setObraSearch('')
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Dropdown de obras */}
                {showObraDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-sm shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredObras.length > 0 ? (
                      filteredObras.map((obra) => (
                        <button
                          key={obra.value}
                          onClick={() => {
                            handleFilterChange('obra', obra.value)
                            setObraSearch(obra.label)
                            setShowObraDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                            filters.obra === obra.value ? 'bg-accent-50 text-accent-700' : 'text-primary-700'
                          }`}
                        >
                          {obra.label}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-primary-500">
                        No se encontraron obras
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay para cerrar dropdowns */}
      {(showAutorDropdown || showObraDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowAutorDropdown(false)
            setShowObraDropdown(false)
          }}
        />
      )}
    </div>
  )
}
