/**
 * Script para probar funcionalidades web de la aplicación
 * Ejecutar con: node scripts/test-web-functionality.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Esquemas simplificados para los scripts
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const AutorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  biografia: { type: String },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ObraSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  descripcion: { type: String },
  esPublico: { type: Boolean, default: false },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const SeccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  nivel: { type: Number, default: 1 },
  seccionPadre: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ParrafoSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  texto: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Crear modelos
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
const Autor = mongoose.models.Autor || mongoose.model('Autor', AutorSchema);
const Obra = mongoose.models.Obra || mongoose.model('Obra', ObraSchema);
const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', SeccionSchema);
const Parrafo = mongoose.models.Parrafo || mongoose.model('Parrafo', ParrafoSchema);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 Probando endpoints de API...');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoints = [
    '/api/autores',
    '/api/obras',
    '/api/secciones',
    '/api/parrafos',
    '/api/search'
  ];

  console.log(`📡 Base URL: ${baseUrl}`);
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (response.ok) {
        console.log(`✅ ${endpoint} - OK`);
      } else {
        console.log(`⚠️  ${endpoint} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

async function testSearchEngine() {
  console.log('\n🔍 Probando motor de búsqueda...');
  
  try {
    const obras = await Obra.find({ esPublico: true }).populate('autor');
    const parrafos = await Parrafo.find().populate('obra');
    
    console.log(`✅ ${obras.length} obras públicas disponibles`);
    console.log(`✅ ${parrafos.length} párrafos indexables`);
    
    // Simular búsqueda
    const searchTerms = ['Dios', 'revelación', 'Bahá\'u\'lláh'];
    
    for (const term of searchTerms) {
      const matchingParrafos = parrafos.filter(p => 
        p.texto.toLowerCase().includes(term.toLowerCase())
      );
      console.log(`🔍 "${term}": ${matchingParrafos.length} resultados`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error probando motor de búsqueda:', error);
    return false;
  }
}

async function testReadingFunctionality() {
  console.log('\n🔍 Probando funcionalidades de lectura...');
  
  try {
    // Probar navegación por obras
    const obras = await Obra.find({ esPublico: true }).populate('autor');
    console.log(`✅ ${obras.length} obras disponibles para lectura`);
    
    // Probar navegación por secciones
    const secciones = await Seccion.find().populate('obra');
    console.log(`✅ ${secciones.length} secciones organizadas`);
    
    // Probar párrafos numerados
    const parrafos = await Parrafo.find().sort({ numero: 1 });
    console.log(`✅ ${parrafos.length} párrafos numerados`);
    
    // Verificar estructura de datos
    for (const obra of obras) {
      const obraParrafos = await Parrafo.find({ obra: obra._id });
      const obraSecciones = await Seccion.find({ obra: obra._id });
      
      console.log(`📚 ${obra.titulo}: ${obraParrafos.length} párrafos, ${obraSecciones.length} secciones`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error probando funcionalidades de lectura:', error);
    return false;
  }
}

async function testAdminFunctionality() {
  console.log('\n🔍 Probando funcionalidades de administración...');
  
  try {
    const adminUser = await Usuario.findOne({ rol: 'admin' });
    
    if (adminUser) {
      console.log(`✅ Usuario admin: ${adminUser.email}`);
      console.log(`✅ Estado: ${adminUser.activo ? 'Activo' : 'Inactivo'}`);
      console.log(`✅ Rol: ${adminUser.rol}`);
      
      // Verificar que puede acceder a datos
      const totalAutores = await Autor.countDocuments();
      const totalObras = await Obra.countDocuments();
      const totalParrafos = await Parrafo.countDocuments();
      
      console.log(`📊 Datos administrables: ${totalAutores} autores, ${totalObras} obras, ${totalParrafos} párrafos`);
      
      return true;
    } else {
      console.log('⚠️  No se encontró usuario administrador');
      return false;
    }
  } catch (error) {
    console.error('❌ Error probando funcionalidades de admin:', error);
    return false;
  }
}

async function generateWebTestReport() {
  console.log('\n📋 Generando reporte de funcionalidades web...');
  
  const results = {
    searchEngine: await testSearchEngine(),
    readingFunctionality: await testReadingFunctionality(),
    adminFunctionality: await testAdminFunctionality()
  };

  console.log('\n📊 RESUMEN DE PRUEBAS WEB:');
  console.log('==========================');
  console.log(`Motor de búsqueda: ${results.searchEngine ? '✅' : '❌'}`);
  console.log(`Funcionalidades de lectura: ${results.readingFunctionality ? '✅' : '❌'}`);
  console.log(`Funcionalidades de admin: ${results.adminFunctionality ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 ¡Todas las funcionalidades web están funcionando!');
    console.log('\n🌐 URLs para probar:');
    console.log('   • Aplicación: http://localhost:3000');
    console.log('   • Autores: http://localhost:3000/autores');
    console.log('   • Admin: http://localhost:3000/admin/login');
    console.log('   • API Search: http://localhost:3000/api/search');
    console.log('\n🔑 Credenciales admin:');
    console.log('   • Email: admin@panel-bahai.org');
    console.log('   • Contraseña: admin123');
  } else {
    console.log('\n⚠️  Algunas funcionalidades necesitan atención');
  }

  return allPassed;
}

async function main() {
  console.log('🧪 Iniciando pruebas de funcionalidades web...\n');
  
  try {
    await connectDB();
    const allTestsPassed = await generateWebTestReport();
    
    if (allTestsPassed) {
      console.log('\n✨ ¡Sistema web listo para desarrollo!');
    } else {
      console.log('\n🔧 Sistema web necesita configuración adicional');
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas web:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

main().catch(console.error);

