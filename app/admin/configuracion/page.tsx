import { Settings, Database, Search, Mail, Shield, Globe, RefreshCw, Trash2 } from 'lucide-react';
import { requireAdminAuth } from '@/lib/auth-helpers';

export default async function AdminConfiguracionPage() {
  // Verificar autenticación admin
  await requireAdminAuth();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-primary-600 font-reading">
          Administra la configuración general del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Configuración de Base de Datos */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Base de Datos
            </h3>
          </div>
          <p className="text-primary-600 font-reading mb-4">
            Gestiona la conexión y mantenimiento de la base de datos
          </p>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconstruir Índices
            </button>
            <button className="btn-secondary w-full">
              <Database className="w-4 h-4 mr-2" />
              Optimizar base de datos
            </button>
            <button className="btn-outline w-full text-red-600 hover:text-red-800">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar datos de prueba
            </button>
          </div>
        </div>

        {/* Configuración de Búsqueda */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Search className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Motor de Búsqueda
            </h3>
          </div>
          <p className="text-primary-600 font-reading mb-4">
            Configura el motor de búsqueda Lunr.js
          </p>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconstruir Índice de Búsqueda
            </button>
            <button className="btn-secondary w-full">
              <Search className="w-4 h-4 mr-2" />
              Probar Búsqueda
            </button>
            <button className="btn-outline w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configurar pesos
            </button>
          </div>
        </div>

        {/* Configuración de Email */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Notificaciones
            </h3>
          </div>
          <p className="text-primary-600 font-reading mb-4">
            Configura el sistema de notificaciones por email
          </p>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <Mail className="w-4 h-4 mr-2" />
              Probar Email
            </button>
            <button className="btn-secondary w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configurar SMTP
            </button>
            <button className="btn-outline w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetear configuración
            </button>
          </div>
        </div>

        {/* Configuración de Seguridad */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Seguridad
            </h3>
          </div>
          <p className="text-primary-600 font-reading mb-4">
            Gestiona la seguridad y autenticación del sistema
          </p>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <Shield className="w-4 h-4 mr-2" />
              Cambiar JWT Secret
            </button>
            <button className="btn-secondary w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar tokens
            </button>
            <button className="btn-outline w-full text-red-600 hover:text-red-800">
              <Shield className="w-4 h-4 mr-2" />
              Cerrar sesiones activas
            </button>
          </div>
        </div>

        {/* Configuración de Aplicación */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Aplicación
            </h3>
          </div>
          <p className="text-primary-600 font-reading mb-4">
            Configuración general de la aplicación
          </p>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <Globe className="w-4 h-4 mr-2" />
              Configurar dominio
            </button>
            <button className="btn-secondary w-full">
              <Settings className="w-4 h-4 mr-2" />
              Configuración General
            </button>
            <button className="btn-outline w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar caché
            </button>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Información del Sistema
            </h3>
          </div>
          <div className="space-y-2 text-sm text-primary-600">
            <p><strong>Versión:</strong> 1.0.0</p>
            <p><strong>Node.js:</strong> {process.version}</p>
            <p><strong>Next.js:</strong> 14.2.32</p>
            <p><strong>MongoDB:</strong> Conectado</p>
            <p><strong>Entorno:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
