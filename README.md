# Panel de Traducción de Literatura Bahá'í al Español

Una aplicación web moderna para el acceso y gestión de literatura bahá'í traducida al español, inspirada en la Bahá'í Reference Library.

## 🌟 Características

* **Biblioteca Digital**: Acceso completo a textos bahá'ís traducidos al español
* **Motor de Búsqueda Avanzado**: Búsqueda en tiempo real con Lunr.js y resaltado de términos
* **Modo Lectura Avanzado**: Párrafos numerados con navegación de ocurrencias y índice lateral sticky
* **Navegación Jerárquica**: Organización por autores → obras → secciones
* **Panel de Administración**: Sistema completo de gestión de contenido con importación Word
* **Diseño Elegante**: Interfaz sobria y profesional optimizada para lectura
* **Responsive**: Optimizado para móviles, tablets y escritorio

## 🚀 Inicio Rápido

### Prerrequisitos

* Node.js 18+
* MongoDB Atlas o MongoDB local
* npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/rubjm9/panelbahai.git
cd panelbahai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus configuraciones:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/panel-bahai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta
JWT_SECRET=tu-jwt-secret
ADMIN_EMAIL=admin@panel-bahai.org
ADMIN_PASSWORD=tu-password-seguro
```

4. **Inicializar la base de datos**
```bash
# Crear usuario administrador
npm run init-admin

# Poblar con datos de ejemplo (opcional)
npm run seed

# O ejecutar todo el setup
npm run setup
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
panel-bahai/
├── app/                    # Páginas y rutas de Next.js 14+
│   ├── admin/             # Panel de administración
│   ├── autores/           # Páginas dinámicas de autores
│   ├── buscar/            # Página de resultados de búsqueda
│   ├── api/               # Rutas API
│   └── ...
├── components/            # Componentes React reutilizables
│   ├── reading/          # Componentes de lectura
│   ├── search/           # Sistema de búsqueda
│   └── admin/            # Componentes administrativos
├── lib/                  # Utilidades y configuraciones
├── models/               # Modelos de MongoDB con Mongoose
├── scripts/              # Scripts de inicialización
└── utils/                # Utilidades auxiliares
```

## 🗄️ Base de Datos

### Modelos Principales

* **Autor**: Información de autores bahá'ís
* **Obra**: Libros y compilaciones
* **Seccion**: Estructura jerárquica de las obras
* **Parrafo**: Párrafos numerados con texto completo
* **Usuario**: Sistema de autenticación para administradores

### Relaciones

```
Autor (1) → (N) Obra (1) → (N) Seccion
                    ↓
                (N) Parrafo
```

## 🔍 Sistema de Búsqueda Avanzado

El motor de búsqueda utiliza **Lunr.js** con las siguientes características:

* **Indexación inteligente**: Títulos de obras, secciones y párrafos
* **Búsqueda en tiempo real**: Resultados instantáneos mientras escribes
* **Resaltado de términos**: Coincidencias resaltadas en amarillo sutil
* **Navegación de ocurrencias**: Barra flotante con navegación como Ctrl+F
* **Filtros avanzados**: Por tipo, autor y obra
* **Página de resultados**: Vista completa de todos los resultados

### Funcionalidades de Búsqueda

* **Búsqueda principal**: Campo de búsqueda en la página principal
* **Página de resultados**: `/buscar?q=termino` con filtros laterales
* **Navegación directa**: Clic en resultado lleva al párrafo específico
* **Resaltado persistente**: Término resaltado en modo lectura
* **Contador de ocurrencias**: "3 de 12" con navegación anterior/siguiente

## 📖 Modo Lectura Avanzado

### Características Principales

* **Párrafos numerados**: Cada párrafo tiene un ID único (`#p123`)
* **Anclaje directo**: URLs con fragmentos para párrafos específicos
* **Índice lateral sticky**: Navegación por secciones que te sigue al hacer scroll
* **Breadcrumbs dinámicos**: Actualización en tiempo real al hacer scroll
* **Navegación por teclado**: Flechas, Home/End, Ctrl+I para índice
* **Barra de ocurrencias**: Navegación como Ctrl+F cuando hay búsqueda activa

### Navegación de Ocurrencias

Cuando realizas una búsqueda y vas a modo lectura, aparece una barra flotante con:
* ⬆️ **Flecha arriba**: Ir a ocurrencia anterior
* ⬇️ **Flecha abajo**: Ir a siguiente ocurrencia  
* **Contador**: "3 de 12" (ocurrencia actual / total)
* ❌ **"Dejar de resaltar"**: Limpia el resaltado para lectura cómoda

