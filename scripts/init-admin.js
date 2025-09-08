/**
 * Script para crear el usuario administrador inicial
 * Ejecutar con: node scripts/init-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Esquema simplificado para el script
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now }
});

// Crear modelo
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

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
      return;
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

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  }
}

async function main() {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  console.log('🔌 Conexión cerrada');
  process.exit(0);
}

main().catch(console.error);
