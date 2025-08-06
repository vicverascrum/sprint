// Configuration file for Sprint Prioritization Form
// Update these values as needed for different environments

window.CONFIG = {
    // AWS Configuration
    AWS: {
        API_BASE_URL: 'https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod',
        REGION: 'us-east-1',
        ENDPOINTS: {
            SUBMIT: '/submit',
            QUERY: '/query'
        }
    },
    
    // Form Configuration
    FORM: {
        SPRINT_NUMBER: 23,
        CAPACITY_LIMIT: 260, // hours
        VERSION: '2.0.0'
    },
    
    // UI Configuration
    UI: {
        COLORS: {
            LIGHT_LOAD: '#007bff',      // 0-50%
            GOOD_CAPACITY: '#ffc107',   // 51-80%
            NEAR_CAPACITY: '#fd7e14',   // 81-100%
            OVER_CAPACITY: '#dc3545'    // 100%+
        },
        ANIMATIONS: {
            ENABLED: true,
            DURATION: 300 // milliseconds
        }
    },
    
    // Debug Configuration
    DEBUG: {
        ENABLED: false, // Set to true for development
        LOG_LEVEL: 'info' // 'debug', 'info', 'warn', 'error'
    },
    
    // Company Configuration
    COMPANY: {
        NAME: 'Foundever',
        THEME: 'foundever-theme'
    }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development environment
    window.CONFIG.DEBUG.ENABLED = true;
    window.CONFIG.DEBUG.LOG_LEVEL = 'debug';
    console.log('🔧 Development mode enabled');
}

// Utility functions
window.CONFIG.utils = {
    log: function(level, message, data) {
        if (!window.CONFIG.DEBUG.ENABLED) return;
        
        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(window.CONFIG.DEBUG.LOG_LEVEL);
        const messageLevelIndex = levels.indexOf(level);
        
        if (messageLevelIndex >= currentLevelIndex) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    },
    
    getCapacityColor: function(hours) {
        const percentage = (hours / window.CONFIG.FORM.CAPACITY_LIMIT) * 100;
        
        if (percentage > 100) return window.CONFIG.UI.COLORS.OVER_CAPACITY;
        if (percentage > 80) return window.CONFIG.UI.COLORS.NEAR_CAPACITY;
        if (percentage > 50) return window.CONFIG.UI.COLORS.GOOD_CAPACITY;
        return window.CONFIG.UI.COLORS.LIGHT_LOAD;
    },
    
    formatTimestamp: function(date = new Date()) {
        return date.toISOString();
    }
};

// Export for Node.js testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CONFIG;
}
