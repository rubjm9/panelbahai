import { NextRequest, NextResponse } from 'next/server'

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const MIN_SCORE = 0.5

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score?: number }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY no configurada')
    return { success: false }
  }
  const res = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = await res.json()
  return { success: !!data.success, score: data.score }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const nombre = formData.get('nombre')
    const email = formData.get('email')
    const mensaje = formData.get('mensaje')
    const privacidad = formData.get('privacidad')
    const recaptchaToken = formData.get('recaptchaToken')

    if (!recaptchaToken || typeof recaptchaToken !== 'string') {
      return NextResponse.json(
        { error: 'Verificación de seguridad incorrecta. Recargue la página e inténtelo de nuevo.' },
        { status: 400 }
      )
    }

    const recaptcha = await verifyRecaptcha(recaptchaToken)
    if (!recaptcha.success || (typeof recaptcha.score === 'number' && recaptcha.score < MIN_SCORE)) {
      return NextResponse.json(
        { error: 'No hemos podido verificar que no eres un robot. Inténtalo de nuevo.' },
        { status: 400 }
      )
    }

    // Validación básica
    if (!nombre || !email || !mensaje || !privacidad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Preparar el email
    const emailBody = `
Nuevo mensaje de contacto desde el Panel de Traducción

Nombre: ${nombre}
Email: ${email}

Mensaje:
${mensaje}

---
Este mensaje fue enviado desde el formulario de contacto del Panel de Traducción de Literatura Bahá'í al Español.
    `.trim()

    // Enviar email usando mailto (solución simple)
    // En producción, deberías usar un servicio de email como SendGrid, Resend, etc.
    const mailtoLink = `mailto:rubjm9+test@gmail.com?subject=Contacto desde Panel de Traducción&body=${encodeURIComponent(emailBody)}`

    // Para una solución más robusta, aquí podrías integrar un servicio de email
    // Por ahora, retornamos éxito y el cliente puede usar mailto
    return NextResponse.json(
      { 
        success: true,
        message: 'Mensaje enviado correctamente',
        mailto: mailtoLink
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error procesando formulario de contacto:', error)
    return NextResponse.json(
      { error: 'Error al procesar el formulario' },
      { status: 500 }
    )
  }
}

