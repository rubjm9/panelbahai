import { notFound } from 'next/navigation'
import ReadingView from '@/components/reading/ReadingView'
import SearchProvider from '@/components/search/SearchProvider'
import { getCachedPublishedWorkComplete } from '@/lib/services/public/obraService'

// Función para obtener datos de la obra usando servicios
async function getObraData(autorSlug: string, obraSlug: string) {
  try {
    const data = await getCachedPublishedWorkComplete(obraSlug, autorSlug);
    
    if (!data) {
      return null;
    }

    // Transformar datos del servicio al formato esperado por el componente
    return {
      obra: {
        titulo: data.obra.titulo,
        slug: data.obra.slug,
        descripcion: data.obra.descripcion,
        fechaPublicacion: data.obra.fechaPublicacion,
        autor: {
          nombre: data.obra.autor.nombre,
          slug: data.obra.autor.slug
        },
        archivoDoc: data.obra.archivoDoc,
        archivoPdf: data.obra.archivoPdf,
        archivoEpub: data.obra.archivoEpub
      },
      secciones: data.secciones.map(sec => ({
        id: sec._id,
        titulo: sec.titulo,
        slug: sec.slug,
        nivel: sec.nivel,
        orden: sec.orden,
        subsecciones: sec.subsecciones.map(sub => ({
          id: sub._id,
          titulo: sub.titulo,
          slug: sub.slug,
          nivel: sub.nivel,
          orden: sub.orden,
          subsecciones: []
        }))
      })),
      parrafos: data.parrafos.map(p => ({
        numero: p.numero,
        texto: p.texto,
        seccion: p.seccion?.titulo
      }))
    };
  } catch (error) {
    console.error('Error fetching obra data:', error);
    return null;
  }
}

// Datos de respaldo para desarrollo
const obrasData: Record<string, any> = {
  'kitab-i-iqan': {
    obra: {
      titulo: "El Kitab-i-Iqan",
      slug: "kitab-i-iqan",
      descripcion: "El Libro de la Certeza",
      autor: {
        nombre: "Bahá'u'lláh",
        slug: "bahaullah"
      }
    },
    secciones: [
      {
        id: "intro",
        titulo: "Introducción",
        slug: "introduccion",
        nivel: 1,
        orden: 1,
        subsecciones: []
      },
      {
        id: "naturaleza",
        titulo: "La Naturaleza de la Revelación",
        slug: "naturaleza-revelacion",
        nivel: 1,
        orden: 2,
        subsecciones: [
          {
            id: "signos",
            titulo: "Los Signos de los Tiempos",
            slug: "signos-tiempos",
            nivel: 2,
            orden: 1,
            subsecciones: []
          }
        ]
      }
    ],
    parrafos: [
      {
        numero: 1,
        texto: "En el Nombre de Dios, el Misericordioso, el Compasivo. Alabado sea Dios, Quien ha hecho descender el Kitab sobre Su siervo, y no ha puesto en él tortuosidad.",
        seccion: "Introducción"
      },
      {
        numero: 2,
        texto: "Este es el Libro acerca del cual no hay duda; es una guía para los temerosos de Dios, que creen en lo invisible, que observan la oración y gastan de lo que les hemos dado.",
        seccion: "Introducción"
      },
      {
        numero: 3,
        texto: "La naturaleza de la revelación divina es un tema que ha ocupado las mentes de los buscadores de la verdad a través de las edades. En cada época, Dios ha enviado Sus Mensajeros para guiar a la humanidad.",
        seccion: "La Naturaleza de la Revelación"
      },
      {
        numero: 4,
        texto: "Los signos que anuncian el advenimiento de una nueva revelación son tanto espirituales como materiales. El mundo experimenta una transformación profunda cuando aparece un nuevo Mensajero de Dios.",
        seccion: "Los Signos de los Tiempos"
      },
      {
        numero: 5,
        texto: "La unidad de Dios, la unidad de Sus Profetas y la unidad de la humanidad son los principios fundamentales que subyacen a toda revelación divina.",
        seccion: "La Naturaleza de la Revelación"
      }
    ]
  },
  'pasajes-bahaullah': {
    obra: {
      titulo: "Pasajes de los Escritos de Bahá'u'lláh",
      slug: "pasajes-bahaullah",
      descripcion: "Selección de pasajes representativos",
      autor: {
        nombre: "Bahá'u'lláh",
        slug: "bahaullah"
      }
    },
    secciones: [],
    parrafos: [
      {
        numero: 1,
        texto: "Él es Dios, exaltado sea Su gloria. Toda alabanza pertenece a Dios, Señor de todos los mundos. Atestiguamos que no hay más Dios que Él, el Rey, el Protector, el Incomparable, el Todopoderoso."
      },
      {
        numero: 2,
        texto: "Y atestiguamos que Aquel Quien es la Aurora del Conocimiento Divino, el Manantial de la sabiduría universal, es el Manifestado, el Oculto, el Suspendido entre la tierra y el cielo."
      }
    ]
  },
  'contestacion-preguntas': {
    obra: {
      titulo: "Contestación a Unas Preguntas",
      slug: "contestacion-preguntas",
      descripcion: "Respuestas a preguntas espirituales",
      autor: {
        nombre: "'Abdu'l-Bahá",
        slug: "abdul-baha"
      }
    },
    secciones: [
      {
        id: "dios",
        titulo: "Acerca de Dios",
        slug: "acerca-dios",
        nivel: 1,
        orden: 1,
        subsecciones: []
      },
      {
        id: "alma",
        titulo: "El Alma Humana",
        slug: "alma-humana",
        nivel: 1,
        orden: 2,
        subsecciones: []
      }
    ],
    parrafos: [
      {
        numero: 1,
        texto: "La primera pregunta que se me hace es acerca de la naturaleza de Dios. Sabed que la esencia de Dios es absolutamente incognoscible.",
        seccion: "Acerca de Dios"
      },
      {
        numero: 2,
        texto: "El alma humana es de la esencia de Dios, y por tanto es eterna. No tiene principio ni fin.",
        seccion: "El Alma Humana"
      }
    ]
  }
};

