/**
 * Script to promote an existing user to a desired role (admin/editor/viewer)
 * Usage:
 *   node scripts/promote-user.js --email user@example.com --role admin
 *
 * Notes:
 * - Reads Mongo URI from .env.local (MONGODB_URI)
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { email: null, role: 'admin' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--email' || a === '-e') && args[i + 1]) {
      out.email = args[i + 1];
      i++;
    } else if ((a === '--role' || a === '-r') && args[i + 1]) {
      out.role = args[i + 1];
      i++;
    }
  }
  return out;
}

const allowedRoles = new Set(['admin', 'editor', 'viewer']);

// Minimal Usuario model
const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  activo: { type: Boolean, default: true },
  fechaActualizacion: { type: Date, default: Date.now }
});

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema);

async function main() {
  const { email, role } = parseArgs();

  if (!email) {
    console.error('❌ Missing --email <email@example.com>');
    process.exit(1);
  }
  if (!allowedRoles.has(role)) {
    console.error('❌ Invalid role. Use one of: admin | editor | viewer');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await Usuario.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.rol = role;
    user.fechaActualizacion = new Date();
    await user.save();

    console.log(`✅ User '${email}' promoted to role: ${role}`);
  } catch (err) {
    console.error('❌ Error promoting user:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
