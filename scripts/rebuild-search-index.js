require('dotenv').config();
const mongoose = require('mongoose');

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Modelos
const AutorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  biografia: { type: String },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true }
});

const ObraSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  descripcion: { type: String },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  esPublico: { type: Boolean, default: true },
  activo: { type: Boolean, default: true },
  contenido: { type: String, default: '' }
});

const SeccionSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  slug: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  nivel: { type: Number, default: 1 },
  activo: { type: Boolean, default: true }
});

const ParrafoSchema = new mongoose.Schema({
  numero: { type: Number, required: true },
  texto: { type: String, required: true },
  obra: { type: mongoose.Schema.Types.ObjectId, ref: 'Obra', required: true },
  seccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' },
  activo: { type: Boolean, default: true }
});

const SearchIndexSchema = new mongoose.Schema({
  version: { type: String, required: true, default: '1.0' },
  documents: { type: [mongoose.Schema.Types.Mixed], required: true, default: [] },
  lastUpdated: { type: Date, required: true, default: Date.now },
  count: { type: Number, required: true, default: 0 },
  obras: { type: Number, required: true, default: 0 },
  secciones: { type: Number, required: true, default: 0 },
  parrafos: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Autor = mongoose.models.Autor || mongoose.model('Autor', AutorSchema);
const Obra = mongoose.models.Obra || mongoose.model('Obra', ObraSchema);
const Seccion = mongoose.models.Seccion || mongoose.model('Seccion', SeccionSchema);
const Parrafo = mongoose.models.Parrafo || mongoose.model('Parrafo', ParrafoSchema);
const SearchIndex = mongoose.models.SearchIndex || mongoose.model('SearchIndex', SearchIndexSchema);

async function rebuildSearchIndex() {
  try {
    console.log('🔄 Iniciando reconstrucción del índice de búsqueda...');

    // Construir índice de búsqueda
    const documents = [];

    // Obtener todas las obras con sus autores
    const obras = await Obra.find({ esPublico: true, activo: true })
      .populate('autor', 'nombre slug')
      .select('titulo slug descripcion autor');

    console.log(`📚 Encontradas ${obras.length} obras públicas`);

    // Agregar títulos de obras al índice
    for (const obra of obras) {
      documents.push({
        id: `obra-${obra._id}`,
        titulo: obra.titulo,
        autor: obra.autor.nombre,
        obraSlug: obra.slug,
        autorSlug: obra.autor.slug,
        texto: `${obra.titulo} ${obra.descripcion || ''}`,
        tipo: 'titulo'
      });
    }

    // Obtener todas las secciones
    const secciones = await Seccion.find({ activo: true })
      .populate({
        path: 'obra',
        populate: {
          path: 'autor',
          select: 'nombre slug'
        },
        match: { esPublico: true, activo: true }
      })
      .select('titulo slug obra nivel');

    console.log(`📖 Encontradas ${secciones.length} secciones`);

    // Agregar secciones al índice
    for (const seccion of secciones) {
      if (seccion.obra) {
        documents.push({
          id: `seccion-${seccion._id}`,
          titulo: seccion.obra.titulo,
          autor: seccion.obra.autor.nombre,
          obraSlug: seccion.obra.slug,
          autorSlug: seccion.obra.autor.slug,
          seccion: seccion.titulo,
          texto: seccion.titulo,
          tipo: 'seccion'
        });
      }
    }

    // Obtener todos los párrafos
    const parrafos = await Parrafo.find({ activo: true })
      .populate({
        path: 'obra',
        populate: {
          path: 'autor',
          select: 'nombre slug'
        },
        match: { esPublico: true, activo: true }
      })
      .populate('seccion', 'titulo')
      .select('numero texto obra seccion')
      .limit(10000);

    console.log(`📝 Encontrados ${parrafos.length} párrafos`);

    // Agregar párrafos al índice
    for (const parrafo of parrafos) {
      if (parrafo.obra) {
        documents.push({
          id: `parrafo-${parrafo._id}`,
          titulo: parrafo.obra.titulo,
          autor: parrafo.obra.autor.nombre,
          obraSlug: parrafo.obra.slug,
          autorSlug: parrafo.obra.autor.slug,
          seccion: parrafo.seccion ? parrafo.seccion.titulo : undefined,
          texto: parrafo.texto,
          numero: parrafo.numero,
          tipo: 'parrafo'
        });
      }
    }

    console.log(`✅ Índice reconstruido con ${documents.length} documentos`);

    // Guardar el índice en la base de datos
    await SearchIndex.findOneAndUpdate(
      { version: '1.0' },
      {
        documents,
        lastUpdated: new Date(),
        count: documents.length,
        obras: obras.length,
        secciones: secciones.length,
        parrafos: parrafos.length
      },
      { upsert: true, new: true }
    );

    console.log('💾 Índice guardado en base de datos');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Obras: ${obras.length}`);
    console.log(`   - Secciones: ${secciones.length}`);
    console.log(`   - Párrafos: ${parrafos.length}`);
    console.log(`   - Total documentos: ${documents.length}`);

  } catch (error) {
    console.error('❌ Error reconstruyendo índice:', error);
    throw error;
  }
}

async function main() {
  await connectDB();
  await rebuildSearchIndex();
  await mongoose.disconnect();
  console.log('✅ Proceso completado');
}

main().catch(console.error);
