/**
 * Hook para IntersectionObserver
 * Observa elementos y detecta cuando entran/salen del viewport
 */

import { useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: UseIntersectionObserverOptions = {}
): RefObject<T> {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    enabled = true
  } = options;

  const elementRef = useRef<T>(null);
  const callbackRef = useRef(callback);

  // Mantener callback actualizado
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !elementRef.current) {
      return;
    }

    const element = elementRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        callbackRef.current(entries);
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [enabled, root, rootMargin, threshold]);

  return elementRef;
}

/**
 * Hook para observar múltiples elementos
 */
export function useMultipleIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: UseIntersectionObserverOptions = {}
) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    enabled = true
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const observeElement = (element: Element) => {
    if (!enabled) {
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          callbackRef.current(entry);
        });
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  };

  return { observeElement };
}


