export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mammoth from 'mammoth';
import multer from 'multer';
import { Readable } from 'stream';
import Autor from '@/models/Autor';
import Obra from '@/models/Obra';
import Seccion from '@/models/Seccion';
import Parrafo from '@/models/Parrafo';
import { rebuildSearchIndexAsync } from '@/utils/search-rebuild';

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Función para parsear el contenido de Word
function parseWordContent(html: string, titulo: string, autorId: string) {
  const sections: Array<{titulo: string, contenido: string}> = [];
  const paragraphs: Array<{numero: number, texto: string, seccion?: string}> = [];
  
  console.log('HTML original de Mammoth:', html); // Debug
  
  // Limpiar HTML pero mantener estructura básica
  let cleanHtml = html
    .replace(/<p[^>]*>/g, '<p>')
    .replace(/<br[^>]*>/g, '\n')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<h([1-6])[^>]*>/g, '\n<h$1>')
    .replace(/<\/h([1-6])>/g, '</h$1>\n');
  
  console.log('HTML limpio:', cleanHtml); // Debug
  
  // Dividir por headers (h1, h2, h3, etc.) y también por párrafos con estilos de título
  const headerRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const titleStyleRegex = /<p[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/p>/gi;
  
  let lastIndex = 0;
  let match;
  let currentSection = '';
  let paragraphNumber = 1;
  
  // Buscar headers HTML estándar
  while ((match = headerRegex.exec(cleanHtml)) !== null) {
    const [fullMatch, level, title] = match;
    const headerIndex = match.index;
    
    // Extraer contenido entre headers
    if (lastIndex < headerIndex) {
      const content = cleanHtml.substring(lastIndex, headerIndex);
      const cleanContent = content
        .replace(/<[^>]*>/g, '') // Remover tags HTML
        .replace(/\n\s*\n/g, '\n\n') // Normalizar saltos de línea
        .trim();
      
      if (cleanContent) {
        if (currentSection) {
          sections.push({
            titulo: currentSection,
            contenido: cleanContent
          });
        }
        
        // Dividir en párrafos respetando saltos de línea
        const paraTexts = cleanContent.split(/\n\s*\n/).filter(p => p.trim());
        paraTexts.forEach(paraText => {
          if (paraText.trim()) {
            paragraphs.push({
              numero: paragraphNumber++,
              texto: paraText.trim(),
              seccion: currentSection || undefined
            });
          }
        });
      }
    }
    
    // Nuevo header encontrado
    currentSection = title.replace(/<[^>]*>/g, '').trim();
    lastIndex = headerIndex + fullMatch.length;
  }
  
  // Si no encontramos headers HTML, buscar párrafos con estilos de título
  if (sections.length === 0) {
    console.log('No se encontraron headers HTML, buscando estilos de título...'); // Debug
    
    // Resetear para buscar por estilos
    lastIndex = 0;
    currentSection = '';
    paragraphNumber = 1;
    
    // Buscar párrafos con estilos de título (bold, font-size grande, etc.)
    const titleParagraphs = cleanHtml.match(/<p[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/p>/gi) || [];
    
    if (titleParagraphs.length > 0) {
      console.log('Títulos encontrados por estilo:', titleParagraphs); // Debug
      
      // Procesar cada título encontrado
      titleParagraphs.forEach((titlePara, index) => {
        const titleMatch = titlePara.match(/<p[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/p>/i);
        if (titleMatch) {
          const titleText = titleMatch[1].replace(/<[^>]*>/g, '').trim();
          if (titleText) {
            currentSection = titleText;
            console.log('Título detectado:', titleText); // Debug
          }
        }
      });
    }
  }
  
  // Procesar contenido después del último header
  if (lastIndex < cleanHtml.length) {
    const content = cleanHtml.substring(lastIndex);
    const cleanContent = content
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/\n\s*\n/g, '\n\n') // Normalizar saltos de línea
      .trim();
    
    if (cleanContent) {
      if (currentSection) {
        sections.push({
          titulo: currentSection,
          contenido: cleanContent
        });
      }
      
      // Dividir en párrafos respetando saltos de línea
      const paraTexts = cleanContent.split(/\n\s*\n/).filter(p => p.trim());
      paraTexts.forEach(paraText => {
        if (paraText.trim()) {
          paragraphs.push({
            numero: paragraphNumber++,
            texto: paraText.trim(),
            seccion: currentSection || undefined
          });
        }
      });
    }
  }
  
  // Si no hay headers, tratar todo como una sección
  if (sections.length === 0 && paragraphs.length === 0) {
    const cleanContent = cleanHtml
      .replace(/<[^>]*>/g, '') // Remover tags HTML
      .replace(/\n\s*\n/g, '\n\n') // Normalizar saltos de línea
      .trim();
    
    if (cleanContent) {
      sections.push({
        titulo: 'Contenido principal',
        contenido: cleanContent
      });
      
      const paraTexts = cleanContent.split(/\n\s*\n/).filter(p => p.trim());
      paraTexts.forEach(paraText => {
        if (paraText.trim()) {
          paragraphs.push({
            numero: paragraphNumber++,
            texto: paraText.trim(),
            seccion: 'Contenido principal'
          });
        }
      });
    }
  }
  
  console.log('Secciones encontradas:', sections); // Debug
  console.log('Párrafos encontrados:', paragraphs.length); // Debug
  
  return { sections, paragraphs, cleanHtml };
}

export async function POST(request: NextRequest) {
  try {
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
    
    if (!file || !titulo || !autorId) {
      return NextResponse.json(
        { success: false, error: 'Archivo, título y autor son requeridos' },
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
    
    // Convertir archivo a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convertir Word a HTML usando mammoth con configuración mejorada
    const result = await mammoth.convertToHtml({ 
      buffer,
      styleMap: [
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h3:fresh", 
        "p[style-name='Heading 3'] => h4:fresh",
        "p[style-name='Heading 4'] => h5:fresh",
        "p[style-name='Heading 5'] => h6:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "p[style-name='Título 1'] => h2:fresh",
        "p[style-name='Título 2'] => h3:fresh",
        "p[style-name='Título 3'] => h4:fresh",
        "p[style-name='Título 4'] => h5:fresh",
        "p[style-name='Título 5'] => h6:fresh",
        "p[style-name='Título 6'] => h6:fresh"
      ]
    });
    const html = result.value;
    
    console.log('HTML convertido por Mammoth:', html); // Debug
    
    // Parsear contenido
    const { sections, paragraphs, cleanHtml } = parseWordContent(html, titulo, autorId);
    
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
    while (await Obra.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    
    // Crear la obra
    const obra = new Obra({
      titulo,
      slug,
      autor: autorId,
      descripcion: descripcion || '',
      orden,
      fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : undefined,
      estado,
      esPublico,
      contenido: cleanHtml, // Guardar el contenido HTML completo
      archivoDoc: file.name, // Guardar el nombre del archivo original
      activo: true
    });
    
    await obra.save();
    
    // Crear secciones
    const seccionesCreadas = [];
    for (const sectionData of sections) {
      const seccionSlug = sectionData.titulo.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      const seccion: any = new Seccion({
        titulo: sectionData.titulo,
        slug: seccionSlug,
        obra: obra._id,
        nivel: 1,
        orden: seccionesCreadas.length + 1,
        activo: true
      });
      
      await seccion.save();
      seccionesCreadas.push(seccion);
    }
    
    // Crear párrafos
    const parrafosCreados = [];
    for (const paraData of paragraphs) {
      const seccion = paraData.seccion ? 
        seccionesCreadas.find(s => s.titulo === paraData.seccion) : 
        null;
      
      const parrafo = new Parrafo({
        numero: paraData.numero,
        texto: paraData.texto,
        obra: obra._id,
        seccion: seccion?._id,
        orden: paraData.numero,
        activo: true
      });
      
      await parrafo.save();
      parrafosCreados.push(parrafo);
    }
    
    // Populate autor para la respuesta
    await obra.populate('autor', 'nombre slug');
    
    // Reconstruir índice de búsqueda automáticamente
    rebuildSearchIndexAsync();
    
    return NextResponse.json({
      success: true,
      data: {
        obra,
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
    
  } catch (error) {
    console.error('Error importing Word document:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

