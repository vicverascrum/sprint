# 🚀 GUÍA COMPLETA: Conectar Formulario con SharePoint

## 📋 RESUMEN DE LO QUE HAREMOS
1. ✅ Excel ya creado en SharePoint 
2. ✅ Flujo "Survey Form to SharePoint Excel" ya creado
3. 🔄 Configurar el webhook con JSON
4. 🔄 Conectar con Excel
5. 🔄 Obtener URL y actualizar código

---

## 📝 PASO 3: CONFIGURAR WEBHOOK CON JSON

**En tu Power Automate, en el webhook trigger:**

1. Busca: **"Request Body JSON Schema"** 
2. Click: **"Use sample payload to generate schema"**
3. **COPIA Y PEGA EXACTAMENTE ESTE JSON:**

```json
{
    "email": "victor@foundever.com",
    "submissionDate": "2024-01-15T10:30:00.000Z",
    "responses": {
        "email": "victor@foundever.com",
        "question1": "high",
        "question3": "medium",
        "question4": "low"
    },
    "prioritySummary": {
        "high": 2,
        "medium": 3,
        "low": 1
    },
    "totalQuestions": 6,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "formType": "sprint-prioritization",
    "sprintNumber": "23"
}
```

4. Click **"Done"**

---

## 📊 PASO 4: ACTUALIZAR EXCEL

**Ve a tu Excel en SharePoint y cambia los encabezados a:**
- A1: **Email**
- B1: **SubmissionDate** 
- C1: **HighPriority**
- D1: **MediumPriority**
- E1: **LowPriority**
- F1: **TotalQuestions**
- G1: **AllResponses**

**IMPORTANTE:** Asegúrate de que sea una TABLA (Insert > Table)

---

## ⚙️ PASO 5: CONECTAR CON EXCEL

**En Power Automate:**

1. Click **"+ New step"**
2. Busca: **"Excel Online (Business)"**
3. Selecciona: **"Add a row into a table"**
4. Configura:
   - **Location**: SharePoint Online
   - **Document Library**: Documents
   - **File**: Sprint-Prioritization-Responses.xlsx
   - **Table**: Table1

---

## 🔗 PASO 6: MAPEAR CAMPOS

**Para cada campo en Excel, selecciona del dynamic content:**

- **Email** → `email`
- **SubmissionDate** → `timestamp` 
- **HighPriority** → `high` (dentro de prioritySummary)
- **MediumPriority** → `medium` (dentro de prioritySummary)
- **LowPriority** → `low` (dentro de prioritySummary)
- **TotalQuestions** → `totalQuestions`
- **AllResponses** → EXPRESSION: `string(triggerBody()?['responses'])`

---

## 📤 PASO 7: RESPUESTA HTTP

1. **+ New step**
2. Busca: **"Response"**
3. Configura:
   - **Status Code**: 200
   - **Headers**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body**:
   ```json
   {
     "success": true,
     "message": "Data saved successfully to SharePoint",
     "timestamp": "@{utcNow()}",
     "recordsProcessed": 1
   }
   ```

---

## 🌐 PASO 8: OBTENER URL

1. **SAVE** el flujo
2. En el webhook trigger, COPIA la **"HTTP POST URL"**
3. Se ve así: `https://prod-XX.westus.logic.azure.com:443/workflows/...`

---

## 💻 PASO 9: ACTUALIZAR CÓDIGO

**Edita el archivo:** `src/scripts/sharepoint-integration.js`

**Encuentra esta línea:**
```javascript
this.powerAutomateUrl = 'PEGA_AQUI_TU_URL_DE_POWER_AUTOMATE';
```

**Reemplázala con tu URL real:**
```javascript
this.powerAutomateUrl = 'TU_URL_COMPLETA_AQUI';
```

---

## 🧪 PASO 10: PROBAR

1. **Activa** el flujo en Power Automate
2. Abre tu formulario web
3. Presiona **F12** (herramientas de desarrollador)
4. Ve a la pestaña **Console**
5. **Llena y envía** el formulario
6. Revisa los mensajes en la consola
7. **Verifica** que aparezcan datos en tu Excel de SharePoint

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ No funciona el webhook
- Verifica que el JSON esté exactamente como se muestra
- Asegúrate de que el flujo esté ACTIVADO

### ❌ No aparecen datos en Excel
- Ve a Power Automate > "My flows" > Tu flujo > "Run history"
- Revisa qué paso falló
- Verifica nombres de columnas exactos

### ❌ Error CORS
- Asegúrate de tener el paso "Response" configurado

### ❌ Error 404
- Verifica que la URL esté correcta y completa
- Asegúrate de que el flujo esté guardado y activado

---

## ✅ CHECKLIST FINAL

- [ ] JSON pegado en webhook
- [ ] Excel actualizado con columnas correctas  
- [ ] Tabla creada en Excel
- [ ] Conexión con Excel configurada
- [ ] Campos mapeados correctamente
- [ ] Respuesta HTTP agregada
- [ ] Flujo guardado y activado
- [ ] URL copiada al código JavaScript
- [ ] Probado y funcionando

**¡Una vez completado todo, tu formulario se conectará automáticamente con SharePoint!** 🎉

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona, dime:
1. ¿En qué paso te quedaste?
2. ¿Qué error ves exactamente?
3. ¿Qué aparece en la consola del navegador?
