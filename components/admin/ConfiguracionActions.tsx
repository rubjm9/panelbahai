'use client'

import { useState } from 'react'
import { Search, RefreshCw, Database } from 'lucide-react'

export default function ConfiguracionActions() {
  const [rebuildLoading, setRebuildLoading] = useState(false)
  const [rebuildResult, setRebuildResult] = useState<{ success: boolean; message?: string; error?: string; count?: number } | null>(null)
  const [cacheLoading, setCacheLoading] = useState(false)
  const [cacheResult, setCacheResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleRebuildIndex = async () => {
    setRebuildResult(null)
    setRebuildLoading(true)
    try {
      const res = await fetch('/api/search/rebuild', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setRebuildResult({ success: true, message: data.message || 'Índice reconstruido', count: data.count })
      } else {
        setRebuildResult({ success: false, error: data.error || 'Error' })
      }
    } catch {
      setRebuildResult({ success: false, error: 'Error de conexión' })
    } finally {
      setRebuildLoading(false)
    }
  }

  const handleClearCache = async () => {
    setCacheResult(null)
    setCacheLoading(true)
    try {
      const res = await fetch('/api/admin/configuracion/revalidate', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setCacheResult({ success: true, message: data.message || 'Caché limpiada' })
      } else {
        setCacheResult({ success: false, error: data.error || 'Error' })
      }
    } catch {
      setCacheResult({ success: false, error: 'Error de conexión' })
    } finally {
      setCacheLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="flex items-center mb-4">
          <Search className="w-6 h-6 text-accent-600 mr-3" />
          <h3 className="text-xl font-display font-semibold text-primary-900">
            Motor de búsqueda
          </h3>
        </div>
        <p className="text-primary-600 font-reading mb-3">
          La búsqueda en la web usa Lunr.js e indexa títulos de obras, secciones y texto de párrafos de obras públicas. El índice se guarda en la base de datos.
        </p>
        <p className="text-primary-700 font-medium mb-1 text-sm">
          No es necesario reconstruir el índice cada vez que crees o edites contenido.
        </p>
        <p className="text-primary-600 font-reading mb-3 text-sm">
          El índice se actualiza solo cuando se crea, edita o elimina una obra, se importa desde Word, se cambia el estado público/borrador o se modifican párrafos. Solo tiene sentido usar el botón si la búsqueda no muestra resultados actualizados (por ejemplo tras un fallo del proceso automático), si hubo cambios directos en la base de datos o para forzar una reconstrucción completa tras muchos cambios.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRebuildIndex}
            disabled={rebuildLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {rebuildLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reconstruyendo...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reconstruir índice de búsqueda
              </>
            )}
          </button>
          {rebuildResult && (
            <div className={`p-3 rounded-sm text-sm ${rebuildResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {rebuildResult.success ? (
                <span>{rebuildResult.message}{rebuildResult.count != null ? ` (${rebuildResult.count} documentos)` : ''}</span>
              ) : (
                <span>{rebuildResult.error}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="w-6 h-6 text-accent-600 mr-3" />
          <h3 className="text-xl font-display font-semibold text-primary-900">
            Caché
          </h3>
        </div>
        <p className="text-primary-600 font-reading mb-4">
          Invalida la caché de la web pública (obras, autores) para que los visitantes vean los datos más recientes. Útil tras cambios que no hayan actualizado la caché automáticamente.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleClearCache}
            disabled={cacheLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {cacheLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Limpiando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpiar caché
              </>
            )}
          </button>
          {cacheResult && (
            <div className={`p-3 rounded-sm text-sm ${cacheResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {cacheResult.success ? cacheResult.message : cacheResult.error}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
