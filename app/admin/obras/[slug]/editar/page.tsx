'use client'

import Link from 'next/link'
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Autor {
  _id: string
  nombre: string
  slug: string
}

interface Obra {
  _id: string
  titulo: string
  slug: string
  autor: Autor
  descripcion: string
  fechaPublicacion?: string
  orden: number
  activo: boolean
  esPublico: boolean
}

export default function EditarObraPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [autores, setAutores] = useState<Autor[]>([])
  const [obra, setObra] = useState<Obra | null>(null)
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
    fetchObra()
  }, [slug])

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

  const fetchObra = async () => {
    try {
      const response = await fetch(`/api/admin/obras/${slug}`)
      if (response.ok) {
        const obraData = await response.json()
        setObra(obraData)
        setFormData({
          titulo: obraData.titulo,
          slug: obraData.slug,
          autor: obraData.autor._id,
          descripcion: obraData.descripcion || '',
          fechaPublicacion: obraData.fechaPublicacion
            ? new Date(obraData.fechaPublicacion).toISOString().split('T')[0]
            : '',
          orden: obraData.orden,
          activo: obraData.activo,
          esPublico: obraData.esPublico
        })
      } else {
        setErrors({ general: 'Error al cargar la obra' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'orden' ? parseInt(value) || 0 : value
    }))

    // Auto-generate slug from title if title changed
    if (name === 'titulo' && obra?.titulo !== value) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug: newSlug }))
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

    if (!validateForm() || !obra) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        fechaPublicacion: formData.fechaPublicacion ? new Date(formData.fechaPublicacion) : undefined
      }

      const response = await fetch(`/api/admin/obras/${obra._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/admin/obras')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al actualizar la obra' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!obra || !confirm('¿Estás seguro de que quieres eliminar esta obra? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/obras/${obra._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/obras')
      } else {
        const errorData = await response.json()
        setErrors({ general: errorData.error || 'Error al eliminar la obra' })
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

  if (!obra) {
    return (
      <div className="admin-content">
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-primary-800 mb-2">
            Obra no encontrada
          </h3>
          <Link href="/admin/obras" className="btn-primary">
            Volver a Obras
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
            <Link href="/admin/obras" className="btn-secondary mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
                Editar Obra
              </h1>
              <p className="text-primary-600 font-reading">
                Modifica la información de la obra: {obra.titulo}
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

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-secondary text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Obra'}
            </button>

            <div className="flex items-center space-x-4">
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
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
