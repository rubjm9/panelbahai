'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, FileText, File } from 'lucide-react'
import Link from 'next/link'

interface Autor {
  _id: string
  nombre: string
  slug: string
}

interface Obra {
  _id: string
  titulo: string
  slug: string
  descripcion: string
  orden: number
  fechaPublicacion?: string
  estado: string
  contenido?: string
  autor: {
    _id: string
    nombre: string
    slug: string
  }
}

interface EditObraFormProps {
  obra: Obra
  autores: Autor[]
}

export default function EditObraForm({ obra, autores }: EditObraFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [contenido, setContenido] = useState(obra.contenido || '')
  const [slug, setSlug] = useState(obra.slug || '')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [fechaPublicacion, setFechaPublicacion] = useState(
    obra.fechaPublicacion ? obra.fechaPublicacion.split('T')[0] : ''
  )
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  
  // Debug: mostrar el contenido recibido
  console.log('EditObraForm - Obra recibida:', obra)
  console.log('EditObraForm - Contenido:', obra.contenido)
  console.log('EditObraForm - Estado contenido:', contenido)
  console.log('EditObraForm - Slug:', obra.slug)

  // Función para generar slug automáticamente
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .trim()
  }

  // Función para validar slug
  const validateSlug = async (slugValue: string): Promise<boolean> => {
    if (!slugValue) {
      setSlugError('El slug es requerido')
      return false
    }

    if (!/^[a-z0-9-]+$/.test(slugValue)) {
      setSlugError('El slug solo puede contener letras minúsculas, números y guiones')
      return false
    }

    if (slugValue.startsWith('-') || slugValue.endsWith('-')) {
      setSlugError('El slug no puede empezar o terminar con guión')
      return false
    }

    // Verificar unicidad solo si el slug ha cambiado
    if (slugValue !== obra.slug) {
      try {
        const response = await fetch(`/api/admin/obras/check-slug?slug=${encodeURIComponent(slugValue)}&exclude=${obra._id}`)
        const data = await response.json()
        
        if (!data.available) {
          setSlugError('Este slug ya está en uso')
          return false
        }
      } catch (error) {
        console.error('Error verificando slug:', error)
        setSlugError('Error verificando disponibilidad del slug')
        return false
      }
    }

    setSlugError(null)
    return true
  }

  // Manejar cambio en el título para generar slug automáticamente
  const handleTituloChange = (titulo: string) => {
    if (!slug || slug === generateSlug(obra.titulo)) {
      setSlug(generateSlug(titulo))
    }
  }

  // Manejar cambio en el slug
  const handleSlugChange = async (slugValue: string) => {
    setSlug(slugValue)
    await validateSlug(slugValue)
  }

  // Funciones para el editor de texto
  const insertHeading = (level: number) => {
    const textarea = document.getElementById('contenido') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = contenido.substring(start, end)
      const headingText = selectedText || `Título ${level}`
      const headingTag = `<h${level}>${headingText}</h${level}>\n\n`
      
      const newValue = contenido.substring(0, start) + headingTag + contenido.substring(end)
      setContenido(newValue)
      
      // Actualizar el cursor después de que React actualice el DOM
      setTimeout(() => {
        const newCursorPos = start + headingTag.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  const insertFormat = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = document.getElementById('contenido') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = contenido.substring(start, end)
      
      let formattedText = ''
      switch (format) {
        case 'bold':
          formattedText = `<strong>${selectedText || 'texto en negrita'}</strong>`
          break
        case 'italic':
          formattedText = `<em>${selectedText || 'texto en cursiva'}</em>`
          break
        case 'underline':
          formattedText = `<u>${selectedText || 'texto subrayado'}</u>`
          break
      }
      
      const newValue = contenido.substring(0, start) + formattedText + contenido.substring(end)
      setContenido(newValue)
      
      // Actualizar el cursor después de que React actualice el DOM
      setTimeout(() => {
        const newCursorPos = start + formattedText.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  const insertList = (type: 'ul' | 'ol') => {
    const textarea = document.getElementById('contenido') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = contenido.substring(start, end)
      
      const listTag = type === 'ul' ? 'ul' : 'ol'
      const listItem = `<${listTag}>\n  <li>${selectedText || 'elemento de lista'}</li>\n</${listTag}>\n\n`
      
      const newValue = contenido.substring(0, start) + listItem + contenido.substring(end)
      setContenido(newValue)
      
      // Actualizar el cursor después de que React actualice el DOM
      setTimeout(() => {
        const newCursorPos = start + listItem.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    // Validar slug antes de enviar
    const isSlugValid = await validateSlug(slug)
    if (!isSlugValid) {
      setIsSubmitting(false)
      return
    }

    try {
      // Usar la referencia del formulario en lugar de e.currentTarget
      const form = formRef.current
      if (!form) {
        throw new Error('Formulario no encontrado')
      }
      
      const formData = new FormData(form)
      formData.set('slug', slug) // Asegurar que el slug se incluya
      formData.set('contenido', contenido) // Asegurar que el contenido se incluya
      formData.set('fechaPublicacion', fechaPublicacion) // Asegurar que la fecha se incluya
      
      console.log('Enviando actualización de obra:', {
        obraId: obra._id,
        slug,
        contenidoLength: contenido.length,
        titulo: formData.get('titulo'),
        autor: formData.get('autor')
      })
      
      const response = await fetch(`/api/admin/obras/${obra._id}`, {
        method: 'PUT',
        body: formData,
      })

      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Datos de respuesta:', data)
        setMessage({ type: 'success', text: 'Obra actualizada correctamente' })
        setTimeout(() => {
          router.push('/admin/obras')
        }, 1500)
      } else {
        let errorData
        try {
          const text = await response.text()
          console.error('Error response text:', text)
          errorData = JSON.parse(text)
        } catch (parseError) {
          console.error('Error parseando respuesta:', parseError)
          errorData = { message: `Error ${response.status}: ${response.statusText}` }
        }
        console.error('Error data:', errorData)
        setMessage({ type: 'error', text: errorData.message || `Error ${response.status}: ${response.statusText}` })
      }
    } catch (error: any) {
      console.error('Error en handleSubmit:', error)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Por favor, intenta de nuevo.'}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow p-6">
      {message && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-primary-900 mb-2">
              Título
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              defaultValue={obra.titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="autor" className="block text-sm font-medium text-primary-900 mb-2">
              Autor
            </label>
            <select
              id="autor"
              name="autor"
              defaultValue={obra.autor._id.toString()}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            >
              {autores.map((autor) => (
                <option key={autor._id.toString()} value={autor._id.toString()}>
                  {autor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campo de Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-primary-900 mb-2">
            Slug (URL amigable) *
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={`flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                slugError ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ejemplo-de-slug-amigable"
              required
            />
            <button
              type="button"
              onClick={() => setSlug(generateSlug(obra.titulo))}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
              title="Generar slug automáticamente"
            >
              Auto
            </button>
          </div>
          {slugError && (
            <p className="mt-1 text-sm text-red-600">{slugError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            El slug se usa en la URL. Solo letras minúsculas, números y guiones. 
            Se genera automáticamente al cambiar el título.
          </p>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-primary-900 mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            defaultValue={obra.descripcion}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Campos de archivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="archivoDoc" className="block text-sm font-medium text-primary-900 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Archivo DOC/DOCX (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra y suelta tu archivo Word aquí
              </p>
              <input
                type="file"
                id="archivoDoc"
                name="archivoDoc"
                accept=".doc,.docx"
                className="hidden"
              />
              <label
                htmlFor="archivoDoc"
                className="btn-secondary cursor-pointer inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formatos: .doc, .docx (máx. 10MB)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="archivoPdf" className="block text-sm font-medium text-primary-900 mb-2">
              <File className="w-4 h-4 inline mr-2" />
              Archivo PDF (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra y suelta tu archivo PDF aquí
              </p>
              <input
                type="file"
                id="archivoPdf"
                name="archivoPdf"
                accept=".pdf"
                className="hidden"
              />
              <label
                htmlFor="archivoPdf"
                className="btn-secondary cursor-pointer inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formato: .pdf (máx. 10MB)
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="archivoEpub" className="block text-sm font-medium text-primary-900 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Archivo EPUB (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra y suelta tu archivo EPUB aquí
              </p>
              <input
                type="file"
                id="archivoEpub"
                name="archivoEpub"
                accept=".epub"
                className="hidden"
              />
              <label
                htmlFor="archivoEpub"
                className="btn-secondary cursor-pointer inline-flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formato: .epub (máx. 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Editor de contenido */}
        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-primary-900 mb-2">
            Contenido de la Obra
          </label>
          <div className="border border-gray-300 focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent">
            {/* Barra de herramientas mejorada */}
            <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center space-x-2 flex-wrap">
              {/* Títulos */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 mr-1">Títulos:</span>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 1 (H1)"
                  onClick={() => insertHeading(1)}
                >
                  H1
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 2 (H2)"
                  onClick={() => insertHeading(2)}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 3 (H3)"
                  onClick={() => insertHeading(3)}
                >
                  H3
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 4 (H4)"
                  onClick={() => insertHeading(4)}
                >
                  H4
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 5 (H5)"
                  onClick={() => insertHeading(5)}
                >
                  H5
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Título 6 (H6)"
                  onClick={() => insertHeading(6)}
                >
                  H6
                </button>
              </div>
              
              <div className="w-px h-4 bg-gray-300"></div>
              
              {/* Formato de texto */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 mr-1">Formato:</span>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Negrita"
                  onClick={() => insertFormat('bold')}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Cursiva"
                  onClick={() => insertFormat('italic')}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Subrayado"
                  onClick={() => insertFormat('underline')}
                >
                  <u>U</u>
                </button>
              </div>
              
              <div className="w-px h-4 bg-gray-300"></div>
              
              {/* Listas */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 mr-1">Listas:</span>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Lista con viñetas"
                  onClick={() => insertList('ul')}
                >
                  • Lista
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-white border border-gray-300 hover:bg-gray-50"
                  title="Lista numerada"
                  onClick={() => insertList('ol')}
                >
                  1. Lista
                </button>
              </div>
            </div>
            <textarea
              id="contenido"
              name="contenido"
              rows={20}
              className="w-full px-3 py-2 border-0 focus:outline-none resize-none"
              placeholder="Escribe aquí el contenido de la obra..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Puedes usar formato básico de texto. Los párrafos se separan con líneas en blanco.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="orden" className="block text-sm font-medium text-primary-900 mb-2">
              Orden
            </label>
            <input
              type="number"
              id="orden"
              name="orden"
              defaultValue={obra.orden}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="fechaPublicacion" className="block text-sm font-medium text-primary-900 mb-2">
              Fecha de Publicación
            </label>
            <input
              type="date"
              id="fechaPublicacion"
              name="fechaPublicacion"
              value={fechaPublicacion}
              onChange={(e) => setFechaPublicacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-primary-900 mb-2">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              defaultValue={obra.estado}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <Link
            href="/admin/obras"
            className="btn-secondary flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
