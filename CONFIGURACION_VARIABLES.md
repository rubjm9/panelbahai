# Configuración de Variables de Entorno - Guía Rápida

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)

```bash
node scripts/setup-env-vars.js
```

Este script te guiará paso a paso para configurar todas las variables necesarias.

### Opción 2: Manual

## Variables Requeridas

### 1. JWT_SECRET (REQUERIDO)

**Generar**:
```bash
openssl rand -base64 32
```

**Añadir a `.env.local`**:
```env
JWT_SECRET=TU_SECRET_GENERADO_AQUI
```

**En Vercel**:
- Settings > Environment Variables
- Añade `JWT_SECRET` con el valor generado

## Variables Opcionales (Recomendadas para Producción)

### 2. Upstash Redis (Para Rate Limiting Distribuido)

**Obtener credenciales**:
1. Ve a https://console.upstash.com/
2. Crea una cuenta (gratis)
3. Crea una nueva base de datos Redis
4. Copia `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

**Añadir a `.env.local`**:
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

**En Vercel**:
- Settings > Environment Variables
- Añade ambas variables

## Verificación

```bash
# Verificar que JWT_SECRET está configurado
node -e "console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)"

# Ejecutar pruebas de seguridad
node scripts/test-security.js
```

## Documentación Completa

Para más detalles, consulta: `docs/SETUP_ENV_VARS.md`


