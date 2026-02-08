import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de privacidad | Panel de Traducción Bahá\'í',
  description: 'Información sobre el tratamiento de datos personales y cumplimiento del RGPD en el Panel de Traducción de Literatura Bahá\'í al Español.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-neutral-50 dark:bg-midnight-900 min-h-screen py-16">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-midnight-800 rounded-lg shadow-elegant p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-display font-medium text-primary-900 dark:text-gray-100 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            Política de privacidad
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y de la Ley Orgánica 3/2018 de protección de datos y garantía de los derechos digitales (LOPDGDD), esta política informa a los usuarios del sitio web del <strong>Panel de Traducción de Literatura Bahá'í al Español</strong> sobre el tratamiento de sus datos personales.
            </p>

            <h3>1. Responsable del tratamiento</h3>
            <p>
              El responsable del tratamiento de los datos personales es el Panel de Traducción de Literatura Bahá'í al Español. Para ejercer sus derechos o consultas en materia de privacidad puede dirigirse a través del formulario de <Link href="/contacto" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">contacto</Link> o al correo electrónico indicado en esta web.
            </p>

            <h3>2. Finalidades y base legal</h3>
            <p>
              Tratamos sus datos personales para las siguientes finalidades y con las bases legales indicadas:
            </p>
            <ul>
              <li><strong>Gestión de consultas y del formulario de contacto:</strong> responder a las solicitudes enviadas a través del formulario de contacto. Base legal: consentimiento del interesado (art. 6.1.a RGPD).</li>
              <li><strong>Navegación y uso del sitio web:</strong> gestión técnica, análisis de uso anónimo o pseudonimizado (por ejemplo mediante Google Analytics) para mejorar el servicio. Base legal: interés legítimo (art. 6.1.f RGPD) y, en su caso, consentimiento para cookies de análisis.</li>
              <li><strong>Gestión de la zona de administración:</strong> en caso de que acceda al área restringida, tratamiento de identificación y sesión. Base legal: ejecución de medidas precontractuales o contractuales y cumplimiento de obligaciones legales aplicables.</li>
            </ul>

            <h3>3. Datos que podemos tratar</h3>
            <p>
              En función del servicio que utilice, podemos tratar: datos de identificación (nombre, apellidos), dirección de correo electrónico, contenido de los mensajes enviados por el formulario de contacto, datos técnicos de navegación (dirección IP, tipo de navegador, páginas visitadas) y, en su caso, datos de acceso a la zona de administración. No recabamos datos especialmente protegidos (salud, ideología, etc.) a través de este sitio.
            </p>

            <h3>4. Destinatarios y transferencias</h3>
            <p>
              Los datos no se ceden a terceros salvo obligación legal o que sea necesario para la prestación del servicio (por ejemplo, proveedores de hosting o herramientas de análisis que actúen como encargados del tratamiento y estén sujetos a obligaciones de confidencialidad y garantías adecuadas). En caso de que se utilicen servicios fuera del Espacio Económico Europeo, se adoptarán las garantías previstas en el RGPD (cláusulas tipo, decisiones de adecuación, etc.).
            </p>

            <h3>5. Conservación de los datos</h3>
            <p>
              Los datos de contacto y mensajes se conservan durante el tiempo necesario para atender su consulta y, en su caso, para posibles comunicaciones relacionadas con el trabajo del Panel. Los datos de navegación y analíticos se conservan según la configuración de las herramientas utilizadas (por ejemplo, períodos de retención de Google Analytics). Una vez cumplida la finalidad, los datos se suprimen o se anonimizan, salvo que deban conservarse por obligación legal.
            </p>

            <h3>6. Sus derechos</h3>
            <p>
              Puede ejercer en cualquier momento los derechos que le reconoce el RGPD:
            </p>
            <ul>
              <li><strong>Acceso:</strong> conocer si tratamos sus datos y obtener una copia.</li>
              <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación cuando ya no sean necesarios, retire el consentimiento o se oponga al tratamiento, entre otros supuestos.</li>
              <li><strong>Limitación del tratamiento:</strong> en los casos previstos en la normativa.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común cuando el tratamiento se base en consentimiento o en la ejecución de un contrato.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento basado en interés legítimo, incluido el perfilado.</li>
              <li><strong>Retirar el consentimiento:</strong> en cualquier momento, sin que afecte a la licitud del tratamiento previo.</li>
            </ul>
            <p>
              Para ejercer estos derechos puede dirigirse al responsable mediante el <Link href="/contacto" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">formulario de contacto</Link> o al correo indicado en la web, indicando su nombre y el derecho que desea ejercer. Tiene derecho a presentar una reclamación ante la autoridad de control competente (en España, la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">Agencia Española de Protección de Datos</a>).
            </p>

            <h3>7. Seguridad</h3>
            <p>
              Se han adoptado medidas técnicas y organizativas adecuadas para garantizar la seguridad e integridad de los datos personales y evitar su alteración, pérdida o acceso no autorizado, en función del estado de la técnica y la naturaleza de los datos.
            </p>

            <h3>8. Modificaciones</h3>
            <p>
              Esta política puede actualizarse para adaptarla a cambios normativos o de funcionamiento del sitio. Se recomienda consultarla periódicamente. La fecha de la última revisión se indicará, en su caso, al pie del documento.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
