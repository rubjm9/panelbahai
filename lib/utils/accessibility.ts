/**
 * Utilidades de accesibilidad
 */

/**
 * Valida jerarquía de headings (h1-h6)
 */
export function checkHeadingHierarchy(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof document === 'undefined') {
    return { valid: true, errors: [], warnings: [] };
  }

  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  if (headings.length === 0) {
    warnings.push('No se encontraron headings en la página');
    return { valid: false, errors, warnings };
  }

  // Verificar que haya al menos un h1
  const h1Count = headings.filter(h => h.tagName === 'H1').length;
  if (h1Count === 0) {
    errors.push('No se encontró ningún h1 en la página');
  } else if (h1Count > 1) {
    warnings.push(`Se encontraron ${h1Count} elementos h1. Debería haber solo uno.`);
  }

  // Verificar jerarquía
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    
    if (index === 0 && level !== 1) {
      warnings.push(`El primer heading debería ser h1, pero es ${heading.tagName.toLowerCase()}`);
    }

    // Verificar que no se salte niveles (ej: h1 -> h3)
    if (previousLevel > 0 && level > previousLevel + 1) {
      errors.push(
        `Jerarquía incorrecta: ${heading.tagName.toLowerCase()} después de h${previousLevel}. ` +
        `Se saltó el nivel h${previousLevel + 1}`
      );
    }

    previousLevel = level;
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Obtiene todos los elementos enfocables
 */
export function getFocusableElements(container?: HTMLElement): HTMLElement[] {
  const root = container || document;
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Atrapa el focus dentro de un contenedor (útil para modales)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {
    return () => {};
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  firstElement.focus();

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Valida contraste de color (WCAG AA)
 * Retorna true si el contraste es suficiente
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { valid: boolean; ratio: number; level: 'AA' | 'AAA' | 'FAIL' } {
  // Convertir colores a RGB
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { valid: false, ratio: 0, level: 'FAIL' };
  }

  // Calcular luminancia relativa
  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);

  // Calcular ratio de contraste
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande
  // WCAG AAA: 7:1 para texto normal, 4.5:1 para texto grande
  let level: 'AA' | 'AAA' | 'FAIL' = 'FAIL';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  }

  return {
    valid: ratio >= 4.5,
    ratio,
    level
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}


