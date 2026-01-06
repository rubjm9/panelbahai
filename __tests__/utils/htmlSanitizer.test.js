/**
 * Tests de sanitización HTML
 * Fase 3: Importación y Gestión de Datos
 */

const { sanitizeHtml, extractPlainText, isHtmlSafe } = require('../../lib/utils/htmlSanitizer');

describe('sanitizeHtml', () => {
  test('debe preservar tags permitidos', () => {
    const html = '<p>Texto <strong>negrita</strong> y <em>cursiva</em></p>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
  });

  test('debe eliminar scripts', () => {
    const html = '<p>Texto</p><script>alert("xss")</script>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  test('debe eliminar event handlers', () => {
    const html = '<p onclick="alert(1)">Texto</p>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('onclick');
  });

  test('debe preservar blockquotes con clase cita', () => {
    const html = '<blockquote>Texto de cita</blockquote>';
    const result = sanitizeHtml(html);
    expect(result).toContain('class="cita"');
  });

  test('debe eliminar javascript: en hrefs', () => {
    const html = '<a href="javascript:alert(1)">Enlace</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('javascript:');
  });
});

describe('extractPlainText', () => {
  test('debe extraer texto sin tags HTML', () => {
    const html = '<p>Texto <strong>negrita</strong></p>';
    const result = extractPlainText(html);
    expect(result).toBe('Texto negrita');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  test('debe normalizar espacios', () => {
    const html = '<p>Texto   con    espacios</p>';
    const result = extractPlainText(html);
    expect(result).not.toContain('   ');
  });
});

describe('isHtmlSafe', () => {
  test('debe detectar HTML seguro', () => {
    const html = '<p>Texto seguro</p>';
    expect(isHtmlSafe(html)).toBe(true);
  });

  test('debe detectar HTML peligroso con scripts', () => {
    const html = '<script>alert(1)</script>';
    expect(isHtmlSafe(html)).toBe(false);
  });

  test('debe detectar javascript: en hrefs', () => {
    const html = '<a href="javascript:alert(1)">Enlace</a>';
    expect(isHtmlSafe(html)).toBe(false);
  });
});

// Helpers
function expect(condition) {
  return {
    toContain: (substring) => {
      if (!condition.includes(substring)) {
        throw new Error(`Expected "${condition}" to contain "${substring}"`);
      }
    },
    not: {
      toContain: (substring) => {
        if (condition.includes(substring)) {
          throw new Error(`Expected "${condition}" not to contain "${substring}"`);
        }
      }
    },
    toBe: (expected) => {
      if (condition !== expected) {
        throw new Error(`Expected ${condition} to be ${expected}`);
      }
    }
  };
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`   ✅ ${name}`);
  } catch (error) {
    console.error(`   ❌ ${name}: ${error.message}`);
    throw error;
  }
}

// Ejecutar tests si se ejecuta directamente
if (require.main === module) {
  console.log('🧪 Ejecutando tests de sanitización HTML...\n');
  try {
    require('./htmlSanitizer.test.js');
    console.log('\n✅ Todos los tests pasaron');
  } catch (error) {
    console.error('\n❌ Algunos tests fallaron:', error);
    process.exit(1);
  }
}


