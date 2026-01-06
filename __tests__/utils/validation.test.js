/**
 * Tests de validación
 * Fase 3: Importación y Gestión de Datos
 */

const { validateWordFile, detectMimeType } = require('../../lib/utils/validation');

// Mock de File para Node.js
class MockFile {
  constructor(name, type, size) {
    this.name = name;
    this.type = type;
    this.size = size;
  }
}

describe('validateWordFile', () => {
  test('debe aceptar archivo .docx válido', () => {
    const file = new MockFile(
      'test.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      1024 * 1024 // 1MB
    );
    
    const result = validateWordFile(file);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('debe rechazar archivo sin tipo MIME válido', () => {
    const file = new MockFile('test.txt', 'text/plain', 1024);
    
    const result = validateWordFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar archivo demasiado grande', () => {
    const file = new MockFile(
      'test.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      11 * 1024 * 1024 // 11MB
    );
    
    const result = validateWordFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('grande'))).toBe(true);
  });

  test('debe rechazar archivo .doc antiguo', () => {
    const file = new MockFile(
      'test.doc',
      'application/msword',
      1024 * 1024
    );
    
    const result = validateWordFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('.docx'))).toBe(true);
  });

  test('debe rechazar archivo null', () => {
    const result = validateWordFile(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('detectMimeType', () => {
  test('debe detectar DOCX por magic number', () => {
    // Magic number de ZIP (DOCX es un ZIP)
    const buffer = Buffer.from('504b0304', 'hex');
    const mime = detectMimeType(buffer, 'test.docx');
    expect(mime).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });

  test('debe detectar DOC por magic number', () => {
    // Magic number de DOC antiguo
    const buffer = Buffer.from('d0cf11e0', 'hex');
    const mime = detectMimeType(buffer, 'test.doc');
    expect(mime).toBe('application/msword');
  });

  test('debe usar extensión como fallback', () => {
    const buffer = Buffer.from('invalid');
    const mime = detectMimeType(buffer, 'test.docx');
    expect(mime).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });
});

// Función helper para ejecutar tests
function expect(condition) {
  return {
    toBe: (expected) => {
      if (condition !== expected) {
        throw new Error(`Expected ${condition} to be ${expected}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (condition <= expected) {
        throw new Error(`Expected ${condition} to be greater than ${expected}`);
      }
    },
    some: (predicate) => {
      return condition.some(predicate);
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
  console.log('🧪 Ejecutando tests de validación...\n');
  try {
    require('./validation.test.js');
    console.log('\n✅ Todos los tests pasaron');
  } catch (error) {
    console.error('\n❌ Algunos tests fallaron:', error);
    process.exit(1);
  }
}


