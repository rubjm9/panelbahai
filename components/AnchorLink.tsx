/**
 * Componente AnchorLink
 * Enlace con scroll suave y accesible
 */

'use client'

import { ReactNode, MouseEvent, useCallback } from 'react';
import Link from 'next/link';

interface AnchorLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  scrollOffset?: number; // Offset adicional para scroll (por defecto usa scroll-margin-top del elemento)
  smooth?: boolean;
  onNavigate?: () => void;
}

export default function AnchorLink({
  href,
  children,
  className = '',
  scrollOffset,
  smooth = true,
  onNavigate
}: AnchorLinkProps) {
  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // Si el href no es un hash, dejar que Next.js maneje la navegación
    if (!href.startsWith('#')) {
      onNavigate?.();
      return;
    }

    e.preventDefault();
    const hash = href.substring(1);
    const element = document.getElementById(hash);

    if (!element) {
      // Si el elemento no existe, hacer scroll normal
      window.location.href = href;
      onNavigate?.();
      return;
    }

    // Calcular offset
    let offset = scrollOffset ?? 0;
    
    // Si no se especifica offset, usar scroll-margin-top del elemento
    if (!scrollOffset) {
      const computedStyle = window.getComputedStyle(element);
      const scrollMarginTop = parseInt(computedStyle.scrollMarginTop) || 0;
      offset = scrollMarginTop;
    }

    // Calcular posición final
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const finalPosition = absoluteElementTop - offset;

    // Scroll suave o instantáneo
    window.scrollTo({
      top: Math.max(0, finalPosition),
      behavior: smooth ? 'smooth' : 'auto'
    });

    // Actualizar hash en URL sin hacer scroll adicional
    window.history.pushState(null, '', href);

    // Enfocar el elemento para accesibilidad
    element.focus({ preventScroll: true });

    // Agregar clase temporal para resaltado
    element.classList.add('anchor-highlight');
    setTimeout(() => {
      element.classList.remove('anchor-highlight');
    }, 2000);

    onNavigate?.();
  }, [href, scrollOffset, smooth, onNavigate]);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={`Navegar a ${href.substring(1)}`}
    >
      {children}
    </Link>
  );
}


