'use client'

import Link from 'next/link'
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Usuario {
  _id: string
  nombre: string
  email: string
  rol: 'admin' | 'editor' | 'viewer'
  activo: boolean
}

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'viewer',
    activo: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [changePassword, setChangePassword] = useState(false)

  useEffect(() => {
    fetchUsuario()
  }, [id])

  const fetchUsuario = async () => {
    try {
      const response = await fetch(`/api/admin/usuarios/${id}`)
      if (response.ok) {
        const usuarioData = await response.json()
        setUsuario(usuarioData)
        setFormData({
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          password: '',
          confirmPassword: '',
          rol: usuarioData.rol,
          activo: usuarioData.activo
        })
      } else {
        setErrors({ general: 'Error al cargar el usuario' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'La nueva contraseña es obligatoria'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    if (!['admin', 'editor', 'viewer'].includes(formData.rol)) {
      newErrors.rol = 'Rol inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !usuario) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData: any = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        rol: formData.rol,
        activo: formData.activo
      }

      if (changePassword && formData.password) {
        submitData.password = formData.password
      }

      const response = await fetch(`/api/admin/usuarios/${usuario._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/admin/usuarios')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al actualizar el usuario' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!usuario || !confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/usuarios/${usuario._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/usuarios')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al eliminar el usuario' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="admin-content">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-primary-600">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="admin-content">
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-primary-800 mb-2">
            Usuario no encontrado
          </h3>
          <Link href="/admin/usuarios" className="btn-primary">
            Volver a Usuarios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-content">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/admin/usuarios" className="btn-secondary mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Editar Usuario
              </h1>
              <p className="text-primary-600 font-reading">
                Modifica la información del usuario: {usuario.nombre}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="form-label">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Juan Pérez"
              required
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="usuario@email.com"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="rol" className="form-label">
              Rol del usuario *
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="viewer">Visualizador - Solo puede ver contenido</option>
              <option value="editor">Editor - Puede crear y editar contenido</option>
              <option value="admin">Administrador - Control total del sistema</option>
            </select>
            {errors.rol && <p className="mt-1 text-sm text-red-600">{errors.rol}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="changePassword" className="ml-2 block text-sm text-primary-900">
                Cambiar contraseña
              </label>
            </div>

            {changePassword && (
              <>
                <div>
                  <label htmlFor="password" className="form-label">
                    Nueva contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    required={changePassword}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar nueva contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Repite la nueva contraseña"
                    required={changePassword}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={formData.activo}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-primary-900">
              Usuario activo - Puede acceder al sistema
            </label>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || usuario.rol === 'admin'}
              className="btn-secondary text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
            </button>

            <div className="flex items-center space-x-4">
              <Link href="/admin/usuarios" className="btn-secondary">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
