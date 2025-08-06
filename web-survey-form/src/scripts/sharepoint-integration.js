class SharePointIntegration {
    constructor() {
        // REEMPLAZA ESTA URL CON LA URL QUE OBTENGAS EN EL PASO 7 DE LA GUÍA
        this.powerAutomateUrl = 'PEGA_AQUI_TU_URL_DE_POWER_AUTOMATE';
        
        // Configuración para desarrollo local (opcional)
        this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    async submitToSharePoint(formData) {
        try {
            // Si estamos en desarrollo, simular respuesta exitosa
            if (this.isDevelopment && this.powerAutomateUrl.includes('XXXXX')) {
                console.log('Development mode: Simulating SharePoint submission', formData);
                await this.simulateDelay(2000);
                return { success: true, message: 'Simulated submission successful (Development mode)' };
            }

            const payload = {
                email: formData.email,
                submissionDate: formData.timestamp || new Date().toISOString(),
                selectedItems: formData.selectedItems || [],
                totalHours: formData.totalHours || 0,
                itemsWithTBD: formData.itemsWithTBD || 0,
                capacityUsed: formData.capacityUsed || 0,
                responses: formData.responses || {},
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            console.log('Sending to Power Automate:', payload);

            const response = await fetch(this.powerAutomateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const responseData = await response.json().catch(() => ({}));
                return { 
                    success: true, 
                    message: 'Data saved to SharePoint successfully',
                    data: responseData
                };
            } else {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error submitting to SharePoint:', error);
            return { 
                success: false, 
                error: error.message,
                details: error.stack
            };
        }
    }

    // Método para simular delay en desarrollo
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Método para validar la configuración
    validateConfiguration() {
        if (this.powerAutomateUrl.includes('XXXXX')) {
            console.warn('⚠️ Power Automate URL not configured. Using development mode.');
            return false;
        }
        return true;
    }

    // Método para testing de conexión
    async testConnection() {
        try {
            const testPayload = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Connection test from form'
            };

            const response = await fetch(this.powerAutomateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testPayload)
            });

            return {
                success: response.ok,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default SharePointIntegration;
