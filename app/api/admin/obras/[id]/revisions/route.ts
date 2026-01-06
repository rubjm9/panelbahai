export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAPI } from '@/lib/auth-helpers';
import { adminAPIRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit';
import {
  listObraRevisions,
  getObraRevision,
  createObraRevision,
  revertObraToRevision
} from '@/lib/services/admin/revisionService';

/**
 * GET /api/admin/obras/[id]/revisions
 * Lista todas las revisiones de una obra
 */
export async function GET(
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
    const revisiones = await listObraRevisions(obraId);

    return NextResponse.json({
      success: true,
      data: revisiones
    });
  } catch (error: any) {
    console.error('Error listando revisiones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al listar revisiones' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/obras/[id]/revisions
 * Crea una nueva revisión manualmente
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
    const body = await request.json();
    const cambios = body.cambios || 'Revisión manual';

    const revision = await createObraRevision(obraId, user.id, cambios);

    return NextResponse.json({
      success: true,
      data: revision
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creando revisión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al crear revisión' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/obras/[id]/revisions
 * Revierte una obra a una versión específica
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
    const version = body.version;

    if (!version || typeof version !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Versión requerida' },
        { status: 400 }
      );
    }

    const obra = await revertObraToRevision(obraId, version, user.id);

    return NextResponse.json({
      success: true,
      data: obra
    });
  } catch (error: any) {
    console.error('Error revirtiendo revisión:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al revertir revisión' 
      },
      { status: 500 }
    );
  }
}


