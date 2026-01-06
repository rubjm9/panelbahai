# Manual de preparación de documentos DOCX para el backoffice

Este manual explica cómo preparar un documento en formato Word (.docx) para publicarlo en el backoffice de la web. Sigue estas instrucciones para asegurar que tu documento se importe correctamente y mantenga el formato deseado.

## Requisitos del archivo

### Formato y tamaño
- **Formato**: Solo archivos `.docx` (formato Word moderno)
- **Tamaño máximo**: 10 MB
- **No compatible**: Los archivos `.doc` antiguos no son compatibles. Si tienes un archivo `.doc`, debes convertirlo a `.docx` primero.

### Cómo convertir .doc a .docx
1. Abre el archivo `.doc` en Microsoft Word
2. Ve a **Archivo > Guardar como**
3. En el menú desplegable "Tipo de archivo", selecciona **"Documento de Word (*.docx)"**
4. Guarda el archivo con la nueva extensión

## Estructura del documento

### Títulos y jerarquías

El sistema reconoce automáticamente los títulos usando los estilos de Word. Los títulos crean secciones en el documento publicado.

#### Estilos de títulos soportados

**En inglés:**
- `Heading 1` → Se convierte en título de nivel 2 (H2)
- `Heading 2` → Se convierte en título de nivel 3 (H3)
- `Heading 3` → Se convierte en título de nivel 4 (H4)
- `Heading 4` → Se convierte en título de nivel 5 (H5)
- `Heading 5` → Se convierte en título de nivel 6 (H6)
- `Heading 6` → Se convierte en título de nivel 6 (H6)

**En español:**
- `Título 1` → Se convierte en título de nivel 2 (H2)
- `Título 2` → Se convierte en título de nivel 3 (H3)
- `Título 3` → Se convierte en título de nivel 4 (H4)
- `Título 4` → Se convierte en título de nivel 5 (H5)
- `Título 5` → Se convierte en título de nivel 6 (H6)
- `Título 6` → Se convierte en título de nivel 6 (H6)

#### Cómo aplicar estilos de título en Word

1. Selecciona el texto que quieres convertir en título
2. En la pestaña **Inicio**, busca el grupo **Estilos**
3. Haz clic en el estilo correspondiente (`Título 1`, `Título 2`, etc.)
4. O usa los atajos de teclado:
   - `Ctrl + Alt + 1` para Título 1
   - `Ctrl + Alt + 2` para Título 2
   - `Ctrl + Alt + 3` para Título 3
   - Y así sucesivamente

#### Jerarquía recomendada

Usa los títulos de forma jerárquica para crear una estructura clara:

```
Título 1 (Heading 1) - Sección principal
  Título 2 (Heading 2) - Subsección
    Título 3 (Heading 3) - Sub-subsección
      Título 4 (Heading 4) - Sub-sub-subsección
```

**Ejemplo:**
```
Título 1: Introducción
  Título 2: Contexto histórico
    Título 3: El siglo XIX
  Título 2: Objetivos del texto
Título 1: Desarrollo
  Título 2: Primera parte
  Título 2: Segunda parte
```

### Párrafos

- Los párrafos normales se crean simplemente escribiendo texto y presionando **Enter**
- No es necesario aplicar ningún estilo especial a los párrafos normales
- El sistema detecta automáticamente los párrafos y los numera secuencialmente

## Formato de texto

El sistema preserva el siguiente formato de texto:

### Negritas
- **Cómo aplicar**: Selecciona el texto y presiona `Ctrl + B` (o `Cmd + B` en Mac)
- **O usa**: El botón **B** en la barra de herramientas
- **Resultado**: El texto aparecerá en negrita en la publicación

### Cursivas (itálica)
- **Cómo aplicar**: Selecciona el texto y presiona `Ctrl + I` (o `Cmd + I` en Mac)
- **O usa**: El botón **I** en la barra de herramientas
- **Resultado**: El texto aparecerá en cursiva en la publicación

### Subrayado
- **Cómo aplicar**: Selecciona el texto y presiona `Ctrl + U` (o `Cmd + U` en Mac)
- **O usa**: El botón **U** en la barra de herramientas
- **Resultado**: El texto aparecerá subrayado en la publicación

### Combinaciones
Puedes combinar formatos: texto en **negrita y cursiva**, o **negrita y subrayado**, etc.

## Citas y blockquotes

Para destacar citas o textos especiales, usa los siguientes estilos:

### Estilos de cita soportados

**En inglés:**
- `Quote`
- `Block Quote`
- `Block Text`

**En español:**
- `Cita`

### Cómo aplicar estilo de cita

1. Selecciona el texto que quieres convertir en cita
2. En la pestaña **Inicio**, busca el grupo **Estilos**
3. Si no ves el estilo "Cita", puedes crearlo:
   - Haz clic derecho en el texto seleccionado
   - Selecciona **Estilos > Guardar selección como nuevo estilo rápido**
   - Nómbralo como "Cita" o "Quote"
   - O aplica formato manualmente y luego crea el estilo

**Alternativa**: Si no tienes el estilo predefinido, puedes:
1. Selecciona el texto
2. Ve a **Inicio > Estilos > Crear un estilo**
3. Nómbralo "Cita" o "Quote"
4. Configura el formato deseado (puedes usar sangría o formato especial)

