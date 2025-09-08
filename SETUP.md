# 🚀 Guía de Configuración Rápida - Panel Bahá'í

## ⚡ Configuración en 5 Minutos

### 1. **Configurar Variables de Entorno**
Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración de Base de Datos
MONGODB_URI=mongodb://localhost:27017/panel-bahai

# Configuración de Autenticación
JWT_SECRET=tu_jwt_secret_super_secreto_aqui_cambiar_en_produccion

# Configuración de Email (opcional para desarrollo)
EMAIL_FROM=noreply@panel-bahai.local
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=

# Configuración de la Aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Panel de Traducción de Literatura Bahá'í"

# Configuración de Búsqueda
SEARCH_INDEX_REBUILD_INTERVAL=3600000

# Configuración de Desarrollo
NODE_ENV=development
```

### 2. **Instalar Dependencias**
```bash
npm install
```

### 3. **Configurar Base de Datos**
```bash
# Opción A: Configuración completa (recomendado)
npm run setup

# Opción B: Solo datos de ejemplo
npm run seed

# Opción C: Solo usuario administrador
npm run init-admin
```

### 4. **Verificar Configuración**
```bash
npm run test-db
```

### 5. **Ejecutar la Aplicación**
```bash
npm run dev
```

## 🌐 URLs de Acceso

- **Aplicación Principal**: http://localhost:3000
- **Panel de Administración**: http://localhost:3000/admin/login
- **API de Búsqueda**: http://localhost:3000/api/search

## 🔑 Credenciales por Defecto

- **Email**: admin@panel-bahai.org
- **Contraseña**: admin123

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer inicio de sesión.

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run setup` | Configuración completa del entorno de desarrollo |
| `npm run test-db` | Verifica que todas las funcionalidades estén funcionando |
| `npm run seed` | Pobla la base de datos con datos de ejemplo |
| `npm run init-admin` | Crea usuario administrador |
| `npm run clean` | Limpia caché de Next.js |
| `npm run dev` | Ejecuta la aplicación en modo desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Ejecuta la aplicación en modo producción |

## 🗄️ Estructura de la Base de Datos

### Colecciones Creadas:
- **usuarios**: Usuarios del sistema (admin, editor, etc.)
- **autores**: Autores de las obras bahá'ís
- **obras**: Libros y escritos
- **secciones**: Capítulos y secciones de las obras
- **parrafos**: Párrafos numerados de las obras

### Datos de Ejemplo Incluidos:
- 5 autores principales (Bahá'u'lláh, El Báb, 'Abdu'l-Bahá, etc.)
- 3 obras de ejemplo
- Secciones organizadas jerárquicamente
- Párrafos numerados con contenido de ejemplo

## 🔍 Funcionalidades Disponibles

### ✅ Implementadas:
- Sistema de autenticación JWT
- Motor de búsqueda Lunr.js
- Páginas de lectura con navegación
- Panel de administración básico
- API REST completa
- Diseño responsivo y elegante

### 🚧 En Desarrollo:
- Sistema de importación de documentos
- Editor de contenido avanzado
- Workflow de aprobación
- Internacionalización (i18n)

## 🐛 Solución de Problemas

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "MongoDB connection failed"
1. Verifica que MongoDB esté ejecutándose
2. Revisa la URI en `.env.local`
3. Para MongoDB local: `mongod`

### Error: "Port 3000 already in use"
```bash
# Cambia el puerto
npm run dev -- -p 3001
```

### Error: "JWT_SECRET not defined"
Asegúrate de que `.env.local` existe y contiene `JWT_SECRET`

## 📞 Soporte

Si encuentras problemas:
1. Ejecuta `npm run test-db` para diagnóstico
2. Revisa los logs en la consola
3. Verifica la configuración de MongoDB
4. Consulta la documentación de Next.js

## 🎯 Próximos Pasos

Una vez configurado:
1. Explora la aplicación en http://localhost:3000
2. Accede al panel de administración
3. Revisa los datos de ejemplo
4. Prueba la funcionalidad de búsqueda
5. Personaliza el contenido según tus necesidades

---

**¡Disfruta desarrollando con el Panel Bahá'í!** 🌟

