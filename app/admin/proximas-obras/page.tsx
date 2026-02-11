'use client'

import { useState, useEffect, useCallback } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

const TIPOS = ['Revisión de traducción', 'Obra no publicada anteriormente'] as const

type ProximaObraItem = {
  id: string
  titulo: string
  autorId: string | null
  autorNombre: string
  tipo: typeof TIPOS[number]
  orden: number
}

type AutorOption = { _id: string; nombre: string; slug: string }

export default function AdminProximasObrasPage() {
  const [items, setItems] = useState<ProximaObraItem[]>([])
  const [autores, setAutores] = useState<AutorOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTituloId, setEditingTituloId] = useState<string | null>(null)
  const [editingTituloValue, setEditingTituloValue] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/proximas-obras', { credentials: 'include' })
      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      if (!res.ok) throw new Error('Error al cargar')
      const json = await res.json()
      if (json.success) setItems(json.data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAutores = useCallback(async () => {
    try {
      const res = await fetch('/api/autores')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setAutores(json.data.map((a: { _id: string; nombre: string; slug: string }) => ({ _id: a._id, nombre: a.nombre, slug: a.slug })))
      }
    } catch {
      setAutores([])
    }
  }, [])

  useEffect(() => {
    fetchItems()
    fetchAutores()
  }, [fetchItems, fetchAutores])

  const saveTitulo = async (id: string) => {
    const value = editingTituloValue.trim()
    setEditingTituloId(null)
    if (!value) return
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/proximas-obras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo: value })
      })
      const json = await res.json()
      if (json.success) {
        setItems(prev => prev.map(it => it.id === id ? { ...it, titulo: json.data.titulo } : it))
      }
    } finally {
      setSaving(null)
    }
  }

  const updateAutor = async (id: string, autorId: string) => {
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/proximas-obras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ autorId })
      })
      const json = await res.json()
      if (json.success) {
        setItems(prev => prev.map(it => it.id === id ? { ...it, autorId, autorNombre: json.data.autorNombre } : it))
      }
    } finally {
      setSaving(null)
    }
  }

  const updateTipo = async (id: string, tipo: typeof TIPOS[number]) => {
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/proximas-obras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tipo })
      })
      const json = await res.json()
      if (json.success) {
        setItems(prev => prev.map(it => it.id === id ? { ...it, tipo: json.data.tipo } : it))
      }
    } finally {
      setSaving(null)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar esta obra de la lista?')) return
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/proximas-obras/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) setItems(prev => prev.filter(it => it.id !== id))
    } finally {
      setSaving(null)
    }
  }

  const addNew = async () => {
    if (autores.length === 0) {
      alert('Primero debe haber al menos un autor.')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/admin/proximas-obras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titulo: 'Nueva obra',
          autorId: autores[0]._id,
          tipo: TIPOS[0]
        })
      })
      const json = await res.json()
      if (json.success) setItems(prev => [...prev, json.data])
    } finally {
      setAdding(false)
    }
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
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) return
    const fromIndex = items.findIndex(it => it.id === sourceId)
    const toIndex = items.findIndex(it => it.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return
    const newOrder = [...items]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    setItems(newOrder)
    try {
      await fetch('/api/admin/proximas-obras', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: newOrder.map(it => it.id) })
      })
    } catch {
      fetchItems()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-primary-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Próximas obras
          </h1>
          <p className="text-primary-600 font-reading">
            Gestionar el listado de obras en traducción o revisión que se muestra en la página pública.
          </p>
        </div>
        <button
          type="button"
          onClick={addNew}
          disabled={adding || autores.length === 0}
          className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir obra
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary-50">
              <tr>
                <th scope="col" className="w-10 px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider" />
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">Autor</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="w-16 px-4 py-3 text-right text-xs font-medium text-primary-700 uppercase tracking-wider" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={e => handleDragStart(e, item.id)}
                  onDragOver={e => handleDragOver(e, item.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, item.id)}
                  className={`${dragOverId === item.id ? 'bg-primary-50' : ''} ${saving === item.id ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </td>
                  <td className="px-4 py-3">
                    {editingTituloId === item.id ? (
                      <input
                        type="text"
                        value={editingTituloValue}
                        onChange={e => setEditingTituloValue(e.target.value)}
                        onBlur={() => saveTitulo(item.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveTitulo(item.id)
                          if (e.key === 'Escape') {
                            setEditingTituloId(null)
                            setEditingTituloValue(item.titulo)
                          }
                        }}
                        className="w-full max-w-md border border-primary-300 rounded-sm px-2 py-1.5 text-primary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTituloId(item.id)
                          setEditingTituloValue(item.titulo)
                        }}
                        className="text-left font-medium text-primary-900 hover:text-primary-700 hover:underline"
                      >
                        {item.titulo}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.autorId ?? ''}
                      onChange={e => updateAutor(item.id, e.target.value)}
                      className="border border-gray-300 rounded-sm px-2 py-1.5 text-sm text-primary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {autores.map(a => (
                        <option key={a._id} value={a._id}>{a.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-4">
                      {TIPOS.map(t => (
                        <label key={t} className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`tipo-${item.id}`}
                            checked={item.tipo === t}
                            onChange={() => updateTipo(item.id, t)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-primary-700">{t}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      disabled={saving === item.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && !loading && (
          <div className="text-center py-12 text-primary-500 text-sm">
            No hay obras en el listado. Use «Añadir obra» para crear la primera.
          </div>
        )}
      </div>
    </div>
  )
}
