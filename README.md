# Panel de Traducción de Literatura Bahá'í al Español

Una aplicación web moderna para el acceso y gestión de literatura bahá'í traducida al español, inspirada en la [Bahá'í Reference Library](https://www.bahai.org/library/).

## 🌟 Características

- **Biblioteca Digital**: Acceso completo a textos bahá'ís traducidos al español
- **Motor de Búsqueda Avanzado**: Búsqueda en tiempo real con Lunr.js
- **Modo Lectura**: Párrafos numerados con anclajes directos e índice lateral
- **Navegación Jerárquica**: Organización por autores → obras → secciones
- **Panel de Administración**: Sistema completo de gestión de contenido
- **Diseño Responsivo**: Optimizado para móviles, tablets y escritorio
- **Multilingüe**: Interfaz en español e inglés (textos solo en español)

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- MongoDB Atlas o MongoDB local
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd panel-bahai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
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
node scripts/init-admin.js

# Poblar con datos de ejemplo (opcional)
node scripts/seed-data.js
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
panel-bahai/
├── app/                    # Páginas y rutas de Next.js 13+
│   ├── admin/             # Panel de administración
│   ├── autores/           # Páginas dinámicas de autores
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

- **Autor**: Información de autores bahá'ís
- **Obra**: Libros y compilaciones
- **Seccion**: Estructura jerárquica de las obras
- **Parrafo**: Párrafos numerados con texto completo
- **Usuario**: Sistema de autenticación para administradores

### Relaciones

```
Autor (1) → (N) Obra (1) → (N) Seccion
                    ↓
                (N) Parrafo
```

## 🔍 Sistema de Búsqueda

El motor de búsqueda utiliza **Lunr.js** con las siguientes características:

- **Indexación inteligente**: Títulos de obras, secciones y párrafos
- **Priorización**: Resultados ordenados por tipo y autor
- **Búsqueda parcial**: Coincidencias con términos incompletos
- **Fragmentos contextuales**: Extractos relevantes resaltados

### Orden de Prioridad

1. **Por tipo**: Títulos → Secciones → Párrafos  
2. **Por autor**: Bahá'u'lláh → El Báb → 'Abdu'l-Bahá → Shoghi Effendi → Casa de Justicia → Declaraciones → Compilaciones

## 🎨 Diseño

- **Framework CSS**: Tailwind CSS
- **Paleta de colores**: Inspirada en la identidad bahá'í
- **Tipografía**: Inter (interfaz) + Georgia (lectura)
- **Iconos**: Lucide React

### Colores Principales

```css
bahai-gold: #B8860B
bahai-darkgold: #8B6914  
bahai-navy: #2C3E50
bahai-lightgray: #F8F9FA
bahai-darkgray: #6C757D
```

## ⚙️ Panel de Administración

Accede a `/admin/login` con las credenciales configuradas.

### Funcionalidades

- **Dashboard**: Estadísticas y actividad reciente
- **Gestión de Autores**: CRUD completo
- **Gestión de Obras**: Administración de contenido
- **Usuarios**: Control de acceso y permisos
- **Sistema de Roles**: Admin, Editor, Viewer

### Roles y Permisos

- **Admin**: Acceso completo al sistema
- **Editor**: Gestión de contenido (autores, obras, párrafos)
- **Viewer**: Solo lectura

## 🌐 API Endpoints

### Públicos
- `GET /api/autores` - Lista de autores
- `GET /api/obras` - Lista de obras (públicas)
- `GET /api/obras/[slug]` - Detalles de obra específica
- `GET /api/search` - Motor de búsqueda

### Administrativos (requieren autenticación)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/obras` - Crear nueva obra
- `POST /api/parrafos` - Crear párrafos

## 📱 Funcionalidades del Modo Lectura

- **Párrafos numerados**: Cada párrafo tiene un ID único (`#p123`)
- **Anclaje directo**: URLs con fragmentos para párrafos específicos
- **Índice lateral**: Navegación por secciones (desplegable/ocultable)
- **Breadcrumbs dinámicos**: Actualización en tiempo real al hacer scroll
- **Navegación**: Botones anterior/siguiente párrafo
- **Responsive**: Adaptado para todos los dispositivos

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción  
npm run start        # Servidor de producción
npm run lint         # Verificar código con ESLint
npm run type-check   # Verificar tipos TypeScript
```

### Scripts de Base de Datos

```bash
node scripts/init-admin.js    # Crear usuario administrador
node scripts/seed-data.js     # Poblar datos de ejemplo
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
```

## 🛠️ Desarrollo

### Agregar Nuevas Obras

1. Accede al panel de administración
2. Navega a "Obras" → "Agregar Nueva"
3. Completa la información básica
4. Agrega secciones y párrafos
5. Marca como "Público" cuando esté listo

### Personalizar Estilos

Los estilos están en:
- `app/globals.css` - Estilos globales y componentes
- `tailwind.config.js` - Configuración de Tailwind

### Agregar Nuevos Autores

Los autores están definidos en el orden de prioridad:
1. Bahá'u'lláh
2. El Báb  
3. 'Abdu'l-Bahá
4. Shoghi Effendi
5. Casa Universal de Justicia
6. Declaraciones Oficiales
7. Compilaciones

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
- Email: panel@bahai-traduccion.org
- Documentación: [Enlace a docs]
- Issues: [GitHub Issues]

---

**Desarrollado con ❤️ para la comunidad bahá'í hispanohablante**# panelbahai
