'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, BookOpen, User, FolderOpen, Folder } from 'lucide-react'
import Link from 'next/link'

interface Autor {
  _id: string;
  nombre: string;
  slug: string;
  biografia: string;
  orden: number;
}

interface Obra {
  _id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  esPublico: boolean;
  orden: number;
  autor: {
    _id: string;
    nombre: string;
    slug: string;
  };
  fechaCreacion: string;
}

interface WorksTreeProps {
  currentObraSlug?: string;
  currentAutorSlug?: string;
}

export default function WorksTree({ currentObraSlug, currentAutorSlug }: WorksTreeProps) {
  const [autores, setAutores] = useState<Autor[]>([])
  const [obrasPorAutor, setObrasPorAutor] = useState<Record<string, Obra[]>>({})
  const [expandedAutores, setExpandedAutores] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Cargar autores
  useEffect(() => {
    const fetchAutores = async () => {
      try {
        const response = await fetch('/api/autores')
        const data = await response.json()
        if (data.success) {
          setAutores(data.data)
          // Expandir el autor actual si existe
          if (currentAutorSlug) {
            const currentAutor = data.data.find((a: Autor) => a.slug === currentAutorSlug)
            if (currentAutor) {
              setExpandedAutores(new Set([currentAutor._id]))
            }
          }
        }
      } catch (error) {
        console.error('Error fetching autores:', error)
      }
    }

    fetchAutores()
  }, [currentAutorSlug])

  // Cargar obras para cada autor
  useEffect(() => {
    const fetchObras = async () => {
      if (autores.length === 0) return

      try {
        const obrasPromises = autores.map(async (autor) => {
          const response = await fetch(`/api/obras?autor=${autor.slug}&esPublico=true`)
          const data = await response.json()
          return { autorId: autor._id, obras: data.success ? data.data : [] }
        })

        const obrasResults = await Promise.all(obrasPromises)
        const obrasMap: Record<string, Obra[]> = {}
        
        obrasResults.forEach(({ autorId, obras }) => {
          obrasMap[autorId] = obras
        })

        setObrasPorAutor(obrasMap)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching obras:', error)
        setLoading(false)
      }
    }

    fetchObras()
  }, [autores])

  const toggleAutor = (autorId: string) => {
    const newExpanded = new Set(expandedAutores)
    if (newExpanded.has(autorId)) {
      newExpanded.delete(autorId)
    } else {
      newExpanded.add(autorId)
    }
    setExpandedAutores(newExpanded)
  }

  const isAutorExpanded = (autorId: string) => expandedAutores.has(autorId)

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2 text-primary-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-300 border-t-primary-600"></div>
          <span className="text-sm">Cargando obras...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">

      <div className="space-y-1">
        {autores.map((autor) => {
          const obras = obrasPorAutor[autor._id] || []
          const isExpanded = isAutorExpanded(autor._id)
          const isCurrentAutor = autor.slug === currentAutorSlug

          return (
            <div key={autor._id} className="select-none">
              {/* Autor */}
              <div
                className={`
                  flex items-center space-x-2 py-2 px-3 rounded-sm cursor-pointer transition-colors
                  ${isCurrentAutor 
                    ? 'bg-primary-100 text-primary-900 font-medium' 
                    : 'text-primary-700 hover:bg-primary-50'
                  }
                `}
                onClick={() => toggleAutor(autor._id)}
              >
                {obras.length > 0 ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )
                ) : (
                  <div className="w-4 h-4 flex-shrink-0" />
                )}
                
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 flex-shrink-0" />
                )}
                
                <span className="text-sm truncate">{autor.nombre}</span>
                
                {obras.length > 0 && (
                  <span className="text-xs text-primary-500 ml-auto">
                    {obras.length}
                  </span>
                )}
              </div>

              {/* Obras del autor */}
              {isExpanded && obras.length > 0 && (
                <div className="ml-6 space-y-1">
                  {obras.map((obra) => {
                    const isCurrentObra = obra.slug === currentObraSlug
                    
                    return (
                      <Link
                        key={obra._id}
                        href={`/autores/${autor.slug}/${obra.slug}`}
                        className={`
                          flex items-center space-x-2 py-1.5 px-3 rounded-sm transition-colors
                          ${isCurrentObra 
                            ? 'text-primary-900 font-medium bg-neutral-200' 
                            : 'text-primary-600 hover:bg-primary-50'
                          }
                        `}
                      >
                        <BookOpen className="w-3 h-3 flex-shrink-0" />
                        <span className="text-sm truncate">{obra.titulo}</span>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Mensaje si no hay obras */}
              {isExpanded && obras.length === 0 && (
                <div className="ml-6 py-2 px-3 text-xs text-primary-500">
                  No hay obras públicas disponibles
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-4 border-t border-primary-200">
        <div className="text-xs text-primary-500 space-y-1">
          <p><strong>Total de autores:</strong> {autores.length}</p>
          <p><strong>Total de obras:</strong> {Object.values(obrasPorAutor).reduce((sum, obras) => sum + obras.length, 0)}</p>
        </div>
      </div>
    </div>
  )
}
