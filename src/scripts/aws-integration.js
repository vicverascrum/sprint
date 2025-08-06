// AWS Integration for Sprint Prioritization Form
// This file handles sending form data to AWS Lambda via API Gateway

const AWS_CONFIG = {
    API_BASE_URL: 'https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod',
    SUBMIT_ENDPOINT: '/submit',
    QUERY_ENDPOINT: '/query'
};

/**
 * Submit form data to AWS Lambda
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} - Response from the API
 */
async function submitToAWS(formData) {
    const url = AWS_CONFIG.API_BASE_URL + AWS_CONFIG.SUBMIT_ENDPOINT;
    
    try {
        console.log('Sending data to AWS:', formData);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('AWS Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('AWS Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('AWS Success response:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error submitting to AWS:', error);
        throw error;
    }
}

/**
 * Query submitted data from AWS
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Object>} - Query results from the API
 */
async function queryFromAWS(filters = {}) {
    const url = AWS_CONFIG.API_BASE_URL + AWS_CONFIG.QUERY_ENDPOINT;
    
    try {
        const queryParams = new URLSearchParams(filters);
        const fullUrl = queryParams.toString() ? `${url}?${queryParams}` : url;
        
        console.log('Querying AWS:', fullUrl);
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('AWS Query Error:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('AWS Query Success:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error querying AWS:', error);
        throw error;
    }
}

/**
 * Prepare form data for AWS submission
 * @param {FormData} formData - Raw form data
 * @param {Array} questions - Questions configuration
 * @returns {Object} - Formatted data for AWS
 */
function prepareFormDataForAWS(formData, questions) {
    const email = formData.get('email');
    const timestamp = new Date().toISOString();
    
    // Process selected items
    const selectedItems = [];
    let totalHours = 0;
    let itemsWithTBD = 0;
    
    questions.forEach(question => {
        if (question.type === 'checkbox') {
            const checkboxValue = formData.get(question.id);
            // Check if checkbox is selected (any value means it's checked)
            const isSelected = checkboxValue !== null && checkboxValue !== '';
            
            if (isSelected) {
                const item = {
                    id: question.id,
                    title: question.title,
                    estimatedHours: question.estimatedHours
                };
                
                selectedItems.push(item);
                
                if (question.estimatedHours === null || question.estimatedHours === undefined) {
                    itemsWithTBD++;
                } else {
                    totalHours += question.estimatedHours;
                }
            }
        }
    });
    
    // Calculate capacity metrics
    const CAPACITY_LIMIT = 260;
    const capacityUsed = Math.round((totalHours / CAPACITY_LIMIT) * 100);
    const remainingCapacity = Math.max(0, CAPACITY_LIMIT - totalHours);
    
    // Return data in the format expected by the Lambda function
    return {
        email: email,
        selectedItems: selectedItems,
        totalHours: totalHours,
        submissionDate: timestamp,
        sprintNumber: 23,
        summary: {
            totalItems: selectedItems.length,
            itemsWithTBD: itemsWithTBD,
            capacityUsed: capacityUsed,
            remainingCapacity: remainingCapacity,
            isOverCapacity: totalHours > CAPACITY_LIMIT
        },
        metadata: {
            userAgent: navigator.userAgent,
            timestamp: timestamp,
            formVersion: '1.0.0'
        }
    };
}

/**
 * Test AWS connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
async function testAWSConnection() {
    console.log('🧪 Starting AWS connection test...');
    
    try {
        const testData = {
            email: 'connection-test@foundever.com',
            selectedItems: [
                {
                    id: 'test-connection',
                    title: 'AWS Connection Test',
                    estimatedHours: 1
                }
            ],
            totalHours: 1,
            submissionDate: new Date().toISOString(),
            sprintNumber: 23,
            summary: {
                totalItems: 1,
                itemsWithTBD: 0,
                capacityUsed: 0,
                remainingCapacity: 259,
                isOverCapacity: false
            },
            metadata: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                formVersion: '1.0.0',
                testConnection: true
            }
        };
        
        console.log('📤 Test data prepared:', testData);
        console.log('🌐 Sending to:', AWS_CONFIG.API_BASE_URL + AWS_CONFIG.SUBMIT_ENDPOINT);
        
        const response = await submitToAWS(testData);
        console.log('✅ Connection test successful:', response);
        return true;
    } catch (error) {
        console.error('❌ AWS Connection test failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return false;
    }
}

// Export functions for use in main.js
window.AWSIntegration = {
    submitToAWS,
    queryFromAWS,
    prepareFormDataForAWS,
    testAWSConnection,
    AWS_CONFIG
};
