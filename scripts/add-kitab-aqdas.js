const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Esquemas simplificados para los scripts
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
const Autor = mongoose.model('Autor', AutorSchema);
const Obra = mongoose.model('Obra', ObraSchema);
const Seccion = mongoose.model('Seccion', SeccionSchema);
const Parrafo = mongoose.model('Parrafo', ParrafoSchema);

async function addKitabAqdas() {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar el autor Bahá'u'lláh
    const autor = await Autor.findOne({ slug: 'bahaullah' });
    if (!autor) {
      throw new Error('Autor Bahá\'u\'lláh no encontrado');
    }
    console.log('👤 Autor encontrado:', autor.nombre);

    // Verificar si ya existe la obra
    const obraExistente = await Obra.findOne({ slug: 'kitab-i-aqdas' });
    if (obraExistente) {
      console.log('⚠️  La obra Kitáb-i-Aqdás ya existe');
      return;
    }

    // Crear la obra Kitáb-i-Aqdás
    const obra = new Obra({
      titulo: 'Kitáb-i-Aqdás',
      slug: 'kitab-i-aqdas',
      autor: autor._id,
      descripcion: 'El Libro Más Sagrado de Bahá\'u\'lláh, que contiene las leyes fundamentales de la Fe Bahá\'í.',
      esPublico: true,
      orden: 1,
      fechaPublicacion: new Date('1873-01-01'),
      idioma: 'es',
      traductor: 'Panel de Traducción Bahá\'í',
      notas: 'Texto sagrado fundamental de la Fe Bahá\'í'
    });

    await obra.save();
    console.log('📚 Obra creada:', obra.titulo);

    // Crear secciones principales
    const seccion1 = new Seccion({
      titulo: 'Introducción',
      slug: 'introduccion',
      obra: obra._id,
      orden: 1,
      nivel: 1
    });
    await seccion1.save();

    const seccion2 = new Seccion({
      titulo: 'Leyes Fundamentales',
      slug: 'leyes-fundamentales',
      obra: obra._id,
      orden: 2,
      nivel: 1
    });
    await seccion2.save();

    const seccion3 = new Seccion({
      titulo: 'Disposiciones Administrativas',
      slug: 'disposiciones-administrativas',
      obra: obra._id,
      orden: 3,
      nivel: 1
    });
    await seccion3.save();

    console.log('📑 Secciones creadas: 3');

    // Crear párrafos de ejemplo
    const parrafos = [
      {
        numero: 1,
        texto: 'En el nombre de Dios, el Exaltado, el Más Poderoso. Este es el Libro Más Sagrado, enviado desde el cielo de la Voluntad de Dios para quienquiera que esté en la tierra y en el cielo.',
        seccion: seccion1._id,
        obra: obra._id
      },
      {
        numero: 2,
        texto: 'Dios ha prescrito para cada uno de vosotros un deber especial; no busquéis el deber de otros. Trabajad con diligencia y no os detengáis a preguntar sobre las obras de otros.',
        seccion: seccion2._id,
        obra: obra._id
      },
      {
        numero: 3,
        texto: 'Cuando los océanos de la sabiduría y del discurso se movieron y las olas de la luz se levantaron, el Todopoderoso pronunció estas palabras:',
        seccion: seccion2._id,
        obra: obra._id
      },
      {
        numero: 4,
        texto: 'Hemos decretado que todo hombre y toda mujer se case. Esto es lo que ha sido ordenado por Aquel que es el Omnisciente, el Sabio.',
        seccion: seccion2._id,
        obra: obra._id
      },
      {
        numero: 5,
        texto: 'Dios ha prescrito la obligación de la oración obligatoria. Quienquiera que no la observe, aunque no sea por negligencia, debe pagar una multa y repetir la oración.',
        seccion: seccion2._id,
        obra: obra._id
      },
      {
        numero: 6,
        texto: 'Hemos ordenado que cada uno de vosotros se siente en su propia casa y no se levante sin necesidad. Esto es lo que ha sido ordenado por Aquel que es el Omnisciente, el Sabio.',
        seccion: seccion3._id,
        obra: obra._id
      },
      {
        numero: 7,
        texto: 'Dios ha prescrito que cada uno de vosotros debe tener una ocupación, como la artesanía, el comercio y similares. Hemos elevado vuestra ocupación al rango de adoración a Dios, el Verdadero.',
        seccion: seccion3._id,
        obra: obra._id
      }
    ];

    for (const parrafoData of parrafos) {
      const parrafo = new Parrafo(parrafoData);
      await parrafo.save();
    }

    console.log('📝 Párrafos creados:', parrafos.length);

    // Actualizar contadores
    await Obra.findByIdAndUpdate(obra._id, {
      $set: {
        totalSecciones: 3,
        totalParrafos: parrafos.length
      }
    });

    console.log('🎉 ¡Kitáb-i-Aqdás agregado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Obra: ${obra.titulo}`);
    console.log(`   - Autor: ${autor.nombre}`);
    console.log(`   - Secciones: 3`);
    console.log(`   - Párrafos: ${parrafos.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addKitabAqdas();
}

module.exports = addKitabAqdas;
