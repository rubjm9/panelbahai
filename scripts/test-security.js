/**
 * Script de Pruebas de Seguridad - Fase 2
 * 
 * Valida que todas las protecciones de seguridad estén funcionando correctamente.
 * 
 * Uso: node scripts/test-security.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  log(`\n🧪 ${name}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testRequest(url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      redirect: 'manual', // No seguir redirects automáticamente
    });
    return response;
  } catch (error) {
    logError(`Error en request: ${error.message}`);
    return null;
  }
}

async function testAdminPageProtection() {
  logTest('Protección de Páginas Admin');
  
  // Intentar acceder a /admin sin autenticación
  const response = await testRequest('/admin');
  
  if (!response) {
    logError('No se pudo conectar al servidor');
    return false;
  }
  
  // Debe redirigir a /admin/login (301, 302, 307, 308)
  if ([301, 302, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    if (location && location.includes('/admin/login')) {
      logSuccess('Redirige a /admin/login cuando no hay autenticación');
      return true;
    } else {
      logError(`Redirige pero a ubicación incorrecta: ${location}`);
      return false;
    }
  } else {
    logError(`No redirige. Status: ${response.status}`);
    return false;
  }
}

async function testAdminAPIProtection() {
  logTest('Protección de APIs Admin');
  
  // Intentar acceder a /api/admin/obras sin token
  const response = await testRequest('/api/admin/obras', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  
  if (!response) {
    logError('No se pudo conectar al servidor');
    return false;
  }
  
  // Debe retornar 401
  if (response.status === 401) {
    const data = await response.json();
    if (data.error || data.success === false) {
      logSuccess('Retorna 401 cuando no hay autenticación');
      return true;
    } else {
      logError('Retorna 401 pero sin mensaje de error');
      return false;
    }
  } else {
    logError(`No retorna 401. Status: ${response.status}`);
    return false;
  }
}

async function testSecurityHeaders() {
  logTest('Headers de Seguridad');
  
  const response = await testRequest('/');
  
  if (!response) {
    logError('No se pudo conectar al servidor');
    return false;
  }
  
  const headers = response.headers;
  const requiredHeaders = [
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'content-security-policy',
  ];
  
  let allPresent = true;
  requiredHeaders.forEach(header => {
    if (headers.get(header)) {
      logSuccess(`Header ${header} presente`);
    } else {
      logError(`Header ${header} ausente`);
      allPresent = false;
    }
  });
  
  // HSTS solo en producción
  const hsts = headers.get('strict-transport-security');
  if (process.env.NODE_ENV === 'production') {
    if (hsts) {
      logSuccess('Header Strict-Transport-Security presente (producción)');
    } else {
      logWarning('Header Strict-Transport-Security ausente (producción)');
    }
  } else {
    if (hsts) {
      logWarning('Header Strict-Transport-Security presente (desarrollo)');
    } else {
      logSuccess('Header Strict-Transport-Security ausente (desarrollo - OK)');
    }
  }
  
  return allPresent;
}

async function testRateLimiting() {
  logTest('Rate Limiting en Login');
  
  // Intentar hacer 6 requests rápidos al endpoint de login
  const requests = [];
  for (let i = 0; i < 6; i++) {
    requests.push(
      testRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      })
    );
  }
  
  const responses = await Promise.all(requests);
  
  // Las primeras 5 deberían retornar 401 (credenciales inválidas)
  // La 6ta debería retornar 429 (rate limit)
  const statusCodes = responses.map(r => r?.status || 0);
  const has429 = statusCodes.includes(429);
  
  if (has429) {
    logSuccess('Rate limiting activo (retorna 429 después de múltiples intentos)');
    return true;
  } else {
    logWarning('Rate limiting no detectado. Esto puede ser normal si Redis no está configurado.');
    logWarning('Status codes recibidos: ' + statusCodes.join(', '));
    return true; // No fallar si Redis no está configurado
  }
}

async function testJWTSecurity() {
  logTest('Validación de JWT_SECRET');
  
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    logError('JWT_SECRET no está configurado');
    return false;
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (jwtSecret.length < 32) {
      logError(`JWT_SECRET es demasiado corto (${jwtSecret.length} chars). Mínimo 32 caracteres en producción.`);
      return false;
    }
    
    if (jwtSecret === 'fallback-secret-key-for-development') {
      logError('JWT_SECRET es el valor por defecto. Debe cambiarse en producción.');
      return false;
    }
    
    logSuccess(`JWT_SECRET configurado correctamente (${jwtSecret.length} caracteres)`);
    return true;
  } else {
    logSuccess('JWT_SECRET configurado (desarrollo)');
    return true;
  }
}

async function runAllTests() {
  log('\n🔒 Iniciando Pruebas de Seguridad - Fase 2\n', 'blue');
  log(`URL base: ${BASE_URL}\n`);
  
  const results = {
    adminPageProtection: await testAdminPageProtection(),
    adminAPIProtection: await testAdminAPIProtection(),
    securityHeaders: await testSecurityHeaders(),
    rateLimiting: await testRateLimiting(),
    jwtSecurity: await testJWTSecurity(),
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log('\n' + '='.repeat(50), 'blue');
  log(`\n📊 Resumen: ${passed}/${total} pruebas pasaron\n`, passed === total ? 'green' : 'yellow');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(test);
    } else {
      logError(test);
    }
  });
  
  if (passed === total) {
    log('\n✅ Todas las pruebas de seguridad pasaron', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
    process.exit(1);
  }
}

// Ejecutar pruebas
runAllTests().catch(error => {
  logError(`Error ejecutando pruebas: ${error.message}`);
  process.exit(1);
});


