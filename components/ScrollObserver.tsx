/**
 * Componente ScrollObserver
 * Observa elementos con IntersectionObserver para detectar visibilidad
 */

'use client'

import { useEffect, useRef, ReactNode } from 'react';
import { useMultipleIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface ScrollObserverProps {
  children: ReactNode;
  onElementVisible?: (element: HTMLElement, entry: IntersectionObserverEntry) => void;
  onElementHidden?: (element: HTMLElement, entry: IntersectionObserverEntry) => void;
  selector?: string; // Selector CSS para elementos a observar
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

export default function ScrollObserver({
  children,
  onElementVisible,
  onElementHidden,
  selector = '.paragraph, .section-header',
  rootMargin = '0px',
  threshold = [0, 0.1, 0.5, 1],
  enabled = true
}: ScrollObserverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observedElementsRef = useRef<Map<Element, () => void>>(new Map());

  const { observeElement } = useMultipleIntersectionObserver(
    (entry) => {
      const element = entry.target as HTMLElement;
      
      if (entry.isIntersecting) {
        onElementVisible?.(element, entry);
      } else {
        onElementHidden?.(element, entry);
      }
    },
    {
      rootMargin,
      threshold,
      enabled
    }
  );

  // Observar elementos cuando se monta o cambia el contenido
  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const elements = container.querySelectorAll(selector);

    // Limpiar observadores anteriores
    observedElementsRef.current.forEach((cleanup) => cleanup());
    observedElementsRef.current.clear();

    // Observar nuevos elementos
    elements.forEach((element) => {
      const cleanup = observeElement(element);
      observedElementsRef.current.set(element, cleanup);
    });

    return () => {
      observedElementsRef.current.forEach((cleanup) => cleanup());
      observedElementsRef.current.clear();
    };
  }, [children, selector, enabled, observeElement]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}


