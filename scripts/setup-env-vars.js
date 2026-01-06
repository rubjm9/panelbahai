/**
 * Script de Configuración de Variables de Entorno - Fase 2
 * 
 * Ayuda a configurar JWT_SECRET y otras variables de entorno necesarias.
 * 
 * Uso: node scripts/setup-env-vars.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function writeEnvFile(filePath, env) {
  const lines = [];
  
  // Leer el archivo ejemplo para mantener el orden y comentarios
  const examplePath = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(examplePath)) {
    const exampleContent = fs.readFileSync(examplePath, 'utf-8');
    const exampleLines = exampleContent.split('\n');
    
    exampleLines.forEach(line => {
      if (line.trim().startsWith('#')) {
        // Mantener comentarios
        lines.push(line);
      } else if (line.trim() === '') {
        // Mantener líneas vacías
        lines.push(line);
      } else {
        const [key] = line.split('=');
        if (key && env[key.trim()]) {
          // Reemplazar con valor actualizado
          lines.push(`${key.trim()}=${env[key.trim()]}`);
        } else {
          // Mantener línea original si no hay valor nuevo
          lines.push(line);
        }
      }
    });
  } else {
    // Si no hay ejemplo, crear desde cero
    Object.entries(env).forEach(([key, value]) => {
      lines.push(`${key}=${value}`);
    });
  }
  
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

async function setupEnvVars() {
  console.log('\n🔐 Configuración de Variables de Entorno - Fase 2\n');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  const existingEnv = readEnvFile(envPath);
  
  // 1. JWT_SECRET
  console.log('📝 Configurando JWT_SECRET...\n');
  
  let jwtSecret = existingEnv.JWT_SECRET;
  
  if (jwtSecret && jwtSecret.length >= 32 && jwtSecret !== 'tu-jwt-secret-muy-seguro-minimo-32-caracteres-en-produccion') {
    const useExisting = await question(`JWT_SECRET ya existe (${jwtSecret.length} caracteres). ¿Usar el existente? (s/n): `);
    if (useExisting.toLowerCase() !== 's') {
      jwtSecret = null;
    }
  }
  
  if (!jwtSecret || jwtSecret.length < 32) {
    const generate = await question('¿Generar nuevo JWT_SECRET? (s/n): ');
    if (generate.toLowerCase() === 's') {
      jwtSecret = generateJWTSecret();
      console.log(`✅ JWT_SECRET generado: ${jwtSecret.substring(0, 20)}...`);
    } else {
      const custom = await question('Ingresa tu JWT_SECRET (mínimo 32 caracteres): ');
      if (custom.length >= 32) {
        jwtSecret = custom;
      } else {
        console.log('⚠️  JWT_SECRET demasiado corto. Generando uno automáticamente...');
        jwtSecret = generateJWTSecret();
      }
    }
  }
  
  // 2. Upstash Redis (Opcional)
  console.log('\n📝 Configurando Upstash Redis (Opcional)...\n');
  console.log('Para rate limiting distribuido en producción, necesitas Upstash Redis.');
  console.log('Obtén las credenciales en: https://console.upstash.com/\n');
  
  const setupUpstash = await question('¿Configurar Upstash Redis ahora? (s/n): ');
  
  let upstashUrl = existingEnv.UPSTASH_REDIS_REST_URL || '';
  let upstashToken = existingEnv.UPSTASH_REST_TOKEN || existingEnv.UPSTASH_REDIS_REST_TOKEN || '';
  
  if (setupUpstash.toLowerCase() === 's') {
    upstashUrl = await question('UPSTASH_REDIS_REST_URL: ') || upstashUrl;
    upstashToken = await question('UPSTASH_REDIS_REST_TOKEN: ') || upstashToken;
  }
  
  // 3. MongoDB URI (si no existe)
  let mongodbUri = existingEnv.MONGODB_URI;
  if (!mongodbUri || mongodbUri.includes('usuario:password')) {
    console.log('\n📝 MongoDB URI...\n');
    const setupMongo = await question('¿Configurar MONGODB_URI ahora? (s/n): ');
    if (setupMongo.toLowerCase() === 's') {
      mongodbUri = await question('MONGODB_URI: ') || mongodbUri;
    }
  }
  
  // 4. Guardar configuración
  const env = {
    ...existingEnv,
    JWT_SECRET: jwtSecret,
  };
  
  if (upstashUrl) {
    env.UPSTASH_REDIS_REST_URL = upstashUrl;
  }
  
  if (upstashToken) {
    env.UPSTASH_REDIS_REST_TOKEN = upstashToken;
  }
  
  if (mongodbUri && !mongodbUri.includes('usuario:password')) {
    env.MONGODB_URI = mongodbUri;
  }
  
  // Mantener otras variables existentes
  Object.keys(existingEnv).forEach(key => {
    if (!env[key] && key !== 'JWT_SECRET' && key !== 'UPSTASH_REDIS_REST_URL' && key !== 'UPSTASH_REDIS_REST_TOKEN' && key !== 'MONGODB_URI') {
      env[key] = existingEnv[key];
    }
  });
  
  writeEnvFile(envPath, env);
  
  console.log('\n✅ Variables de entorno configuradas en .env.local\n');
  console.log('📋 Resumen:');
  console.log(`   JWT_SECRET: ${jwtSecret ? '✅ Configurado (' + jwtSecret.length + ' caracteres)' : '❌ No configurado'}`);
  console.log(`   UPSTASH_REDIS_REST_URL: ${upstashUrl ? '✅ Configurado' : '⚠️  No configurado (usará memoria)'}`);
  console.log(`   UPSTASH_REDIS_REST_TOKEN: ${upstashToken ? '✅ Configurado' : '⚠️  No configurado'}`);
  console.log(`   MONGODB_URI: ${mongodbUri && !mongodbUri.includes('usuario:password') ? '✅ Configurado' : '⚠️  No configurado'}`);
  
  console.log('\n📚 Para más información, consulta: docs/SETUP_ENV_VARS.md\n');
  
  rl.close();
}

setupEnvVars().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


