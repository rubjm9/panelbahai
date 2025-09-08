'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface SidebarFiltersProps {
  onFilterChange: (filters: {
    tipo: string
    autor?: string
    obra?: string
  }) => void
  autores: FilterOption[]
  obras: FilterOption[]
  className?: string
}

export default function SidebarFilters({ 
  onFilterChange, 
  autores, 
  obras, 
  className = "" 
}: SidebarFiltersProps) {
  const [filters, setFilters] = useState({
    tipo: 'todos',
    autor: '',
    obra: ''
  })
  
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
  }, [filters, onFilterChange])

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
    <div className={`space-y-4 ${className}`}>
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

      {/* Botón limpiar */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-primary-500 hover:text-primary-700 py-2 border-t border-primary-200"
        >
          Limpiar filtros
        </button>
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

