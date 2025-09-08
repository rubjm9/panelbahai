/**
 * Script completo para configurar el entorno de desarrollo
 * Ejecutar con: node scripts/setup-dev.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

async function createAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@panel-bahai.org';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Verificar si ya existe un usuario admin
    const existingAdmin = await Usuario.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  El usuario administrador ya existe');
      return existingAdmin;
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Crear usuario administrador
    const adminUser = new Usuario({
      email: adminEmail,
      nombre: 'Administrador',
      password: hashedPassword,
      rol: 'admin',
      activo: true
    });

    await adminUser.save();

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Contraseña: ${adminPassword}`);
    console.log('🚨 IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
    
    return adminUser;

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

async function seedSampleData() {
  try {
    // Verificar si ya existen datos
    const existingAutores = await Autor.countDocuments();
    if (existingAutores > 0) {
      console.log('⚠️  Ya existen datos en la base de datos');
      return;
    }

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await Parrafo.deleteMany({});
    await Seccion.deleteMany({});
    await Obra.deleteMany({});
    await Autor.deleteMany({});

    // Crear autores
    console.log('👤 Creando autores...');
    const autores = await Autor.create([
      {
        nombre: "Bahá'u'lláh",
        slug: "bahaullah",
        biografia: "Fundador de la Fe Bahá'í (1817-1892). Bahá'u'lláh es el título de Mírzá Husayn-'Alí, que significa 'Gloria de Dios'.",
        orden: 1
      },
      {
        nombre: "El Báb",
        slug: "el-bab",
        biografia: "Precursor de Bahá'u'lláh (1819-1850). El Báb, cuyo nombre era Siyyid 'Alí-Muhammad, anunció la proximidad de una nueva Revelación divina.",
        orden: 2
      },
      {
        nombre: "'Abdu'l-Bahá",
        slug: "abdul-baha",
        biografia: "Hijo mayor de Bahá'u'lláh (1844-1921) e intérprete autorizado de Sus enseñanzas. Su nombre significa 'Siervo de Bahá'.",
        orden: 3
      },
      {
        nombre: "Shoghi Effendi",
        slug: "shoghi-effendi",
        biografia: "Guardián de la Fe Bahá'í (1897-1957), nieto de 'Abdu'l-Bahá y encargado de guiar a la comunidad bahá'í mundial.",
        orden: 4
      },
      {
        nombre: "Casa Universal de Justicia",
        slug: "casa-justicia",
        biografia: "Cuerpo administrativo supremo de la Fe Bahá'í, establecido en 1963 en el Centro Mundial Bahá'í en Haifa, Israel.",
        orden: 5
      }
    ]);

    // Crear obras de ejemplo
    console.log('📚 Creando obras...');
    const obras = await Obra.create([
      {
        titulo: "El Kitab-i-Iqan",
        slug: "kitab-i-iqan",
        autor: autores[0]._id, // Bahá'u'lláh
        descripcion: "El Libro de la Certeza, una de las obras más importantes de Bahá'u'lláh sobre temas espirituales y teológicos.",
        esPublico: true,
        orden: 1
      },
      {
        titulo: "Pasajes de los Escritos de Bahá'u'lláh",
        slug: "pasajes-bahaullah",
        autor: autores[0]._id,
        descripcion: "Selección de pasajes representativos de los escritos de Bahá'u'lláh sobre diversos temas espirituales.",
        esPublico: true,
        orden: 2
      },
      {
        titulo: "Contestación a Unas Preguntas",
        slug: "contestacion-preguntas",
        autor: autores[2]._id, // 'Abdu'l-Bahá
        descripcion: "Respuestas de 'Abdu'l-Bahá a preguntas sobre temas espirituales y filosóficos.",
        esPublico: true,
        orden: 1
      }
    ]);

    // Crear secciones de ejemplo
    console.log('📑 Creando secciones...');
    const secciones = await Seccion.create([
      {
        titulo: "Introducción",
        slug: "introduccion",
        obra: obras[0]._id, // Kitab-i-Iqan
        nivel: 1,
        orden: 1
      },
      {
        titulo: "La Naturaleza de la Revelación",
        slug: "naturaleza-revelacion",
        obra: obras[0]._id,
        nivel: 1,
        orden: 2
      },
      {
        titulo: "Los Signos de los Tiempos",
        slug: "signos-tiempos",
        obra: obras[0]._id,
        nivel: 2,
        seccionPadre: null,
        orden: 3
      }
    ]);

    // Crear párrafos de ejemplo
    console.log('📝 Creando párrafos...');
    const parrafos = [
      {
        numero: 1,
        texto: "En el Nombre de Dios, el Misericordioso, el Compasivo. Alabado sea Dios, Quien ha hecho descender el Kitab sobre Su siervo, y no ha puesto en él tortuosidad.",
        obra: obras[0]._id,
        seccion: secciones[0]._id,
        orden: 1
      },
      {
        numero: 2,
        texto: "Este es el Libro acerca del cual no hay duda; es una guía para los temerosos de Dios, que creen en lo invisible, que observan la oración y gastan de lo que les hemos dado.",
        obra: obras[0]._id,
        seccion: secciones[0]._id,
        orden: 2
      },
      {
        numero: 3,
        texto: "La naturaleza de la revelación divina es un tema que ha ocupado las mentes de los buscadores de la verdad a través de las edades. En cada época, Dios ha enviado Sus Mensajeros para guiar a la humanidad.",
        obra: obras[0]._id,
        seccion: secciones[1]._id,
        orden: 3
      },
      {
        numero: 4,
        texto: "Los signos que anuncian el advenimiento de una nueva revelación son tanto espirituales como materiales. El mundo experimenta una transformación profunda cuando aparece un nuevo Mensajero de Dios.",
        obra: obras[0]._id,
        seccion: secciones[2]._id,
        orden: 4
      },
      {
        numero: 5,
        texto: "La unidad de Dios, la unidad de Sus Profetas y la unidad de la humanidad son los principios fundamentales que subyacen a toda revelación divina.",
        obra: obras[0]._id,
        seccion: secciones[1]._id,
        orden: 5
      }
    ];

    await Parrafo.create(parrafos);

    // Crear algunos párrafos para la segunda obra
    const parrafosObra2 = [
      {
        numero: 1,
        texto: "Él es Dios, exaltado sea Su gloria. Toda alabanza pertenece a Dios, Señor de todos los mundos. Atestiguamos que no hay más Dios que Él, el Rey, el Protector, el Incomparable, el Todopoderoso.",
        obra: obras[1]._id,
        orden: 1
      },
      {
        numero: 2,
        texto: "Y atestiguamos que Aquel Quien es la Aurora del Conocimiento Divino, el Manantial de la sabiduría universal, es el Manifestado, el Oculto, el Suspendido entre la tierra y el cielo.",
        obra: obras[1]._id,
        orden: 2
      }
    ];

    await Parrafo.create(parrafosObra2);

    console.log('✅ Datos de ejemplo creados exitosamente');
    console.log(`📊 Creados: ${autores.length} autores, ${obras.length} obras, ${secciones.length} secciones, ${parrafos.length + parrafosObra2.length} párrafos`);

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando configuración del entorno de desarrollo...\n');
  
  try {
    await connectDB();
    
    // Crear usuario administrador
    console.log('👤 Configurando usuario administrador...');
    await createAdminUser();
    
    // Crear datos de ejemplo
    console.log('\n📚 Creando datos de ejemplo...');
    await seedSampleData();
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Visita: http://localhost:3000');
    console.log('3. Accede al admin: http://localhost:3000/admin/login');
    console.log('4. Usa las credenciales mostradas arriba');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

main().catch(console.error);
