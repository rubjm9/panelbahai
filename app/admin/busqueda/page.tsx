'use client'

import { useState } from 'react'
import { Search, RefreshCw, Database, FileText, BookOpen, AlertCircle } from 'lucide-react'

export default function AdminBusquedaPage() {
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [lastRebuild, setLastRebuild] = useState<Date | null>(null)
  const [rebuildResult, setRebuildResult] = useState<any>(null)

  const handleRebuildIndex = async () => {
    setIsRebuilding(true)
    setRebuildResult(null)

    try {
      // Reconstruir índice en el servidor
      const response = await fetch('/api/search/rebuild', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        setRebuildResult(result)
        setLastRebuild(new Date())
        
        // También reconstruir en el cliente si está disponible
        if (typeof window !== 'undefined' && (window as any).rebuildSearchIndex) {
          await (window as any).rebuildSearchIndex()
        }
      } else {
        const error = await response.json()
        setRebuildResult({ success: false, error: error.error })
      }
    } catch (error) {
      console.error('Error rebuilding index:', error)
      setRebuildResult({ 
        success: false, 
        error: 'Error de conexión' 
      })
    } finally {
      setIsRebuilding(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Gestión de Búsqueda
          </h1>
          <p className="text-primary-600 font-reading">
            Administra el índice de búsqueda de la biblioteca
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Panel de reconstrucción */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Search className="w-6 h-6 text-accent-600 mr-3" />
            <h2 className="text-xl font-display font-semibold text-primary-900">
              Reconstruir Índice de Búsqueda
            </h2>
          </div>
          
          <p className="text-primary-600 font-reading mb-6">
            Reconstruye el índice de búsqueda para incluir nuevas obras, párrafos y secciones. 
            Esto es necesario cuando agregas contenido nuevo a la biblioteca.
          </p>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleRebuildIndex}
              disabled={isRebuilding}
              className="btn-primary flex items-center"
            >
              {isRebuilding ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Reconstruyendo...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reconstruir Índice
                </>
              )}
            </button>
            
            {lastRebuild && (
              <span className="text-sm text-primary-500">
                Última reconstrucción: {lastRebuild.toLocaleString()}
              </span>
            )}
          </div>

          {/* Resultado de la reconstrucción */}
          {rebuildResult && (
            <div className={`p-4 rounded-sm ${
              rebuildResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {rebuildResult.success ? (
                <div>
                  <div className="flex items-center mb-2">
                    <Database className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">
                      Índice reconstruido exitosamente
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-primary-700">
                        {rebuildResult.obras} obras
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-primary-700">
                        {rebuildResult.secciones} secciones
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-primary-700">
                        {rebuildResult.parrafos} párrafos
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Database className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-primary-700">
                        {rebuildResult.count} documentos
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">
                    Error: {rebuildResult.error}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información sobre el sistema de búsqueda */}
        <div className="card">
          <h3 className="text-lg font-display font-semibold text-primary-900 mb-4">
            Información del Sistema de Búsqueda
          </h3>
          
          <div className="space-y-3 text-sm text-primary-600">
            <p>
              <strong>Motor de búsqueda:</strong> Lunr.js con configuración para español
            </p>
            <p>
              <strong>Contenido indexado:</strong> Títulos de obras, secciones y párrafos de obras públicas
            </p>
            <p>
              <strong>Pesos de búsqueda:</strong> Títulos (10x), Autores (8x), Secciones (6x), Contenido (1x)
            </p>
            <p>
              <strong>Reconstrucción automática:</strong> ✅ Activada - El índice se reconstruye automáticamente cuando:
            </p>
            <ul className="ml-4 space-y-1">
              <li>• Se crea una nueva obra</li>
              <li>• Se actualiza una obra existente</li>
              <li>• Se elimina una obra</li>
              <li>• Se importa contenido desde Word</li>
              <li>• Se cambia el estado público/privado de una obra</li>
            </ul>
            <p className="text-green-600 font-medium">
              🎉 Ya no necesitas reconstruir manualmente el índice después de hacer cambios
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
