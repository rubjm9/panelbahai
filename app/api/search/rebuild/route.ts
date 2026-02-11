import { NextRequest, NextResponse } from 'next/server'
import { rebuildSearchIndex } from '@/utils/search-rebuild'
import { requireAdminAPI } from '@/lib/auth-helpers'

/**
 * POST: Reconstruye el índice de búsqueda y lo guarda en la base de datos.
 * Solo administradores. Útil como recurso manual cuando la reconstrucción
 * automática falló o tras cambios directos en la base de datos.
 */
export async function POST(_request: NextRequest) {
  try {
    await requireAdminAPI()
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 401 }
    )
  }

  try {
    const result = await rebuildSearchIndex()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Error al reconstruir el índice',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Índice de búsqueda reconstruido y guardado correctamente',
      count: result.count,
      obras: result.obras,
      secciones: result.secciones,
      parrafos: result.parrafos,
    })
  } catch (error) {
    console.error('Error en POST /api/search/rebuild:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
