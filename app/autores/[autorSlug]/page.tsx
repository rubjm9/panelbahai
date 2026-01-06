import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Calendar, Eye, ArrowRight } from 'lucide-react'
import { getCachedAutorBySlug } from '@/lib/services/public/autorService'
import { listPublishedWorksByAutor } from '@/lib/services/public/obraService'

// Función para obtener datos del autor usando servicios
async function getAutorData(slug: string) {
  try {
    // Obtener autor y obras en paralelo usando servicios
    const [autor, obras] = await Promise.all([
      getCachedAutorBySlug(slug),
      listPublishedWorksByAutor(slug)
    ]);
    
    if (!autor) {
      return null;
    }

    return { autor, obras };
  } catch (error) {
    console.error('Error fetching autor data:', error);
    return null;
  }
}

// Datos de respaldo para desarrollo
const autoresData: Record<string, any> = {
  'bahaullah': {
    nombre: "Bahá'u'lláh",
    slug: "bahaullah",
    biografia: "Bahá'u'lláh (1817-1892) es el título de Mírzá Husayn-'Alí, que significa 'Gloria de Dios'. Es el Fundador de la Fe Bahá'í y el Manifestante de Dios para esta época. Sus escritos forman la base de las enseñanzas bahá'ís y incluyen más de 100 volúmenes de revelaciones, cartas, oraciones y comentarios sobre temas espirituales, sociales y administrativos.",
    fechas: "1817-1892",
    obras: [
      {
        titulo: "El Kitab-i-Iqan",
        slug: "kitab-i-iqan",
        descripcion: "El Libro de la Certeza, una de las obras más importantes sobre temas espirituales y teológicos.",
        esPublico: true,
        fechaPublicacion: "1862"
      },
      {
        titulo: "Pasajes de los Escritos de Bahá'u'lláh",
        slug: "pasajes-bahaullah",
        descripcion: "Selección de pasajes representativos sobre diversos temas espirituales.",
        esPublico: true
      },
      {
        titulo: "El Kitab-i-Aqdas",
        slug: "kitab-i-aqdas",
        descripcion: "El Libro Más Sagrado, la obra principal de leyes y ordenanzas de Bahá'u'lláh.",
        esPublico: true,
        fechaPublicacion: "1873"
      }
    ]
  },
  'el-bab': {
    nombre: "El Báb",
    slug: "el-bab",
    biografia: "El Báb (1819-1850), cuyo nombre era Siyyid 'Alí-Muhammad, fue el Precursor de Bahá'u'lláh. Anunció la proximidad de Aquel 'a Quien Dios hará manifiesto' y preparó el camino para la revelación de Bahá'u'lláh. Sus escritos, que incluyen comentarios sobre el Corán, oraciones, y leyes, constituyen una revelación independiente.",
    fechas: "1819-1850",
    obras: [
      {
        titulo: "Selecciones de los Escritos del Báb",
        slug: "selecciones-bab",
        descripcion: "Compilación de pasajes representativos de los escritos del Báb.",
        esPublico: true
      }
    ]
  },
  'abdul-baha': {
    nombre: "'Abdu'l-Bahá",
    slug: "abdul-baha",
    biografia: "'Abdu'l-Bahá (1844-1921), cuyo nombre significa 'Siervo de Bahá', fue el hijo mayor de Bahá'u'lláh. Designado como el intérprete autorizado de las enseñanzas de Su Padre, Sus escritos y charlas proporcionan explicaciones claras de los principios bahá'ís y su aplicación práctica en la vida diaria.",
    fechas: "1844-1921",
    obras: [
      {
        titulo: "Contestación a Unas Preguntas",
        slug: "contestacion-preguntas",
        descripcion: "Respuestas a preguntas sobre temas espirituales y filosóficos.",
        esPublico: true
      },
      {
        titulo: "La Sabiduría de 'Abdu'l-Bahá",
        slug: "sabiduria-abdul-baha",
        descripcion: "Compilación de charlas y escritos sobre diversos temas.",
        esPublico: true
      }
    ]
  },
  'shoghi-effendi': {
    nombre: "Shoghi Effendi",
    slug: "shoghi-effendi",
    biografia: "Shoghi Effendi (1897-1957) fue el Guardián de la Fe Bahá'í, nieto de 'Abdu'l-Bahá. Durante 36 años guió el desarrollo de la comunidad bahá'í mundial, tradujo textos sagrados al inglés y escribió extensamente sobre la interpretación y aplicación de las enseñanzas bahá'ís.",
    fechas: "1897-1957",
    obras: [
      {
        titulo: "El Desenvolvimiento de la Civilización Mundial",
        slug: "desenvolvimiento-civilizacion",
        descripcion: "Análisis del plan divino para la unificación de la humanidad.",
        esPublico: true
      }
    ]
  },
  'casa-justicia': {
    nombre: "Casa Universal de Justicia",
    slug: "casa-justicia",
    biografia: "La Casa Universal de Justicia es el cuerpo administrativo supremo de la Fe Bahá'í, establecido en 1963. Compuesta por nueve miembros elegidos cada cinco años, guía los asuntos de la comunidad bahá'í mundial y legisla sobre materias no explícitamente reveladas en los textos sagrados.",
    fechas: "1963-presente",
    obras: [
      {
        titulo: "Cartas de la Casa Universal de Justicia",
        slug: "cartas-casa-justicia",
        descripcion: "Compilación de cartas y declaraciones oficiales.",
        esPublico: true
      }
    ]
  },
  'declaraciones-oficiales': {
    nombre: "Declaraciones Oficiales",
    slug: "declaraciones-oficiales",
    biografia: "Declaraciones y comunicados oficiales de las instituciones bahá'ís sobre temas de importancia mundial y comunitaria.",
    obras: []
  },
  'compilaciones': {
    nombre: "Compilaciones",
    slug: "compilaciones",
    biografia: "Selecciones temáticas de textos de varios autores bahá'ís, organizadas para facilitar el estudio de temas específicos de las enseñanzas bahá'ís.",
    obras: [
      {
        titulo: "La Compilación sobre la Mujer",
        slug: "compilacion-mujer",
        descripcion: "Selección de textos sobre el papel y la posición de la mujer.",
        esPublico: true
      }
    ]
  }
};

