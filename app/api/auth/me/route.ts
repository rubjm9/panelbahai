export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = verifyJWT(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
