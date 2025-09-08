/**
 * Script para configurar dominio de desarrollo local
 * Ejecutar con: node scripts/setup-dev-domain.js
 */

const fs = require('fs');
const path = require('path');

function createHostsEntry() {
  console.log('🌐 Configurando dominio de desarrollo local...');
  
  const domain = 'panel-bahai.local';
  const hostsPath = process.platform === 'win32' 
    ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
    : '/etc/hosts';
  
  const hostsEntry = `127.0.0.1 ${domain}`;
  
  console.log(`📝 Entrada para hosts: ${hostsEntry}`);
  console.log(`📁 Archivo hosts: ${hostsPath}`);
  
  console.log('\n📋 INSTRUCCIONES MANUALES:');
  console.log('==========================');
  console.log('');
  console.log('1. Abre el archivo hosts como administrador:');
  console.log(`   sudo nano ${hostsPath}`);
  console.log('');
  console.log('2. Añade esta línea al final del archivo:');
  console.log(`   ${hostsEntry}`);
  console.log('');
  console.log('3. Guarda el archivo y cierra el editor');
  console.log('');
  console.log('4. Actualiza tu .env.local:');
  console.log(`   NEXT_PUBLIC_APP_URL=http://${domain}:3000`);
  console.log('');
  console.log('5. Reinicia el servidor de desarrollo:');
  console.log('   npm run dev');
  console.log('');
  console.log('6. Accede a: http://panel-bahai.local:3000');
}

function createNextConfig() {
  console.log('\n⚙️  Configurando Next.js para dominio personalizado...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'panel-bahai.local'],
  },
  // Configuración para desarrollo local
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Configuración de headers para desarrollo
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;

  try {
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ next.config.js actualizado');
  } catch (error) {
    console.log('⚠️  No se pudo actualizar next.config.js:', error.message);
  }
}

function createDevScripts() {
  console.log('\n📜 Creando scripts de desarrollo...');
  
  const devScripts = `#!/bin/bash
# Script para iniciar desarrollo con dominio personalizado

echo "🚀 Iniciando Panel Bahá'í en modo desarrollo..."
echo "🌐 Dominio: http://panel-bahai.local:3000"
echo "📚 Admin: http://panel-bahai.local:3000/admin/login"
echo ""

# Verificar que el dominio está configurado
if ! grep -q "panel-bahai.local" /etc/hosts; then
    echo "⚠️  Advertencia: panel-bahai.local no está en /etc/hosts"
    echo "   Ejecuta: sudo echo '127.0.0.1 panel-bahai.local' >> /etc/hosts"
    echo ""
fi

# Iniciar el servidor
npm run dev
`;

  try {
    fs.writeFileSync(path.join(process.cwd(), 'scripts', 'dev-with-domain.sh'), devScripts);
    fs.chmodSync(path.join(process.cwd(), 'scripts', 'dev-with-domain.sh'), '755');
    console.log('✅ Script de desarrollo creado');
  } catch (error) {
    console.log('⚠️  No se pudo crear el script:', error.message);
  }
}

function updatePackageJson() {
  console.log('\n📦 Actualizando package.json...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Añadir script para desarrollo con dominio
    packageJson.scripts['dev-domain'] = 'bash scripts/dev-with-domain.sh';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json actualizado');
  } catch (error) {
    console.log('⚠️  No se pudo actualizar package.json:', error.message);
  }
}

function main() {
  console.log('🌐 Configurando dominio de desarrollo para Panel Bahá\'í...\n');
  
  createHostsEntry();
  createNextConfig();
  createDevScripts();
  updatePackageJson();
  
  console.log('\n🎉 ¡Configuración de dominio completada!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Sigue las instrucciones de hosts arriba');
  console.log('2. Actualiza tu .env.local con el nuevo dominio');
  console.log('3. Ejecuta: npm run dev-domain');
  console.log('4. Accede a: http://panel-bahai.local:3000');
  console.log('\n✨ ¡Disfruta del desarrollo con dominio personalizado!');
}

main();

