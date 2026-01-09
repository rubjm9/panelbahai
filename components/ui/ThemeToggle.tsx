'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-sm
        text-primary-700 hover:text-primary-900
        dark:text-neutral-300 dark:hover:text-neutral-100
        hover:bg-primary-100 dark:hover:bg-slate-800
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-800
        ${className}
      `}
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <Moon className={iconSizes[size]} />
      ) : (
        <Sun className={iconSizes[size]} />
      )}
    </button>
  )
}