interface ReadingPageProps {
  params: {
    autorSlug: string;
    obraSlug: string;
  };
  searchParams: {
    p?: string; // párrafo actual
    q?: string; // término de búsqueda para resaltar
  };
}

export default async function ReadingPage({ params, searchParams }: ReadingPageProps) {
  const { autorSlug, obraSlug } = params;
  const currentParagraph = searchParams.p ? parseInt(searchParams.p) : undefined;
  const highlightQuery = searchParams.q || undefined;
  
  // Intentar obtener datos reales, usar datos de respaldo si falla
  let data = await getObraData(autorSlug, obraSlug);
  
  if (!data) {
    // Usar datos de respaldo
    const obraData = obrasData[obraSlug];
    if (!obraData) {
      notFound();
    }
    data = obraData;
  }

  const { obra, secciones, parrafos } = data;

  // Verificar que el autor coincida
  if (obra.autor.slug !== autorSlug) {
    notFound();
  }

  return (
    <SearchProvider>
      <ReadingView 
        obra={{
          titulo: obra.titulo,
          autor: obra.autor.nombre,
          autorSlug: obra.autor.slug,
          slug: obra.slug,
          archivoDoc: obra.archivoDoc,
          archivoPdf: obra.archivoPdf,
          archivoEpub: obra.archivoEpub
        }}
        parrafos={parrafos}
        secciones={secciones}
        currentParagraph={currentParagraph}
        highlightQuery={highlightQuery}
      />
    </SearchProvider>
  );
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: { params: { autorSlug: string, obraSlug: string } }) {
  const { autorSlug, obraSlug } = params;
  
  // Intentar obtener datos reales usando servicio
  const data = await getCachedPublishedWorkComplete(obraSlug, autorSlug);
  
  if (!data) {
    // Fallback a datos de respaldo
    const obraData = obrasData[obraSlug];
    if (obraData) {
      return {
        title: `${obraData.obra.titulo} - ${obraData.obra.autor.nombre} | Panel Bahá'í`,
        description: obraData.obra.descripcion || `${obraData.obra.titulo} por ${obraData.obra.autor.nombre}. Lectura completa con párrafos numerados y búsqueda avanzada.`,
        keywords: ['Bahá\'í', obraData.obra.autor.nombre, obraData.obra.titulo, 'literatura', 'textos sagrados'],
        openGraph: {
          title: `${obraData.obra.titulo} - ${obraData.obra.autor.nombre}`,
          description: obraData.obra.descripcion,
          type: 'article',
          authors: [obraData.obra.autor.nombre]
        }
      };
    }
    
    return {
      title: 'Obra no encontrada - Panel Bahá\'í',
      description: 'La obra solicitada no se encuentra disponible.'
    };
  }

  const { obra } = data;
  
  return {
    title: `${obra.titulo} - ${obra.autor.nombre} | Panel Bahá'í`,
    description: obra.descripcion || `${obra.titulo} por ${obra.autor.nombre}. Lectura completa con párrafos numerados y búsqueda avanzada.`,
    keywords: ['Bahá\'í', obra.autor.nombre, obra.titulo, 'literatura', 'textos sagrados'],
    openGraph: {
      title: `${obra.titulo} - ${obra.autor.nombre}`,
      description: obra.descripcion,
      type: 'article',
      authors: [obra.autor.nombre]
    }
  };
}
