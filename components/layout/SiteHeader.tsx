"use client"

import Link from 'next/link'
import { useState } from 'react'
import { BookOpen, ChevronDown, Menu, X } from 'lucide-react'

const authors = [
  { name: "Bahá'u'lláh", slug: 'bahaullah' },
  { name: 'El Báb', slug: 'el-bab' },
  { name: "'Abdu'l-Bahá", slug: 'abdul-baha' },
  { name: 'Shoghi Effendi', slug: 'shoghi-effendi' },
  { name: 'Casa Universal de Justicia', slug: 'casa-justicia' },
  { name: 'Compilaciones', slug: 'compilaciones' }
]

export default function SiteHeader() {
  const [openAuthors, setOpenAuthors] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-primary-100 sticky top-0 z-50">
      <div className="container-elegant">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="w-10 h-10 bg-primary-800 rounded-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </span>
            <div>
              <span className="text-lg font-semibold text-primary-900">Panel Bahá'í</span>
              <p className="text-xs text-primary-600 leading-none">Literatura en Español</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 relative">
            <Link href="/acerca" className="nav-link">Acerca del Panel</Link>
            <Link href="/proximas-traducciones" className="nav-link">Próximas Traducciones</Link>
            <Link href="/contacto" className="nav-link">Contacto</Link>

            {/* Autores dropdown */}
            <div className="relative"
                 onMouseEnter={() => setOpenAuthors(true)}
                 onMouseLeave={() => setOpenAuthors(false)}>
              <Link href="/autores" className="nav-link inline-flex items-center">
                Autores
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openAuthors ? 'rotate-180' : ''}`} />
              </Link>
              {openAuthors && (
                <div className="absolute right-0 top-full w-64 bg-white border border-primary-200 rounded-sm shadow-lg p-2"
                     onMouseEnter={() => setOpenAuthors(true)}
                     onMouseLeave={() => setOpenAuthors(false)}>
                  <ul className="max-h-72 overflow-y-auto">
                    {authors.map(a => (
                      <li key={a.slug}>
                        <Link href={`/autores/${a.slug}`} className="block px-3 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-sm">
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dashboard */}
            <Link href="/admin" className="nav-link text-accent-700 hover:text-accent-800">Dashboard</Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-primary-700"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-primary-100 py-3">
            <nav className="flex flex-col space-y-2">
              <Link href="/acerca" className="nav-link" onClick={() => setMobileOpen(false)}>Acerca del Panel</Link>
              <Link href="/proximas" className="nav-link" onClick={() => setMobileOpen(false)}>Próximas Traducciones</Link>
              <Link href="/contacto" className="nav-link" onClick={() => setMobileOpen(false)}>Contacto</Link>
              <Link href="/autores" className="nav-link" onClick={() => setMobileOpen(false)}>Autores</Link>
              <div>
                <div className="text-sm font-medium text-primary-700 mt-2 mb-1">Autores principales</div>
                <ul className="grid grid-cols-1 gap-1">
                  {authors.map(a => (
                    <li key={a.slug}>
                      <Link href={`/autores/${a.slug}`} className="block px-3 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-sm" onClick={() => setMobileOpen(false)}>
                        {a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/admin" className="nav-link text-accent-700" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
