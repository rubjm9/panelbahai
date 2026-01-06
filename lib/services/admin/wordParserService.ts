/**
 * Servicio de parsing de documentos Word
 * Fase 3: Importación y Gestión de Datos
 * 
 * Extrae y parsea contenido de documentos Word (.docx) de forma segura
 */

import mammoth from 'mammoth';
import { sanitizeHtml, extractPlainText } from '@/lib/utils/htmlSanitizer';
import { validateWordFile, detectMacros, detectMimeType } from '@/lib/utils/validation';

export interface ParsedSection {
  titulo: string;
  contenido: string;
  nivel: number;
}

export interface ParsedParagraph {
  numero: number;
  texto: string;
  seccion?: string;
}

export interface ParsedWordResult {
  sections: ParsedSection[];
  paragraphs: ParsedParagraph[];
  cleanHtml: string;
}

export interface WordParseOptions {
  titulo?: string;
  autorId?: string;
  validateMacros?: boolean;
}

/**
 * Parsea un documento Word y extrae su contenido estructurado
 * 
 * @param file - Archivo Word a parsear
 * @param options - Opciones de parsing
 * @returns Resultado parseado con secciones y párrafos
 * @throws Error si el archivo no es válido o contiene macros
 */
export async function parseWordDocument(
  file: File,
  options: WordParseOptions = {}
): Promise<ParsedWordResult> {
  // Validar archivo
  const validation = validateWordFile(file);
  if (!validation.valid) {
    throw new Error(`Archivo inválido: ${validation.errors.join(', ')}`);
  }

  // Convertir a buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validar MIME type real (no solo extensión)
  const detectedMime = detectMimeType(buffer, file.name);
  if (!detectedMime || !detectedMime.includes('word')) {
    throw new Error('El archivo no parece ser un documento Word válido');
  }

  // Detectar macros si está habilitado
  if (options.validateMacros !== false) {
    const hasMacros = await detectMacros(buffer);
    if (hasMacros) {
      throw new Error('El archivo contiene macros. Por seguridad, los archivos con macros no están permitidos');
    }
  }

  // Convertir Word a HTML usando mammoth
  const result = await mammoth.convertToHtml({ buffer }, {
    styleMap: [
      // Títulos en inglés
      "p[style-name='Heading 1'] => h2:fresh",
      "p[style-name='Heading 2'] => h3:fresh",
      "p[style-name='Heading 3'] => h4:fresh",
      "p[style-name='Heading 4'] => h5:fresh",
      "p[style-name='Heading 5'] => h6:fresh",
      "p[style-name='Heading 6'] => h6:fresh",
      // Títulos en español
      "p[style-name='Título 1'] => h2:fresh",
      "p[style-name='Título 2'] => h3:fresh",
      "p[style-name='Título 3'] => h4:fresh",
      "p[style-name='Título 4'] => h5:fresh",
      "p[style-name='Título 5'] => h6:fresh",
      "p[style-name='Título 6'] => h6:fresh",
      // Citas y blockquotes
      "p[style-name='Quote'] => blockquote:fresh",
      "p[style-name='Cita'] => blockquote:fresh",
      "p[style-name='Block Quote'] => blockquote:fresh",
      "p[style-name='Block Text'] => blockquote:fresh",
    ]
  });

  const html = result.value;

  // Advertencias de mammoth (formato no reconocido, etc.)
  if (result.messages.length > 0) {
    console.warn('Advertencias de Mammoth:', result.messages);
  }

  // Parsear contenido
  return parseWordContent(html, options.titulo || '', options.autorId || '');
}

/**
 * Parsea el contenido HTML extraído de Word
 * 
 * @param html - HTML generado por mammoth
 * @param titulo - Título de la obra (opcional)
 * @param autorId - ID del autor (opcional)
 * @returns Contenido estructurado
 */
