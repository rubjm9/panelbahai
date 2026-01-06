/**
 * Script de Migración a UUIDs y Revisiones
 * Fase 3: Importación y Gestión de Datos
 * 
 * Genera UUIDs para obras, párrafos y secciones existentes
 * Crea revisiones iniciales para obras y párrafos existentes
 * 
 * Uso: node scripts/migrate-to-uuids.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Esquemas para el script
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
  slug: { type: String, required: true, lowercase: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  descripcion: { type: String },
  fechaPublicacion: { type: Date },
  orden: { type: Number, required: true, default: 0 },
  activo: { type: Boolean, default: true },
  esPublico: { type: Boolean, default: false },
  estado: { type: String, enum: ['publicado', 'borrador', 'archivado'], default: 'borrador' },
  contenido: { type: String },
  archivoDoc: { type: String },
  archivoPdf: { type: String },
  archivoEpub: { type: String },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  uuid: { type: String, unique: true, sparse: true },
  revisionActual: { type: mongoose.Schema.Types.ObjectId, ref: 'RevisionObra', default: null },
  revisiones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RevisionObra' }]
});

const ParrafoSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  texto: { type: String, required: true, trim: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion', default: null },
  orden: { type: Number, required: true, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  uuid: { type: String, unique: true, sparse: true },
  revisionActual: { type: mongoose.Schema.Types.ObjectId, ref: 'RevisionParrafo', default: null },
  revisiones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RevisionParrafo' }]
});

const SeccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccionPadre: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion', default: null },
  nivel: { type: Number, required: true, min: 1, max: 3 },
  orden: { type: Number, required: true, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  uuid: { type: String, unique: true, sparse: true }
});

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const RevisionObraSchema = new mongoose.Schema({
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  version: { type: Number, required: true, min: 1 },
  contenido: { type: String },
  estado: { type: String, enum: ['publicado', 'borrador', 'archivado'], required: true },
  esPublico: { type: Boolean, required: true, default: false },
  autorRevision: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaRevision: { type: Date, required: true, default: Date.now },
  cambios: { type: String, trim: true, maxlength: 500 },
  activo: { type: Boolean, default: true }
});

const RevisionParrafoSchema = new mongoose.Schema({
  parrafo: { type: mongoose.Schema.Types.ObjectId, ref: 'Parrafo', required: true },
  version: { type: Number, required: true, min: 1 },
  texto: { type: String, required: true, trim: true },
  numero: { type: Number, required: true },
  autorRevision: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaRevision: { type: Date, required: true, default: Date.now },
  cambios: { type: String, trim: true, maxlength: 500 },
  activo: { type: Boolean, default: true }
});

// Crear modelos
const Autor = mongoose.models.Autor || mongoose.model('Autor', AutorSchema);
const Obra = mongoose.models.Obra || mongoose.model('Obra', ObraSchema);
const Parrafo = mongoose.models.Parrafo || mongoose.model('Parrafo', ParrafoSchema);
const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', SeccionSchema);
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);
const RevisionObra = mongoose.models.RevisionObra || mongoose.model('RevisionObra', RevisionObraSchema);
const RevisionParrafo = mongoose.models.RevisionParrafo || mongoose.model('RevisionParrafo', RevisionParrafoSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definido en .env.local');
  process.exit(1);
}

async function migrateObras() {
  console.log('\n📚 Migrando obras...');
  
  const obras = await Obra.find({ uuid: { $exists: false } });
  console.log(`   Encontradas ${obras.length} obras sin UUID`);
  
  if (obras.length === 0) {
    console.log('   ✅ No hay obras que migrar');
    return 0;
  }
  
  let count = 0;
  for (const obra of obras) {
    try {
      // Generar UUID
      obra.uuid = uuidv4();
      await obra.save();
      
      // Crear revisión inicial si no existe
      const revisionExistente = await RevisionObra.findOne({ obra: obra._id, version: 1 });
      if (!revisionExistente) {
        // Buscar un usuario admin para la revisión
        const adminUser = await Usuario.findOne({ rol: 'admin' });
        if (adminUser) {
          const revision = new RevisionObra({
            obra: obra._id,
            version: 1,
            contenido: obra.contenido || '',
            estado: obra.estado,
            esPublico: obra.esPublico,
            autorRevision: adminUser._id,
            fechaRevision: obra.fechaCreacion || new Date(),
            cambios: 'Migración inicial - Revisión creada automáticamente',
            activo: true
          });
          
          await revision.save();
          
          // Actualizar obra con revisión
          obra.revisionActual = revision._id;
          obra.revisiones = [revision._id];
          await obra.save();
        }
      }
      
      count++;
      if (count % 10 === 0) {
        console.log(`   Procesadas ${count}/${obras.length} obras...`);
      }
    } catch (error) {
      console.error(`   ⚠️  Error procesando obra ${obra._id}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${count} obras migradas`);
  return count;
}

async function migrateParrafos() {
  console.log('\n📝 Migrando párrafos...');
  
  const parrafos = await Parrafo.find({ uuid: { $exists: false } });
  console.log(`   Encontrados ${parrafos.length} párrafos sin UUID`);
  
  if (parrafos.length === 0) {
    console.log('   ✅ No hay párrafos que migrar');
    return 0;
  }
  
  let count = 0;
  for (const parrafo of parrafos) {
    try {
      // Generar UUID
      parrafo.uuid = uuidv4();
      await parrafo.save();
      
      // Crear revisión inicial si no existe
      const revisionExistente = await RevisionParrafo.findOne({ parrafo: parrafo._id, version: 1 });
      if (!revisionExistente) {
        // Buscar un usuario admin para la revisión
        const adminUser = await Usuario.findOne({ rol: 'admin' });
        if (adminUser) {
          const revision = new RevisionParrafo({
            parrafo: parrafo._id,
            version: 1,
            texto: parrafo.texto,
            numero: parrafo.numero,
            autorRevision: adminUser._id,
            fechaRevision: parrafo.fechaCreacion || new Date(),
            cambios: 'Migración inicial - Revisión creada automáticamente',
            activo: true
          });
          
          await revision.save();
          
          // Actualizar párrafo con revisión
          parrafo.revisionActual = revision._id;
          parrafo.revisiones = [revision._id];
          await parrafo.save();
        }
      }
      
      count++;
      if (count % 50 === 0) {
        console.log(`   Procesados ${count}/${parrafos.length} párrafos...`);
      }
    } catch (error) {
      console.error(`   ⚠️  Error procesando párrafo ${parrafo._id}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${count} párrafos migrados`);
  return count;
}

async function migrateSecciones() {
  console.log('\n📑 Migrando secciones...');
  
  const secciones = await Seccion.find({ uuid: { $exists: false } });
  console.log(`   Encontradas ${secciones.length} secciones sin UUID`);
  
  if (secciones.length === 0) {
    console.log('   ✅ No hay secciones que migrar');
    return 0;
  }
  
  let count = 0;
  for (const seccion of secciones) {
    try {
      // Generar UUID
      seccion.uuid = uuidv4();
      await seccion.save();
      
      count++;
      if (count % 50 === 0) {
        console.log(`   Procesadas ${count}/${secciones.length} secciones...`);
      }
    } catch (error) {
      console.error(`   ⚠️  Error procesando sección ${seccion._id}:`, error.message);
    }
  }
  
  console.log(`   ✅ ${count} secciones migradas`);
  return count;
}

async function validateMigration() {
  console.log('\n🔍 Validando migración...');
  
  const obrasSinUuid = await Obra.countDocuments({ uuid: { $exists: false } });
  const parrafosSinUuid = await Parrafo.countDocuments({ uuid: { $exists: false } });
  const seccionesSinUuid = await Seccion.countDocuments({ uuid: { $exists: false } });
  
  const obrasSinRevision = await Obra.countDocuments({ 
    revisionActual: { $exists: false } 
  });
  const parrafosSinRevision = await Parrafo.countDocuments({ 
    revisionActual: { $exists: false } 
  });
  
  if (obrasSinUuid === 0 && parrafosSinUuid === 0 && seccionesSinUuid === 0) {
    console.log('   ✅ Todos los documentos tienen UUID');
  } else {
    console.log(`   ⚠️  Aún hay documentos sin UUID:`);
    console.log(`      - Obras: ${obrasSinUuid}`);
    console.log(`      - Párrafos: ${parrafosSinUuid}`);
    console.log(`      - Secciones: ${seccionesSinUuid}`);
  }
  
  if (obrasSinRevision === 0 && parrafosSinRevision === 0) {
    console.log('   ✅ Todas las obras y párrafos tienen revisión inicial');
  } else {
    console.log(`   ⚠️  Aún hay documentos sin revisión inicial:`);
    console.log(`      - Obras: ${obrasSinRevision}`);
    console.log(`      - Párrafos: ${parrafosSinRevision}`);
  }
  
  return {
    obrasSinUuid,
    parrafosSinUuid,
    seccionesSinUuid,
    obrasSinRevision,
    parrafosSinRevision
  };
}

async function main() {
  console.log('🚀 Iniciando migración a UUIDs y revisiones...\n');
  
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Migrar obras
    const obrasMigradas = await migrateObras();
    
    // Migrar párrafos
    const parrafosMigrados = await migrateParrafos();
    
    // Migrar secciones
    const seccionesMigradas = await migrateSecciones();
    
    // Validar migración
    const validacion = await validateMigration();
    
    // Resumen
    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log('==========================');
    console.log(`Obras migradas: ${obrasMigradas}`);
    console.log(`Párrafos migrados: ${parrafosMigrados}`);
    console.log(`Secciones migradas: ${seccionesMigradas}`);
    console.log('\n✅ Migración completada');
    
    if (validacion.obrasSinUuid === 0 && 
        validacion.parrafosSinUuid === 0 && 
        validacion.seccionesSinUuid === 0 &&
        validacion.obrasSinRevision === 0 &&
        validacion.parrafosSinRevision === 0) {
      console.log('\n🎉 ¡Todas las migraciones fueron exitosas!');
    } else {
      console.log('\n⚠️  Algunas migraciones necesitan atención');
      console.log('   Ejecuta el script nuevamente para completar las migraciones pendientes');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

main();
