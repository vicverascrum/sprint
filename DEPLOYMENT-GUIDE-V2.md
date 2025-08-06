# Sprint Prioritization v2.0 - Deployment Guide with Priority System

## 🚀 Overview
This version adds comprehensive priority tracking to the sprint prioritization form.

### New Features
- ✅ Priority selection (High/Medium/Low) for each item
- ✅ Priority-based point calculation (High=30, Medium=20, Low=10)
- ✅ Enhanced database schema with priority fields
- ✅ Priority analytics and reporting
- ✅ Improved AWS Lambda with priority processing

## 📋 Deployment Steps

### 1. Deploy Enhanced DynamoDB Table

```bash
# Deploy the new table structure
aws cloudformation deploy \
  --template-file cloudformation/dynamodb-table-v2.yaml \
  --stack-name sprint-prioritization-v2 \
  --region us-east-1

# Get the table name
aws cloudformation describe-stacks \
  --stack-name sprint-prioritization-v2 \
  --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
  --output text
```

### 2. Update Lambda Function

```bash
# Package the enhanced lambda
cd lambda/
zip -r ../lambda-v2.zip index.js package.json

# Update the function
aws lambda update-function-code \
  --function-name sprint-prioritization \
  --zip-file fileb://../lambda-v2.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name sprint-prioritization \
  --environment Variables='{DYNAMODB_TABLE=sprint-prioritization-v2}'
```

### 3. Deploy Frontend Changes

Upload these files to your web server:
- `src/scripts/main-dropdown.js` (updated)
- `src/scripts/aws-integration.js` (enhanced)
- `src/styles/style.css` (with dropdown styles)

### 4. Test Priority System

```javascript
// Test the priority system
await window.AWSIntegration.testAWSConnection();

// Submit test data with priorities
const testData = {
    email: 'test@foundever.com',
    selectedItems: [{
        questionId: 'test1',
        hours: '8',
        priority: 'high'
    }],
    priorityCount: { high: 1, medium: 0, low: 0 },
    totalPoints: 30
};
await window.AWSIntegration.submitToAWS(testData);
```

## 📊 Database Schema Changes

### New Fields Added:
- `highPriorityCount` (Number)
- `mediumPriorityCount` (Number)  
- `lowPriorityCount` (Number)
- `priorityBreakdown` (Object)
- `totalPoints` (Number)
- `priorityProfile` (String)
- `totalPointsRange` (String)

### New Indexes:
- `FormVersionSprintIndex`
- `PriorityProfileIndex`
- `PointsRangeIndex`

## 🔍 Priority Analytics Queries

### Query by Priority Profile
```bash
aws dynamodb query \
  --table-name sprint-prioritization-v2 \
  --index-name PriorityProfileIndex \
  --key-condition-expression "priorityProfile = :profile" \
  --expression-attribute-values '{":profile":{"S":"high-focused"}}'
```

### Query High-Point Submissions
```bash
aws dynamodb scan \
  --table-name sprint-prioritization-v2 \
  --filter-expression "totalPoints > :minPoints" \
  --expression-attribute-values '{":minPoints":{"N":"100"}}'
```

### Get Priority Statistics
```bash
curl -X GET "https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod/query?minPoints=50&limit=100"
```

## 🧪 Testing Checklist

- [ ] Form loads with priority dropdowns
- [ ] Checkboxes show/hide priority selectors
- [ ] Priority validation works correctly
- [ ] Points calculation is accurate (30-20-10)
- [ ] AWS submission includes priority data
- [ ] DynamoDB stores all priority fields
- [ ] Query API returns priority statistics
- [ ] Error handling works for invalid priorities

## 📈 Priority Profiles

The system automatically categorizes submissions:

- **high-focused**: 70%+ high priority items
- **high-heavy**: 40-69% high priority items  
- **medium-focused**: 70%+ medium priority items
- **balanced**: Equal distribution
- **mixed-priorities**: 30%+ high AND 30%+ medium
- **low-focused**: Majority low priority items

## 🔧 Troubleshooting

### Priority Data Not Saving
1. Check browser console for errors
2. Verify AWS Lambda logs
3. Check DynamoDB table permissions
4. Validate JSON schema in requests

### Point Calculation Issues
```javascript
// Debug point calculation
console.log('Priority counts:', priorityCount);
console.log('Expected points:', (priorityCount.high * 30) + (priorityCount.medium * 20) + (priorityCount.low * 10));
```

### Query Performance
- Use appropriate GSI for priority queries
- Add pagination for large result sets
- Monitor DynamoDB metrics

## 📊 Monitoring & Analytics

### Key Metrics to Track:
- Average points per submission
- Priority distribution trends
- Most common priority profiles
- Capacity utilization vs priority levels

### CloudWatch Alarms:
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "PrioritySubmissionErrors" \
  --alarm-description "High error rate in priority submissions" \
  --metric-name "Errors" \
  --namespace "AWS/Lambda" \
  --statistic "Sum" \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

## 🚀 Future Enhancements

- Priority-based notifications
- Advanced analytics dashboard  
- Priority recommendations based on historical data
- Integration with project management tools
- Priority trend analysis

---

**Version**: v2.0-with-priority  
**Last Updated**: 2024-01-15  
**Compatible With**: Sprint 23+
