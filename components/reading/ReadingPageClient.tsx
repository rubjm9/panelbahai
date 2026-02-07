'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ReadingView, { Section } from './ReadingView'
import WorksTree from './WorksTree'

export interface ObraData {
  obra: {
    titulo: string
    autor: string
    autorSlug: string
    slug: string
    archivoDoc?: string
    archivoPdf?: string
    archivoEpub?: string
  }
  parrafos: { numero: number; texto: string; seccion?: string }[]
  secciones: Section[]
}

function normalizeApiData(data: {
  obra: { titulo: string; slug: string; autor: { nombre: string; slug: string }; archivoDoc?: string; archivoPdf?: string; archivoEpub?: string }
  secciones: { _id: string; titulo: string; slug: string; nivel: number; orden: number; subsecciones?: { _id: string; titulo: string; slug: string; nivel: number; orden: number; subsecciones?: any[] }[] }[]
  parrafos: { numero: number; texto: string; seccion?: string }[]
}): ObraData {
  const mapSection = (sec: any): Section => ({
    id: sec._id || sec.id,
    titulo: sec.titulo,
    slug: sec.slug,
    nivel: sec.nivel,
    orden: sec.orden,
    subsecciones: (sec.subsecciones || []).map(mapSection)
  })

  return {
    obra: {
      titulo: data.obra.titulo,
      autor: data.obra.autor.nombre,
      autorSlug: data.obra.autor.slug,
      slug: data.obra.slug,
      archivoDoc: data.obra.archivoDoc,
      archivoPdf: data.obra.archivoPdf,
      archivoEpub: data.obra.archivoEpub
    },
    secciones: (data.secciones || []).map(mapSection),
    parrafos: data.parrafos || []
  }
}

interface ReadingPageClientProps {
  initialData: ObraData
  currentParagraph?: number
  highlightQuery?: string
}

const FADE_DURATION_MS = 120

export default function ReadingPageClient({
  initialData,
  currentParagraph,
  highlightQuery
}: ReadingPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [workData, setWorkData] = useState<ObraData>(initialData)
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'out' | 'skeleton' | 'in'>('idle')
  const [isLoading, setIsLoading] = useState(false)

  // Actualizar título del documento cuando cambia la obra (navegación cliente)
  useEffect(() => {
    if (workData && workData.obra) {
      document.title = `${workData.obra.titulo} - ${workData.obra.autor} | Panel Bahá'í`
    }
  }, [workData])

  const handleObraSelect = useCallback(async (autorSlug: string, obraSlug: string) => {
    const targetPath = `/autores/${autorSlug}/${obraSlug}`
    if (pathname === targetPath) return

    setTransitionPhase('out')
    setIsLoading(true)

    // Mostrar skeleton solo después del fade-out para no tapar la animación
    const skeletonTimer = setTimeout(() => {
      setTransitionPhase(prev => (prev === 'out' ? 'skeleton' : prev))
    }, FADE_DURATION_MS)

    fetch(`${window.location.origin}/api/obras/${obraSlug}?autor=${autorSlug}`)
      .then(res => res.json())
      .then((json) => {
        if (!json.success || !json.data) {
          clearTimeout(skeletonTimer)
          router.push(targetPath)
          setTransitionPhase('idle')
          setIsLoading(false)
          return
        }
        const next = normalizeApiData(json.data)
        setWorkData(next)
        setTransitionPhase('in')
        window.history.replaceState(null, '', targetPath)
        setTimeout(() => {
          setTransitionPhase('idle')
          setIsLoading(false)
        }, FADE_DURATION_MS)
      })
      .catch(() => {
        clearTimeout(skeletonTimer)
        router.push(targetPath)
        setTransitionPhase('idle')
        setIsLoading(false)
      })
  }, [pathname, router])

  const opacityClass =
    transitionPhase === 'out'
      ? 'reading-content-transition reading-content-fade-out'
      : transitionPhase === 'in'
        ? 'reading-content-transition reading-content-fade-in'
        : ''

  return (
    <ReadingView
      obra={workData.obra}
      parrafos={workData.parrafos}
      secciones={workData.secciones}
      currentParagraph={currentParagraph}
      highlightQuery={highlightQuery}
      onObraSelect={handleObraSelect}
      contentWrapperClassName={opacityClass}
      showSkeleton={transitionPhase === 'skeleton'}
    />
  )
}
