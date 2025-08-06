# Power Automate Flow Setup for SharePoint Integration

## Step 1: Create a new Flow in Power Automate

1. Go to https://make.powerautomate.com
2. Click "Create" > "Instant cloud flow"
3. Name: "Survey Form to SharePoint Excel"
4. Trigger: "When an HTTP request is received"

## Step 2: Configure HTTP Trigger

1. Add trigger "When an HTTP request is received"
2. In "Request Body JSON Schema", paste:

```json
{
    "type": "object",
    "properties": {
        "email": {
            "type": "string"
        },
        "submissionDate": {
            "type": "string"
        },
        "responses": {
            "type": "object"
        },
        "prioritySummary": {
            "type": "object",
            "properties": {
                "high": {
                    "type": "integer"
                },
                "medium": {
                    "type": "integer"
                },
                "low": {
                    "type": "integer"
                }
            }
        }
    }
}
```

## Step 3: Add Excel Online Action

1. Add action "Excel Online (Business)" > "Add a row into a table"
2. Configure:
   - Location: SharePoint Site
   - Document Library: Your library
   - File: Your Excel file
   - Table: Your table name

## Step 4: Map Fields

Map the dynamic content from the HTTP trigger to Excel columns:
- Email: `triggerBody()?['email']`
- Submission Date: `triggerBody()?['submissionDate']`
- Responses: `string(triggerBody()?['responses'])`
- High Priority Count: `triggerBody()?['prioritySummary']?['high']`
- Medium Priority Count: `triggerBody()?['prioritySummary']?['medium']`
- Low Priority Count: `triggerBody()?['prioritySummary']?['low']`

## Step 5: Get the HTTP URL

1. Save the flow
2. Copy the HTTP POST URL
3. Update the `powerAutomateUrl` in `sharepoint-integration.js`

## Excel Table Structure

Create a table in Excel with these columns:
- Email (Text)
- SubmissionDate (Date)
- Responses (Text - JSON)
- HighPriority (Number)
- MediumPriority (Number)
- LowPriority (Number)
