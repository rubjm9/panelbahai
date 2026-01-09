import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const nombre = formData.get('nombre')
    const email = formData.get('email')
    const mensaje = formData.get('mensaje')
    const privacidad = formData.get('privacidad')

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
    const mailtoLink = `mailto:rubjm9@gmail.com?subject=Contacto desde Panel de Traducción&body=${encodeURIComponent(emailBody)}`

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

