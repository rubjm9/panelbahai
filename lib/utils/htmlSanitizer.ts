/**
 * Sanitizador HTML robusto
 * Fase 3: Importación y Gestión de Datos
 * 
 * Usa DOMPurify para sanitización estricta de HTML
 */

import DOMPurify from 'isomorphic-dompurify';

// Whitelist estricto de tags permitidos
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'blockquote', 'a', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
];

// Whitelist estricto de atributos permitidos
const ALLOWED_ATTR = [
  'href',      // Para enlaces
  'class',     // Para clases CSS (ej: blockquote class="cita")
  'id'         // Para anclas
];

// Configuración de DOMPurify
const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

/**
 * Sanitiza HTML eliminando contenido peligroso
 * 
 * @param html - HTML a sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Primera pasada: sanitización con DOMPurify
  let sanitized = DOMPurify.sanitize(html, PURIFY_CONFIG);

  // Segunda pasada: limpieza adicional manual
  sanitized = additionalCleanup(sanitized);

  return sanitized;
}

/**
 * Limpieza adicional manual para casos edge
 * 
 * @param html - HTML ya sanitizado por DOMPurify
 * @returns HTML con limpieza adicional
 */
function additionalCleanup(html: string): string {
  // Remover event handlers que puedan haber escapado
  let cleaned = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remover javascript: en hrefs (DOMPurify debería hacerlo, pero por seguridad)
  cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  cleaned = cleaned.replace(/href\s*=\s*["']data:[^"']*["']/gi, '');

  // Normalizar espacios y saltos de línea
  cleaned = cleaned.replace(/\r\n/g, '\n');
  cleaned = cleaned.replace(/\r/g, '\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Asegurar que blockquotes tengan la clase "cita"
  cleaned = cleaned.replace(/<blockquote([^>]*)>/gi, (match, attrs) => {
    if (!attrs || !attrs.includes('class')) {
      return '<blockquote class="cita">';
    }
    if (!attrs.includes('class="cita"') && !attrs.includes("class='cita'")) {
      return match.replace(/class\s*=\s*["'][^"']*["']/gi, 'class="cita"');
    }
    return match;
  });

  // Normalizar párrafos vacíos
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, '');

  // Remover atributos no permitidos de tags permitidos
  cleaned = cleaned.replace(/<(\w+)([^>]*)>/gi, (match, tag, attrs) => {
    if (!ALLOWED_TAGS.includes(tag.toLowerCase())) {
      return ''; // Remover tag no permitido
    }

    // Filtrar atributos permitidos
    const allowedAttrs: string[] = [];
    const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2];

      if (ALLOWED_ATTR.includes(attrName)) {
        // Validar href especialmente
        if (attrName === 'href') {
          // Solo permitir http, https, mailto, tel
          if (/^(https?|mailto|tel):/i.test(attrValue)) {
            allowedAttrs.push(`${attrName}="${attrValue}"`);
          }
        } else {
          allowedAttrs.push(`${attrName}="${attrValue}"`);
        }
      }
    }

    return allowedAttrs.length > 0
      ? `<${tag} ${allowedAttrs.join(' ')}>`
      : `<${tag}>`;
  });

  return cleaned;
}

/**
 * Extrae texto plano del HTML (para búsqueda)
 * 
 * @param html - HTML del que extraer texto
 * @returns Texto plano
 */
export function extractPlainText(html: string): string {
  if (!html) return '';

  // Remover todos los tags HTML
  let text = html.replace(/<[^>]*>/g, '');

  // Reemplazar entidades HTML
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");

  // Normalizar espacios
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Valida que el HTML sanitizado no contenga contenido peligroso
 * 
 * @param html - HTML a validar
 * @returns true si es seguro, false en caso contrario
 */
export function isHtmlSafe(html: string): boolean {
  if (!html) return true;

  // Buscar patrones peligrosos
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /data:text\/html/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      return false;
    }
  }

  return true;
}


