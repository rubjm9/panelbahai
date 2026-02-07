/**
 * Script para restablecer la contraseña del usuario administrador
 * Ejecutar con: node scripts/reset-admin-password.js
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

async function resetAdminPassword() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@panel-bahai.org';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Buscar usuario admin
    const adminUser = await Usuario.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('❌ No se encontró el usuario administrador');
      console.log(`📧 Email buscado: ${adminEmail}`);
      console.log('\n💡 Ejecuta: npm run init-admin para crear el usuario');
      return;
    }

    // Crear hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Actualizar contraseña
    adminUser.password = hashedPassword;
    adminUser.activo = true; // Asegurar que esté activo
    await adminUser.save();

    console.log('✅ Contraseña del administrador restablecida exitosamente');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Nueva contraseña: ${adminPassword}`);
    console.log('🚨 IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
  }
}

async function main() {
  await connectDB();
  await resetAdminPassword();
  await mongoose.connection.close();
  console.log('🔌 Conexión cerrada');
  process.exit(0);
}

main().catch(console.error);
