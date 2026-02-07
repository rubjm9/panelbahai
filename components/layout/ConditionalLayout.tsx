'use client'

import { usePathname } from 'next/navigation'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  // Detectar si estamos en modo lectura (ruta de obra específica)
  // Formato: /autores/[autor-slug]/[obra-slug]
  // Ejemplo: /autores/bahau-llah/el-libro-mas-sagrado
  const isReadingMode = pathname.startsWith('/autores/') && pathname.split('/').length >= 4

  if (isAdminRoute) {
    // Para rutas de admin, solo mostrar el contenido sin header ni footer
    return <>{children}</>
  }

  // Para rutas públicas, mostrar header y footer
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter variant={isReadingMode ? 'minimal' : 'default'} />
    </>
  )
}



