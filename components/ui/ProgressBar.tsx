/**
 * Componente ProgressBar
 */

'use client'

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (label || value !== undefined) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-primary-700 font-medium">
            {label || 'Progreso'}
          </span>
          <span className="text-sm text-primary-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent-600 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progreso'}
        />
      </div>
    </div>
  );
}


