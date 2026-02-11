'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteUsuarioButtonProps {
  usuarioId: string
  usuarioNombre: string
  className?: string
}

export default function DeleteUsuarioButton({
  usuarioId,
  usuarioNombre,
  className = '',
}: DeleteUsuarioButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioId}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Error al eliminar')
        return
      }
      router.refresh()
    } catch {
      alert('Error de conexión')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-primary-600 whitespace-nowrap">¿Eliminar?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="btn-secondary text-red-600 hover:text-red-800 text-sm py-1 px-2"
        >
          {loading ? '...' : 'Sí'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="btn-secondary text-sm py-1 px-2"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={className}
      title={`Eliminar a ${usuarioNombre}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
