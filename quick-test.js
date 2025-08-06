// Quick test script for AWS integration
const https = require('https');

const testData = {
    email: 'quicktest@foundever.com',
    selectedItems: [
        {
            id: 'question3',
            title: 'Visual button for pending acknowledgment',
            estimatedHours: 4
        }
    ],
    totalHours: 4,
    submissionDate: new Date().toISOString(),
    sprintNumber: 23
};

const postData = JSON.stringify(testData);

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

console.log('🧪 Testing AWS Lambda integration...');
console.log('📤 Sending data:', testData);

const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('✅ Response:', response);
            
            if (response.success) {
                console.log('🎉 Test PASSED! Data saved successfully.');
                console.log(`📝 Record ID: ${response.id}`);
                console.log(`⏰ Submitted at: ${response.submittedAt}`);
            } else {
                console.log('❌ Test FAILED!', response);
            }
        } catch (error) {
            console.log('❌ Error parsing response:', error.message);
            console.log('📄 Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
