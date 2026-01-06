/**
 * Hook para gestionar focus visible
 * Detecta si el usuario navega con teclado o mouse
 */

import { useEffect, useState, useRef } from 'react';

export function useFocusVisible() {
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);
  const hadKeyboardEventRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar navegación por teclado (Tab, Shift+Tab, flechas, etc.)
      if (
        e.key === 'Tab' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown'
      ) {
        hadKeyboardEventRef.current = true;
        setIsKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEventRef.current = false;
      setIsKeyboardNavigation(false);
    };

    const handleFocus = (e: FocusEvent) => {
      if (hadKeyboardEventRef.current) {
        const target = e.target as HTMLElement;
        if (target) {
          target.classList.add('focus-visible');
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.classList.remove('focus-visible');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('focusout', handleBlur, true);
    };
  }, []);

  return { isKeyboardNavigation };
}


