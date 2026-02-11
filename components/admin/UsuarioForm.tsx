'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ROLES = [
  { value: 'viewer', label: 'Visualizador' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Administrador' },
] as const

interface UsuarioFormProps {
  usuarioId?: string
  initialNombre?: string
  initialEmail?: string
  initialRol?: string
}

export default function UsuarioForm({
  usuarioId,
  initialNombre = '',
  initialEmail = '',
  initialRol = 'viewer',
}: UsuarioFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(initialNombre)
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState(initialRol)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(usuarioId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isEdit && (!password || password.length < 6)) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/usuarios/${usuarioId}` : '/api/admin/usuarios'
      const method = isEdit ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol: rol,
      }
      if (isEdit) {
        if (password.trim()) body.nuevaContrasena = password
      } else {
        body.password = password
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      router.push('/admin/usuarios')
      router.refresh()
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
          <div className="p-3 bg-red-50 text-red-800 text-sm rounded-sm">
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
            placeholder="Nombre completo"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="usuario@ejemplo.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">
            {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
          </label>
          <input
            id="password"
            type="password"
            required={!isEdit}
            minLength={isEdit ? undefined : 6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder={isEdit ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
          />
          {isEdit && (
            <p className="text-xs text-primary-500 mt-1">
              Solo rellena si quieres cambiar la contraseña
            </p>
          )}
        </div>
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-primary-700 mb-1">
            Rol
          </label>
          <select
            id="rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="input"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
          <Link href="/admin/usuarios" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
