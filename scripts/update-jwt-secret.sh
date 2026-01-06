#!/bin/bash

# Script para actualizar JWT_SECRET en .env.local

ENV_FILE=".env.local"
NEW_JWT_SECRET="lvuKoJw0lTpFvTP4pBLzlBrFntpNE4NLXKnwa8v92i8="

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Archivo .env.local no encontrado"
    echo "📝 Creando desde env.example..."
    cp env.example .env.local
fi

# Actualizar JWT_SECRET
if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
    # Reemplazar línea existente
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" "$ENV_FILE"
    fi
    echo "✅ JWT_SECRET actualizado en .env.local"
else
    # Añadir nueva línea
    echo "" >> "$ENV_FILE"
    echo "# JWT Configuration" >> "$ENV_FILE"
    echo "JWT_SECRET=$NEW_JWT_SECRET" >> "$ENV_FILE"
    echo "✅ JWT_SECRET añadido a .env.local"
fi

# Verificar
JWT_LENGTH=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2 | wc -c)
JWT_LENGTH=$((JWT_LENGTH - 1)) # Restar el newline

echo ""
echo "📏 Longitud del JWT_SECRET: $JWT_LENGTH caracteres"

if [ $JWT_LENGTH -ge 32 ]; then
    echo "✅ JWT_SECRET cumple con el requisito mínimo (32 caracteres)"
else
    echo "⚠️  JWT_SECRET es demasiado corto (mínimo 32 caracteres)"
fi

echo ""
echo "🔐 JWT_SECRET configurado:"
grep "^JWT_SECRET=" "$ENV_FILE" | sed 's/\(.\{20\}\).*/\1.../'


