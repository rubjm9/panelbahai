export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Autor from '@/models/Autor';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild';
import { uploadFile } from '@/lib/gridfs';
import { requireAdminAPI } from '@/lib/auth-helpers';
import { adminAPIRateLimit, getRateLimitIdentifier, checkRateLimit } from '@/lib/rateLimit';
import { parseWordDocument } from '@/lib/services/admin/wordParserService';
import { validateWordFile } from '@/lib/utils/validation';
import { v4 as uuidv4 } from 'uuid';
import { createObraRevision, createParrafoRevision } from '@/lib/services/admin/revisionService';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación admin (defensa en profundidad)
    const user = await requireAdminAPI()
    
    // Rate limiting: 100 requests por minuto por usuario
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
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }
    
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const titulo = formData.get('titulo') as string;
    const autorId = formData.get('autorId') as string;
    const descripcion = formData.get('descripcion') as string;
    const orden = parseInt(formData.get('orden') as string) || 0;
    const fechaPublicacion = formData.get('fechaPublicacion') as string;
    const estado = formData.get('estado') as string || 'borrador';
    const esPublico = formData.get('esPublico') === 'true';
    
    // Validar campos requeridos
    if (!file || !titulo || !autorId) {
      return NextResponse.json(
        { success: false, error: 'Archivo, título y autor son requeridos' },
        { status: 400 }
      );
    }
    
    // Validar archivo usando utilidades de validación
    const fileValidation = validateWordFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, error: fileValidation.errors.join('. ') },
        { status: 400 }
      );
    }
    
    // Verificar que el autor existe
    const autor = await Autor.findById(autorId);
    if (!autor) {
      return NextResponse.json(
        { success: false, error: 'Autor no encontrado' },
        { status: 400 }
      );
    }
    
    // Parsear documento Word usando el servicio
    let parsedResult;
    try {
      parsedResult = await parseWordDocument(file, {
        titulo,
        autorId,
        validateMacros: true
      });
    } catch (parseError: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: parseError.message || 'Error al procesar el documento Word' 
        },
        { status: 400 }
      );
    }
    
    const { sections, paragraphs, cleanHtml } = parsedResult;
    
    if (paragraphs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se pudo extraer contenido del documento' },
        { status: 400 }
      );
    }
    
    // Generar slug único para la obra
    let slug = titulo.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    let counter = 1;
    let originalSlug = slug;
    while (await Obra.findOne({ autor: autorId, slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    
    // Generar UUID para la obra
    const obraUuid = uuidv4();
    
    // Crear la obra
    const obra = new Obra({
      titulo,
      slug,
      uuid: obraUuid,
      autor: autorId,
      descripcion: descripcion || '',
      orden,
      fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : undefined,
      estado,
      esPublico,
      contenido: cleanHtml,
      activo: true
    });
    
    await obra.save();
    
    // Crear revisión inicial
    try {
      await createObraRevision(obra._id.toString(), user.id, 'Importación inicial desde Word');
    } catch (revisionError) {
      console.warn('Error creando revisión inicial:', revisionError);
      // No fallar la importación si la revisión falla
    }
    
    // Subir el archivo Word a GridFS
    try {
      const fileId = await uploadFile(file, {
        obraId: obra._id.toString(),
        tipo: 'doc',
        filename: file.name
      });
      obra.archivoDoc = fileId;
      await obra.save();
    } catch (fileError) {
      console.error('Error subiendo archivo Word a GridFS:', fileError);
      // No fallar la importación si hay error con el archivo
    }
    
    // Crear secciones con UUIDs
    const seccionesCreadas = [];
    for (const sectionData of sections) {
      const seccionSlug = sectionData.titulo.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      const seccion = new Seccion({
        titulo: sectionData.titulo,
        slug: seccionSlug,
        uuid: uuidv4(),
        obra: obra._id,
        nivel: sectionData.nivel || 1,
        orden: seccionesCreadas.length + 1,
        activo: true
      });
      
      await seccion.save();
      seccionesCreadas.push(seccion);
    }
    
    // Crear párrafos con UUIDs y revisiones
    const parrafosCreados = [];
    for (const paraData of paragraphs) {
      const seccion = paraData.seccion ? 
        seccionesCreadas.find(s => s.titulo === paraData.seccion) : 
        null;
      
      const parrafoUuid = uuidv4();
      const parrafo = new Parrafo({
        numero: paraData.numero,
        texto: paraData.texto,
        uuid: parrafoUuid,
        obra: obra._id,
        seccion: seccion?._id,
        orden: paraData.numero,
        activo: true
      });
      
      await parrafo.save();
      
      // Crear revisión inicial del párrafo
      try {
        await createParrafoRevision(parrafo._id.toString(), user.id, 'Importación inicial desde Word');
      } catch (revisionError) {
        console.warn('Error creando revisión inicial del párrafo:', revisionError);
        // No fallar la importación si la revisión falla
      }
      
      parrafosCreados.push(parrafo);
    }
    
    // Populate autor para la respuesta
    await obra.populate('autor', 'nombre slug');
    
    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();
    
    return NextResponse.json({
      success: true,
      data: {
        obra: {
          _id: obra._id.toString(),
          titulo: obra.titulo,
          slug: obra.slug,
          uuid: obra.uuid,
          estado: obra.estado,
          esPublico: obra.esPublico
        },
        secciones: seccionesCreadas.length,
        parrafos: parrafosCreados.length,
        resumen: {
          titulo: obra.titulo,
          autor: (obra.autor as any).nombre,
          secciones: seccionesCreadas.length,
          parrafos: parrafosCreados.length
        }
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error importing Word document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
