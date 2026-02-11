'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  BarChart3,
} from 'lucide-react'

const allNavigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3, adminOnly: false },
  { name: 'Autores', href: '/admin/autores', icon: Users, adminOnly: false },
  { name: 'Obras', href: '/admin/obras', icon: BookOpen, adminOnly: false },
  { name: 'Próximas obras', href: '/admin/proximas-obras', icon: FileText, adminOnly: false },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users, adminOnly: true },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings, adminOnly: false },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userRol, setUserRol] = useState<string | null>(null)
  const [userNombre, setUserNombre] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.data) {
          if (data.data.rol != null) setUserRol(data.data.rol)
          if (data.data.nombre != null) setUserNombre(data.data.nombre)
        }
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      window.location.href = '/admin/login'
    }
  }

  const navigation = userRol === 'admin'
    ? allNavigation
    : allNavigation.filter((item) => !item.adminOnly)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 flex items-center justify-center mr-3">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-900">Admin Panel</span>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium  ${
                      pathname === item.href
                        ? 'bg-primary-600 text-white'
                        : 'text-primary-600 hover:bg-primary-50 hover:text-primary-900'
                    }`}
                  >
                    <Icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 flex items-center justify-center mr-3">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-primary-900">Admin Panel</span>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium  ${
                      pathname === item.href
                        ? 'bg-primary-600 text-white'
                        : 'text-primary-600 hover:bg-primary-50 hover:text-primary-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userNombre ?? (userRol === 'admin' ? 'Administrador' : userRol === 'editor' ? 'Editor' : 'Administrador')}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center disabled:opacity-50"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Botón móvil para abrir sidebar */}
        <div className="lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white shadow-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-600"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
