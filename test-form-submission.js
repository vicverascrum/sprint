// Test específico para envío del formulario
const https = require('https');
const fs = require('fs');

// Simular datos del formulario como los enviaría el navegador
function simulateFormSubmission() {
    // Cargar las preguntas reales
    const questionsData = JSON.parse(fs.readFileSync('./src/data/questions.json', 'utf8'));
    
    // Simular FormData con selecciones
    const mockFormData = {
        email: 'form-test@foundever.com',
        question1: 'on',  // Seleccionado
        question2: 'on',  // Seleccionado
        // question3 no seleccionado
    };
    
    // Preparar datos como lo haría prepareFormDataForAWS
    const selectedItems = [];
    let totalHours = 0;
    
    questionsData.questions.forEach(question => {
        if (question.type === 'checkbox' && mockFormData[question.id] === 'on') {
            selectedItems.push({
                id: question.id,
                title: question.title,
                estimatedHours: question.estimatedHours
            });
            
            if (question.estimatedHours !== null && question.estimatedHours !== undefined) {
                totalHours += question.estimatedHours;
            }
        }
    });
    
    const awsData = {
        email: mockFormData.email,
        selectedItems: selectedItems,
        totalHours: totalHours,
        submissionDate: new Date().toISOString(),
        sprintNumber: 23,
        summary: {
            totalItems: selectedItems.length,
            itemsWithTBD: selectedItems.filter(item => item.estimatedHours === null).length,
            capacityUsed: Math.round((totalHours / 260) * 100),
            remainingCapacity: Math.max(0, 260 - totalHours),
            isOverCapacity: totalHours > 260
        },
        metadata: {
            userAgent: 'Node.js Test',
            timestamp: new Date().toISOString(),
            formVersion: '1.0.0'
        }
    };
    
    return awsData;
}

// Enviar datos a AWS
function submitToAWS(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'dubo90gxce.execute-api.us-east-1.amazonaws.com',
            port: 443,
            path: '/prod/submit',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    reject(new Error(`Parse error: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// Ejecutar test
async function runTest() {
    console.log('🧪 TESTING FORM SUBMISSION');
    console.log('==========================');
    
    try {
        console.log('📝 Preparando datos del formulario...');
        const formData = simulateFormSubmission();
        
        console.log('📤 Datos a enviar:');
        console.log(`   Email: ${formData.email}`);
        console.log(`   Items seleccionados: ${formData.selectedItems.length}`);
        console.log(`   Total horas: ${formData.totalHours}h`);
        console.log(`   Items:`);
        formData.selectedItems.forEach((item, index) => {
            console.log(`     ${index + 1}. ${item.title.substring(0, 50)}... (${item.estimatedHours}h)`);
        });
        
        console.log('\n🚀 Enviando a AWS...');
        const result = await submitToAWS(formData);
        
        console.log(`✅ Status: ${result.status}`);
        console.log('📊 Respuesta:', result.data);
        
        if (result.data.success) {
            console.log(`🎉 ¡ÉXITO! Registro guardado con ID: ${result.data.id}`);
        } else {
            console.log('❌ Error en la respuesta:', result.data);
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
    }
}

runTest();
