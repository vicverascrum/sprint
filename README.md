# Sprint Prioritization Form

A web-based survey form for sprint prioritization with capacity management, real-time progress tracking, and **AWS Lambda integration** for data persistence.

## 🚀 Quick Start

```bash
# Clone or download the project
cd VotingForm

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open at `http://localhost:8080`

## 📁 Project Structure

```
VotingForm/
├── index.html                    # Main HTML file (ROOT)
├── package.json                  # Project configuration
├── validate-json.js              # JSON validation script
├── start.sh                      # Start script
├── README.md                     # This file
├── quick-test.js                 # AWS integration test
├── test-aws-connection.html      # AWS connection test page
└── src/                          # Source files
    ├── data/
    │   └── questions.json        # Survey questions data
    ├── scripts/
    │   ├── main.js               # Main JavaScript logic
    │   └── aws-integration.js    # AWS Lambda integration
    └── styles/
        ├── style.css             # Base styles
        └── foundever-theme.css   # Foundever theme
```

## ✨ Features

### **Core Features**
- **Sprint Capacity Management**: 260-hour capacity tracking
- **Real-time Progress Bar**: Visual capacity indicator
- **Dynamic Color Coding**: Progress bar changes color based on capacity level
- **Sticky Header**: Always visible sprint information
- **Floating Submit Button**: Easy form submission with dynamic feedback
- **Responsive Design**: Works on desktop and mobile
- **Professional Foundever Theme**: Corporate branding

### **🆕 AWS Integration Features**
- **Automatic Data Persistence**: All submissions saved to AWS DynamoDB
- **Real-time Validation**: Server-side validation via AWS Lambda
- **Query API**: Retrieve and analyze submitted data
- **Error Handling**: Robust error handling with user feedback
- **Loading States**: Visual feedback during submission

## 🎯 Usage

1. **Open the form**: Navigate to `index.html` in your browser
2. **Fill email**: Enter your email address
3. **Select items**: Choose sprint items by checking boxes
4. **Monitor capacity**: Watch the progress bar fill up
5. **Submit**: Use the floating submit button
6. **Confirmation**: Receive confirmation that data was saved to AWS

## 🔧 Development

```bash
# Validate JSON structure
npm run validate

# Run tests
npm test

# Start development server with watch
npm run dev

# Test AWS connection
node quick-test.js

# Open AWS connection test page
open http://localhost:8080/test-aws-connection.html
```

## 🌐 AWS Architecture

### **Components**
- **API Gateway**: `https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod`
- **Lambda Functions**:
  - `sprint-prioritization-api`: Handles form submissions
  - `sprint-query-api`: Handles data queries
- **DynamoDB**: Stores all form submissions
- **IAM Roles**: Secure access management

### **Endpoints**
- **POST /submit**: Submit form data
- **GET /query**: Query submitted data

### **Data Format**
```json
{
  "email": "user@foundever.com",
  "selectedItems": [
    {
      "id": "question1",
      "title": "Item description",
      "estimatedHours": 24
    }
  ],
  "totalHours": 24,
  "submissionDate": "2025-08-06T05:31:31.411Z",
  "sprintNumber": 23
}
```

## 📊 Capacity Management

- **0-50%**: Blue progress (light load)
- **51-80%**: Yellow progress (good capacity)
- **81-100%**: Orange progress (near capacity)
- **100%+**: Red progress (over capacity)

## 🎨 Customization

- **Colors**: Edit `src/styles/foundever-theme.css`
- **Questions**: Modify `src/data/questions.json`
- **Logic**: Update `src/scripts/main.js`
- **AWS Config**: Update `src/scripts/aws-integration.js`

## 📱 Responsive

The form is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

### **Frontend Testing**
```bash
# Test form validation
npm test

# Test AWS integration
node quick-test.js

# Open interactive test page
open http://localhost:8080/test-aws-connection.html
```

### **API Testing**
```bash
# Test submit endpoint
curl -X POST https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod/submit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@foundever.com","selectedItems":[{"id":"question1","title":"Test","estimatedHours":4}],"totalHours":4}'

# Test query endpoint
curl -X GET https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod/query
```

## 🔍 Troubleshooting

### **Common Issues**

#### **Form not submitting**
1. Check browser console for errors
2. Verify AWS endpoints are accessible
3. Test with `test-aws-connection.html`

#### **AWS Connection Failed**
1. Verify API Gateway is deployed
2. Check Lambda function logs in CloudWatch
3. Ensure CORS is properly configured

#### **Data not appearing in database**
1. Check Lambda function execution logs
2. Verify DynamoDB table permissions
3. Test with `node quick-test.js`

### **Debug Commands**
```bash
# Check AWS CLI configuration
aws configure list

# Test Lambda function directly
aws lambda invoke --function-name sprint-prioritization-api --payload '{"test":true}' response.json

# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/sprint"
```

## 📈 Analytics

The system tracks:
- **Submission timestamps**
- **User email addresses**
- **Selected items and hours**
- **Capacity utilization**
- **Sprint participation rates**

Query the data using the `/query` endpoint or AWS Console.

## 🔐 Security

- **CORS enabled** for web browser access
- **Input validation** on both client and server
- **IAM roles** for secure AWS access
- **No sensitive data** stored in frontend code

## 🚀 Deployment

### **Frontend Deployment**
- Host static files on any web server
- Ensure HTTPS for production use
- Update API endpoints if needed

### **AWS Infrastructure**
- Already deployed and configured
- API Gateway: `dubo90gxce.execute-api.us-east-1.amazonaws.com`
- Region: `us-east-1`

---

**Built for Foundever Sprint Planning** 🏢

**Last Updated**: August 6, 2025  
**Version**: 2.0.0 (with AWS integration)  
**Author**: Victor Vera
