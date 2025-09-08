/**
 * Script para configurar MongoDB Atlas correctamente
 * Ejecutar con: node scripts/fix-mongodb-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection(uri) {
  try {
    console.log(`🔍 Probando: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(uri);
    console.log('✅ Conexión exitosa!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Colecciones encontradas: ${collections.length}`);
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function provideAtlasInstructions() {
  console.log('\n📋 CONFIGURACIÓN DE MONGODB ATLAS:');
  console.log('====================================');
  console.log('');
  console.log('1. Ve a: https://cloud.mongodb.com');
  console.log('2. Inicia sesión en tu cuenta');
  console.log('3. Selecciona tu proyecto');
  console.log('4. Haz clic en "Connect" en tu cluster');
  console.log('5. Selecciona "Connect your application"');
  console.log('6. Copia la cadena de conexión');
  console.log('');
  console.log('7. La cadena debe verse así:');
  console.log('   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority');
  console.log('');
  console.log('8. Reemplaza <username> y <password> con tus credenciales reales');
  console.log('9. Añade el nombre de la base de datos al final:');
  console.log('   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/panel-bahai?retryWrites=true&w=majority');
  console.log('');
  console.log('10. Actualiza tu archivo .env.local:');
  console.log('    MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/panel-bahai');
  console.log('');
}

async function provideLocalInstructions() {
  console.log('\n📋 CONFIGURACIÓN DE MONGODB LOCAL:');
  console.log('===================================');
  console.log('');
  console.log('1. Instalar MongoDB local:');
  console.log('   brew tap mongodb/brew');
  console.log('   brew install mongodb-community');
  console.log('');
  console.log('2. Iniciar MongoDB:');
  console.log('   brew services start mongodb/brew/mongodb-community');
  console.log('');
  console.log('3. Configurar .env.local:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/panel-bahai');
  console.log('');
}

async function main() {
  console.log('🔧 Diagnosticando problema de conexión MongoDB...\n');
  
  const currentUri = process.env.MONGODB_URI;
  
  if (!currentUri) {
    console.log('❌ No se encontró MONGODB_URI en .env.local');
    console.log('\n📝 Crea el archivo .env.local con:');
    console.log('MONGODB_URI=mongodb://localhost:27017/panel-bahai');
    return;
  }
  
  console.log(`📋 URI actual: ${currentUri.replace(/\/\/.*@/, '//***:***@')}`);
  
  if (currentUri.includes('mongodb+srv://')) {
    console.log('\n🌐 Detectado MongoDB Atlas (nube)');
    const isConnected = await testConnection(currentUri);
    
    if (!isConnected) {
      await provideAtlasInstructions();
    } else {
      console.log('\n🎉 ¡MongoDB Atlas está funcionando correctamente!');
      console.log('Ejecuta: npm run setup');
    }
  } else if (currentUri.includes('localhost')) {
    console.log('\n💻 Detectado MongoDB local');
    const isConnected = await testConnection(currentUri);
    
    if (!isConnected) {
      await provideLocalInstructions();
    } else {
      console.log('\n🎉 ¡MongoDB local está funcionando correctamente!');
      console.log('Ejecuta: npm run setup');
    }
  } else {
    console.log('\n❓ URI no reconocida. Verifica tu configuración.');
  }
}

main().catch(console.error);

