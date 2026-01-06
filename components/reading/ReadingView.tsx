'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Menu, X, BookOpen, ChevronUp, ChevronDown, PanelLeft, PanelLeftClose, Library, Focus } from 'lucide-react'
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
    archivoDoc?: string;
    archivoPdf?: string;
    archivoEpub?: string;
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
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1920)
  
  // Ocultar sidebars por defecto según el tamaño de pantalla
  useEffect(() => {
    const checkWindowSize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      if (width < 1024) {
        // En pantallas menores a 1024px, ocultar ambos sidebars
        setLibraryOpen(false)
        setTocOpen(false)
      } else if (width < 1200) {
        // En pantallas menores a 1200px, ocultar solo el sidebar izquierdo
        setLibraryOpen(false)
        setTocOpen(true)
      } else {
        // En pantallas mayores, mostrar ambos
        setLibraryOpen(true)
        setTocOpen(true)
      }
    }
    
    // Verificar al cargar
    checkWindowSize()
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkWindowSize)
    
    return () => {
      window.removeEventListener('resize', checkWindowSize)
    }
  }, [])
  const contentRef = useRef<HTMLDivElement>(null)
  const [highlightTerm, setHighlightTerm] = useState<string>(highlightQuery || '')
  const [occurrences, setOccurrences] = useState<number[]>([])
  const [currentOccurrenceIndex, setCurrentOccurrenceIndex] = useState<number>(0)
  const [showFinderBar, setShowFinderBar] = useState<boolean>(false)
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(0)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [showCopyDropdown, setShowCopyDropdown] = useState<number | null>(null)
  const [focusMode, setFocusMode] = useState<boolean>(false)
  const [paragraphInput, setParagraphInput] = useState<string>('')
  const [showParagraphInput, setShowParagraphInput] = useState<boolean>(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const isNavigatingToHash = useRef<boolean>(false)

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

  // Scroll to paragraph on load (solo si viene de props, no de hash)
  useEffect(() => {
    // Si hay un hash en la URL, el handleHashChange se encargará de navegar
    if (window.location.hash) {
      return
    }
    
    if (currentParagraph) {
      isNavigatingToHash.current = true
      // Pequeño delay para asegurar que el DOM esté renderizado
      setTimeout(() => {
        const element = document.getElementById(`p${currentParagraph}`)
        if (element) {
          scrollToElement(element, false) // No centrar, solo scroll al inicio con offset
          setActiveParagraph(currentParagraph)
          
          // Agregar resaltado temporal después del scroll
          setTimeout(() => {
            element.classList.add('paragraph-highlight-temp')
            
            // Remover el resaltado después de 3 segundos
            setTimeout(() => {
              element.classList.remove('paragraph-highlight-temp')
              isNavigatingToHash.current = false
            }, 3000)
          }, 300) // Delay adicional para que el scroll termine
        } else {
          isNavigatingToHash.current = false
        }
      }, 200)
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

  // Función para calcular la altura total del header + breadcrumb
  const getHeaderOffset = (): number => {
    if (focusMode) {
      // En modo focus, solo hay breadcrumb fijo
      const breadcrumb = document.getElementById('breadcrumb')
      return breadcrumb ? breadcrumb.offsetHeight : 73
    }
    
    // Calcular altura del header
    const header = document.getElementById('header')
    const headerHeight = header ? header.offsetHeight : 73
    
    // Calcular altura del breadcrumb
    const breadcrumb = document.getElementById('breadcrumb')
    const breadcrumbHeight = breadcrumb ? breadcrumb.offsetHeight : (isScrolled ? 57 : 73) // py-2 = ~57px, py-4 = ~73px
    
    return headerHeight + breadcrumbHeight
  }

  // Detectar cambios en el hash de la URL para resaltado temporal
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#p')) {
        const paragraphNum = parseInt(hash.substring(2))
        if (!isNaN(paragraphNum)) {
          isNavigatingToHash.current = true
          
          // Esperar a que el DOM esté completamente renderizado y los estilos aplicados
          setTimeout(() => {
            const element = document.getElementById(`p${paragraphNum}`)
            if (element) {
              // Calcular offset correcto
              const headerOffset = getHeaderOffset()
              const elementRect = element.getBoundingClientRect()
              const absoluteElementTop = elementRect.top + window.pageYOffset
              const finalPosition = absoluteElementTop - headerOffset - 16
              
              // Usar scrollTo con behavior: 'auto' para evitar animaciones que interfieran
              window.scrollTo({
                top: Math.max(0, finalPosition),
                behavior: 'auto'
              })
              
              // Después del scroll inicial, hacer un scroll suave para el ajuste fino
              setTimeout(() => {
                const newRect = element.getBoundingClientRect()
                const newAbsoluteTop = newRect.top + window.pageYOffset
                const newFinalPosition = newAbsoluteTop - headerOffset - 16
                
                window.scrollTo({
                  top: Math.max(0, newFinalPosition),
                  behavior: 'smooth'
                })
                
                setActiveParagraph(paragraphNum)
                
                // Agregar resaltado temporal después del scroll
                setTimeout(() => {
                  element.classList.add('paragraph-highlight-temp')
                  
                  // Remover el resaltado después de 3 segundos
                  setTimeout(() => {
                    element.classList.remove('paragraph-highlight-temp')
                  }, 3000)
                  
                  // Permitir que el scroll handler actualice la URL de nuevo
                  setTimeout(() => {
                    isNavigatingToHash.current = false
                  }, 1000)
                }, 300)
              }, 50)
            } else {
              isNavigatingToHash.current = false
            }
          }, 200) // Delay mayor para asegurar que todo esté renderizado
        } else if (hash.startsWith('#section-')) {
          // Manejar navegación a secciones por hash
          const sectionId = hash.substring(1)
          const sectionElement = document.getElementById(sectionId)
          if (sectionElement) {
            isNavigatingToHash.current = true
            setTimeout(() => {
              scrollToElement(sectionElement, false)
              setTimeout(() => {
                isNavigatingToHash.current = false
              }, 1000)
            }, 200)
          }
        }
      }
    }

    // Ejecutar inmediatamente si hay hash en la URL
    if (window.location.hash) {
      handleHashChange()
    }

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [focusMode, isScrolled]) // Agregar dependencias para recalcular offset

  // Detectar scroll para hacer el header más fino y actualizar scroll-margin-top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 20)
    }
    
    // Actualizar scroll-margin-top dinámicamente
    const updateScrollMargin = () => {
      // Calcular offset dinámicamente
      let offset = 150 // Valor por defecto
      if (typeof window !== 'undefined') {
        if (focusMode) {
          const breadcrumb = document.getElementById('breadcrumb')
          offset = breadcrumb ? breadcrumb.offsetHeight + 16 : 89
        } else {
          const header = document.getElementById('header')
          const breadcrumb = document.getElementById('breadcrumb')
          const headerHeight = header ? header.offsetHeight : 73
          const breadcrumbHeight = breadcrumb ? breadcrumb.offsetHeight : (isScrolled ? 57 : 73)
          offset = headerHeight + breadcrumbHeight + 16
        }
      }
      
      // Aplicar a párrafos y secciones
      document.querySelectorAll('.paragraph, .section-header').forEach((el) => {
        (el as HTMLElement).style.scrollMarginTop = `${offset}px`
      })
    }

    window.addEventListener('scroll', handleScroll)
    
    // Actualizar scroll margin al cargar y cuando cambie el tamaño de la ventana o estado
    updateScrollMargin()
    window.addEventListener('resize', updateScrollMargin)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateScrollMargin)
    }
  }, [focusMode, isScrolled])

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
        case 'l':
        case 'L':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setFocusMode(!focusMode)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeParagraph, parrafos.length, tocOpen, focusMode])

  // Helper function to scroll to element with proper offset for fixed headers
  const scrollToElement = (element: HTMLElement, center: boolean = true) => {
    const headerOffset = getHeaderOffset()
    const elementRect = element.getBoundingClientRect()
    const absoluteElementTop = elementRect.top + window.pageYOffset
    const viewportHeight = window.innerHeight
    const elementHeight = elementRect.height
    
    let finalPosition: number
    
    if (center) {
      // Calcular posición para centrar verticalmente
      const centerPosition = absoluteElementTop - (viewportHeight / 2) + (elementHeight / 2)
      finalPosition = centerPosition
    } else {
      // Scroll al inicio del elemento con offset para header
      finalPosition = absoluteElementTop - headerOffset - 16 // 16px de margen adicional
    }
    
    window.scrollTo({
      top: Math.max(0, finalPosition), // No permitir scroll negativo
      behavior: 'smooth'
    })
  }

  // Navigate to specific paragraph
  const navigateToParagraph = (paragraphNumber: number) => {
    const targetParagraph = Math.max(1, Math.min(paragraphNumber, parrafos.length))
    const element = document.getElementById(`p${targetParagraph}`)
    if (element) {
      scrollToElement(element)
      setActiveParagraph(targetParagraph)
      
      // Agregar resaltado temporal después del scroll
      setTimeout(() => {
        element.classList.add('paragraph-highlight-temp')
        
        // Remover el resaltado después de 3 segundos
        setTimeout(() => {
          element.classList.remove('paragraph-highlight-temp')
        }, 3000)
      }, 300) // Delay adicional para que el scroll termine
    }
  }


  // Navigate to section
  const navigateToSection = (sectionTitle: string) => {
    const sectionElement = document.getElementById(`section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`)
    if (sectionElement) {
      // Usar scrollToElement con offset para header
      scrollToElement(sectionElement, false) // false = no centrar, solo scroll al inicio
      // No cerrar el sidebar automáticamente
      // setTocOpen(false)
      // Update active section
      setActiveSection(sectionTitle)
    }
  }

  // Update active paragraph and section usando IntersectionObserver
  useEffect(() => {
    if (isNavigatingToHash.current) {
      return
    }

    const paragraphElements = document.querySelectorAll('.paragraph')
    const observers: IntersectionObserver[] = []

    paragraphElements.forEach((element) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              const paragraphNum = parseInt(element.id.replace('p', ''))
              if (paragraphNum !== activeParagraph) {
                setActiveParagraph(paragraphNum)
                
                // Update active section based on current paragraph
                const paragraph = parrafos.find(p => p.numero === paragraphNum)
                if (paragraph?.seccion) {
                  setActiveSection(paragraph.seccion)
                }

                // Update URL without page reload
                const url = new URL(window.location.href)
                url.hash = `p${paragraphNum}`
                if (highlightTerm && highlightTerm.length > 0) {
                  url.searchParams.set('q', highlightTerm)
                } else {
                  url.searchParams.delete('q')
                }
                const newUrl = `${url.pathname}${url.search}${url.hash}`
                window.history.replaceState({}, '', newUrl)

                // Sincronizar scroll del sidebar
                if (sidebarScrollRef.current && paragraph?.seccion) {
                  const activeSectionElement = sidebarScrollRef.current.querySelector(
                    `[data-section="${paragraph.seccion.toLowerCase().replace(/\s+/g, '-')}"]`
                  )
                  if (activeSectionElement) {
                    const sidebarRect = sidebarScrollRef.current.getBoundingClientRect()
                    const elementRect = activeSectionElement.getBoundingClientRect()
                    
                    if (elementRect.top < sidebarRect.top || elementRect.bottom > sidebarRect.bottom) {
                      activeSectionElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                      })
                    }
                  }
                }
              }
            }
          })
        },
        {
          root: null,
          rootMargin: '-20% 0px -20% 0px', // Elemento debe estar en el 60% central del viewport
          threshold: [0, 0.5, 1]
        }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [parrafos, highlightTerm, activeParagraph])

  const renderTableOfContents = (sections: Section[], level: number = 0): JSX.Element[] => {
    return sections.map((section) => (
      <div key={`${section.id}-${level}`} className={`ml-${level * 3}`}>
        <button
          onClick={() => navigateToSection(section.titulo)}
          data-section={section.titulo.toLowerCase().replace(/\s+/g, '-')}
          className={`w-full text-left py-1 px-2 text-xs hover:text-primary-800 transition-colors rounded-sm ${
            activeSection === section.titulo ? 'text-primary-900 font-medium bg-neutral-200' : 'text-primary-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{section.titulo}</span>
            <span className="text-xs text-primary-500 ml-1 flex-shrink-0">
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

  // Handle paragraph input navigation
  const handleParagraphInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const paragraphNum = parseInt(paragraphInput)
    if (!isNaN(paragraphNum) && paragraphNum >= 1 && paragraphNum <= parrafos.length) {
      navigateToParagraph(paragraphNum)
      setParagraphInput('')
      setShowParagraphInput(false)
    }
  }

  const handleParagraphInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Solo permitir números
    if (value === '' || /^\d+$/.test(value)) {
      setParagraphInput(value)
    }
  }

  const handleParagraphNumberClick = () => {
    setShowParagraphInput(true)
    setParagraphInput(activeParagraph.toString())
  }

  // Aplicar clase al body cuando esté en modo lectura sin distracciones
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode')
    } else {
      document.body.classList.remove('focus-mode')
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('focus-mode')
    }
  }, [focusMode])

  // Posicionar tooltips correctamente
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.hasAttribute && target.hasAttribute('data-tooltip')) {
        const rect = target.getBoundingClientRect()
        const tooltipText = target.getAttribute('data-tooltip') || ''
        
        // Crear tooltip en el body para evitar problemas de z-index
        const tooltipElement = document.createElement('div')
        tooltipElement.className = 'custom-tooltip'
        tooltipElement.textContent = tooltipText
        tooltipElement.style.position = 'fixed'
        tooltipElement.style.left = `${rect.left + rect.width / 2}px`
        tooltipElement.style.top = `${rect.bottom + 8}px`
        tooltipElement.style.transform = 'translateX(-50%)'
        tooltipElement.style.zIndex = '999999'
        tooltipElement.style.opacity = '1'
        tooltipElement.style.visibility = 'visible'
        
        // Crear flecha
        const arrowElement = document.createElement('div')
        arrowElement.className = 'custom-tooltip-arrow'
        arrowElement.style.position = 'fixed'
        arrowElement.style.left = `${rect.left + rect.width / 2}px`
        arrowElement.style.top = `${rect.bottom + 4}px`
        arrowElement.style.transform = 'translateX(-50%)'
        arrowElement.style.zIndex = '999999'
        arrowElement.style.opacity = '1'
        arrowElement.style.visibility = 'visible'
        
        document.body.appendChild(tooltipElement)
        document.body.appendChild(arrowElement)
        
        // Guardar referencias para limpiar después
        target.setAttribute('data-tooltip-element', 'true')
        target.setAttribute('data-tooltip-id', tooltipElement.id || 'tooltip-' + Date.now())
        target.setAttribute('data-arrow-id', arrowElement.id || 'arrow-' + Date.now())
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.hasAttribute && target.hasAttribute('data-tooltip')) {
        // Remover tooltips del DOM
        const tooltips = document.querySelectorAll('.custom-tooltip')
        const arrows = document.querySelectorAll('.custom-tooltip-arrow')
        
        tooltips.forEach(tooltip => tooltip.remove())
        arrows.forEach(arrow => arrow.remove())
      }
    }

    document.addEventListener('mouseenter', handleMouseEnter, true)
    document.addEventListener('mouseleave', handleMouseLeave, true)
    
    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
    }
  }, [])

  return (
    <>
      {/* Breadcrumb fijo con altura reducida al hacer scroll - FUERA del contenedor principal */}
      <div id={`breadcrumb`} className={`${focusMode ? 'fixed left-0 right-0' : 'sticky'} z-30 bg-white border-b border-neutral-200 transition-all duration-300 ${
        focusMode 
          ? 'top-0 py-2' 
          : isScrolled 
            ? 'top-[73px] py-2' 
            : 'top-[73px] py-4'
      }`}>
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
                data-tooltip={libraryOpen ? 'Ocultar biblioteca' : 'Mostrar biblioteca'}
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
                data-tooltip={tocOpen ? 'Ocultar índice de contenidos' : 'Mostrar índice de contenidos'}
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`p-2 transition-colors ${
                  focusMode 
                    ? 'text-accent-600 hover:text-accent-800' 
                    : 'text-primary-600 hover:text-primary-800'
                }`}
                data-tooltip={focusMode ? 'Salir del modo lectura enfocada' : 'Activar modo lectura enfocada'}
              >
                <Focus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-50">

      {/* Contenido principal con ancho fijo */}
      <main 
        ref={contentRef}
        className={`mx-auto max-w-4xl max-[1400px]:max-w-[700px] px-4 lg:px-8 min-h-screen ${
          windowWidth < 1200 && windowWidth >= 1024 ? 'ml-4' : ''
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
                      className="paragraph"
                    >
                      <div className="relative">
                        <div 
                          className={`paragraph-number transition-colors duration-300 w-5 h-5 flex items-center justify-center text-xs font-medium ${
                            activeParagraph === parrafo.numero 
                              ? 'paragraph-number-active' 
                              : ''
                          }`}
                          onClick={() => setShowCopyDropdown(showCopyDropdown === parrafo.numero ? null : parrafo.numero)}
                          style={{ cursor: 'pointer' }}
                        >
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
                        <div 
                          className="paragraph-content"
                          dangerouslySetInnerHTML={{ __html: highlightHtml(parrafo.texto, highlightTerm, parrafo.numero) }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

      {/* Sidebar izquierdo flotante - Biblioteca */}
      <aside 
        className={`
          fixed left-0 w-64 bg-white lg:bg-gradient-to-l lg:from-neutral-100 lg:to-neutral-50
          border-r border-neutral-200 transition-all duration-300 z-30
          ${libraryOpen && !focusMode ? 'translate-x-0' : '-translate-x-full'}
          ${isScrolled ? 'top-[126px]' : 'top-[142px]'}
        `}
        style={{
          height: isScrolled ? 'calc(100vh - 126px)' : 'calc(100vh - 142px)'
        }}
      >
        <div className="h-full overflow-y-auto">
          {/* Header del sidebar izquierdo */}
          <div className="flex items-center justify-between p-3 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <Library className="w-4 h-4 text-primary-700" />
              <h3 className="font-medium text-primary-900 text-base">Biblioteca</h3>
            </div>
            <button
              onClick={() => setLibraryOpen(false)}
              className="p-1 text-primary-500 hover:text-primary-700"
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

      {/* Sidebar derecho flotante - Índice */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed right-0 w-64 bg-white lg:bg-gradient-to-r lg:from-neutral-100 lg:to-neutral-50
          border-l border-neutral-200 transition-all duration-300 z-30
          ${tocOpen && !focusMode ? 'translate-x-0' : 'translate-x-full'}
          ${isScrolled ? 'top-[126px]' : 'top-[142px]'}
        `}
        style={{
          height: isScrolled ? 'calc(100vh - 126px)' : 'calc(100vh - 142px)'
        }}
      >
          <div ref={sidebarScrollRef} className="h-full overflow-y-auto lg:overflow-y-auto">
            {/* Header del sidebar derecho */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-200">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary-700" />
                <h3 className="font-medium text-primary-900 text-base">Índice</h3>
              </div>
              <button
                onClick={() => setTocOpen(false)}
                className="p-1 text-primary-500 hover:text-primary-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del índice */}
            <div className="p-4">
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

              {/* Sección de Descargas */}
              {(obra.archivoPdf || obra.archivoDoc || obra.archivoEpub) && (
                <div className="mt-6 pt-4 border-t border-neutral-200">
                  <h4 className="font-medium text-primary-900 mb-3">Descargas</h4>
                  <div className="flex space-x-2">
                    {obra.archivoPdf && (
                      <a
                        href={`/api/files/${obra.archivoPdf}`}
                        download
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">PDF</span>
                      </a>
                    )}
                    
                    {obra.archivoDoc && (
                      <a
                        href={`/api/files/${obra.archivoDoc}`}
                        download
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">DOC</span>
                      </a>
                    )}
                    
                    {obra.archivoEpub && (
                      <a
                        href={`/api/files/${obra.archivoEpub}`}
                        download
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded transition-colors"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">EPUB</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-neutral-200">
                <h4 className="font-medium text-primary-900 mb-2">Navegación</h4>
                <p className="text-xs text-neutral-600 mb-4">
                  Para navegar a un párrafo en concreto, introduzca el número a continuación.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Párrafo actual:</span>
                    {showParagraphInput ? (
                      <form onSubmit={handleParagraphInputSubmit} className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={paragraphInput}
                          onChange={handleParagraphInputChange}
                          onBlur={() => setShowParagraphInput(false)}
                          className="w-12 px-1 py-0.5 text-xs text-center border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Nº"
                          autoFocus
                        />
                        <span className="text-xs text-neutral-500">de {parrafos.length}</span>
                      </form>
                    ) : (
                      <span 
                        className="font-medium text-primary-900 cursor-pointer hover:text-primary-700 transition-colors"
                        onClick={handleParagraphNumberClick}
                        title="Hacer clic para navegar a un párrafo específico"
                      >
                        {activeParagraph} de {parrafos.length}
                      </span>
                    )}
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
                    <p>Ctrl+L Modo lectura concentrada</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </aside>

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

      {/* Pestaña para mostrar biblioteca cuando está oculta */}
      {!libraryOpen && !focusMode && (
        <button
          onClick={() => setLibraryOpen(true)}
          className="sidebar-tab sidebar-tab-left"
          title="Mostrar biblioteca"
        >
          <Library className="w-4 h-4" />
        </button>
      )}

      {/* Pestaña para mostrar índice cuando está oculto */}
      {!tocOpen && !focusMode && (
        <button
          onClick={() => setTocOpen(true)}
          className="sidebar-tab sidebar-tab-right"
          title="Mostrar índice"
        >
          <BookOpen className="w-4 h-4" />
        </button>
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
    </>
  )
}