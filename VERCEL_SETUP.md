# Configuración de Vercel para Panel Bahá'í

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### 1. Acceder a la Configuración de Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Haz clic en **Settings** (Configuración)
3. Ve a **Environment Variables** (Variables de Entorno)

### 2. Configurar las Variables

Agrega las siguientes variables de entorno:

```
MONGODB_URI=mongodb+srv://rubjm9:XuAzQrh63i4T9J3e@panelbahai.pnqz1ea.mongodb.net/?retryWrites=true&w=majority&appName=PanelBahai
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=AsRo6NFOrOZn16s9R1jT/0S3pLukBkPf56UiclH565g=
JWT_SECRET=cOe08JvZVz46YZXmIjiAwLU6M0ROXfln91QY9m+efAs=
ADMIN_EMAIL=admin@panel-bahai.org
ADMIN_PASSWORD=admin123
DISABLE_DB_DURING_BUILD=false
```

### 3. Importante: DISABLE_DB_DURING_BUILD

**CRÍTICO:** Cambia `DISABLE_DB_DURING_BUILD` de `true` a `false` para que la aplicación pueda conectarse a la base de datos en producción.

### 4. Después de Configurar

1. **Redeploy** la aplicación desde Vercel
2. Ve a `/admin/busqueda` para reconstruir el índice de búsqueda
3. Verifica que las nuevas obras aparezcan en las búsquedas

### 5. Verificación

Para verificar que todo funciona:
1. Ve a la página principal y busca tu nueva obra
2. Ve a `/autores/[autor-slug]` para ver si aparece la obra
3. Ve a `/admin/busqueda` para ver las estadísticas del índice

## Problema Actual

La aplicación está configurada con `DISABLE_DB_DURING_BUILD=true`, lo que impide que se conecte a la base de datos en producción. Esto significa que:
- No se pueden agregar nuevas obras
- No se pueden hacer búsquedas
- No se puede acceder al panel de administración

## Solución

Cambiar `DISABLE_DB_DURING_BUILD` a `false` y configurar todas las variables de entorno permitirá que la aplicación funcione completamente en producción.
