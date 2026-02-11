'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AutorFormProps {
  autorId?: string
  initialNombre?: string
  initialBiografia?: string
  initialOrden?: number
}

export default function AutorForm({
  autorId,
  initialNombre = '',
  initialBiografia = '',
  initialOrden = 0,
}: AutorFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(initialNombre)
  const [biografia, setBiografia] = useState(initialBiografia)
  const [orden, setOrden] = useState(initialOrden)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(autorId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/autores/${autorId}` : '/api/admin/autores'
      const method = isEdit ? 'PATCH' : 'POST'
      const body = JSON.stringify({
        nombre: nombre.trim(),
        biografia: biografia.trim() || undefined,
        orden: Number(orden) || 0,
      })
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      if (isEdit) {
        router.push('/admin/autores')
        router.refresh()
      } else {
        router.push('/admin/autores')
        router.refresh()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-sm rounded">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-primary-700 mb-1">
            Nombre *
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input"
            placeholder="Ej: Bahá'u'lláh"
          />
        </div>
        <div>
          <label htmlFor="biografia" className="block text-sm font-medium text-primary-700 mb-1">
            Descripción (se muestra en la página pública /autores)
          </label>
          <textarea
            id="biografia"
            value={biografia}
            onChange={(e) => setBiografia(e.target.value)}
            rows={5}
            className="input"
            placeholder="Breve biografía o descripción del autor..."
          />
        </div>
        <div>
          <label htmlFor="orden" className="block text-sm font-medium text-primary-700 mb-1">
            Orden
          </label>
          <input
            id="orden"
            type="number"
            min={0}
            value={orden}
            onChange={(e) => setOrden(Number(e.target.value) || 0)}
            className="input w-24"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear autor'}
          </button>
          <Link href="/admin/autores" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
