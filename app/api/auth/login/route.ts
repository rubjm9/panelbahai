import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import { verifyPassword, signJWT } from '@/lib/auth';
import { loginRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos cada 15 minutos por IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(loginRateLimit, identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ 
      email: email.toLowerCase(), 
      activo: true 
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, usuario.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = signJWT({
      id: usuario._id.toString(),
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol
    });

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: usuario._id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol
        },
        token
      }
    });

    // Establecer cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
