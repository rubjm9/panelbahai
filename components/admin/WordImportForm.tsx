'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import Autor from '@/models/Autor'

interface WordImportFormProps {
  autores: Autor[]
}

interface ImportResult {
  success: boolean
  data?: {
    obra: any
    secciones: number
    parrafos: number
    resumen: {
      titulo: string
      autor: string
      secciones: number
      parrafos: number
    }
  }
  error?: string
}

export default function WordImportForm({ autores }: WordImportFormProps) {
  const [formData, setFormData] = useState({
    file: null as File | null,
    titulo: '',
    autorId: '',
    descripcion: '',
    esPublico: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
      setResult(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.type === 'application/msword')) {
      setFormData(prev => ({ ...prev, file }))
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file || !formData.titulo || !formData.autorId) {
      setResult({
        success: false,
        error: 'Por favor completa todos los campos requeridos'
      })
      return
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(formData.file.type)) {
      setResult({
        success: false,
        error: 'Solo se permiten archivos Word (.docx, .doc)'
      })
      return
    }

    // Validar tamaño de archivo (10MB)
    if (formData.file.size > 10 * 1024 * 1024) {
      setResult({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('titulo', formData.titulo)
      formDataToSend.append('autorId', formData.autorId)
      formDataToSend.append('descripcion', formData.descripcion)
      formDataToSend.append('esPublico', formData.esPublico.toString())

      const response = await fetch('/api/admin/import/word', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Limpiar formulario
        setFormData({
          file: null,
          titulo: '',
          autorId: '',
          descripcion: '',
          esPublico: false
        })
        // Limpiar input de archivo
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      console.error('Error importing document:', error)
      setResult({
        success: false,
        error: 'Error de conexión. Intenta de nuevo.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-accent-600 mr-3" />
        <h2 className="text-xl font-semibold text-primary-900">
          Importar documento Word
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Área de carga de archivo */}
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Archivo Word (.docx, .doc)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
              dragActive
                ? 'border-accent-600 bg-accent-50'
                : formData.file
                ? 'border-green-500 bg-green-50'
                : 'border-primary-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".docx,.doc"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {formData.file ? (
              <div className="space-y-2">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                <p className="text-sm font-medium text-green-700">
                  {formData.file.name}
                </p>
                <p className="text-xs text-green-600">
                  {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-primary-400 mx-auto" />
                <p className="text-sm font-medium text-primary-700">
                  Arrastra tu archivo Word aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-primary-500">
                  Formatos soportados: .docx, .doc (máximo 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información de la obra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Título de la obra *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: El Kitab-i-Iqan"
              className="w-full px-3 py-2 border border-primary-200 rounded-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Autor *
            </label>
            <select
              name="autorId"
              value={formData.autorId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-primary-200 rounded-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
              required
            >
              <option value="">Seleccionar autor</option>
              {autores.map((autor) => (
                <option key={autor._id} value={autor._id}>
                  {autor.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Breve descripción de la obra..."
            rows={3}
            className="w-full px-3 py-2 border border-primary-200 rounded-sm focus:ring-2 focus:ring-accent-600 focus:border-accent-600"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="esPublico"
            checked={formData.esPublico}
            onChange={handleInputChange}
            className="h-4 w-4 text-accent-600 focus:ring-accent-600 border-primary-300 rounded"
          />
          <label className="ml-2 text-sm text-primary-700">
            Hacer público inmediatamente
          </label>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading || !formData.file || !formData.titulo || !formData.autorId}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Importar documento
            </>
          )}
        </button>
      </form>

      {/* Resultado */}
      {result && (
        <div className={`mt-6 p-4 rounded-sm ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            )}
            <div className="flex-1">
              {result.success ? (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">
                    ¡Importación exitosa!
                  </h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Obra:</strong> {result.data?.resumen.titulo}</p>
                    <p><strong>Autor:</strong> {result.data?.resumen.autor}</p>
                    <p><strong>Secciones:</strong> {result.data?.resumen.secciones}</p>
                    <p><strong>Párrafos:</strong> {result.data?.resumen.parrafos}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Error en la importación
                  </h4>
                  <p className="text-sm text-red-700">
                    {result.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