export default async function AutorPage({ params }: { params: { autorSlug: string } }) {
  const { autorSlug } = params;
  
  let data = await getAutorData(autorSlug);
  
  if (!data) {
    const autorData = autoresData[autorSlug];
    if (!autorData) {
      notFound();
    }
    data = { autor: autorData, obras: autorData.obras || [] };
  }

  const { autor, obras } = data;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero azul unificado */}
      <section className="bg-primary-900 text-white">
        <div className="container-elegant">
          <div className="section-elegant text-center">
            <h1 className="display-title text-white mb-4">{autor.nombre}</h1>
            {autor.fechas && (
              <p className="text-xl text-primary-200 max-w-3xl mx-auto">{autor.fechas}</p>
            )}
          </div>
        </div>
      </section>
      {/* Breadcrumbs */}
      <nav className="header-elegant">
        <div className="container-elegant">
          <div className="flex items-center py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800 transition-colors">Inicio</Link>
            <span className="mx-2 text-primary-400">/</span>
            <Link href="/autores" className="text-primary-600 hover:text-primary-800 transition-colors">Autores</Link>
            <span className="mx-2 text-primary-400">/</span>
            <span className="text-primary-900 font-medium">{autor.nombre}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section elegante */}
      <section className="section-elegant bg-white">
        <div className="container-elegant">
          <div className="text-center mb-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-primary-700 leading-relaxed">
                {autor.biografia}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Obras Section */}
      <section className="section-elegant">
        <div className="container-elegant">
          <div className="mb-12">
            <h2 className="text-2xl font-normal text-primary-900 mb-4 text-center">
              Obras Disponibles
            </h2>
            <p className="text-primary-600 text-center">
              {obras.length > 0 
                ? `${obras.length} obra${obras.length !== 1 ? 's' : ''} disponible${obras.length !== 1 ? 's' : ''}`
                : 'No hay obras disponibles actualmente'
              }
            </p>
          </div>

          {obras.length > 0 ? (
            <div className="grid-elegant md:grid-cols-2 lg:grid-cols-3">
              {obras.map((obra: any) => (
                <ObraCard key={obra.slug} obra={obra} autor={autor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary-100 rounded-sm flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-primary-900 mb-3">
                No hay obras disponibles
              </h3>
              <p className="text-primary-600">
                Las obras de este autor están siendo preparadas para su publicación.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// Componente para tarjetas de obra
function ObraCard({ obra, autor }: { obra: any; autor: any }) {
  return (
    <Link href={`/autores/${autor.slug}/${obra.slug}`} className="group">
      <div className="card hover:shadow-elegant-xl transition-all duration-300 group-hover:border-primary-200">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-primary-900 mb-3 group-hover:text-primary-800 transition-colors">
            {obra.titulo}
          </h3>
          <p className="text-primary-600 text-sm leading-relaxed mb-4">
            {obra.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-primary-500 mb-6">
          {obra.fechaPublicacion && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {obra.fechaPublicacion}
            </div>
          )}
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            {obra.esPublico ? 'Público' : 'Borrador'}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
            Leer obra
          </span>
          <ArrowRight className="w-4 h-4 text-primary-500 group-hover:text-primary-700 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}