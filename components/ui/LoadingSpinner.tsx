/**
 * Componente LoadingSpinner
 */

'use client'

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  label?: string;
}

const sizes = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8'
};

export default function LoadingSpinner({
  size = 'medium',
  className = '',
  label = 'Cargando...'
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label={label}>
      <Loader2 className={`${sizes[size]} animate-spin text-accent-600`} />
      <span className="sr-only">{label}</span>
    </div>
  );
}


