# Power Automate Setup Guide - Guía Completa

## Paso 1: Crear el Excel en SharePoint

1. **Ve a tu sitio de SharePoint de la empresa**
   - Abre tu navegador
   - Ve a tu sitio de SharePoint (ej: https://tuempresa.sharepoint.com)

2. **Crear el archivo Excel**
   - Click en "Nuevo" > "Excel"
   - Nombra el archivo: "Sprint-Prioritization-Responses.xlsx"

3. **Crear las columnas en Excel:**
   En la primera fila, crea estos encabezados:
   - **A1**: Email
   - **B1**: SubmissionDate
   - **C1**: TotalItems
   - **D1**: TotalHours
   - **E1**: ItemsWithTBD
   - **F1**: CapacityUsed
   - **G1**: SelectedItems
   - **H1**: ResponseDetails

4. **Convertir a tabla:**
   - Selecciona las celdas A1:H1
   - Ve a "Insertar" > "Tabla"
   - Marca "Mi tabla tiene encabezados"
   - Click "Aceptar"
   - Guarda el archivo

## Paso 2: Crear el Flow en Power Automate - EN INGLÉS

1. **Go to Power Automate**
   - Ve a https://make.powerautomate.com
   - Inicia sesión con tu cuenta corporativa

2. **Create new flow - USANDO WEBHOOK TRIGGER**
   - Click "**Create**"
   - Select "**Automated cloud flow**"
   - Flow name: "Survey Form to SharePoint Excel"
   
   **En "Choose your flow's trigger" busca:**
   - En la search box, escribe: "**webhook**"
   - Selecciona: "**Webhook trigger**" ← ¡Esta es la correcta!
   - Click "**Create**"

## Paso 2.5: Lo que debes ver con Webhook

**Deberías ver una caja con:**
- Title: "**Webhook**" o "**When a HTTP request is received**"
- Icon: 🌐 (globe icon)
- Fields: "Request Body JSON Schema" o similar

**¡Perfecto! Continúa al Paso 3.**

## Paso 3: Configurar el Webhook/HTTP trigger - CORREGIDO PARA TU FORMULARIO REAL

1. **En el webhook trigger que aparece:**
   - Busca un campo que diga "**Request Body JSON Schema**" o "**Schema**"
   - Si ves un link que dice "**Use sample payload to generate schema**" o similar, click ahí
   - Pega exactamente este JSON (corregido para tu formulario real):

```json
{
    "email": "victor@foundever.com",
    "submissionDate": "2024-01-15T10:30:00.000Z",
    "question1": "high",
    "question2": "medium", 
    "question3": "high",
    "question4": "low",
    "question5": "medium",
    "question6": "high",
    "question7": "low",
    "question8": "medium",
    "totalPoints": 150,
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

2. **Click "Done" o "OK"**

## Actualizar Excel - COLUMNAS CORRECTAS PARA TU FORMULARIO

**Cambia las columnas en tu Excel a estas 11 columnas:**
   - **A1**: Email
   - **B1**: SubmissionDate
   - **C1**: Question1
   - **D1**: Question2
   - **E1**: Question3
   - **F1**: Question4
   - **G1**: Question5
   - **H1**: Question6
   - **I1**: Question7
   - **J1**: Question8
   - **K1**: TotalPoints

## Paso 4: Agregar acción de Excel Online

1. **Agregar nuevo paso:**
   - Click "**+ New step**"
   - Busca: "**Excel Online (Business)**"
   - Selecciona: "**Add a row into a table**"
   - **Location**: SharePoint Online
   - **Document Library**: Documents
   - **File**: Sprint-Prioritization-Responses.xlsx
   - **Table**: Table1

## Paso 5: Mapear los campos - CORREGIDO PARA TUS 8 PREGUNTAS

**Para cada columna en tu Excel, selecciona del dynamic content:**

- **Email** → `email`
- **SubmissionDate** → `timestamp`
- **Question1** → `question1` 
- **Question2** → `question2`
- **Question3** → `question3`
- **Question4** → `question4`
- **Question5** → `question5`
- **Question6** → `question6`
- **Question7** → `question7`
- **Question8** → `question8`
- **TotalPoints** → `totalPoints`

## Paso 6: Agregar respuesta HTTP (Recomendado)

1. **Agregar otro paso:**
   - Click "+ Nuevo paso"
   - Busca "Respuesta"
   - Selecciona "Respuesta"

2. **Configurar la respuesta:**
   - **Código de estado**: 200
   - **Encabezados**: Agregar nuevo
     - Clave: `Content-Type`
     - Valor: `application/json`
   - **Cuerpo**: 
   ```json
   {
     "success": true,
     "message": "Data saved successfully to SharePoint",
     "timestamp": "@{utcNow()}",
     "recordsProcessed": 1
   }
   ```

## Paso 7: Obtener la URL del HTTP POST

1. **Guardar el flujo:**
   - Click "Guardar" (arriba a la derecha)
   - Espera a que se guarde completamente

2. **Obtener la URL:**
   - En el desencadenador HTTP, verás "URL de HTTP POST"
   - Click en el icono de copiar 📋
   - La URL se ve así: `https://prod-XX.westus.logic.azure.com:443/workflows/...`

3. **Actualizar el código:**
   - Ve al archivo `sharepoint-integration.js`
   - Reemplaza `PEGA_AQUI_TU_URL_DE_POWER_AUTOMATE` con tu URL

## Paso 8: Activar y probar el flujo

1. **Activar el flujo:**
   - Asegúrate de que el estado sea "Activado" (toggle en la parte superior)

2. **Probar desde el formulario:**
   - Abre tu formulario web
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Console"
   - Llena y envía el formulario
   - Revisa los mensajes en la consola

3. **Verificar en SharePoint:**
   - Ve a tu Excel en SharePoint
   - Verifica que aparezca una nueva fila con los datos

4. **Revisar historial del flujo:**
   - En Power Automate, ve a "Mis flujos"
   - Click en tu flujo
   - Ve a "Historial de ejecución de 28 días"
   - Revisa si hay errores

## Solución de problemas comunes

### ❌ Error: "La tabla no existe"
**Solución:** Asegúrate de haber convertido tus datos a una tabla en Excel

### ❌ Error CORS
**Solución:** Agrega el paso de Respuesta HTTP (Paso 6)

### ❌ Error 404 al enviar
**Solución:** 
- Verifica que la URL esté correcta
- Asegúrate de que el flujo esté activado

### ❌ Los datos no aparecen en Excel
**Solución:**
1. Ve al historial del flujo en Power Automate
2. Click en una ejecución fallida
3. Revisa qué paso falló
4. Verifica que los nombres de columnas coincidan exactamente

### ❌ Error de permisos
**Solución:** Asegúrate de tener permisos de edición en el sitio de SharePoint

## Ejemplo de URL final
Tu URL debería verse así:
```
https://prod-27.westus.logic.azure.com:443/workflows/abcd1234-5678-90ef-ghij-klmnopqrstuv/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=TU_SIGNATURE_MUY_LARGA_AQUI
```

## ✅ Lista de verificación
- [ ] Excel creado en SharePoint con tabla
- [ ] Flujo creado en Power Automate
- [ ] Desencadenador HTTP configurado con esquema
- [ ] Acción de Excel configurada
- [ ] Campos mapeados correctamente
- [ ] Respuesta HTTP agregada
- [ ] Flujo guardado y activado
- [ ] URL copiada al código
- [ ] Probado y funcionando

¡Una vez que completes todos estos pasos, tu formulario se conectará automáticamente con SharePoint! 🚀
