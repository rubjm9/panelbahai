'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, BookOpen, FileText, Calendar, Globe, AlertTriangle } from 'lucide-react'

interface Obra {
  _id: string
  titulo: string
  slug: string
  descripcion: string
  esPublico: boolean
  orden: number
  fechaPublicacion?: string
  autor: {
    _id: string
    nombre: string
    slug: string
  }
  parrafos: number
  secciones: number
}

interface ObrasListProps {
  obras: Obra[]
}

export default function ObrasList({ obras: initialObras }: ObrasListProps) {
  const [obras, setObras] = useState(initialObras)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [obraToDelete, setObraToDelete] = useState<Obra | null>(null)

  const handleDeleteClick = (obra: Obra) => {
    setObraToDelete(obra)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!obraToDelete) return

    setDeletingId(obraToDelete._id)
    
    try {
      const response = await fetch(`/api/obras/${obraToDelete.slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remover la obra de la lista
        setObras(obras.filter(obra => obra._id !== obraToDelete._id))
        setShowDeleteModal(false)
        setObraToDelete(null)
      } else {
        const error = await response.json()
        alert(`Error al eliminar la obra: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting obra:', error)
      alert('Error al eliminar la obra')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setObraToDelete(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Gestión de Obras
          </h1>
          <p className="text-primary-600 font-reading">
            Administra las obras de la biblioteca bahá'í
          </p>
        </div>
        <Link href="/admin/obras/nueva" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva obra
        </Link>
      </div>

      <div className="grid gap-6">
        {obras.map((obra) => (
          <div key={obra._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <BookOpen className="w-6 h-6 text-accent-600 mr-3" />
                  <h3 className="text-xl font-display font-semibold text-primary-900">
                    {obra.titulo}
                  </h3>
                  <div className="ml-3 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-sm">
                      Orden: {obra.orden}
                    </span>
                    {obra.esPublico ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-sm flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        Público
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-sm">
                        Borrador
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-primary-600 font-reading mb-3">
                  <strong>Autor:</strong> {obra.autor.nombre}
                </p>
                
                <p className="text-primary-600 font-reading mb-4 line-clamp-2">
                  {obra.descripcion}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-primary-500 mb-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{obra.parrafos} párrafos</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span>{obra.secciones} secciones</span>
                  </div>
                  {obra.fechaPublicacion && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{obra.fechaPublicacion}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Link 
                  href={`/autores/${obra.autor.slug}/${obra.slug}`}
                  className="btn-secondary"
                  title="Ver obra"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link 
                  href={`/admin/obras/${obra.slug}/editar`}
                  className="btn-secondary"
                  title="Editar obra"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDeleteClick(obra)}
                  disabled={deletingId === obra._id}
                  className="btn-secondary text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar obra"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {obras.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary-800 mb-2">
              No hay obras registradas
            </h3>
            <p className="text-primary-500 mb-6">
              Comienza agregando la primera obra a la biblioteca
            </p>
            <Link href="/admin/obras/nueva" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Crear primera obra
            </Link>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && obraToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-primary-900">
                Confirmar eliminación
              </h3>
            </div>
            
            <p className="text-primary-600 mb-6">
              ¿Estás seguro de que quieres eliminar la obra <strong>"{obraToDelete.titulo}"</strong>?
              Esta acción también eliminará todos los párrafos y secciones asociados.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="btn-secondary"
                disabled={deletingId === obraToDelete._id}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === obraToDelete._id}
                className="btn-primary bg-red-600 hover:bg-red-700 text-white"
              >
                {deletingId === obraToDelete._id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
