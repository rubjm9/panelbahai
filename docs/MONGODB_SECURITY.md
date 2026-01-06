# Guía de Hardening de MongoDB Atlas

Esta guía describe las mejores prácticas de seguridad para configurar MongoDB Atlas en producción.

## 1. Usuario de Aplicación con Privilegios Mínimos

### Crear Usuario de Aplicación

1. En MongoDB Atlas, ve a **Database Access**
2. Clic en **Add New Database User**
3. Configura:
   - **Authentication Method**: Password
   - **Username**: `panel-bahai-app` (o nombre descriptivo)
   - **Password**: Genera una contraseña segura (mínimo 16 caracteres)
   - **Database User Privileges**: 
     - Selecciona **Custom Role**
     - Crea un rol con solo `readWrite` en la base de datos específica
     - NO otorgues permisos de `dbAdmin`, `userAdmin`, o `clusterAdmin`

### Rol Recomendado

```json
{
  "role": "appReadWrite",
  "privileges": [
    {
      "resource": {
        "db": "panel-bahai",
        "collection": ""
      },
      "actions": ["find", "insert", "update", "remove"]
    }
  ]
}
```

**Importante**: Este usuario solo puede leer y escribir en la base de datos `panel-bahai`, no puede:
- Crear o eliminar bases de datos
- Modificar usuarios
- Acceder a otras bases de datos
- Ejecutar comandos administrativos

## 2. Network Access: Whitelist de IPs

### Configurar IP Whitelist

1. En MongoDB Atlas, ve a **Network Access**
2. Clic en **Add IP Address**
3. Añade las siguientes IPs:

#### IPs de Vercel (Producción)
- `0.0.0.0/0` - **Solo si es necesario** (permite todas las IPs)
- O mejor: añade las IPs específicas de Vercel (consulta la documentación de Vercel)

**Nota**: Vercel usa IPs dinámicas, por lo que puede ser necesario permitir `0.0.0.0/0` temporalmente. Sin embargo, considera usar:
- **Vercel IP Ranges**: Consulta `https://api.vercel.com/v1/edge-config/ip-ranges` para obtener las IPs actuales
- **MongoDB Atlas Private Endpoint**: Para máxima seguridad, configura un endpoint privado

#### IPs de Desarrollo
- Tu IP pública de desarrollo (puedes obtenerla en `https://api.ipify.org`)
- IPs de otros desarrolladores autorizados

### Recomendación

Para desarrollo local, puedes usar:
```bash
# Obtener tu IP pública
curl https://api.ipify.org
```

Añade esta IP a la whitelist con un comentario como "Desarrollo - [Tu Nombre]".

## 3. Database Access: Configuración de Roles

### Roles por Usuario

| Usuario | Rol | Base de Datos | Descripción |
|---------|-----|---------------|-------------|
| `panel-bahai-app` | `readWrite` | `panel-bahai` | Usuario de aplicación |
| `admin` | `atlasAdmin` | - | **DESHABILITAR** en producción |

### Deshabilitar Usuario Admin

1. Ve a **Database Access**
2. Encuentra el usuario `admin` (creado por defecto)
3. Clic en **Edit**
4. Cambia el estado a **Disabled**

**Importante**: Asegúrate de tener al menos un usuario activo antes de deshabilitar el admin.

## 4. Encryption at Rest

### Habilitar Encryption

1. En MongoDB Atlas, ve a **Security** > **Encryption**
2. Asegúrate de que **Encryption at Rest** esté habilitado
3. Usa **AWS KMS** o **Azure Key Vault** para producción

**Nota**: En el plan gratuito (M0), la encriptación puede estar limitada. Considera actualizar a un plan superior para producción.

## 5. Audit Logging (Opcional)

### Habilitar Audit Logging

1. En MongoDB Atlas, ve a **Security** > **Audit Log**
2. Habilita **Audit Logging**
3. Configura qué eventos auditar:
   - Authentication
   - Authorization
   - CRUD operations (opcional, genera mucho log)

**Costo**: Audit logging puede generar costos adicionales. Úsalo solo si es necesario para cumplimiento.

## 6. Rotación de Credenciales

### Proceso de Rotación

1. **Cada 90 días** (o según política de seguridad):
   - Genera nueva contraseña para el usuario de aplicación
   - Actualiza `MONGODB_URI` en Vercel (Environment Variables)
   - Prueba la conexión
   - Elimina la contraseña antigua

### Script de Rotación

