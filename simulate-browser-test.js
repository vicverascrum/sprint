// Simular el test de conexión como lo haría el navegador
const https = require('https');

// Simular window y navigator
global.window = {
    CONFIG: {
        AWS: {
            API_BASE_URL: 'https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod',
            ENDPOINTS: {
                SUBMIT: '/submit',
                QUERY: '/query'
            }
        }
    }
};

global.navigator = {
    userAgent: 'Node.js Browser Simulation'
};

// Simular fetch
global.fetch = function(url, options) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const postData = options.body;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: options.method,
            headers: options.headers
        };
        
        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const response = {
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    json: () => Promise.resolve(JSON.parse(data)),
                    text: () => Promise.resolve(data)
                };
                resolve(response);
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

// Cargar el código de aws-integration.js
const fs = require('fs');
const awsIntegrationCode = fs.readFileSync('./src/scripts/aws-integration.js', 'utf8');

// Ejecutar el código (simulando el navegador)
eval(awsIntegrationCode);

// Simular el test
async function simulateBrowserTest() {
    console.log('🧪 SIMULANDO TEST DE CONEXIÓN DEL NAVEGADOR');
    console.log('============================================');
    
    try {
        console.log('📋 Verificando que AWSIntegration existe...');
        if (!global.window.AWSIntegration) {
            console.log('❌ Error: AWSIntegration no está disponible');
            return;
        }
        
        console.log('✅ AWSIntegration cargado correctamente');
        console.log(`📡 API URL: ${global.window.AWSIntegration.AWS_CONFIG.API_BASE_URL}`);
        
        console.log('🚀 Ejecutando testAWSConnection()...');
        const isConnected = await global.window.AWSIntegration.testAWSConnection();
        
        if (isConnected) {
            console.log('✅ ¡TEST DE CONEXIÓN EXITOSO!');
        } else {
            console.log('❌ Test de conexión falló');
        }
        
    } catch (error) {
        console.error('❌ Error en la simulación:', error.message);
        console.error('📚 Stack:', error.stack);
    }
}

simulateBrowserTest();
