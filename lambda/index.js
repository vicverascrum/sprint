const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'sprint-prioritization-v2';
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    
    try {
        if (event.httpMethod === 'POST') {
            return await handleSubmission(event);
        } else if (event.httpMethod === 'GET') {
            return await handleQuery(event);
        } else {
            return {
                statusCode: 405,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};

async function handleSubmission(event) {
    const requestBody = JSON.parse(event.body);
    console.log('Processing submission:', requestBody);
    
    // Validate required fields
    if (!requestBody.email) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Email is required' })
        };
    }
    
    // Prepare enhanced item for DynamoDB with priority data
    const timestamp = new Date().toISOString();
    const item = {
        // Primary keys
        email: requestBody.email,
        timestamp: requestBody.timestamp || timestamp,
        
        // Basic submission data
        submissionDate: requestBody.submissionDate || timestamp,
        selectedItems: requestBody.selectedItems || [],
        totalHours: requestBody.totalHours || 0,
        itemsWithTBD: requestBody.itemsWithTBD || 0,
        capacityUsed: requestBody.capacityUsed || 0,
        
        // NEW: Priority fields
        highPriorityCount: requestBody.highPriorityCount || 0,
        mediumPriorityCount: requestBody.mediumPriorityCount || 0,
        lowPriorityCount: requestBody.lowPriorityCount || 0,
        priorityBreakdown: requestBody.priorityBreakdown || { high: 0, medium: 0, low: 0 },
        totalPoints: requestBody.totalPoints || 0,
        
        // Additional data
        responses: requestBody.responses || {},
        sprintNumber: requestBody.sprintNumber || 23,
        formVersion: requestBody.formVersion || "v2.0-with-priority",
        
        // Enhanced summary with priority info
        summary: {
            totalItems: requestBody.selectedItems ? requestBody.selectedItems.length : 0,
            itemsWithTBD: requestBody.itemsWithTBD || 0,
            capacityUsed: requestBody.capacityUsed || 0,
            remainingCapacity: Math.max(0, 260 - (requestBody.totalHours || 0)),
            isOverCapacity: (requestBody.totalHours || 0) > 260,
            priorityDistribution: requestBody.priorityBreakdown || { high: 0, medium: 0, low: 0 },
            averagePriorityScore: calculateAveragePriorityScore(requestBody.priorityBreakdown)
        },
        
        // Metadata
        metadata: {
            userAgent: requestBody.metadata?.userAgent || 'Unknown',
            submissionTimestamp: timestamp,
            formVersion: requestBody.formVersion || "v2.0-with-priority",
            hasValidPriorities: hasValidPriorities(requestBody.priorityBreakdown),
            processingVersion: "lambda-v2.0"
        },
        
        // GSI fields for querying
        formVersionSprintNumber: `${requestBody.formVersion || "v2.0"}-sprint-${requestBody.sprintNumber || 23}`,
        totalPointsRange: getTotalPointsRange(requestBody.totalPoints || 0),
        priorityProfile: getPriorityProfile(requestBody.priorityBreakdown),
        
        // Timestamps for TTL and sorting
        createdAt: timestamp,
        updatedAt: timestamp,
        ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year TTL
    };
    
    console.log('Prepared item for DynamoDB:', item);
    
    // Store in DynamoDB
    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: 'attribute_not_exists(email) AND attribute_not_exists(#ts)',
        ExpressionAttributeNames: {
            '#ts': 'timestamp'
        }
    };
    
    try {
        await dynamodb.put(params).promise();
        console.log('Successfully stored item in DynamoDB');
        
        // Return success response with priority summary
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                message: 'Sprint prioritization submitted successfully with priority data',
                data: {
                    email: item.email,
                    timestamp: item.timestamp,
                    totalItems: item.summary.totalItems,
                    totalHours: item.totalHours,
                    totalPoints: item.totalPoints,
                    priorityBreakdown: item.priorityBreakdown,
                    priorityProfile: item.priorityProfile,
                    formVersion: item.formVersion
                }
            })
        };
        
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
            console.log('Duplicate submission detected, updating existing record');
            return await handleDuplicateSubmission(item);
        } else {
            throw error;
        }
    }
}