### Resultado
El texto con estilo de cita aparecerá como un bloque destacado (blockquote) en la publicación.

## Enlaces

- Los enlaces (hipervínculos) se preservan automáticamente
- **Cómo crear**: Selecciona el texto, haz clic derecho y elige **Hipervínculo**, o presiona `Ctrl + K`
- El sistema mantendrá los enlaces funcionales en la publicación

## Estructura recomendada del documento

### Orden sugerido

1. **Título principal** (usando Título 1 / Heading 1) - Opcional, ya que el título se ingresa en el formulario
2. **Contenido principal** organizado con títulos y subsecciones
3. **Párrafos normales** con el texto del contenido
4. **Citas** cuando sea necesario destacar pasajes especiales

### Ejemplo de estructura

```
[Texto normal - Introducción general del documento]

Título 1: Primera sección principal
[Párrafo normal con el contenido de la primera sección]

Título 2: Subsección de la primera parte
[Párrafo normal explicando la subsección]

Título 1: Segunda sección principal
[Párrafo normal con el contenido]

[Cita con estilo "Cita" o "Quote"]
Este es un pasaje destacado que aparecerá como cita.

[Párrafo normal continuando el contenido]
```

## Buenas prácticas

### ✅ Hacer

- Usa los estilos de título de Word (no solo texto grande en negrita)
- Mantén una jerarquía lógica de títulos (no saltes de Título 1 a Título 3 sin usar Título 2)
- Usa párrafos normales para el contenido principal
- Aplica negritas y cursivas de forma consistente
- Revisa el documento antes de importarlo para asegurar que los estilos están correctamente aplicados

### ❌ Evitar

- No uses texto grande y negrita en lugar de estilos de título
- No mezcles diferentes sistemas de estilos (por ejemplo, no uses "Título 1" y "Heading 1" en el mismo documento)
- No uses tablas complejas (el sistema puede no preservarlas correctamente)
- No uses imágenes incrustadas (no se importarán)
- No uses columnas de texto (se convertirán en texto normal)
- No uses encabezados y pies de página (no se importarán)

## Limitaciones

### No se importan

- **Imágenes**: Las imágenes incrustadas en el documento no se importan
- **Tablas**: Las tablas pueden no preservarse correctamente
- **Encabezados y pies de página**: No se importan
- **Notas al pie**: No se importan
- **Columnas de texto**: Se convierten en texto normal
- **Formularios y campos**: No se importan
- **Macros**: No se ejecutan ni se importan

### Se preservan

- ✅ Títulos y jerarquías (usando estilos)
- ✅ Párrafos normales
- ✅ Negritas, cursivas y subrayado
- ✅ Citas (blockquotes)
- ✅ Enlaces (hipervínculos)
- ✅ Estructura básica del documento

## Proceso de importación

1. **Prepara tu documento** siguiendo este manual
2. **Guarda el archivo** como `.docx`
3. **Accede al backoffice** y ve a la sección de importación
4. **Completa el formulario**:
   - Selecciona el archivo `.docx`
   - Ingresa el título de la obra
   - Selecciona el autor
   - Completa los campos opcionales (descripción, fecha, etc.)
5. **Importa el documento**
6. **Revisa el resultado** en la vista previa o edición de la obra

## Solución de problemas

### El documento no se importa correctamente

- **Verifica el formato**: Asegúrate de que es un archivo `.docx` (no `.doc`)
- **Revisa el tamaño**: El archivo no debe superar los 10 MB
- **Verifica los estilos**: Asegúrate de que los títulos usan los estilos correctos de Word

### Los títulos no se reconocen

- **Problema**: Estás usando texto grande en negrita en lugar de estilos
- **Solución**: Aplica los estilos "Título 1", "Título 2", etc. desde el menú de Estilos

### El formato se pierde

- **Problema**: Estás usando formatos no soportados
- **Solución**: Usa solo negritas, cursivas, subrayado y estilos de título. Evita formatos avanzados como sombras, contornos, etc.

### Las citas no aparecen como blockquotes

- **Problema**: No estás usando el estilo "Cita" o "Quote"
- **Solución**: Aplica el estilo de cita desde el menú de Estilos de Word

## Resumen rápido

| Elemento | Cómo aplicarlo | Resultado |
|----------|----------------|-----------|
| Título principal | Estilo "Título 1" o "Heading 1" | Sección de nivel 2 |
| Subtítulo | Estilo "Título 2" o "Heading 2" | Sección de nivel 3 |
| Párrafo normal | Texto normal con Enter | Párrafo numerado |
| Negrita | `Ctrl + B` o botón **B** | Texto en negrita |
| Cursiva | `Ctrl + I` o botón **I** | Texto en cursiva |
| Subrayado | `Ctrl + U` o botón **U** | Texto subrayado |
| Cita | Estilo "Cita" o "Quote" | Blockquote destacado |
| Enlace | `Ctrl + K` o menú contextual | Enlace funcional |

---

**Última actualización**: Este manual refleja las funcionalidades actuales del sistema de importación. Si encuentras algún problema o tienes sugerencias, contacta al administrador del sistema.



