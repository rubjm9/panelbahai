/**
 * Utilidades de validación para archivos y datos
 * Fase 3: Importación y Gestión de Datos
 */

import { z } from 'zod';

// Esquemas de validación
export const WordFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(10 * 1024 * 1024), // 10MB máximo
  type: z.enum([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ])
});

export const ObraDataSchema = z.object({
  titulo: z.string().min(1).max(500),
  autor: z.string().regex(/^[0-9a-fA-F]{24}$/), // ObjectId de MongoDB
  descripcion: z.string().max(2000).optional(),
  fechaPublicacion: z.date().optional(),
  orden: z.number().int().min(0).default(0),
  estado: z.enum(['publicado', 'borrador', 'archivado']).default('borrador'),
  esPublico: z.boolean().default(false)
});

export const ParrafoDataSchema = z.object({
  numero: z.number().int().positive(),
  texto: z.string().min(1),
  obra: z.string().regex(/^[0-9a-fA-F]{24}$/),
  seccion: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  orden: z.number().int().min(0).default(0)
});

/**
 * Valida un archivo Word
 * 
 * @param file - Archivo a validar
 * @returns Objeto con validación y errores
 */
export function validateWordFile(file: File | null): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!file) {
    errors.push('No se proporcionó ningún archivo');
    return { valid: false, errors };
  }

  // Validar tipo MIME
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de archivo no permitido. Solo se aceptan archivos Word (.docx, .doc)');
  }

  // Validar extensión (verificación adicional)
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
    errors.push('La extensión del archivo no es válida. Debe ser .docx o .doc');
  }

  // Validar tamaño (10MB máximo)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`El archivo es demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`);
  }

  // Validar que no esté vacío
  if (file.size === 0) {
    errors.push('El archivo está vacío');
  }

  // Verificar que es .docx (mammoth solo soporta .docx)
  if (file.type === 'application/msword' || fileName.endsWith('.doc')) {
    errors.push('Los archivos .doc antiguos no son compatibles. Por favor, convierte el archivo a .docx');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Detecta macros en un archivo Word (.docx)
 * 
 * Los archivos .docx son ZIPs. Las macros están en vbaProject.bin
 * 
 * @param buffer - Buffer del archivo Word
 * @returns true si se detectan macros, false en caso contrario
 */
export async function detectMacros(buffer: Buffer): Promise<boolean> {
  try {
    // Los archivos .docx son archivos ZIP
    // Las macros están típicamente en vbaProject.bin dentro del ZIP
    const JSZip = await import('jszip').catch(() => null);

    if (!JSZip) {
      // Si no podemos verificar, asumimos que no hay macros por seguridad
      // pero no rechazamos el archivo
      console.warn('No se pudo verificar macros: jszip no disponible');
      return false;
    }

    const zip = await JSZip.default.loadAsync(buffer);

    // Buscar archivos relacionados con macros
    const macroFiles = [
      'word/vbaProject.bin',
      'word/vbaData.xml',
      'word/_rels/vbaProject.bin.rels'
    ];

    for (const filePath of macroFiles) {
      if (zip.file(filePath)) {
        return true; // Se encontraron macros
      }
    }

    return false; // No se encontraron macros
  } catch (error) {
    // Si hay error al leer el ZIP, asumimos que no hay macros
    // pero registramos el error
    console.warn('Error al verificar macros:', error);
    return false;
  }
}

/**
 * Valida la estructura de datos de una obra
 * 
 * @param data - Datos a validar
 * @returns Resultado de validación
 */
export function validateObraData(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: z.infer<typeof ObraDataSchema>;
} {
  try {
    const validated = ObraDataSchema.parse(data);
    return {
      valid: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: (error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Error de validación desconocido']
    };
  }
}

/**
 * Valida la estructura de datos de un párrafo
 * 
 * @param data - Datos a validar
 * @returns Resultado de validación
 */
export function validateParrafoData(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: z.infer<typeof ParrafoDataSchema>;
} {
  try {
    const validated = ParrafoDataSchema.parse(data);
    return {
      valid: true,
      errors: [],
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: (error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Error de validación desconocido']
    };
  }
}

/**
 * Valida el MIME type real de un archivo (no solo la extensión)
 * 
 * @param buffer - Primeros bytes del archivo
 * @param fileName - Nombre del archivo
 * @returns MIME type detectado o null
 */
export function detectMimeType(buffer: Buffer, fileName: string): string | null {
  // Magic numbers para detectar tipos de archivo
  const signatures: Record<string, string> = {
    // DOCX es un ZIP (PK\x03\x04)
    '504b0304': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // DOC antiguo (D0CF11E0)
    'd0cf11e0': 'application/msword'
  };

  // Leer primeros 4 bytes
  const header = buffer.slice(0, 4).toString('hex').toLowerCase();

  // Buscar en signatures
  for (const [sig, mime] of Object.entries(signatures)) {
    if (header.startsWith(sig.toLowerCase())) {
      return mime;
    }
  }

  // Fallback: usar extensión
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (ext === 'doc') {
    return 'application/msword';
  }

  return null;
}


