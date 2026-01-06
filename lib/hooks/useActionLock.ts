/**
 * Hook para prevenir acciones concurrentes (doble submit, etc.)
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface LockState {
  isLocked: boolean;
  action: string | null;
  lockedAt: number | null;
}

export function useActionLock(timeout: number = 30000) {
  const [lockState, setLockState] = useState<LockState>({
    isLocked: false,
    action: null,
    lockedAt: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lock = useCallback((action: string) => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLockState({
      isLocked: true,
      action,
      lockedAt: Date.now()
    });

    // Auto-unlock después del timeout
    timeoutRef.current = setTimeout(() => {
      setLockState({
        isLocked: false,
        action: null,
        lockedAt: null
      });
    }, timeout);
  }, [timeout]);

  const unlock = useCallback((action?: string) => {
    // Si se especifica una acción, solo desbloquear si coincide
    if (action && lockState.action !== action) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setLockState({
      isLocked: false,
      action: null,
      lockedAt: null
    });
  }, [lockState.action]);

  const isLocked = useCallback((action?: string) => {
    if (!lockState.isLocked) {
      return false;
    }
    // Si se especifica una acción, verificar si es la misma
    if (action) {
      return lockState.action === action;
    }
    return true;
  }, [lockState]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLocked: lockState.isLocked,
    action: lockState.action,
    lock,
    unlock,
    isLockedFor: isLocked
  };
}


