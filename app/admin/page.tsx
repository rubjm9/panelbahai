import { BarChart3, Users, BookOpen, FileText, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - Admin Panel Bahá\'í',
  description: 'Panel de administración del sistema'
}

export default function DashboardPage() {
  // En una implementación real, estos datos vendrían de la base de datos
  const stats = [
    {
      name: 'Total Autores',
      value: '7',
      change: '+0%',
      changeType: 'neutral',
      icon: Users,
    },
    {
      name: 'Total Obras',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: BookOpen,
    },
    {
      name: 'Total Párrafos',
      value: '45,231',
      change: '+18%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Búsquedas (mes)',
      value: '2,847',
      change: '+25%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'obra_added',
      title: 'Nueva obra agregada',
      description: 'Se agregó "Pasajes de los Escritos de Bahá\'u\'lláh"',
      time: 'Hace 2 horas',
      user: 'Admin'
    },
    {
      id: 2,
      type: 'parrafos_updated',
      title: 'Párrafos actualizados',
      description: 'Se actualizaron 15 párrafos en "El Kitab-i-Iqan"',
      time: 'Hace 1 día',
      user: 'Editor'
    },
    {
      id: 3,
      type: 'search_index',
      title: 'Índice de búsqueda actualizado',
      description: 'Se reconstruyó el índice de búsqueda con 45,231 documentos',
      time: 'Hace 2 días',
      user: 'Sistema'
    },
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
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow overflow-hidden"
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
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'positive' ? 'text-green-600' : 
                  item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {item.change}
                </p>
              </dd>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actividad reciente */}
        <div className="bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-display font-semibold text-primary-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
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
                          <div>
                            <p className="text-sm text-primary-900 font-medium">
                              {activity.title}
                            </p>
                            <p className="text-sm text-primary-600">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-primary-500">
                            <div>{activity.time}</div>
                            <div className="text-xs">{activity.user}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-display font-semibold text-primary-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-4">
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Agregar Nueva Obra
              </button>
              <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <Users className="w-5 h-5 mr-2" />
                Gestionar Autores
              </button>
              <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Actualizar Índice de Búsqueda
              </button>
              <button className="w-full bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium py-3 px-4 transition-colors flex items-center justify-center">
                <FileText className="w-5 h-5 mr-2" />
                Importar Documento Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
