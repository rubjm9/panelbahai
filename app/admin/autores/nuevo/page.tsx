'use client'

import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoAutorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    biografia: '',
    orden: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orden' ? parseInt(value) || 0 : value
    }))

    // Auto-generate slug from name
    if (name === 'nombre') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
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

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/autores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/autores')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al crear el autor' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsSubmitting(false)
    }
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
                Nuevo Autor
              </h1>
              <p className="text-primary-600 font-reading">
                Agrega un nuevo autor a la biblioteca bahá'í
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

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
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
              {isSubmitting ? 'Guardando...' : 'Guardar Autor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
