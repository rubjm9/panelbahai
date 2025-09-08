/**
 * Script para configurar MongoDB local
 * Ejecutar con: node scripts/setup-mongodb-local.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testLocalMongoDB() {
  console.log('🔍 Probando conexión a MongoDB local...');
  
  try {
    // Intentar conectar a MongoDB local
    await mongoose.connect('mongodb://localhost:27017/panel-bahai');
    console.log('✅ Conectado a MongoDB local exitosamente');
    
    // Probar operaciones básicas
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Colecciones encontradas: ${collections.length}`);
    
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB local:', error.message);
    return false;
  }
}

async function provideInstructions() {
  console.log('\n📋 INSTRUCCIONES PARA CONFIGURAR MONGODB LOCAL:');
  console.log('================================================');
  console.log('');
  console.log('1. INSTALAR MONGODB:');
  console.log('   macOS (con Homebrew):');
  console.log('     brew tap mongodb/brew');
  console.log('     brew install mongodb-community');
  console.log('');
  console.log('   Ubuntu/Debian:');
  console.log('     wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -');
  console.log('     echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
  console.log('     sudo apt-get update');
  console.log('     sudo apt-get install -y mongodb-org');
  console.log('');
  console.log('2. INICIAR MONGODB:');
  console.log('   macOS:');
  console.log('     brew services start mongodb/brew/mongodb-community');
  console.log('');
  console.log('   Ubuntu/Debian:');
  console.log('     sudo systemctl start mongod');
  console.log('     sudo systemctl enable mongod');
  console.log('');
  console.log('3. VERIFICAR QUE ESTÁ FUNCIONANDO:');
  console.log('     mongosh --eval "db.runCommand({connectionStatus: 1})"');
  console.log('');
  console.log('4. CONFIGURAR .env.local:');
  console.log('     MONGODB_URI=mongodb://localhost:27017/panel-bahai');
  console.log('');
  console.log('5. EJECUTAR DE NUEVO:');
  console.log('     npm run setup');
  console.log('');
  console.log('ALTERNATIVA - MONGODB ATLAS (NUBE):');
  console.log('===================================');
  console.log('');
  console.log('1. Crear cuenta en: https://cloud.mongodb.com');
  console.log('2. Crear un cluster gratuito');
  console.log('3. Obtener la cadena de conexión');
  console.log('4. Configurar en .env.local:');
  console.log('   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/panel-bahai');
  console.log('');
}

async function main() {
  console.log('🚀 Configurando MongoDB para desarrollo local...\n');
  
  const isConnected = await testLocalMongoDB();
  
  if (!isConnected) {
    await provideInstructions();
  } else {
    console.log('\n🎉 ¡MongoDB local está funcionando correctamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecuta: npm run setup');
    console.log('2. Ejecuta: npm run dev');
  }
}

main().catch(console.error);

