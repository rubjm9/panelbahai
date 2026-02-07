'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_ID = 'G-Y7T3MCX0CN'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const isPublicPage = pathname && !pathname.startsWith('/admin')

  if (!isPublicPage) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
