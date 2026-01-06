export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/auth-helpers';
import { adminAPIRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit';
import {
  publishObra,
  unpublishObra,
  changePublicationState
} from '@/lib/services/admin/publicationService';

/**
 * POST /api/admin/obras/[id]/publish
 * Publica una obra
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdminAPI();
    
    // Rate limiting
    const identifier = getRateLimitIdentifier(request, user.id);
    const rateLimitResult = await checkRateLimit(adminAPIRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const obraId = params.id;
    const obra = await publishObra(obraId, user.id);

    return NextResponse.json({
      success: true,
      data: obra
    });
  } catch (error: any) {
    console.error('Error publicando obra:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al publicar obra' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/obras/[id]/publish
 * Despublica una obra
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdminAPI();
    
    // Rate limiting
    const identifier = getRateLimitIdentifier(request, user.id);
    const rateLimitResult = await checkRateLimit(adminAPIRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const obraId = params.id;
    const obra = await unpublishObra(obraId, user.id);

    return NextResponse.json({
      success: true,
      data: obra
    });
  } catch (error: any) {
    console.error('Error despublicando obra:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al despublicar obra' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/obras/[id]/publish
 * Cambia el estado de publicación de una obra
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdminAPI();
    
    // Rate limiting
    const identifier = getRateLimitIdentifier(request, user.id);
    const rateLimitResult = await checkRateLimit(adminAPIRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const obraId = params.id;
    const body = await request.json();
    const { estado, esPublico } = body;

    if (!estado || !['publicado', 'borrador', 'archivado'].includes(estado)) {
      return NextResponse.json(
        { success: false, error: 'Estado inválido' },
        { status: 400 }
      );
    }

    if (typeof esPublico !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'esPublico debe ser un booleano' },
        { status: 400 }
      );
    }

    const obra = await changePublicationState(obraId, estado, esPublico, user.id);

    return NextResponse.json({
      success: true,
      data: obra
    });
  } catch (error: any) {
    console.error('Error cambiando estado de publicación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al cambiar estado de publicación' 
      },
      { status: 500 }
    );
  }
}


