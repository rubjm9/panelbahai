interface SiteFooterProps {
  variant?: 'default' | 'minimal'
}

export default function SiteFooter({ variant = 'default' }: SiteFooterProps) {
  const year = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer className="w-full py-6 mt-auto border-t border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            &copy; {year} Panel de Traducción de Literatura Bahá'í al Español
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-primary-900 dark:bg-midnight-900 text-white mt-0 transition-colors duration-200">
      <div className="container-elegant py-12">
        <div className="grid-elegant md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-medium mb-4 text-white dark:text-neutral-100">Panel de Traducción</h4>
            <p className="text-primary-200 dark:text-neutral-400 leading-relaxed">
              Traducciones oficiales en español de los textos de autoridad de la Fe bahá'í.
            </p>
          </div>
          <div>
            <ul className="space-y-3 text-primary-200 dark:text-neutral-400">
              <li><a href="/autores" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Autores</a></li>
              <li><a href="/proximas-traducciones" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Próximas Traducciones</a></li>
              <li><a href="/acerca" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Sobre el Panel</a></li>
              <li><a href="/contacto" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-white dark:text-neutral-100">Recursos Oficiales</h4>
            <ul className="space-y-3 text-primary-200 dark:text-neutral-400">
              <li><a href="https://bahai.org" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Bahá'í.org</a></li>
              <li><a href="https://bahai.org/library" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Bahá'í Reference Library</a></li>
              <li><a href="https://bahai.es/editorial/" target="_blank" rel="noopener noreferrer" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Editorial Bahá'í de España</a></li>
              <li><a href="/politica-privacidad" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Política de privacidad</a></li>
              <li><a href="/politica-cookies" className="hover:text-white dark:hover:text-neutral-100 transition-colors">Política de cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-800 dark:border-slate-800 mt-8 pt-6 text-center text-primary-300 dark:text-neutral-500">
          <p>&copy; {year} Panel de Traducción de Literatura Bahá'í al Español</p>
        </div>
      </div>
    </footer>
  )
}