function parseWordContent(
  html: string,
  titulo: string,
  autorId: string
): ParsedWordResult {
  const sections: ParsedSection[] = [];
  const paragraphs: ParsedParagraph[] = [];

  // Sanitizar HTML
  let processedHtml = sanitizeHtml(html);
  processedHtml = processHtmlContent(processedHtml);

  // Dividir por headers (h2, h3, h4, etc.)
  const headerRegex = /<h([2-6])[^>]*>(.*?)<\/h[2-6]>/gi;

  let lastIndex = 0;
  let match;
  let currentSection: { titulo: string; nivel: number } | null = null;
  let paragraphNumber = 1;
  const sectionStack: Array<{ titulo: string; nivel: number }> = [];

  // Buscar headers HTML
  while ((match = headerRegex.exec(processedHtml)) !== null) {
    const [fullMatch, level, titleHtml] = match;
    const headerIndex = match.index;
    const levelNum = parseInt(level);

    // Extraer texto del título
    const titleText = extractPlainText(titleHtml).trim();

    // Procesar contenido entre headers
    if (lastIndex < headerIndex) {
      const content = processedHtml.substring(lastIndex, headerIndex);
      const paragraphsInSection = extractParagraphs(content, currentSection?.titulo || null);

      paragraphsInSection.forEach(para => {
        paragraphs.push({
          numero: paragraphNumber++,
          texto: para,
          seccion: currentSection?.titulo || undefined
        });
      });
    }

    // Manejar jerarquía de secciones
    while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].nivel >= levelNum) {
      sectionStack.pop();
    }

    // Crear nueva sección
    currentSection = {
      titulo: titleText,
      nivel: levelNum
    };
    sectionStack.push(currentSection);

    // Guardar sección
    sections.push({
      titulo: titleText,
      contenido: '',
      nivel: levelNum
    });

    lastIndex = headerIndex + fullMatch.length;
  }

  // Procesar contenido después del último header
  if (lastIndex < processedHtml.length) {
    const content = processedHtml.substring(lastIndex);
    const paragraphsInSection = extractParagraphs(content, currentSection?.titulo || null);

    paragraphsInSection.forEach(para => {
      paragraphs.push({
        numero: paragraphNumber++,
        texto: para,
        seccion: currentSection?.titulo || undefined
      });
    });
  }

  // Si no hay headers, tratar todo como una sección
  if (sections.length === 0 && paragraphs.length === 0) {
    const paragraphsInContent = extractParagraphs(processedHtml, null);

    if (paragraphsInContent.length > 0) {
      sections.push({
        titulo: 'Contenido principal',
        contenido: '',
        nivel: 1
      });

      paragraphsInContent.forEach(para => {
        paragraphs.push({
          numero: paragraphNumber++,
          texto: para,
          seccion: 'Contenido principal'
        });
      });
    }
  }

  return { sections, paragraphs, cleanHtml: processedHtml };
}

/**
 * Procesa y normaliza el contenido HTML
 */
function processHtmlContent(html: string): string {
  // Normalizar espacios y saltos de línea
  let processed = html
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n'); // Máximo 2 saltos de línea seguidos

  // Asegurar que los blockquotes tengan la clase apropiada
  processed = processed.replace(/<blockquote([^>]*)>/gi, '<blockquote class="cita"$1>');

  // Normalizar párrafos vacíos
  processed = processed.replace(/<p[^>]*>\s*<\/p>/gi, '');

  return processed;
}

/**
 * Extrae párrafos preservando formato HTML
 */
function extractParagraphs(html: string, currentSection: string | null): string[] {
  const paragraphs: string[] = [];

  if (!html || html.trim().length === 0) {
    return paragraphs;
  }

  // Buscar todos los párrafos y blockquotes
  const elementRegex = /<(p|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  const foundElements: Array<{ start: number; end: number; tag: string; content: string }> = [];

  while ((match = elementRegex.exec(html)) !== null) {
    foundElements.push({
      start: match.index,
      end: match.index + match[0].length,
      tag: match[1],
      content: match[2]
    });
  }

  // Procesar elementos encontrados
  foundElements.forEach(element => {
    let processedContent = element.content.trim();

    // Si es un blockquote, asegurar que tenga la clase
    if (element.tag === 'blockquote') {
      processedContent = `<blockquote class="cita">${processedContent}</blockquote>`;
    } else {
      // Normalizar párrafo - preservar formato interno
      processedContent = `<p>${processedContent}</p>`;
    }

    // Solo agregar si tiene contenido
    const textContent = extractPlainText(processedContent);
    if (textContent.trim().length > 0) {
      paragraphs.push(processedContent);
    }
  });

  // Si no encontramos párrafos estructurados, intentar dividir por saltos de línea
  if (paragraphs.length === 0) {
    const textParts = html
      .split(/(<[^>]+>)/g)
      .filter(part => {
        if (part.trim().length === 0) return false;
        if (part.startsWith('<') && part.endsWith('>')) return false;
        return true;
      });

    // Agrupar texto continuo en párrafos
    let currentParagraph = '';
    textParts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length > 0) {
        if (currentParagraph.length > 0) {
          currentParagraph += ' ' + trimmed;
        } else {
          currentParagraph = trimmed;
        }
      } else if (currentParagraph.length > 0) {
        paragraphs.push(`<p>${currentParagraph}</p>`);
        currentParagraph = '';
      }
    });

    // Agregar último párrafo si existe
    if (currentParagraph.length > 0) {
      paragraphs.push(`<p>${currentParagraph}</p>`);
    }
  }

  // Si aún no hay párrafos, tratar todo el HTML como un párrafo
  if (paragraphs.length === 0) {
    const textContent = extractPlainText(html);
    if (textContent.trim().length > 0) {
      let processed = html.trim();
      // Si no tiene tags de párrafo, agregarlos
      if (!processed.match(/^<[^>]+>/)) {
        processed = `<p>${processed}</p>`;
      }
      paragraphs.push(processed);
    }
  }

  return paragraphs;
}


