#!/bin/bash
# Script para iniciar desarrollo con dominio personalizado

echo "🚀 Iniciando Panel Bahá'í en modo desarrollo..."
echo "🌐 Dominio: http://panel-bahai.local:3000"
echo "📚 Admin: http://panel-bahai.local:3000/admin/login"
echo ""

# Verificar que el dominio está configurado
if ! grep -q "panel-bahai.local" /etc/hosts; then
    echo "⚠️  Advertencia: panel-bahai.local no está en /etc/hosts"
    echo "   Ejecuta: sudo echo '127.0.0.1 panel-bahai.local' >> /etc/hosts"
    echo ""
fi

# Iniciar el servidor
npm run dev
