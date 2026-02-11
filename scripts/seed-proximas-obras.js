/**
 * Rellena la colección ProximaObra con el listado inicial de obras en traducción/revisión.
 * Ejecutar con: node scripts/seed-proximas-obras.js
 * Requiere que existan los autores en la base de datos (por slug).
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProximaObraSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Autor', required: true },
  tipo: { type: String, required: true, enum: ['Revisión de traducción', 'Obra no publicada anteriormente'] },
  orden: { type: Number, required: true, default: 0 },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

const ProximaObra = mongoose.models.ProximaObra || mongoose.model('ProximaObra', ProximaObraSchema);
const Autor = mongoose.models.Autor || mongoose.model('Autor', new mongoose.Schema({ nombre: String, slug: String }));

const OBRAS_INICIALES = [
  { titulo: 'Afire with the Vision', autorSlug: 'shoghi-effendi', tipo: 'Obra no publicada anteriormente' },
  { titulo: 'Selección de los Escritos del Báb', autorSlug: 'el-bab', tipo: 'Revisión de traducción' },
  { titulo: "Tablas de Bahá'u'lláh, reveladas después del Kitáb-i-Aqdas", autorSlug: 'bahaullah', tipo: 'Revisión de traducción' },
  { titulo: "Selección de los Escritos de 'Abdu'l-Bahá", autorSlug: 'abdul-baha', tipo: 'Revisión de traducción' }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const autores = await Autor.find({}).lean();
  const bySlug = Object.fromEntries(autores.map(a => [a.slug, a._id]));

  const existing = await ProximaObra.countDocuments();
  if (existing > 0) {
    console.log(`Ya existen ${existing} registros en ProximaObra. No se inserta nada.`);
    process.exit(0);
    return;
  }

  for (let i = 0; i < OBRAS_INICIALES.length; i++) {
    const { titulo, autorSlug, tipo } = OBRAS_INICIALES[i];
    const autorId = bySlug[autorSlug];
    if (!autorId) {
      console.warn(`Autor con slug "${autorSlug}" no encontrado. Omitiendo: ${titulo}`);
      continue;
    }
    await ProximaObra.create({ titulo, autor: autorId, tipo, orden: i });
    console.log(`Creado: ${titulo}`);
  }

  console.log('Seed de próximas obras terminado.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
