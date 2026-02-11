"use client"

import Link from 'next/link'
import { useState } from 'react'
import { BookOpen, ChevronDown, Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const authors = [
  { name: "Bahá'u'lláh", slug: 'bahaullah' },
  { name: 'El Báb', slug: 'el-bab' },
  { name: "'Abdu'l-Bahá", slug: 'abdul-baha' },
  { name: 'Shoghi Effendi', slug: 'shoghi-effendi' },
  { name: 'Casa Universal de Justicia', slug: 'casa-justicia' },
  { name: 'Recopilaciones', slug: 'recopilaciones' }
]

export default function SiteHeader() {
  const [openAuthors, setOpenAuthors] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header id={`header`} className="bg-white dark:bg-midnight-900 shadow-sm border-b border-primary-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="container-elegant">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="w-10 h-10 bg-primary-800 rounded-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </span>
            <div>
              <span className="text-lg font-semibold text-primary-900 dark:text-neutral-100">Panel de Traducción</span>
              <p className="text-xs text-primary-600 dark:text-neutral-400 leading-none">Literatura Bahá'í en Español</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 relative">
            {/* Autores dropdown */}
            <div className="relative"
                 onMouseEnter={() => setOpenAuthors(true)}
                 onMouseLeave={() => setOpenAuthors(false)}>
              <Link href="/autores" className="nav-link inline-flex items-center">
                Autores
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openAuthors ? 'rotate-180' : ''}`} />
              </Link>
              {openAuthors && (
                <div className="absolute right-0 top-full w-64 bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-700 rounded-sm shadow-lg p-2"
                     onMouseEnter={() => setOpenAuthors(true)}
                     onMouseLeave={() => setOpenAuthors(false)}>
                  <ul className="max-h-72 overflow-y-auto">
                    {authors.map(a => (
                      <li key={a.slug}>
                        <Link href={`/autores/${a.slug}`} className="block px-3 py-2 text-sm text-primary-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-slate-700 rounded-sm transition-colors">
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link href="/proximas-traducciones" className="nav-link">Próximas traducciones</Link>
            <Link href="/acerca" className="nav-link">Sobre el Panel</Link>
            <Link href="/contacto" className="nav-link">Contacto</Link>

            {/* Acceso */}
            <Link href="/admin" className="nav-link text-accent-700 hover:text-accent-800 dark:text-accent-500 dark:hover:text-accent-400">Acceso</Link>
            
            {/* Theme Toggle */}
            <ThemeToggle size="md" />
          </nav>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle size="sm" />
            <button
              className="p-2 text-primary-700 dark:text-neutral-300"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(prev => !prev)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel — siempre en DOM para animar apertura/cierre */}
        <div
          className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          aria-hidden={!mobileOpen}
        >
          <div className="overflow-hidden">
            <div className="border-t border-primary-100 dark:border-slate-800 py-3 min-h-0">
              <nav className={`flex flex-col space-y-2 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 delay-75' : 'opacity-0'}`}>
                <Link href="/autores" className="nav-link" onClick={() => setMobileOpen(false)}>Autores</Link>
                <div>
                  <div className="text-sm font-medium text-primary-700 dark:text-neutral-300 mt-2 mb-1">Autores principales</div>
                  <ul className="grid grid-cols-1 gap-1">
                    {authors.map(a => (
                      <li key={a.slug}>
                        <Link href={`/autores/${a.slug}`} className="block px-3 py-2 text-sm text-primary-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-sm transition-colors" onClick={() => setMobileOpen(false)}>
                          {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/proximas-traducciones" className="nav-link" onClick={() => setMobileOpen(false)}>Próximas traducciones</Link>
                <Link href="/acerca" className="nav-link" onClick={() => setMobileOpen(false)}>Sobre el Panel</Link>
                <Link href="/contacto" className="nav-link" onClick={() => setMobileOpen(false)}>Contacto</Link>
                <Link href="/admin" className="nav-link text-accent-700 dark:text-accent-500" onClick={() => setMobileOpen(false)}>Acceso</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
