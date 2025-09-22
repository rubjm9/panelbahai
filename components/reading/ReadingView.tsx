'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Menu, X, BookOpen, ChevronUp, ChevronDown, PanelLeft, PanelLeftClose, Library } from 'lucide-react'
import Link from 'next/link'
import WorksTree from './WorksTree'

interface Paragraph {
  numero: number;
  texto: string;
  seccion?: string;
}

interface Section {
  id: string;
  titulo: string;
  slug: string;
  nivel: number;
  orden: number;
  subsecciones?: Section[];
}

interface ReadingViewProps {
  obra: {
    titulo: string;
    autor: string;
    autorSlug: string;
    slug: string;
  };
  parrafos: Paragraph[];
  secciones: Section[];
  currentParagraph?: number;
  highlightQuery?: string;
}

export default function ReadingView({ 
  obra, 
  parrafos, 
  secciones, 
  currentParagraph,
  highlightQuery
}: ReadingViewProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [activeParagraph, setActiveParagraph] = useState<number>(currentParagraph || 1)
  const [showToc, setShowToc] = useState(false)
  const [tocOpen, setTocOpen] = useState(true)
  const [libraryOpen, setLibraryOpen] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const [highlightTerm, setHighlightTerm] = useState<string>(highlightQuery || '')
  const [occurrences, setOccurrences] = useState<number[]>([])
  const [currentOccurrenceIndex, setCurrentOccurrenceIndex] = useState<number>(0)
  const [showFinderBar, setShowFinderBar] = useState<boolean>(false)
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(0)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [showCopyDropdown, setShowCopyDropdown] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  // Sincronizar término de resaltado desde props/URL/sessionStorage
  useEffect(() => {
    try {
      if (highlightQuery && highlightQuery.length > 0) {
        setHighlightTerm(highlightQuery)
        setShowFinderBar(true)
        return
      }
      const url = new URL(window.location.href)
      const qp = url.searchParams.get('q') || ''
      if (qp) {
        setHighlightTerm(qp)
        setShowFinderBar(true)
        return
      }
      const last = sessionStorage.getItem('lastSearchQuery') || ''
      if (last) {
        setHighlightTerm(last)
        setShowFinderBar(true)
        url.searchParams.set('q', last)
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
      }
    } catch {}
  }, [highlightQuery])

  // Encontrar todas las ocurrencias del término en los párrafos
  useEffect(() => {
    if (!highlightTerm || highlightTerm.trim().length === 0) {
      setOccurrences([])
      setCurrentOccurrenceIndex(0)
      setShowFinderBar(false)
      return
    }

    const found: number[] = []
    parrafos.forEach((parrafo) => {
      const regex = new RegExp(highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const matches = parrafo.texto.match(regex)
      if (matches) {
        // Agregar el número de párrafo por cada ocurrencia encontrada
        for (let i = 0; i < matches.length; i++) {
          found.push(parrafo.numero)
        }
      }
    })
    setOccurrences(found)
    setCurrentOccurrenceIndex(0)
  }, [highlightTerm, parrafos])

  // Sincronizar índice inicial cuando se carga con un párrafo específico
  useEffect(() => {
    if (currentParagraph && highlightTerm && occurrences.length > 0) {
      // Encontrar el índice de la ocurrencia que corresponde al párrafo actual
      let globalIndex = 0
      for (let i = 0; i < parrafos.length; i++) {
        const p = parrafos[i]
        if (p.numero < currentParagraph) {
          const regex = new RegExp(highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          const matches = p.texto.match(regex)
          if (matches) {
            globalIndex += matches.length
          }
        } else if (p.numero === currentParagraph) {
          break
        }
      }
      setCurrentOccurrenceIndex(globalIndex)
      
      // Actualizar resaltado después de un pequeño delay
      setTimeout(() => {
        updateHighlighting()
      }, 100)
    }
  }, [currentParagraph, highlightTerm, occurrences, parrafos])

  // Navegar a la siguiente ocurrencia
  const goToNextOccurrence = () => {
    if (occurrences.length === 0) return
    const nextIndex = (currentOccurrenceIndex + 1) % occurrences.length
    setCurrentOccurrenceIndex(nextIndex)
    const paragraphNum = occurrences[nextIndex]
    navigateToParagraph(paragraphNum)
    
    // Actualizar resaltado después de un pequeño delay
    setTimeout(() => {
      updateHighlighting()
    }, 100)
  }

  // Navegar a la ocurrencia anterior
  const goToPreviousOccurrence = () => {
    if (occurrences.length === 0) return
    const prevIndex = currentOccurrenceIndex === 0 ? occurrences.length - 1 : currentOccurrenceIndex - 1
    setCurrentOccurrenceIndex(prevIndex)
    const paragraphNum = occurrences[prevIndex]
    navigateToParagraph(paragraphNum)
    
    // Actualizar resaltado después de un pequeño delay
    setTimeout(() => {
      updateHighlighting()
    }, 100)
  }

  // Dejar de resaltar
  const clearHighlighting = () => {
    setHighlightTerm('')
    setShowFinderBar(false)
    setOccurrences([])
    setCurrentOccurrenceIndex(0)
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('q')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    } catch {}
  }

  // Utilidad para resaltar términos en HTML simple con foco activo
  const highlightHtml = (html: string, term?: string, paragraphNum?: number): string => {
    if (!term || term.trim().length === 0) return html
    try {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escaped})`, 'gi')
      let occurrenceIndex = 0
      
      return html.replace(regex, (match) => {
        // Calcular el índice global de esta ocurrencia
        let globalIndex = 0
        for (let i = 0; i < parrafos.length; i++) {
          const p = parrafos[i]
          if (p.numero < paragraphNum!) {
            const paragraphRegex = new RegExp(escaped, 'gi')
            const paragraphMatches = p.texto.match(paragraphRegex)
            if (paragraphMatches) {
              globalIndex += paragraphMatches.length
            }
          } else if (p.numero === paragraphNum) {
            break
          }
        }
        globalIndex += occurrenceIndex
        
        const isActive = globalIndex === currentOccurrenceIndex
        const className = isActive ? 'search-highlight-active' : 'search-highlight'
        occurrenceIndex++
        return `<mark class="${className}">${match}</mark>`
      })
    } catch {
      return html
    }
  }

  // Función para actualizar el resaltado cuando cambia la ocurrencia activa
  const updateHighlighting = () => {
    if (!highlightTerm || occurrences.length === 0) return
    
    // Forzar re-render de todos los párrafos
    const paragraphElements = document.querySelectorAll('.paragraph-content')
    paragraphElements.forEach((element, index) => {
      const paragraphNum = index + 1
      if (element.textContent) {
        element.innerHTML = highlightHtml(element.textContent, highlightTerm, paragraphNum)
      }
    })
  }

  // Scroll to paragraph on load
  useEffect(() => {
    if (currentParagraph) {
      const element = document.getElementById(`p${currentParagraph}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setActiveParagraph(currentParagraph)
      }
    }
    // Si no hay highlightQuery, intentar recuperar del sessionStorage
    try {
      if (!highlightQuery) {
        const last = sessionStorage.getItem('lastSearchQuery') || ''
        if (last && last.length > 0) {
          setHighlightTerm(last)
          setShowFinderBar(true)
          const url = new URL(window.location.href)
          url.searchParams.set('q', last)
          window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
        }
      }
    } catch {}
  }, [currentParagraph, highlightQuery])

  // Detectar scroll para hacer el header más fino
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCopyDropdown !== null) {
        const target = event.target as HTMLElement
        if (!target.closest('.paragraph-number')) {
          setShowCopyDropdown(null)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showCopyDropdown])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Don't interfere with form inputs
      }

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          navigateToParagraph(activeParagraph - 1)
          break
        case 'ArrowDown':
          event.preventDefault()
          navigateToParagraph(activeParagraph + 1)
          break
        case 'Home':
          event.preventDefault()
          navigateToParagraph(1)
          break
        case 'End':
          event.preventDefault()
          navigateToParagraph(parrafos.length)
          break
        case 'Escape':
          setTocOpen(false)
          break
        case 'i':
        case 'I':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setTocOpen(!tocOpen)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeParagraph, parrafos.length, tocOpen])

  // Navigate to specific paragraph
  const navigateToParagraph = (paragraphNumber: number) => {
    const targetParagraph = Math.max(1, Math.min(paragraphNumber, parrafos.length))
    const element = document.getElementById(`p${targetParagraph}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setActiveParagraph(targetParagraph)
    }
  }

  // Navigate to section
  const navigateToSection = (sectionTitle: string) => {
    const sectionElement = document.getElementById(`section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`)
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // No cerrar el sidebar automáticamente
      // setTocOpen(false)
      // Update active section
      setActiveSection(sectionTitle)
    }
  }

  // Update active paragraph and section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const paragraphElements = document.querySelectorAll('.paragraph')
      let currentActive = activeParagraph
      let currentSection = activeSection

      paragraphElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          const paragraphNum = parseInt(element.id.replace('p', ''))
          if (paragraphNum !== currentActive) {
            currentActive = paragraphNum
            // Update active section based on current paragraph
            const paragraph = parrafos.find(p => p.numero === paragraphNum)
            if (paragraph?.seccion) {
              currentSection = paragraph.seccion
            }
          }
        }
      })

      setActiveParagraph(currentActive)
      setActiveSection(currentSection)

      // Sincronizar scroll del sidebar
      if (sidebarScrollRef.current && currentSection) {
        const activeSectionElement = sidebarScrollRef.current.querySelector(`[data-section="${currentSection.toLowerCase().replace(/\s+/g, '-')}"]`)
        if (activeSectionElement) {
          const sidebarRect = sidebarScrollRef.current.getBoundingClientRect()
          const elementRect = activeSectionElement.getBoundingClientRect()
          
          // Solo hacer scroll si el elemento no está visible en el sidebar
          if (elementRect.top < sidebarRect.top || elementRect.bottom > sidebarRect.bottom) {
            activeSectionElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            })
          }
        }
      }

      // Update URL without page reload
      const url = new URL(window.location.href)
      url.hash = `p${currentActive}`
      if (highlightTerm && highlightTerm.length > 0) {
        url.searchParams.set('q', highlightTerm)
      } else {
        url.searchParams.delete('q')
      }
      const newUrl = `${url.pathname}${url.search}${url.hash}`
      window.history.replaceState({}, '', newUrl)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeParagraph, activeSection, parrafos])

  const renderTableOfContents = (sections: Section[], level: number = 0): JSX.Element[] => {
    return sections.map((section) => (
      <div key={`${section.id}-${level}`} className={`ml-${level * 3}`}>
        <button
          onClick={() => navigateToSection(section.titulo)}
          data-section={section.titulo.toLowerCase().replace(/\s+/g, '-')}
          className={`w-full text-left py-1.5 px-2 text-sm hover:text-primary-800 transition-colors rounded-sm ${
            activeSection === section.titulo ? 'text-primary-900 font-medium bg-neutral-200' : 'text-primary-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{section.titulo}</span>
            <span className="text-xs text-primary-500 ml-2 flex-shrink-0">
              {getSectionStartParagraph(section.titulo)}
            </span>
          </div>
        </button>
        {section.subsecciones && section.subsecciones.length > 0 && (
          <div className="ml-3">
            {renderTableOfContents(section.subsecciones, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  // Get paragraph count for a section
  const getSectionParagraphCount = (sectionSlug: string) => {
    return parrafos.filter(p => p.seccion === sectionSlug).length
  }

  // Get the starting paragraph number for a section
  const getSectionStartParagraph = (sectionTitle: string) => {
    const sectionParagraphs = parrafos.filter(p => p.seccion === sectionTitle)
    if (sectionParagraphs.length === 0) return 0
    return Math.min(...sectionParagraphs.map(p => p.numero))
  }

  const getCurrentSectionTitle = (): string => {
    const paragraph = parrafos.find(p => p.numero === activeParagraph)
    return paragraph?.seccion || ''
  }

  // Copy paragraph link to clipboard
  const copyParagraphLink = async (paragraphNum: number) => {
    try {
      const url = new URL(window.location.href)
      url.hash = `p${paragraphNum}`
      await navigator.clipboard.writeText(url.toString())
      setShowCopyDropdown(null)
      // Show a brief success message (you could add a toast notification here)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb fijo con altura reducida al hacer scroll */}
      <div className={`sticky top-[73px] z-30 bg-white border-b border-neutral-200 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="container-elegant">
          <div className="flex items-center justify-between">
            <nav className="breadcrumb">
              <Link href="/">Inicio</Link>
              <span className="mx-2">/</span>
              <Link href={`/autores/${obra.autorSlug}`}>
                {obra.autor}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary-900 font-medium">{obra.titulo}</span>
              {getCurrentSectionTitle() && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-primary-600">{getCurrentSectionTitle()}</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span className="text-primary-500">Párrafo {activeParagraph}</span>
            </nav>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLibraryOpen(!libraryOpen)}
                className={`p-2 transition-colors ${
                  libraryOpen 
                    ? 'text-accent-600 hover:text-accent-800' 
                    : 'text-primary-600 hover:text-primary-800'
                }`}
                title={libraryOpen ? 'Ocultar biblioteca' : 'Mostrar biblioteca'}
              >
                <Library className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className={`p-2 transition-colors ${
                  tocOpen 
                    ? 'text-accent-600 hover:text-accent-800' 
                    : 'text-primary-600 hover:text-primary-800'
                }`}
                title={tocOpen ? 'Ocultar índice' : 'Mostrar índice'}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar izquierdo - Biblioteca */}
        <aside 
          className={`
            fixed lg:sticky top-[120px] left-0 h-full lg:h-[calc(100vh-7.5rem)] w-80 bg-white lg:bg-gradient-to-l lg:from-neutral-100 lg:to-neutral-50
            border-r border-neutral-200 transition-transform duration-300 z-20
            ${libraryOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'}
          `}
        >
          <div className="h-full overflow-y-auto lg:overflow-y-auto">
            {/* Header del sidebar izquierdo */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <Library className="w-5 h-5 text-primary-700" />
                <h3 className="font-medium text-primary-900 text-lg">Biblioteca</h3>
              </div>
              <button
                onClick={() => setLibraryOpen(false)}
                className="lg:hidden p-1 text-primary-500 hover:text-primary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido de la biblioteca */}
            <WorksTree 
              currentObraSlug={obra.slug}
              currentAutorSlug={obra.autorSlug}
            />
          </div>
        </aside>

        {/* Contenido principal elegante */}
        <main 
          ref={contentRef}
          className={`flex-1 transition-all duration-300 ${
            libraryOpen && tocOpen ? 'lg:mx-16' : 
            libraryOpen ? 'lg:ml-80 lg:mr-auto lg:max-w-4xl' : 
            tocOpen ? 'lg:mr-80 lg:ml-auto lg:max-w-4xl' : 
            'lg:mx-auto lg:max-w-7xl'
          }`}
        >
          <div className="reading-content px-4 lg:px-8">
            <header className="mb-16 text-center">
              <h1 className="display-title mb-4">
                {obra.titulo}
              </h1>
              <p className="text-xl text-primary-600">
                por {obra.autor}
              </p>
            </header>

            <div className="prose prose-lg max-w-none">
              {parrafos.map((parrafo, index) => {
                // Check if this paragraph starts a new section
                const previousParagraph = index > 0 ? parrafos[index - 1] : null
                const isNewSection = parrafo.seccion && parrafo.seccion !== previousParagraph?.seccion
                
                return (
                  <div key={`${parrafo.numero}-${index}`}>
                    {/* Section header */}
                    {isNewSection && parrafo.seccion && (
                      <div 
                        id={`section-${parrafo.seccion.toLowerCase().replace(/\s+/g, '-')}`}
                        className="section-header mb-8 mt-12 first:mt-0"
                      >
                        <h2 className="text-2xl font-display font-semibold text-primary-800 border-b border-primary-200 pb-2">
                          {parrafo.seccion}
                        </h2>
                      </div>
                    )}
                    
                    {/* Paragraph */}
                    <div
                      id={`p${parrafo.numero}`}
                      className={`paragraph ${
                        activeParagraph === parrafo.numero ? 'bg-primary-25' : ''
                      }`}
                    >
                      <div className="relative flex items-center">
                        <div 
                          className={`paragraph-number transition-all duration-300 ${
                            activeParagraph === parrafo.numero 
                              ? 'bg-accent-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium' 
                              : ''
                          }`}
                          onClick={() => setShowCopyDropdown(showCopyDropdown === parrafo.numero ? null : parrafo.numero)}
                          style={{ cursor: 'pointer' }}
                        >
                          {parrafo.numero}
                        </div>
                        
                        {/* Dropdown para copiar enlace */}
                        {showCopyDropdown === parrafo.numero && (
                          <div className="absolute left-0 -top-1.5 z-50 bg-white border border-primary-200 rounded-sm shadow-lg py-1 min-w-48">
                            <button
                              onClick={() => copyParagraphLink(parrafo.numero)}
                              className="w-full text-left px-3 py-2 text-xs text-primary-700 hover:bg-primary-50 transition-colors font-sans font-semibold"
                            >
                              Copiar enlace a este párrafo
                            </button>
                          </div>
                        )}
                      </div>
                      <div 
                        className="paragraph-content"
                        dangerouslySetInnerHTML={{ __html: highlightHtml(parrafo.texto, highlightTerm, parrafo.numero) }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Sidebar derecho - Índice */}
        <aside 
          ref={sidebarRef}
          className={`
            fixed lg:sticky top-[120px] right-0 h-full lg:h-[calc(100vh-7.5rem)] w-80 bg-white lg:bg-gradient-to-r lg:from-neutral-100 lg:to-neutral-50
            border-l border-neutral-200 transition-transform duration-300 z-20
            ${tocOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'}
          `}
        >
          <div ref={sidebarScrollRef} className="h-full overflow-y-auto lg:overflow-y-auto">
            {/* Header del sidebar derecho */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary-700" />
                <h3 className="font-medium text-primary-900 text-lg">Índice</h3>
              </div>
              <button
                onClick={() => setTocOpen(false)}
                className="lg:hidden p-1 text-primary-500 hover:text-primary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del índice */}
            <div className="p-6">
              {secciones.length > 0 ? (
                <nav className="space-y-1">
                  {renderTableOfContents(secciones)}
                </nav>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                  <p className="text-sm text-primary-500">
                    Esta obra no tiene secciones definidas.
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h4 className="font-medium text-primary-900 mb-4">Navegación</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Párrafo actual:</span>
                    <span className="font-medium text-primary-900">
                      {activeParagraph} de {parrafos.length}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigateToParagraph(activeParagraph - 1)}
                      disabled={activeParagraph <= 1}
                      className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => navigateToParagraph(activeParagraph + 1)}
                      disabled={activeParagraph >= parrafos.length}
                      className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                    >
                      Siguiente →
                    </button>
                  </div>
                  
                  <div className="text-xs text-primary-500 space-y-1 pt-2 border-t border-primary-200">
                    <p><strong>Atajos de teclado:</strong></p>
                    <p>↑↓ Navegar párrafos</p>
                    <p>Home/End Ir al inicio/final</p>
                    <p>Ctrl+I Toggle índice</p>
                    <p>Esc Cerrar índice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Barra flotante de navegación de ocurrencias */}
      {showFinderBar && highlightTerm && occurrences.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white border border-primary-200 rounded-sm shadow-lg px-4 py-2 flex items-center space-x-3">
            <button
              onClick={goToPreviousOccurrence}
              className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
              title="Ocurrencia anterior"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="text-sm text-primary-700 font-medium min-w-0">
              {currentOccurrenceIndex + 1} de {occurrences.length}
            </span>
            <button
              onClick={goToNextOccurrence}
              className="p-1 text-primary-600 hover:text-primary-800 transition-colors"
              title="Siguiente ocurrencia"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-primary-200"></div>
            <button
              onClick={clearHighlighting}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 transition-colors"
              title="Dejar de resaltar"
            >
              <X className="w-4 h-4" />
              <span>Dejar de resaltar</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para móvil */}
      {(tocOpen || libraryOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-20 lg:hidden"
          onClick={() => {
            setTocOpen(false)
            setLibraryOpen(false)
          }}
        />
      )}
    </div>
  )
}