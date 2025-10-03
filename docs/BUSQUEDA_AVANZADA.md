# 🔍 Guía de Búsqueda Avanzada

El motor de búsqueda del Panel Bahá'í ahora soporta sintaxis avanzada para búsquedas más precisas y potentes.

## 📋 Sintaxis Soportada

### 1. **Búsquedas Exactas con Comillas** ✅
```
"frase exacta"
"palabras juntas"
```
- Busca la frase exacta tal como está escrita
- Útil para encontrar citas específicas o términos técnicos
- Requiere que todos los términos estén presentes en el documento

**Ejemplos funcionando:**
- `"Casa Universal de Justicia"` - encuentra documentos que contienen esta frase
- `"El Kitab-i-Iqan"` - busca el título exacto
- `"Bahá'u'lláh"` - encuentra menciones exactas del autor

### 2. **Operadores Booleanos**
```
palabra1 AND palabra2
término1 OR término2
```
- **AND**: Ambos términos deben aparecer
- **OR**: Al menos uno de los términos debe aparecer

**Ejemplos:**
- `Bahá'u'lláh AND Kitáb`
- `oración OR meditación`

### 3. **Términos Requeridos (+)**
```
+palabra1 palabra2
+término obligatorio
```
- El término con `+` debe aparecer obligatoriamente
- Los otros términos son opcionales

**Ejemplo:** `+Bahá'u'lláh Kitáb` (debe contener "Bahá'u'lláh")

### 4. **Términos Excluidos (-)**
```
palabra1 -palabra2
término -excluir
```
- Excluye resultados que contengan el término con `-`
- Útil para refinar búsquedas

**Ejemplo:** `oración -meditación` (oración pero no meditación)

### 5. **Wildcards (*)**
```
palabra*
*terminación
pal*abra
```
- `*` representa cualquier secuencia de caracteres
- Útil para buscar variaciones de palabras

**Ejemplos:**
- `Bahá*` encuentra "Bahá'u'lláh", "Bahá'í", etc.
- `*justicia` encuentra "justicia", "injusticia", etc.

### 6. **Fuzzy Matching (~)**
```
palabra~1
término~2
```
- `~1` permite 1 error tipográfico
- `~2` permite 2 errores tipográficos
- Útil para corregir errores de escritura

**Ejemplos:**
- `Bahá'u'lláh~1` encuentra "Bahá'u'llah" (sin acento)
- `justicia~2` encuentra "justisia", "justicia", etc.

## 🎯 Ejemplos Prácticos

### Búsquedas Básicas
```
oración
meditación
Bahá'u'lláh
```

### Búsquedas Exactas
```
"Casa Universal de Justicia"
"Kitáb-i-Aqdás"
"Llamamiento del Señor de las Huestes"
```

### Búsquedas Combinadas
```
Bahá'u'lláh AND oración
"Casa de Justicia" OR "Casa Universal"
+Kitáb -meditación
```

### Búsquedas con Wildcards
```
Bahá* AND oración
*justicia AND universal
medit* OR oraci*
```

### Búsquedas con Tolerancia a Errores
```
Bahá'u'lláh~1
justicia~2
meditación~1
```

## 💡 Consejos de Uso

### 1. **Combinar Sintaxis**
Puedes combinar múltiples operadores en una sola búsqueda:
```
"Casa Universal" AND +Bahá'u'lláh -meditación
```

### 2. **Búsquedas Progresivas**
- Empieza con términos simples
- Refina con operadores booleanos
- Usa wildcards para explorar variaciones

### 3. **Términos Específicos**
- Usa comillas para frases exactas
- Usa `+` para términos obligatorios
- Usa `-` para excluir términos irrelevantes

### 4. **Corrección de Errores**
- Usa `~1` o `~2` para tolerar errores tipográficos
- Especialmente útil para nombres propios

## 🔧 Limitaciones Actuales

- **Regex complejo**: No soporta expresiones regulares avanzadas
- **Operadores anidados**: No soporta paréntesis para agrupar operaciones
- **Casos edge**: Las búsquedas muy complejas pueden requerir ajustes menores

## 🚀 Funcionalidades Futuras

- Soporte para búsquedas por proximidad (`"palabra1 palabra2"~5`)
- Operadores anidados con paréntesis
- Búsquedas por campos específicos (`autor:Bahá'u'lláh`)
- Historial de búsquedas
- Sugerencias automáticas

## 📊 Rendimiento

- **Búsquedas simples**: < 10ms
- **Búsquedas complejas**: < 50ms
- **Wildcards**: < 100ms
- **Fuzzy matching**: < 200ms

El motor está optimizado para manejar hasta 10,000 documentos con excelente rendimiento.