async function handleDuplicateSubmission(item) {
    // Update existing record with new priority data
    const updateParams = {
        TableName: TABLE_NAME,
        Key: {
            email: item.email,
            timestamp: item.timestamp
        },
        UpdateExpression: `
            SET 
            selectedItems = :selectedItems,
            totalHours = :totalHours,
            itemsWithTBD = :itemsWithTBD,
            capacityUsed = :capacityUsed,
            highPriorityCount = :highPriorityCount,
            mediumPriorityCount = :mediumPriorityCount,
            lowPriorityCount = :lowPriorityCount,
            priorityBreakdown = :priorityBreakdown,
            totalPoints = :totalPoints,
            responses = :responses,
            summary = :summary,
            metadata = :metadata,
            priorityProfile = :priorityProfile,
            totalPointsRange = :totalPointsRange,
            updatedAt = :updatedAt
        `,
        ExpressionAttributeValues: {
            ':selectedItems': item.selectedItems,
            ':totalHours': item.totalHours,
            ':itemsWithTBD': item.itemsWithTBD,
            ':capacityUsed': item.capacityUsed,
            ':highPriorityCount': item.highPriorityCount,
            ':mediumPriorityCount': item.mediumPriorityCount,
            ':lowPriorityCount': item.lowPriorityCount,
            ':priorityBreakdown': item.priorityBreakdown,
            ':totalPoints': item.totalPoints,
            ':responses': item.responses,
            ':summary': item.summary,
            ':metadata': item.metadata,
            ':priorityProfile': item.priorityProfile,
            ':totalPointsRange': item.totalPointsRange,
            ':updatedAt': item.updatedAt
        },
        ReturnValues: 'ALL_NEW'
    };
    
    try {
        const result = await dynamodb.update(updateParams).promise();
        console.log('Successfully updated existing record');
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                message: 'Sprint prioritization updated successfully with new priority data',
                updated: true,
                data: {
                    email: result.Attributes.email,
                    timestamp: result.Attributes.timestamp,
                    totalItems: result.Attributes.summary.totalItems,
                    totalHours: result.Attributes.totalHours,
                    totalPoints: result.Attributes.totalPoints,
                    priorityBreakdown: result.Attributes.priorityBreakdown,
                    priorityProfile: result.Attributes.priorityProfile
                }
            })
        };
    } catch (error) {
        throw error;
    }
}

async function handleQuery(event) {
    const queryParams = event.queryStringParameters || {};
    console.log('Processing query with params:', queryParams);
    
    let params = {
        TableName: TABLE_NAME,
        Limit: parseInt(queryParams.limit) || 50
    };
    
    // Add filters based on query parameters
    if (queryParams.email) {
        params.KeyConditionExpression = 'email = :email';
        params.ExpressionAttributeValues = { ':email': queryParams.email };
    }
    
    if (queryParams.sprintNumber) {
        params.FilterExpression = 'sprintNumber = :sprintNumber';
        params.ExpressionAttributeValues = {
            ...params.ExpressionAttributeValues,
            ':sprintNumber': parseInt(queryParams.sprintNumber)
        };
    }
    
    if (queryParams.minPoints) {
        const filterExpr = params.FilterExpression ? `${params.FilterExpression} AND totalPoints >= :minPoints` : 'totalPoints >= :minPoints';
        params.FilterExpression = filterExpr;
        params.ExpressionAttributeValues = {
            ...params.ExpressionAttributeValues,
            ':minPoints': parseInt(queryParams.minPoints)
        };
    }
    
    if (queryParams.priorityProfile) {
        const filterExpr = params.FilterExpression ? `${params.FilterExpression} AND priorityProfile = :priorityProfile` : 'priorityProfile = :priorityProfile';
        params.FilterExpression = filterExpr;
        params.ExpressionAttributeValues = {
            ...params.ExpressionAttributeValues,
            ':priorityProfile': queryParams.priorityProfile
        };
    }
    
    try {
        const result = params.KeyConditionExpression ? 
            await dynamodb.query(params).promise() : 
            await dynamodb.scan(params).promise();
        
        console.log(`Query returned ${result.Items.length} items`);
        
        // Calculate aggregated priority statistics
        const stats = calculatePriorityStats(result.Items);
        
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                success: true,
                data: result.Items,
                count: result.Items.length,
                stats: stats,
                lastEvaluatedKey: result.LastEvaluatedKey
            })
        };
        
    } catch (error) {
        throw error;
    }
}

