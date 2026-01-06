/**
 * Servicio de auditoría de accesibilidad
 */

import { checkHeadingHierarchy, checkColorContrast } from '@/lib/utils/accessibility';

export interface AccessibilityAuditResult {
  headings: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  contrast: {
    valid: boolean;
    issues: Array<{
      element: string;
      foreground: string;
      background: string;
      ratio: number;
      level: 'AA' | 'AAA' | 'FAIL';
    }>;
  };
  overall: {
    valid: boolean;
    score: number; // 0-100
  };
}

/**
 * Realiza auditoría completa de accesibilidad de la página
 */
export function auditPageAccessibility(): AccessibilityAuditResult {
  const headings = checkHeadingHierarchy();
  
  // Auditoría de contraste (básica - verifica elementos comunes)
  const contrastIssues: AccessibilityAuditResult['contrast']['issues'] = [];
  
  if (typeof document !== 'undefined') {
    // Verificar contraste en botones, enlaces y texto
    const elementsToCheck = document.querySelectorAll<HTMLElement>(
      'button, a, .btn-primary, .btn-secondary, input, textarea'
    );

    elementsToCheck.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const foreground = styles.color;
      const background = styles.backgroundColor || 
                        styles.backgroundImage || 
                        getBackgroundColor(element);

      // Convertir a hex para validación (simplificado)
      const fgHex = rgbToHex(foreground);
      const bgHex = rgbToHex(background);

      if (fgHex && bgHex) {
        const contrast = checkColorContrast(fgHex, bgHex);
        if (!contrast.valid) {
          contrastIssues.push({
            element: element.tagName.toLowerCase() + (element.className ? `.${element.className}` : ''),
            foreground: fgHex,
            background: bgHex,
            ratio: contrast.ratio,
            level: contrast.level
          });
        }
      }
    });
  }

  const contrast = {
    valid: contrastIssues.length === 0,
    issues: contrastIssues
  };

  // Calcular score general
  let score = 100;
  if (!headings.valid) score -= 30;
  if (headings.warnings.length > 0) score -= 10;
  if (!contrast.valid) score -= 40;
  if (contrast.issues.length > 0) score -= contrast.issues.length * 5;
  score = Math.max(0, score);

  return {
    headings,
    contrast,
    overall: {
      valid: headings.valid && contrast.valid,
      score
    }
  };
}

/**
 * Obtiene el color de fondo de un elemento (incluyendo padres)
 */
function getBackgroundColor(element: HTMLElement): string {
  let current: HTMLElement | null = element;
  
  while (current) {
    const bg = window.getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return bg;
    }
    current = current.parentElement;
  }
  
  return '#ffffff'; // Fallback a blanco
}

/**
 * Convierte color RGB/RGBA a hex
 */
function rgbToHex(rgb: string): string | null {
  if (rgb.startsWith('#')) {
    return rgb;
  }

  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return null;
  }

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}


