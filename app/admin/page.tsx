import { BarChart3, BookOpen, FileText, Layers, ListTodo, Settings, Upload, Users } from 'lucide-react'
import Link from 'next/link'
import { requireAdminAuth } from '@/lib/auth-helpers'
import dbConnect from '@/lib/mongodb'
import Obra from '@/models/Obra'
import Parrafo from '@/models/Parrafo'
import Seccion from '@/models/Seccion'
import ProximaObra from '@/models/ProximaObra'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard - Admin Panel Bahá\'í',
  description: 'Panel de administración del sistema'
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0 || !Number.isFinite(diffMs)) {
    return 'Ahora'
  }
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} h`
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default async function DashboardPage() {
  await requireAdminAuth()

  await dbConnect()
  const [totalObras, totalParrafos, totalSecciones, totalProximasObras, obrasRecientes] = await Promise.all([
    Obra.countDocuments({ activo: true }),
    Parrafo.countDocuments({ activo: true }),
    Seccion.countDocuments({ activo: true }),
    ProximaObra.countDocuments(),
    Obra.find({ activo: true })
      .select('titulo fechaActualizacion slug')
      .sort({ fechaActualizacion: -1 })
      .limit(5)
      .lean(),
  ])

  const stats = [
    { name: 'Obras', value: totalObras.toLocaleString('es-ES'), icon: BookOpen },
    { name: 'Párrafos', value: totalParrafos.toLocaleString('es-ES'), icon: FileText },
    { name: 'Secciones', value: totalSecciones.toLocaleString('es-ES'), icon: Layers },
    { name: 'Próximas obras', value: totalProximasObras.toLocaleString('es-ES'), icon: ListTodo },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">Dashboard</h1>
        <p className="text-primary-600 font-reading">
          Resumen general del sistema y actividad reciente
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow overflow-hidden rounded-sm"
            >
              <dt>
                <div className="absolute bg-primary-600 p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-primary-600 truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-primary-900">
                  {item.value}
                </p>
              </dd>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actividad reciente */}
        <div className="bg-white shadow rounded-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-display font-semibold text-primary-900 mb-4">
              Actividad reciente
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {obrasRecientes.length === 0 ? (
                  <p className="text-sm text-primary-600">No hay obras en el sistema.</p>
                ) : (
                  obrasRecientes.map((obra, activityIdx) => (
                    <li key={String(obra._id)}>
                      <div className="relative pb-8">
                        {activityIdx !== obrasRecientes.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 bg-primary-600 flex items-center justify-center ring-8 ring-white">
                              <BarChart3 className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-primary-900 font-medium">
                                Obra actualizada
                              </p>
                              {obra.slug ? (
                                <Link href={`/admin/obras/${obra.slug}/editar`} className="text-sm text-primary-600 hover:text-primary-800 hover:underline block truncate">
                                  {obra.titulo}
                                </Link>
                              ) : (
                                <p className="text-sm text-primary-600 truncate">
                                  {obra.titulo}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-primary-500 shrink-0">
                              {formatRelativeTime(new Date(obra.fechaActualizacion))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white shadow rounded-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-display font-semibold text-primary-900 mb-4">
              Acciones rápidas
            </h3>
            <div className="space-y-4">
              <Link href="/admin/obras" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Gestionar obras
              </Link>
              <Link href="/admin/obras/nueva" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Agregar nueva obra
              </Link>
              <Link href="/admin/importar" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <Upload className="w-5 h-5 mr-2" />
                Importar documento
              </Link>
              <Link href="/admin/proximas-obras" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <ListTodo className="w-5 h-5 mr-2" />
                Próximas obras
              </Link>
              <Link href="/admin/autores" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <Users className="w-5 h-5 mr-2" />
                Gestionar autores
              </Link>
              <Link href="/admin/configuracion" className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuración (índice, caché)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
