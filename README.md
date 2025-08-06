# Sprint Prioritization Form

A web-based survey form for sprint prioritization with capacity management and real-time progress tracking.

## 🚀 Quick Start

```bash
# Clone or download the project
cd web-survey-form

# Install dependencies (if needed)
npm install

# Start the development server
npm start
```

The application will open at `http://localhost:8080`

## 📁 Project Structure

```
web-survey-form/
├── index.html              # Main HTML file (ROOT)
├── package.json            # Project configuration
├── validate-json.js        # JSON validation script
├── start.sh               # Start script
├── README.md              # This file
└── src/                   # Source files
    ├── data/
    │   └── questions.json # Survey questions data
    ├── scripts/
    │   └── main.js        # Main JavaScript logic
    └── styles/
        ├── style.css      # Base styles
        └── foundever-theme.css # Foundever theme
```

## ✨ Features

- **Sprint Capacity Management**: 260-hour capacity tracking
- **Real-time Progress Bar**: Visual capacity indicator
- **Dynamic Color Coding**: Progress bar changes color based on capacity level
- **Sticky Header**: Always visible sprint information
- **Floating Submit Button**: Easy form submission
- **Responsive Design**: Works on desktop and mobile
- **Professional Foundever Theme**: Corporate branding

## 🎯 Usage

1. **Open the form**: Navigate to `index.html` in your browser
2. **Fill email**: Enter your email address
3. **Select items**: Choose sprint items by checking boxes
4. **Monitor capacity**: Watch the progress bar fill up
5. **Submit**: Use the floating submit button

## 🔧 Development

```bash
# Validate JSON structure
npm run validate

# Run tests
npm test

# Start development server with watch
npm run dev
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

## 📱 Responsive

The form is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

---

**Built for Foundever Sprint Planning** 🏢
