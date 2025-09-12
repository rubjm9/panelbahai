'use client'

import Link from 'next/link'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Autor {
  _id: string
  nombre: string
  slug: string
}

export default function NuevaObraPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autores, setAutores] = useState<Autor[]>([])
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    autor: '',
    descripcion: '',
    fechaPublicacion: '',
    orden: 0,
    activo: true,
    esPublico: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAutores()
  }, [])

  const fetchAutores = async () => {
    try {
      const response = await fetch('/api/admin/autores')
      if (response.ok) {
        const autoresData = await response.json()
        setAutores(autoresData)
      }
    } catch (error) {
      console.error('Error fetching autores:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'orden' ? parseInt(value) || 0 : value
    }))

    // Auto-generate slug from title
    if (name === 'titulo') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
    }

    if (!formData.autor) {
      newErrors.autor = 'Debes seleccionar un autor'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria'
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
      const submitData = {
        ...formData,
        fechaPublicacion: formData.fechaPublicacion ? new Date(formData.fechaPublicacion) : undefined
      }

      const response = await fetch('/api/admin/obras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/admin/obras')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al crear la obra' })
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
            <Link href="/admin/obras" className="btn-secondary mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Nueva Obra
              </h1>
              <p className="text-primary-600 font-reading">
                Agrega una nueva obra a la biblioteca bahá'í
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
            <label htmlFor="titulo" className="form-label">
              Título de la Obra *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Ej: Las Siete Valles"
              required
            />
            {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
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
              placeholder="Ej: las-siete-valles"
              required
            />
            <p className="mt-1 text-sm text-primary-500">
              URL: /autores/[autor]/{formData.slug || 'ejemplo'}
            </p>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
          </div>

          <div>
            <label htmlFor="autor" className="form-label">
              Autor *
            </label>
            <select
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Selecciona un autor</option>
              {autores.map((autor) => (
                <option key={autor._id} value={autor._id}>
                  {autor.nombre}
                </option>
              ))}
            </select>
            {errors.autor && <p className="mt-1 text-sm text-red-600">{errors.autor}</p>}
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
            <label htmlFor="descripcion" className="form-label">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="form-input"
              placeholder="Describe brevemente la obra..."
              required
            />
            {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
          </div>

          <div>
            <label htmlFor="fechaPublicacion" className="form-label">
              Fecha de Publicación
            </label>
            <input
              type="date"
              id="fechaPublicacion"
              name="fechaPublicacion"
              value={formData.fechaPublicacion}
              onChange={handleInputChange}
              className="form-input"
            />
            <p className="mt-1 text-sm text-primary-500">
              Fecha en que la obra fue publicada (opcional)
            </p>
          </div>

          <div className="space-y-3">
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
                Activo - La obra está disponible en el sistema
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="esPublico"
                name="esPublico"
                checked={formData.esPublico}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="esPublico" className="ml-2 block text-sm text-primary-900">
                Público - La obra es visible para todos los usuarios
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/admin/obras" className="btn-secondary">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Obra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
