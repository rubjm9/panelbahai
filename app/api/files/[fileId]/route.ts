import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/gridfs'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

/**
 * API para servir archivos desde GridFS
 * GET /api/files/[fileId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params

    // Validar que el fileId es un ObjectId válido
    if (!ObjectId.isValid(fileId)) {
      return NextResponse.json(
        { error: 'ID de archivo inválido' },
        { status: 400 }
      )
    }

    // Descargar el archivo desde GridFS
    const { buffer, filename, contentType } = await downloadFile(fileId)

    // Determinar content-type si no está disponible
    let mimeType = contentType
    if (!mimeType) {
      const ext = filename.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'epub': 'application/epub+zip'
      }
      mimeType = mimeTypes[ext || ''] || 'application/octet-stream'
    }

    // Retornar el archivo con headers apropiados
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error: any) {
    console.error('Error descargando archivo:', error)
    
    if (error.message === 'File not found') {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error al descargar el archivo' },
      { status: 500 }
    )
  }
}


