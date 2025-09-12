export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-primary-900 text-white mt-16">
      <div className="container-elegant py-12">
        <div className="grid-elegant md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-medium mb-4 text-white">Panel de Traducción</h4>
            <p className="text-primary-200 leading-relaxed">
              Dedicado a hacer accesible la literatura bahá'í en español con la más alta calidad.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-white">Enlaces</h4>
            <ul className="space-y-3 text-primary-200">
              <li><a href="/acerca" className="hover:text-white transition-colors">Acerca del Panel</a></li>
              <li><a href="/proximas" className="hover:text-white transition-colors">Próximas Traducciones</a></li>
              <li><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="/autores" className="hover:text-white transition-colors">Autores</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-white">Recursos Oficiales</h4>
            <ul className="space-y-3 text-primary-200">
              <li><a href="https://bahai.org" className="hover:text-white transition-colors">Bahá'í.org</a></li>
              <li><a href="https://bahai.org/library" className="hover:text-white transition-colors">Bahá'í Reference Library</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-primary-300">
          <p>&copy; {year} Panel de Traducción de Literatura Bahá'í al Español</p>
        </div>
      </div>
    </footer>
  )
}
