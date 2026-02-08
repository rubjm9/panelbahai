
import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Política de Cookies | Panel de Traducción Bahá\'í',
    description: 'Información sobre el uso de cookies en el Panel Tecnológico de Traducción de Literatura Bahá\'í al Español.',
};

export default function CookiePolicyPage() {
    return (
        <div className="bg-neutral-50 dark:bg-midnight-900 min-h-screen py-16">
            <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-midnight-800 rounded-lg shadow-elegant p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-display font-medium text-primary-900 dark:text-gray-100 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                        Política de Cookies
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        <p>
                            En cumplimiento con lo dispuesto en el artículo 22.2 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI), esta Política de Cookies tiene como finalidad informarle de manera clara y precisa sobre las cookies que se utilizan en el sitio web del <strong>Panel de Traducción de Literatura Bahá'í al Español</strong>.
                        </p>

                        <h3>1. ¿Qué son las cookies?</h3>
                        <p>
                            Una cookie es un pequeño fichero de texto que los sitios web envían al navegador y que se almacenan en el terminal del usuario, el cual puede ser un ordenador personal, un teléfono móvil, una tableta, etc. Estos archivos permiten que el sitio web recuerde información sobre su visita, como el idioma preferido y otras opciones, lo que puede facilitar su próxima visita y hacer que el sitio le resulte más útil.
                        </p>

                        <h3>2. Tipos de cookies que utilizamos</h3>
                        <p>
                            En este sitio web utilizamos cookies propias y de terceros para conseguir una mejor experiencia de navegación, así como para obtener estadísticas de uso.
                        </p>

                        <h4>Cookies Técnicas (Necesarias)</h4>
                        <p>
                            Son aquellas que permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen. Por ejemplo, controlar el tráfico y la comunicación de datos, identificar la sesión, acceder a partes de acceso restringido, etc.
                        </p>
                        <ul>
                            <li><strong>Gestión de sesión:</strong> Para mantener la sesión de usuario activa si se autentica.</li>
                            <li><strong>Preferencias:</strong> Recordan ajustes como el modo oscuro o tamaño de fuente.</li>
                        </ul>

                        <h4>Cookies de Análisis (Estadísticas)</h4>
                        <p>
                            Son aquellas que, bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado. Para ello se analiza su navegación en nuestra página web con el fin de mejorar la oferta de contenidos y servicios.
                        </p>
                        <ul>
                            <li><strong>Google Analytics:</strong> Utilizamos Google Analytics para obtener estadísticas anónimas de acceso y navegación.</li>
                        </ul>

                        <h3>3. ¿Cómo gestionar las cookies?</h3>
                        <p>
                            Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador.
                        </p>
                        <ul>
                            <li>
                                <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                    Google Chrome
                                </a>
                            </li>
                            <li>
                                <a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                    Internet Explorer / Edge
                                </a>
                            </li>
                            <li>
                                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                    Mozilla Firefox
                                </a>
                            </li>
                            <li>
                                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                    Safari
                                </a>
                            </li>
                        </ul>

                        <h3>4. Consentimiento</h3>
                        <p>
                            Al navegar y continuar en nuestro sitio web estará consintiendo el uso de las cookies antes enunciadas, en las condiciones contenidas en la presente Política de Cookies.
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
    );
}
