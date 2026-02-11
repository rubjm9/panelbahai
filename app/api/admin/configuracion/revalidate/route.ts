import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAdminAPI } from '@/lib/auth-helpers'

/**
 * POST: Invalida la caché de datos públicos (obras, autores).
 * Útil si se hicieron cambios directos en la BD o se quiere forzar actualización.
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
    revalidateTag('obras')
    revalidateTag('autores')
    return NextResponse.json({
      success: true,
      message: 'Caché invalidada correctamente',
    })
  } catch (error) {
    console.error('Error revalidando caché:', error)
    return NextResponse.json(
      { success: false, error: 'Error al limpiar la caché' },
      { status: 500 }
    )
  }
}