```bash
# 1. Generar nueva contraseña
openssl rand -base64 32

# 2. Actualizar en MongoDB Atlas
# - Ve a Database Access
# - Edita el usuario
# - Cambia la contraseña

# 3. Actualizar en Vercel
# - Ve a Project Settings > Environment Variables
# - Actualiza MONGODB_URI con la nueva contraseña

# 4. Verificar conexión
npm run test-db
```

## 7. Connection String Seguro

### Formato del Connection String

```
mongodb+srv://panel-bahai-app:<PASSWORD>@cluster.mongodb.net/panel-bahai?retryWrites=true&w=majority&authSource=admin
```

**Componentes importantes**:
- `panel-bahai-app`: Usuario de aplicación
- `<PASSWORD>`: Contraseña (URL-encoded)
- `cluster.mongodb.net`: Cluster de MongoDB Atlas
- `panel-bahai`: Nombre de la base de datos
- `retryWrites=true`: Reintentos automáticos
- `w=majority`: Write concern (mayoría de nodos)
- `authSource=admin`: Base de datos de autenticación

### Variables de Entorno

```env
# .env.local (desarrollo)
MONGODB_URI=mongodb+srv://panel-bahai-app:password@cluster.mongodb.net/panel-bahai?retryWrites=true&w=majority&authSource=admin

# Vercel Environment Variables (producción)
# Configurar en: Project Settings > Environment Variables
```

## 8. Monitoreo y Alertas

### Configurar Alertas

1. En MongoDB Atlas, ve a **Alerts**
2. Configura alertas para:
   - **Connection Count**: Alerta si hay demasiadas conexiones
   - **Replication Lag**: Alerta si hay retraso en replicación
   - **Disk Usage**: Alerta si el disco está lleno
   - **Failed Authentication**: Alerta si hay intentos de autenticación fallidos

### Monitoreo de Seguridad

- Revisa **Security** > **Audit Log** regularmente
- Monitorea intentos de conexión fallidos
- Revisa cambios en usuarios y roles

## 9. Backup y Recuperación

### Configurar Backups

1. En MongoDB Atlas, ve a **Backup**
2. Habilita **Cloud Backup** (disponible en planes M10+)
3. Configura:
   - **Snapshot Schedule**: Diario
   - **Retention**: 7 días (mínimo recomendado)
   - **Point-in-Time Recovery**: Habilitado si está disponible

### Plan de Recuperación

1. **Backup Automático**: MongoDB Atlas hace backups automáticos
2. **Backup Manual**: Puedes crear snapshots manuales antes de cambios importantes
3. **Restauración**: Prueba el proceso de restauración periódicamente

## 10. Checklist de Seguridad

### Antes de Lanzar a Producción

- [ ] Usuario de aplicación creado con privilegios mínimos
- [ ] Usuario admin deshabilitado
- [ ] IP whitelist configurada (Vercel + desarrollo)
- [ ] Encryption at Rest habilitada
- [ ] Connection string seguro configurado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Audit logging habilitado (opcional)
- [ ] Alertas configuradas
- [ ] Backups configurados
- [ ] Proceso de rotación de credenciales documentado

### Mantenimiento Regular

- [ ] Rotar credenciales cada 90 días
- [ ] Revisar audit logs mensualmente
- [ ] Verificar que no hay usuarios no autorizados
- [ ] Actualizar IP whitelist según necesidad
- [ ] Probar proceso de restauración trimestralmente

## 11. Recursos Adicionales

- [MongoDB Atlas Security Best Practices](https://www.mongodb.com/docs/atlas/security-best-practices/)
- [MongoDB Atlas Network Security](https://www.mongodb.com/docs/atlas/security/)
- [Vercel IP Ranges](https://vercel.com/docs/security/ip-ranges)
- [MongoDB Connection String Options](https://www.mongodb.com/docs/manual/reference/connection-string/)

## 12. Troubleshooting

### Error: "IP not whitelisted"

**Solución**: Añade tu IP actual a la whitelist en MongoDB Atlas.

### Error: "Authentication failed"

**Solución**: 
1. Verifica que el usuario existe y está activo
2. Verifica que la contraseña es correcta (URL-encoded)
3. Verifica que el `authSource` es correcto

### Error: "Too many connections"

**Solución**:
1. Revisa si hay conexiones que no se están cerrando
2. Considera usar connection pooling
3. Verifica el límite de conexiones de tu plan

### Error: "User does not have permission"

**Solución**:
1. Verifica que el usuario tiene el rol correcto
2. Verifica que el rol tiene permisos en la base de datos correcta
3. Verifica que el usuario no está deshabilitado


