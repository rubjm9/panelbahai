'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, BookOpen, Globe, AlertTriangle, Search, GripVertical } from 'lucide-react'

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
  const [filter, setFilter] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)

  const canReorder = !filter.trim()

  const filteredObras = useMemo(() => {
    if (!filter.trim()) return obras
    const q = filter.trim().toLowerCase()
    return obras.filter(
      (o) =>
        o.titulo.toLowerCase().includes(q) ||
        o.autor.nombre.toLowerCase().includes(q) ||
        (o.slug && o.slug.toLowerCase().includes(q))
    )
  }, [obras, filter])

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
        setObras(obras.filter((obra) => obra._id !== obraToDelete._id))
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  const handleDragLeave = () => setDragOverId(null)

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    if (!canReorder) return
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) return
    const list = filteredObras
    const fromIndex = list.findIndex((o) => o._id === sourceId)
    const toIndex = list.findIndex((o) => o._id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const newOrder = [...list]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    const ids = newOrder.map((o) => o._id)
    setObras(newOrder)
    setSavingOrder(true)
    try {
      const res = await fetch('/api/admin/obras', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      if (!res.ok) {
        setObras(initialObras)
        alert(data.error || 'Error al guardar el orden')
      }
    } catch {
      setObras(initialObras)
      alert('Error de conexión')
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-1">
            Gestión de obras
          </h1>
          <p className="text-primary-600 font-reading text-sm">
            Administra las obras de la biblioteca bahá'í
          </p>
        </div>
        <Link href="/admin/obras/nueva" className="btn-primary shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Nueva obra
        </Link>
      </div>

      {obras.length > 0 && (
        <div className="mb-4">
          <label htmlFor="obras-filter" className="sr-only">
            Buscar por título o autor
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              id="obras-filter"
              type="text"
              placeholder="Buscar por título o autor..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input pl-9 py-2 w-full max-w-sm text-sm"
            />
          </div>
          {filter.trim() ? (
            <p className="text-sm text-primary-500 mt-1">
              {filteredObras.length} de {obras.length} obra{obras.length !== 1 ? 's' : ''}
            </p>
          ) : obras.length > 0 ? (
            <p className="text-sm text-primary-500 mt-1">
              Arrastra una fila para cambiar el orden (se usa en la web pública).
            </p>
          ) : null}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-sm">
        {filteredObras.length === 0 ? (
          <div className="px-4 py-12 text-center">
            {obras.length === 0 ? (
              <>
                <BookOpen className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-primary-800 mb-1">
                  No hay obras registradas
                </h3>
                <p className="text-primary-500 text-sm mb-4">
                  Comienza agregando la primera obra a la biblioteca
                </p>
                <Link href="/admin/obras/nueva" className="btn-primary inline-flex">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear primera obra
                </Link>
              </>
            ) : (
              <p className="text-primary-500 text-sm">
                No hay obras que coincidan con &quot;{filter}&quot;
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-primary-50">
                  {canReorder && (
                    <th scope="col" className="w-10 px-2 py-2 text-left text-xs font-medium text-primary-700 uppercase tracking-wider" aria-label="Reordenar">
                    </th>
                  )}
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
                    Obra
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-primary-700 uppercase tracking-wider hidden md:table-cell">
                    Autor
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-primary-700 uppercase tracking-wider w-20">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-primary-700 uppercase tracking-wider w-16 hidden lg:table-cell">
                    Párr.
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-primary-700 uppercase tracking-wider w-16 hidden lg:table-cell">
                    Secc.
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-primary-700 uppercase tracking-wider w-24 hidden xl:table-cell">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-primary-700 uppercase tracking-wider w-28">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredObras.map((obra) => (
                  <tr
                    key={obra._id}
                    className={`hover:bg-gray-50 ${dragOverId === obra._id ? 'bg-primary-50' : ''} ${savingOrder ? 'opacity-70' : ''}`}
                    {...(canReorder
                      ? {
                          draggable: true,
                          onDragStart: (e: React.DragEvent) => handleDragStart(e, obra._id),
                          onDragOver: (e: React.DragEvent) => handleDragOver(e, obra._id),
                          onDragLeave: handleDragLeave,
                          onDrop: (e: React.DragEvent) => handleDrop(e, obra._id),
                        }
                      : {})}
                  >
                    {canReorder && (
                      <td className="px-2 py-2 text-primary-400 cursor-grab active:cursor-grabbing" title="Arrastra para cambiar el orden (se usa en la web pública)">
                        <GripVertical className="w-5 h-5" />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-500 shrink-0 hidden sm:block" />
                        <div className="min-w-0">
                          <span className="font-medium text-primary-900 text-sm block truncate max-w-[200px] sm:max-w-none" title={obra.titulo}>
                            {obra.titulo}
                          </span>
                          <span className="text-primary-500 text-xs md:hidden">{obra.autor.nombre}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-primary-600 hidden md:table-cell">
                      {obra.autor.nombre}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {obra.esPublico ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Público">
                          <Globe className="w-3 h-3 mr-0.5" />
                          Púb.
                        </span>
                      ) : (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" title="Borrador">
                          Borr.
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-primary-600 hidden lg:table-cell">
                      {obra.parrafos}
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-primary-600 hidden lg:table-cell">
                      {obra.secciones}
                    </td>
                    <td className="px-3 py-2 text-sm text-primary-500 hidden xl:table-cell">
                      {obra.fechaPublicacion || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/autores/${obra.autor.slug}/${obra.slug}`}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                          title="Ver obra"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/obras/${obra.slug}/editar`}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded transition-colors"
                          title="Editar obra"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(obra)}
                          disabled={deletingId === obra._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar obra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && obraToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 shrink-0" />
              <h3 className="text-lg font-semibold text-primary-900">
                Confirmar eliminación
              </h3>
            </div>

            <p className="text-primary-600 mb-6 text-sm">
              ¿Está seguro de que desea eliminar la obra <strong>&quot;{obraToDelete.titulo}&quot;</strong>?
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
