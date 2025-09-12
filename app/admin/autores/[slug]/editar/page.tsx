'use client'

import Link from 'next/link'
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Autor {
  _id: string
  nombre: string
  slug: string
  biografia: string
  orden: number
}

export default function EditarAutorPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [autor, setAutor] = useState<Autor | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    biografia: '',
    orden: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAutor()
  }, [slug])

  const fetchAutor = async () => {
    try {
      const response = await fetch(`/api/admin/autores/${slug}`)
      if (response.ok) {
        const autorData = await response.json()
        setAutor(autorData)
        setFormData({
          nombre: autorData.nombre,
          slug: autorData.slug,
          biografia: autorData.biografia,
          orden: autorData.orden
        })
      } else {
        setErrors({ general: 'Error al cargar el autor' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orden' ? parseInt(value) || 0 : value
    }))

    // Auto-generate slug from name if name changed
    if (name === 'nombre' && autor?.nombre !== value) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug: newSlug }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
    }

    if (!formData.biografia.trim()) {
      newErrors.biografia = 'La biografía es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !autor) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/autores/${autor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/autores')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al actualizar el autor' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!autor || !confirm('¿Estás seguro de que quieres eliminar este autor? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/autores/${autor._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/autores')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al eliminar el autor' })
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

  if (!autor) {
    return (
      <div className="admin-content">
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-primary-800 mb-2">
            Autor no encontrado
          </h3>
          <Link href="/admin/autores" className="btn-primary">
            Volver a Autores
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
            <Link href="/admin/autores" className="btn-secondary mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Editar Autor
              </h1>
              <p className="text-primary-600 font-reading">
                Modifica la información del autor: {autor.nombre}
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
              Nombre del Autor *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Bahá'u'lláh"
              required
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="form-label">
              Slug (URL) *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: bahau-llah"
              required
            />
            <p className="mt-1 text-sm text-primary-500">
              URL: /autores/{formData.slug || 'ejemplo'}
            </p>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label htmlFor="orden" className="form-label">
              Orden de Aparición
            </label>
            <input
              type="number"
              id="orden"
              name="orden"
              value={formData.orden}
              onChange={handleInputChange}
              className="form-input"
              placeholder="0"
              min="0"
            />
            <p className="mt-1 text-sm text-primary-500">
              Número que determina el orden de aparición en listas (menor número = aparece primero)
            </p>
          </div>

          <div>
            <label htmlFor="biografia" className="form-label">
              Biografía *
            </label>
            <textarea
              id="biografia"
              name="biografia"
              value={formData.biografia}
              onChange={handleInputChange}
              rows={6}
              className="form-input"
              placeholder="Escribe una breve biografía del autor..."
              required
            />
            {errors.biografia && <p className="mt-1 text-sm text-red-600">{errors.biografia}</p>}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-secondary text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Autor'}
            </button>

            <div className="flex items-center space-x-4">
              <Link href="/admin/autores" className="btn-secondary">
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
