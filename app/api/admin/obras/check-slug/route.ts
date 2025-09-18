import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const exclude = searchParams.get('exclude')
    
    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        message: 'Slug es requerido' 
      }, { status: 400 })
    }
    
    // Validar formato del slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Formato de slug inválido' 
      }, { status: 400 })
    }
    
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return NextResponse.json({ 
        success: false, 
        message: 'El slug no puede empezar o terminar con guión' 
      }, { status: 400 })
    }
    
    // Construir query para verificar unicidad
    const query: any = { slug, activo: true }
    
    // Excluir la obra actual si se está editando
    if (exclude) {
      query._id = { $ne: exclude }
    }
    
    const existingObra = await Obra.findOne(query)
    
    return NextResponse.json({ 
      success: true, 
      available: !existingObra,
      message: existingObra ? 'Slug ya está en uso' : 'Slug disponible'
    })
    
  } catch (error: any) {
    console.error('Error verificando slug:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
