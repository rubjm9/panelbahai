
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if consent is already given
        const consent = localStorage.getItem('cookie_consent_accepted')
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const acceptCookies = () => {
        localStorage.setItem('cookie_consent_accepted', 'true')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 right-0 p-4 md:p-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-midnight-800 rounded-lg shadow-elegant-xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-5 overflow-hidden relative">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    aria-label="Cerrar aviso de cookies"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-medium text-primary-900 dark:text-gray-100 mb-2">
                    Uso de cookies
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    Utilizamos cookies propias y de terceros para mejorar su experiencia y analizar el uso de nuestra web. Al continuar navegando, acepta su uso conforme a nuestra política.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={acceptCookies}
                        className="flex-1 bg-primary-800 hover:bg-primary-900 text-white dark:bg-primary-600 dark:hover:bg-primary-500 font-medium py-2 px-4 rounded transition-colors text-sm text-center"
                    >
                        Aceptar todas
                    </button>

                    <Link
                        href="/politica-cookies"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded transition-colors text-sm text-center"
                    >
                        Ver política
                    </Link>
                </div>
            </div>
        </div>
    )
}