// Helper functions for priority calculations
function calculateAveragePriorityScore(priorityBreakdown) {
    if (!priorityBreakdown) return 0;
    
    const total = priorityBreakdown.high + priorityBreakdown.medium + priorityBreakdown.low;
    if (total === 0) return 0;
    
    const weightedSum = (priorityBreakdown.high * 30) + (priorityBreakdown.medium * 20) + (priorityBreakdown.low * 10);
    return Math.round(weightedSum / total);
}

function hasValidPriorities(priorityBreakdown) {
    if (!priorityBreakdown) return false;
    return priorityBreakdown.high > 0 || priorityBreakdown.medium > 0 || priorityBreakdown.low > 0;
}

function getTotalPointsRange(totalPoints) {
    if (totalPoints >= 200) return 'very-high';
    if (totalPoints >= 150) return 'high';
    if (totalPoints >= 100) return 'medium';
    if (totalPoints >= 50) return 'low';
    return 'very-low';
}

function getPriorityProfile(priorityBreakdown) {
    if (!priorityBreakdown) return 'none';
    
    const { high, medium, low } = priorityBreakdown;
    const total = high + medium + low;
    
    if (total === 0) return 'none';
    
    const highRatio = high / total;
    const mediumRatio = medium / total;
    
    if (highRatio >= 0.7) return 'high-focused';
    if (highRatio >= 0.4) return 'high-heavy';
    if (mediumRatio >= 0.7) return 'medium-focused';
    if (high === medium && medium === low) return 'balanced';
    if (highRatio >= 0.3 && mediumRatio >= 0.3) return 'mixed-priorities';
    
    return 'low-focused';
}

function calculatePriorityStats(items) {
    if (!items || items.length === 0) {
        return {
            totalSubmissions: 0,
            averageTotalPoints: 0,
            priorityDistribution: { high: 0, medium: 0, low: 0 },
            profileDistribution: {}
        };
    }
    
    const totalSubmissions = items.length;
    let totalPoints = 0;
    let priorityTotals = { high: 0, medium: 0, low: 0 };
    let profileCounts = {};
    
    items.forEach(item => {
        totalPoints += item.totalPoints || 0;
        
        if (item.priorityBreakdown) {
            priorityTotals.high += item.priorityBreakdown.high || 0;
            priorityTotals.medium += item.priorityBreakdown.medium || 0;
            priorityTotals.low += item.priorityBreakdown.low || 0;
        }
        
        const profile = item.priorityProfile || 'unknown';
        profileCounts[profile] = (profileCounts[profile] || 0) + 1;
    });
    
    return {
        totalSubmissions,
        averageTotalPoints: Math.round(totalPoints / totalSubmissions),
        priorityDistribution: priorityTotals,
        profileDistribution: profileCounts,
        averagePrioritiesPerSubmission: {
            high: Math.round(priorityTotals.high / totalSubmissions * 10) / 10,
            medium: Math.round(priorityTotals.medium / totalSubmissions * 10) / 10,
            low: Math.round(priorityTotals.low / totalSubmissions * 10) / 10
        }
    };
}