## ⚙️ Panel de Administración

Accede a `/admin/login` con las credenciales configuradas.

### Funcionalidades

* **Dashboard**: Estadísticas y actividad reciente
* **Gestión de Autores**: CRUD completo
* **Gestión de Obras**: Administración de contenido
* **Importación Word**: Subida y procesamiento de documentos .docx
* **Usuarios**: Control de acceso y permisos
* **Configuración**: Ajustes del sistema

### Importación de Documentos Word

* **Drag & Drop**: Interfaz intuitiva para subir archivos
* **Procesamiento automático**: Extracción de texto y estructura
* **Mapeo de secciones**: Detección automática de títulos
* **Vista previa**: Revisión antes de guardar

## 🎨 Diseño y UX

* **Framework CSS**: Tailwind CSS con paleta personalizada
* **Paleta de colores**: Tonos elegantes y sobrios
* **Tipografía**: Playfair Display (títulos) + Crimson Text (lectura) + Inter (interfaz)
* **Iconos**: Lucide React
* **Responsive**: Adaptado para todos los dispositivos

### Paleta de Colores

```css
Primary: Grises elegantes (#F8F9FA a #0D0F10)
Accent: Dorados sutiles (#FFF8E1 a #FF6F00)
Neutral: Tonos neutros (#FDFDFD a #101010)
```

## 🌐 API Endpoints

### Públicos

* `GET /api/autores` - Lista de autores
* `GET /api/obras` - Lista de obras (públicas)
* `GET /api/obras/[slug]` - Detalles de obra específica
* `GET /api/search` - Motor de búsqueda con índice Lunr

### Administrativos (requieren autenticación)

* `POST /api/auth/login` - Iniciar sesión
* `POST /api/auth/logout` - Cerrar sesión
* `GET /api/auth/me` - Información del usuario actual
* `POST /api/admin/import/word` - Importar documento Word

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción  
npm run start        # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run type-check   # Verificar tipos TypeScript
npm run setup        # Setup completo (admin + seed)
npm run seed         # Poblar datos de ejemplo
npm run init-admin   # Crear usuario administrador
npm run clean        # Limpiar cache
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. El despliegue es automático

### Variables de Entorno para Producción

```env
MONGODB_URI=tu-mongodb-atlas-uri
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=clave-secreta-segura
JWT_SECRET=jwt-secret-seguro
ADMIN_EMAIL=admin@tu-dominio.com
ADMIN_PASSWORD=password-seguro
```

## 🛠️ Desarrollo

### Agregar Nuevas Obras

1. Accede al panel de administración
2. Navega a "Obras" → "Agregar Nueva"
3. Completa la información básica
4. Agrega secciones y párrafos
5. O usa la importación Word para documentos existentes

### Personalizar Estilos

Los estilos están en:

* `app/globals.css` - Estilos globales y componentes
* `tailwind.config.js` - Configuración de Tailwind

### Estructura de Datos

Los autores están definidos en el orden de prioridad:

1. Bahá'u'lláh
2. El Báb
3. 'Abdu'l-Bahá
4. Shoghi Effendi
5. Casa Universal de Justicia
6. Declaraciones Oficiales
7. Compilaciones

## 🧪 Testing

```bash
npm run test-db      # Probar funcionalidades de base de datos
npm run test-web     # Probar funcionalidades web
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo una licencia propietaria del Panel de Traducción de Literatura Bahá'í al Español.

## 🆘 Soporte

Para soporte técnico o consultas:

* **Issues**: [GitHub Issues](https://github.com/rubjm9/panelbahai/issues)
* **Documentación**: Ver `/docs` (próximamente)

## 🗺️ Roadmap

### Próximas Funcionalidades

- [ ] **Optimización de Performance**: Memoización del índice Lunr, carga diferida
- [ ] **Sistema de Roles**: Editor, Viewer con permisos específicos
- [ ] **Auditoría**: Registro de cambios y versionado
- [ ] **Exportación**: PDF, EPUB, formatos de lectura
- [ ] **API REST**: Endpoints para integración externa
- [ ] **Internacionalización**: Soporte para múltiples idiomas
- [ ] **PWA**: Funcionalidad offline y instalación como app

---

**Desarrollado con ❤️ para la comunidad bahá'í hispanohablante**

*Inspirado en la [Bahá'í Reference Library](https://www.bahai.org/library/) y diseñado para facilitar el acceso a la literatura bahá'í en español.*