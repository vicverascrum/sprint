# Database Setup for Priority System

## Required Database Changes

### 1. Update Excel/SharePoint Columns

**Current columns:**
- Email
- SubmissionDate
- TotalItems
- TotalHours
- ItemsWithTBD
- CapacityUsed
- SelectedItems
- ResponseDetails

**NEW columns to add:**
- **HighPriorityCount** (Number) - Count of high priority items
- **MediumPriorityCount** (Number) - Count of medium priority items  
- **LowPriorityCount** (Number) - Count of low priority items
- **TotalPoints** (Number) - Calculated priority points (high=30, medium=20, low=10)
- **PriorityBreakdown** (Text) - JSON with detailed priority info
- **FormVersion** (Text) - Version identifier (e.g., "v2.0-with-priority")

### 2. Power Automate Flow Updates

**Update the JSON schema in the HTTP trigger:**

```json
{
    "email": "victor@foundever.com",
    "submissionDate": "2024-01-15T10:30:00.000Z",
    "selectedItems": [
        {
            "questionId": "question1",
            "questionTitle": "Sample question",
            "hours": "8",
            "priority": "high",
            "isEstimated": true
        }
    ],
    "totalHours": 24,
    "itemsWithTBD": 1,
    "capacityUsed": 9,
    "priorityBreakdown": {
        "high": 2,
        "medium": 1, 
        "low": 0
    },
    "totalPoints": 80,
    "responses": {
        "email": "victor@foundever.com",
        "question1_selected": "8",
        "question1_priority": "high"
    },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "formVersion": "v2.0-with-priority"
}
```

### 3. Field Mapping in Power Automate

**Map these fields in the Excel action:**

- **Email** → `email`
- **SubmissionDate** → `timestamp`
- **TotalItems** → `length(triggerBody()?['selectedItems'])`
- **TotalHours** → `totalHours`
- **ItemsWithTBD** → `itemsWithTBD`
- **CapacityUsed** → `capacityUsed`
- **HighPriorityCount** → `triggerBody()?['priorityBreakdown']?['high']`
- **MediumPriorityCount** → `triggerBody()?['priorityBreakdown']?['medium']`
- **LowPriorityCount** → `triggerBody()?['priorityBreakdown']?['low']`
- **TotalPoints** → `totalPoints`
- **SelectedItems** → `string(triggerBody()?['selectedItems'])`
- **PriorityBreakdown** → `string(triggerBody()?['priorityBreakdown'])`
- **ResponseDetails** → `string(triggerBody()?['responses'])`
- **FormVersion** → `formVersion`

### 4. AWS DynamoDB Schema (if using AWS)

```json
{
    "TableName": "sprint-prioritization",
    "KeySchema": [
        {
            "AttributeName": "email",
            "KeyType": "HASH"
        },
        {
            "AttributeName": "timestamp",
            "KeyType": "RANGE"
        }
    ],
    "AttributeDefinitions": [
        {
            "AttributeName": "email",
            "AttributeType": "S"
        },
        {
            "AttributeName": "timestamp", 
            "AttributeType": "S"
        }
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "priority-index",
            "KeySchema": [
                {
                    "AttributeName": "formVersion",
                    "KeyType": "HASH"
                },
                {
                    "AttributeName": "totalPoints",
                    "KeyType": "RANGE"
                }
            ]
        }
    ]
}
```

### 5. Testing the Priority System

**Test data to verify:**
1. ✅ Priority counts are correct
2. ✅ Total points calculation (high=30, medium=20, low=10)
3. ✅ Individual item priorities are stored
4. ✅ Hours + priority combination works
5. ✅ Database receives complete priority data

### 6. Data Analysis Queries

**Example Power BI/Excel queries:**

```sql
-- Count by priority level
SELECT 
    HighPriorityCount,
    MediumPriorityCount, 
    LowPriorityCount,
    COUNT(*) as ResponseCount
FROM SprintPrioritization 
GROUP BY HighPriorityCount, MediumPriorityCount, LowPriorityCount

-- Average points by submission date
SELECT 
    DATE(SubmissionDate) as Date,
    AVG(TotalPoints) as AvgPoints,
    COUNT(*) as Submissions
FROM SprintPrioritization
GROUP BY DATE(SubmissionDate)
ORDER BY Date DESC
```

## Implementation Checklist

- [ ] Update Excel columns in SharePoint
- [ ] Update Power Automate JSON schema
- [ ] Update Power Automate field mapping
- [ ] Test form submission end-to-end
- [ ] Verify priority data in database
- [ ] Test priority calculations
- [ ] Create priority analysis dashboard
- [ ] Document new data structure for team

## Priority Point System

- **High Priority**: 30 points each
- **Medium Priority**: 20 points each  
- **Low Priority**: 10 points each

**Example calculation:**
- 2 High + 1 Medium + 1 Low = (2×30) + (1×20) + (1×10) = 90 points
