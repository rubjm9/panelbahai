# Configuración de Variables de Entorno - Fase 2

Esta guía te ayudará a configurar las variables de entorno necesarias para la Fase 2 de seguridad.

## Variables Requeridas

### 1. JWT_SECRET (REQUERIDO)

**Descripción**: Clave secreta para firmar y verificar tokens JWT.

**Requisitos**:
- Mínimo 32 caracteres en producción
- Debe ser aleatorio y seguro
- No debe ser el valor por defecto

**Generar JWT_SECRET**:

```bash
# Opción 1: Usando OpenSSL (recomendado)
openssl rand -base64 32

# Opción 2: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Ejemplo generado**:
```
JJ/rv49uteyMlHqyaBOwZ85AKmTEzXw/M4YxRAuZDeo=
```

**Configuración**:

1. Copia el valor generado
2. Añádelo a tu archivo `.env.local`:
   ```env
   JWT_SECRET=JJ/rv49uteyMlHqyaBOwZ85AKmTEzXw/M4YxRAuZDeo=
   ```

3. En **Vercel** (producción):
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Añade `JWT_SECRET` con el valor generado
   - Asegúrate de seleccionar todos los entornos (Production, Preview, Development)

## Variables Opcionales

### 2. UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN (OPCIONAL)

**Descripción**: Credenciales de Upstash Redis para rate limiting distribuido.

**Cuándo usar**:
- ✅ **Producción**: Siempre configurar para rate limiting distribuido
- ⚠️ **Desarrollo**: Opcional. Si no se configura, se usa memoria en memoria (solo funciona en un servidor)

**Obtener credenciales**:

1. Ve a [Upstash Console](https://console.upstash.com/)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto (si no tienes uno)
4. Crea una nueva base de datos Redis:
   - Click en "Create Database"
   - Elige un nombre (ej: `panel-bahai-rate-limit`)
   - Selecciona la región más cercana a tu servidor
   - Elige el plan (Free tier es suficiente para empezar)
5. Una vez creada, verás las credenciales:
   - **UPSTASH_REDIS_REST_URL**: URL de la API REST
   - **UPSTASH_REDIS_REST_TOKEN**: Token de autenticación

**Configuración**:

1. Copia las credenciales de Upstash
2. Añádelas a tu archivo `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxxxx
   ```

3. En **Vercel** (producción):
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Añade ambas variables
   - Asegúrate de seleccionar todos los entornos

**Nota**: Si no configuras estas variables, el rate limiting funcionará en memoria (solo desarrollo local). En producción, es altamente recomendable usar Upstash para rate limiting distribuido.

## Configuración Completa

### Archivo `.env.local` (Desarrollo)

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/panel-bahai?retryWrites=true&w=majority&authSource=admin

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura

# JWT Configuration (REQUERIDO)
# Generado con: openssl rand -base64 32
JWT_SECRET=TU_JWT_SECRET_GENERADO_AQUI

# Rate Limiting (Upstash Redis) - OPCIONAL
# Obtener en: https://console.upstash.com/
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Admin User Configuration
ADMIN_EMAIL=admin@panel-bahai.org
ADMIN_PASSWORD=tu-password-seguro
```

### Variables en Vercel (Producción)

1. Ve a tu proyecto en [Vercel](https://vercel.com/)
2. Settings > Environment Variables
3. Añade todas las variables necesarias:
   - `JWT_SECRET` (REQUERIDO)
   - `UPSTASH_REDIS_REST_URL` (RECOMENDADO)
   - `UPSTASH_REDIS_REST_TOKEN` (RECOMENDADO)
   - `MONGODB_URI` (si no está ya configurado)
   - Otras variables según necesites

4. Asegúrate de seleccionar:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional)

## Verificación

### Verificar JWT_SECRET

```bash
# Verificar que JWT_SECRET está configurado
node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)"

# En producción, debe ser >= 32 caracteres
```

### Verificar Rate Limiting

1. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Intenta hacer login incorrectamente 6 veces seguidas
3. La 6ta vez debería retornar 429 (Too Many Requests)

### Ejecutar Pruebas de Seguridad

```bash
# Asegúrate de que el servidor esté corriendo
npm run dev

# En otra terminal, ejecuta las pruebas
node scripts/test-security.js
```

## Troubleshooting

### Error: "JWT_SECRET debe tener al menos 32 caracteres"

**Solución**: Genera un nuevo JWT_SECRET con `openssl rand -base64 32` y actualiza la variable de entorno.

### Error: "Rate limiting usando memoria"

**Solución**: Esto es normal en desarrollo si no has configurado Upstash. En producción, configura Upstash Redis.

### Error: "UPSTASH_REDIS_REST_URL is not defined"

**Solución**: Esto es normal si no has configurado Upstash. El sistema usará memoria en su lugar. Para producción, configura Upstash.

## Seguridad

### ⚠️ IMPORTANTE

- **NUNCA** commitees el archivo `.env.local` al repositorio
- **NUNCA** compartas tus credenciales públicamente
- **SIEMPRE** usa valores diferentes para desarrollo y producción
- **ROTA** las credenciales periódicamente (cada 90 días recomendado)

### Archivos a ignorar

Asegúrate de que `.env.local` esté en `.gitignore`:

```gitignore
# .gitignore
.env.local
.env*.local
```

## Recursos

- [Upstash Console](https://console.upstash.com/)
- [Upstash Documentation](https://docs.upstash.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OpenSSL Documentation](https://www.openssl.org/docs/)


