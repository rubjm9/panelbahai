import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ConditionalLayout from '@/components/layout/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Panel de Traducción de Literatura Bahá\'í al Español',
  description: 'Biblioteca digital oficial de textos bahá\'ís traducidos al español',
  keywords: ['Bahá\'í', 'literatura', 'traducción', 'español', 'textos sagrados'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  )
}
