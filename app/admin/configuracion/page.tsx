import { Settings } from 'lucide-react'
import { requireAdminAuth } from '@/lib/auth-helpers'
import ConfiguracionActions from '@/components/admin/ConfiguracionActions'

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracionPage() {
  await requireAdminAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
          Configuración del sistema
        </h1>
        <p className="text-primary-600 font-reading">
          Acciones de mantenimiento e información del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <ConfiguracionActions />

        {/* Información del sistema */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 text-accent-600 mr-3" />
            <h3 className="text-xl font-display font-semibold text-primary-900">
              Información del sistema
            </h3>
          </div>
          <div className="space-y-2 text-sm text-primary-600">
            <p><strong>Versión:</strong> 0.1.0</p>
            <p><strong>Node.js:</strong> {process.version}</p>
            <p><strong>Next.js:</strong> 14.x</p>
            <p><strong>Entorno:</strong> {process.env.NODE_ENV ?? 'development'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
