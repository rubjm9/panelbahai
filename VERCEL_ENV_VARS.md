# Variables de Entorno para Vercel

## Configuración Requerida en Vercel Dashboard

Ve a **Settings > Environment Variables** en tu proyecto de Vercel y agrega:

```
MONGODB_URI=mongodb+srv://rubjm9:XuAzQrh63i4T9J3e@panelbahai.pnqz1ea.mongodb.net/?retryWrites=true&w=majority&appName=PanelBahai
NEXTAUTH_URL=https://panel-bahai.vercel.app
NEXTAUTH_SECRET=AsRo6NFOrOZn16s9R1jT/0S3pLukBkPf56UiclH565g=
JWT_SECRET=cOe08JvZVz46YZXmIjiAwLU6M0ROXfln91QY9m+efAs=
ADMIN_EMAIL=admin@panel-bahai.org
ADMIN_PASSWORD=admin123
DISABLE_DB_DURING_BUILD=false
```

## ⚠️ CRÍTICO: DISABLE_DB_DURING_BUILD

**Debe ser `false`** para que la aplicación se conecte a la base de datos en producción.

## Pasos Después de Configurar

1. **Redeploy** la aplicación
2. Ve a `/admin/busqueda` para reconstruir el índice
3. Verifica que las nuevas obras aparezcan
