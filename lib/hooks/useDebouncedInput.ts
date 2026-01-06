/**
 * Hook para input con debounce y throttling
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebouncedInputOptions {
  debounceMs?: number;
  throttleMs?: number;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}

export function useDebouncedInput(
  initialValue: string = '',
  options: UseDebouncedInputOptions = {}
) {
  const {
    debounceMs = 300,
    throttleMs,
    onChange,
    onSubmit
  } = options;

  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastThrottleTimeRef = useRef<number>(0);

  // Debounce: actualizar valor después de que el usuario deje de escribir
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      onChange?.(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceMs, onChange]);

  // Throttle: limitar frecuencia de actualizaciones
  const throttledOnChange = useCallback((newValue: string) => {
    if (!throttleMs) {
      onChange?.(newValue);
      return;
    }

    const now = Date.now();
    if (now - lastThrottleTimeRef.current >= throttleMs) {
      lastThrottleTimeRef.current = now;
      onChange?.(newValue);
    } else {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      throttleTimerRef.current = setTimeout(() => {
        lastThrottleTimeRef.current = Date.now();
        onChange?.(newValue);
      }, throttleMs - (now - lastThrottleTimeRef.current));
    }
  }, [throttleMs, onChange]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (throttleMs) {
      throttledOnChange(newValue);
    }
  }, [throttleMs, throttledOnChange]);

  const handleSubmit = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setDebouncedValue(value);
    onSubmit?.(value);
  }, [value, onSubmit]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return {
    value,
    debouncedValue,
    setValue: handleChange,
    submit: handleSubmit
  };
}


