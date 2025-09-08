/**
 * Script para verificar que las funcionalidades básicas estén funcionando
 * Ejecutar con: node scripts/test-functionality.js
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

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a la base de datos...');
  try {
    const stats = await mongoose.connection.db.stats();
    console.log(`✅ Base de datos: ${stats.db}`);
    console.log(`📊 Colecciones: ${stats.collections}`);
    return true;
  } catch (error) {
    console.error('❌ Error probando conexión:', error);
    return false;
  }
}

async function testModels() {
  console.log('\n🔍 Probando modelos de datos...');
  
  try {
    // Probar conteo de documentos
    const usuarios = await Usuario.countDocuments();
    const autores = await Autor.countDocuments();
    const obras = await Obra.countDocuments();
    const secciones = await Seccion.countDocuments();
    const parrafos = await Parrafo.countDocuments();

    console.log(`✅ Usuarios: ${usuarios}`);
    console.log(`✅ Autores: ${autores}`);
    console.log(`✅ Obras: ${obras}`);
    console.log(`✅ Secciones: ${secciones}`);
    console.log(`✅ Párrafos: ${parrafos}`);

    // Probar relaciones
    if (obras.length > 0) {
      const obraConAutor = await Obra.findOne().populate('autor');
      if (obraConAutor && obraConAutor.autor) {
        console.log(`✅ Relación Obra-Autor: ${obraConAutor.titulo} → ${obraConAutor.autor.nombre}`);
      }
    }

    if (parrafos.length > 0) {
      const parrafoConObra = await Parrafo.findOne().populate('obra');
      if (parrafoConObra && parrafoConObra.obra) {
        console.log(`✅ Relación Párrafo-Obra: Párrafo ${parrafoConObra.numero} → ${parrafoConObra.obra.titulo}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error probando modelos:', error);
    return false;
  }
}

async function testSearchData() {
  console.log('\n🔍 Probando datos para búsqueda...');
  
  try {
    // Verificar que tenemos datos suficientes para búsqueda
    const obrasPublicas = await Obra.find({ esPublico: true }).populate('autor');
    const parrafosPublicos = await Parrafo.find().populate('obra');

    console.log(`✅ Obras públicas: ${obrasPublicas.length}`);
    console.log(`✅ Párrafos disponibles: ${parrafosPublicos.length}`);

    if (obrasPublicas.length > 0) {
      console.log('📚 Obras disponibles para búsqueda:');
      obrasPublicas.forEach(obra => {
        console.log(`   - ${obra.titulo} (${obra.autor.nombre})`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Error probando datos de búsqueda:', error);
    return false;
  }
}

async function testAdminUser() {
  console.log('\n🔍 Probando usuario administrador...');
  
  try {
    const adminUser = await Usuario.findOne({ rol: 'admin' });
    
    if (adminUser) {
      console.log(`✅ Usuario admin encontrado: ${adminUser.email}`);
      console.log(`✅ Estado: ${adminUser.activo ? 'Activo' : 'Inactivo'}`);
      console.log(`✅ Rol: ${adminUser.rol}`);
      return true;
    } else {
      console.log('⚠️  No se encontró usuario administrador');
      return false;
    }
  } catch (error) {
    console.error('❌ Error probando usuario admin:', error);
    return false;
  }
}

async function generateTestReport() {
  console.log('\n📋 Generando reporte de funcionalidades...');
  
  const results = {
    database: await testDatabaseConnection(),
    models: await testModels(),
    searchData: await testSearchData(),
    adminUser: await testAdminUser()
  };

  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log('========================');
  console.log(`Base de datos: ${results.database ? '✅' : '❌'}`);
  console.log(`Modelos: ${results.models ? '✅' : '❌'}`);
  console.log(`Datos de búsqueda: ${results.searchData ? '✅' : '❌'}`);
  console.log(`Usuario admin: ${results.adminUser ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n🚀 La aplicación está lista para ejecutarse:');
    console.log('   npm run dev');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Ejecuta: node scripts/setup-dev.js');
    console.log('   2. Verifica la configuración de MongoDB');
    console.log('   3. Revisa las variables de entorno');
  }

  return allPassed;
}

async function main() {
  console.log('🧪 Iniciando pruebas de funcionalidad...\n');
  
  try {
    await connectDB();
    const allTestsPassed = await generateTestReport();
    
    if (allTestsPassed) {
      console.log('\n✨ ¡Sistema listo para desarrollo!');
    } else {
      console.log('\n🔧 Sistema necesita configuración adicional');
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

main().catch(console.error);
