// This file contains the JavaScript code for the survey form logic.

import SharePointIntegration from './sharepoint-integration.js';

let questionsLoaded = false; // Flag to prevent multiple loads

async function loadQuestions() {
    if (questionsLoaded) return; // Prevent multiple loads
    
    try {
        const response = await fetch('src/data/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update form header
        document.getElementById('form-title').textContent = data.formTitle;
        
        // Update subtitle only if it exists and has content
        const subtitleElement = document.getElementById('form-subtitle');
        if (subtitleElement && data.subtitle && data.subtitle.trim() !== '') {
            subtitleElement.textContent = data.subtitle;
        } else if (subtitleElement) {
            subtitleElement.style.display = 'none';
        }
        
        // Add progress bar and counter
        addProgressIndicator(data.questions.length);
        
        // Generate questions
        const container = document.getElementById('questions-container');
        data.questions.forEach((question, index) => {
            const questionCard = createQuestionCard(question, index + 1);
            container.appendChild(questionCard);
        });
        
        // Initialize form handling
        initializeForm(data.questions.length);
        
    } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to static content if JSON fails to load
        loadStaticQuestions();
    }
}

function addProgressIndicator(totalQuestions) {
    const header = document.querySelector('.form-header');
    
    // Add question counter
    const counter = document.createElement('div');
    counter.className = 'question-counter';
    counter.textContent = `0 of ${totalQuestions} questions answered`;
    header.appendChild(counter);
    
    // Add progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    header.appendChild(progressBar);
}

function updateProgress() {
    const form = document.getElementById('survey-form');
    const emailInput = form.querySelector('input[type="email"]');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    
    let answeredCount = 0;
    const totalQuestions = checkboxes.length + 1; // +1 for email
    const CAPACITY_LIMIT = 260;
    
    // Check email
    if (emailInput && emailInput.value.trim() !== '') {
        answeredCount++;
    }
    
    // Count checked checkboxes and calculate hours
    let totalHours = 0;
    let itemsWithTBD = 0;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            answeredCount++;
            const hours = checkbox.value;
            if (hours === 'TBD' || hours === null || hours === '') {
                itemsWithTBD++;
            } else if (!isNaN(hours)) {
                totalHours += parseInt(hours);
            }
        }
    });
    
    // Calculate capacity progress instead of question progress
    const capacityProgress = Math.min((totalHours / CAPACITY_LIMIT) * 100, 100);
    const progressFill = document.querySelector('.progress-fill');
    const counter = document.querySelector('.question-counter');
    
    // Debug: log the values
    console.log('Debug - totalHours:', totalHours, 'capacityProgress:', capacityProgress);
    
    // Update progress bar with capacity percentage
    if (progressFill) {
        progressFill.style.width = `${capacityProgress}%`;
        
        // Change color based on capacity level
        if (totalHours > CAPACITY_LIMIT) {
            progressFill.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
        } else if (totalHours > CAPACITY_LIMIT * 0.8) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12 0%, #e67e22 100%)';
        } else if (totalHours > CAPACITY_LIMIT * 0.5) {
            progressFill.style.background = 'linear-gradient(90deg, #f1c40f 0%, #f39c12 100%)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--foundever-primary) 0%, var(--foundever-secondary) 100%)';
        }
    }
    
    if (counter) {
        // Create capacity-focused counter text
        let counterText = '';
        
        if (totalHours === 0 && itemsWithTBD === 0) {
            counterText = `<span class="capacity-label">Sprint Capacity:</span> 0h / ${CAPACITY_LIMIT}h (0%)`;
        } else {
            let hoursInfo = '';
            if (totalHours > 0) {
                hoursInfo = `${totalHours}h`;
                if (itemsWithTBD > 0) {
                    hoursInfo += ` + ${itemsWithTBD} TBD`;
                }
            } else if (itemsWithTBD > 0) {
                hoursInfo = `${itemsWithTBD} TBD`;
            }
            
            const capacityPercentage = Math.round((totalHours / CAPACITY_LIMIT) * 100);
            const remainingHours = Math.max(0, CAPACITY_LIMIT - totalHours);
            
            counterText = `<span class="capacity-label">Sprint Capacity:</span> ${hoursInfo} / ${CAPACITY_LIMIT}h (${capacityPercentage}%) - ${remainingHours}h remaining`;
        }
        
        // Set the base text first
        counter.innerHTML = counterText;
        
        // Then add capacity indicator if needed
        if (totalHours > 0) {
            updateCapacityIndicator(totalHours, CAPACITY_LIMIT);
        }
    }
}

function createQuestionCard(question, questionNumber) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    let cardHTML = `
        <div class="question-number">${questionNumber}</div>
        <div class="question-content">
            <label class="question-title" ${question.type === 'email' ? `for="${question.id}"` : ''}>
                ${question.title}
            </label>
    `;
    
    if (question.type === 'email') {
        cardHTML += `
            <div class="input-group">
                <input type="email" id="${question.id}" name="${question.id}" 
                       class="text-input" placeholder="${question.placeholder}" 
                       ${question.required ? 'required' : ''}>
            </div>
        `;
    } else if (question.type === 'checkbox') {
        const hoursText = question.estimatedHours ? `${question.estimatedHours} hours` : 'TBD';
        const devFeedbackHTML = question.devFeedback ? `
            <div class="dev-feedback">
                <strong>Developer Feedback:</strong> ${question.devFeedback}
            </div>
        ` : '';
        
        cardHTML += `
            ${devFeedbackHTML}
            <div class="checkbox-group">
                <label class="checkbox-option">
                    <input type="checkbox" name="${question.id}" value="${question.estimatedHours || 'TBD'}" 
                           ${question.required ? 'required' : ''}>
                    <span class="checkbox-label">${hoursText}</span>
                </label>
            </div>
        `;
    } else if (question.type === 'radio') {
        if (question.hasImage) {
            cardHTML += `
                <div class="screenshot-container">
                    <img src="${question.imageSrc}" alt="${question.imageAlt}" class="screenshot">
                </div>
            `;
        }
        
        cardHTML += '<div class="radio-group">';
        question.options.forEach(option => {
            cardHTML += `
                <label class="radio-option">
                    <input type="radio" name="${question.id}" value="${option.value}" 
                           ${question.required ? 'required' : ''}>
                    <span class="radio-label">${option.label}</span>
                </label>
            `;
        });
        cardHTML += '</div>';
    }
    
    cardHTML += '</div>';
    card.innerHTML = cardHTML;
    return card;
}

function loadStaticQuestions() {
    // Fallback static content
    const container = document.getElementById('questions-container');
    container.innerHTML = `
        <div class="question-card">
            <div class="question-number">1</div>
            <div class="question-content">
                <label class="question-title" for="email">Email address *</label>
                <div class="input-group">
                    <input type="email" id="email" name="email" class="text-input" placeholder="Your email" required>
                </div>
            </div>
        </div>
        <div class="question-card">
            <div class="question-number">2</div>
            <div class="question-content">
                <label class="question-title">
                    Sample question for testing purposes
                </label>
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question1" value="8">
                        <span class="checkbox-label">8 hours</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Add progress indicator for static content
    addProgressIndicator(2);
    initializeForm(2);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert at the top of the form
    const form = document.getElementById('survey-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

async function initializeForm(totalQuestions) {
    const form = document.getElementById('survey-form');
    const resultMessage = document.getElementById('result-message');
    const floatingBtn = document.getElementById('floating-submit');
    
    // Initialize SharePoint integration
    const sharePointIntegration = new SharePointIntegration();
    
    // Initialize floating button
    initializeFloatingButton(floatingBtn);
    
    // Add change listeners for progress tracking
    form.addEventListener('change', updateProgress);
    form.addEventListener('input', updateProgress);
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const email = formData.get('email');
        
        // Validate email
        if (!email || !validateEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Collect selected items and calculate total hours
        const selectedItems = [];
        let totalHours = 0;
        let itemsWithoutHours = 0;
        const CAPACITY_LIMIT = 260;
        
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            showError('Please select at least one item.');
            return;
        }
        
        checkboxes.forEach(checkbox => {
            const questionCard = checkbox.closest('.question-card');
            const questionNumber = questionCard.querySelector('.question-number').textContent;
            const questionTitle = questionCard.querySelector('.question-title').textContent.trim();
            const hours = checkbox.value;
            
            selectedItems.push({
                questionNumber: questionNumber,
                questionTitle: questionTitle,
                estimatedHours: hours,
                isEstimated: hours !== 'TBD'
            });
            
            if (hours !== 'TBD' && !isNaN(hours)) {
                totalHours += parseInt(hours);
            } else {
                itemsWithoutHours++;
            }
        });
        
        // Check capacity limit
        if (totalHours > CAPACITY_LIMIT) {
            const excess = totalHours - CAPACITY_LIMIT;
            showError(`⚠️ Selection exceeds sprint capacity! You've selected ${totalHours}h, which is ${excess}h over the ${CAPACITY_LIMIT}h limit. Please remove some items to continue.`);
            return;
        }
        
        // Prepare data for SharePoint submission
        const submissionData = {
            email: email,
            selectedItems: selectedItems,
            totalHours: totalHours,
            itemsWithTBD: itemsWithoutHours,
            capacityUsed: Math.round((totalHours / CAPACITY_LIMIT) * 100),
            capacityLimit: CAPACITY_LIMIT,
            timestamp: new Date().toISOString(),
            responses: Object.fromEntries(formData)
        };
        
        // Update floating button to show loading state
        floatingBtn.querySelector('.btn-text').textContent = 'Submitting...';
        floatingBtn.querySelector('.btn-icon').textContent = '⏳';
        floatingBtn.disabled = true;
        floatingBtn.classList.add('submitting');
        
        try {
            // Submit to AWS PostgreSQL
            const result = await submitToAWS(submissionData);
            
            if (result.success) {
                // Display success message with AWS confirmation
                showSuccessMessage(email, selectedItems, totalHours, itemsWithoutHours, CAPACITY_LIMIT, true);
                
                // Update floating button for success
                floatingBtn.querySelector('.btn-text').textContent = 'Submitted ✓';
                floatingBtn.querySelector('.btn-icon').textContent = '✅';
                floatingBtn.classList.remove('submitting');
                floatingBtn.classList.add('success');
            } else {
                // Handle AWS error
                console.error('AWS submission failed:', result.error);
                showError(`Failed to submit: ${result.error || 'Unknown error'}`);
                
                // Reset floating button
                floatingBtn.querySelector('.btn-text').textContent = 'Submit';
                floatingBtn.querySelector('.btn-icon').textContent = '📝';
                floatingBtn.disabled = false;
                floatingBtn.classList.remove('submitting');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showError(`Failed to submit: ${error.message}`);
            
            // Reset floating button
            floatingBtn.querySelector('.btn-text').textContent = 'Submit';
            floatingBtn.querySelector('.btn-icon').textContent = '📝';
            floatingBtn.disabled = false;
            floatingBtn.classList.remove('submitting');
        }
        
        setTimeout(() => {
            if (confirm('Would you like to submit another response?')) {
                form.reset();
                resultMessage.classList.remove('show');
                floatingBtn.querySelector('.btn-text').textContent = 'Submit';
                floatingBtn.querySelector('.btn-icon').textContent = '📝';
                floatingBtn.disabled = false;
                floatingBtn.classList.remove('success', 'submitting');
                updateProgress();
                updateFloatingButton();
            }
        }, 5000);
    });
    
    // Add interaction effects
    const checkboxOptions = document.querySelectorAll('.checkbox-option');
    checkboxOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            if (!this.querySelector('input').checked) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (!this.querySelector('input').checked) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Also handle radio options for compatibility
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Initial progress update
    updateProgress();
    
    // Mark questions as loaded
    questionsLoaded = true;
}

function initializeFloatingButton(floatingBtn) {
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    // Show button with animation after a short delay
    setTimeout(() => {
        floatingBtn.classList.add('show');
    }, 1000);
    
    // Add scroll listener with enhanced effects
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
        
        // Add scrolling class for animation
        floatingBtn.classList.add('scrolling');
        
        // Add directional movement based on scroll
        if (scrollDelta > 0) {
            // Scrolling down - balloon moves slightly up
            floatingBtn.style.transform = 'translateY(-5px) rotate(2deg)';
        } else if (scrollDelta < 0) {
            // Scrolling up - balloon moves slightly down
            floatingBtn.style.transform = 'translateY(5px) rotate(-2deg)';
        }
        
        // Clear previous timeout
        clearTimeout(scrollTimeout);
        
        // Reset position after scroll stops
        scrollTimeout = setTimeout(() => {
            floatingBtn.classList.remove('scrolling');
            floatingBtn.style.transform = '';
        }, 150);
        
        lastScrollY = currentScrollY;
        updateFloatingButton();
    });
    
    // Add form change listener to update button state
    document.addEventListener('change', updateFloatingButton);
    document.addEventListener('input', updateFloatingButton);
    
    // Add mouse movement effect near the button
    document.addEventListener('mousemove', (e) => {
        const rect = floatingBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        
        // If mouse is within 150px of the button, add subtle movement
        if (distance < 150) {
            const moveX = (e.clientX - centerX) * 0.1;
            const moveY = (e.clientY - centerY) * 0.1;
            floatingBtn.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.1}deg)`;
        } else {
            floatingBtn.style.transform = '';
        }
    });
}

function updateFloatingButton() {
    const floatingBtn = document.getElementById('floating-submit');
    const form = document.getElementById('survey-form');
    
    if (!floatingBtn || !form) return;
    
    const emailInput = form.querySelector('input[type="email"]');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = form.querySelectorAll('input[type="checkbox"]:checked');
    
    // Calculate total hours in real time
    let totalHours = 0;
    let itemsWithTBD = 0;
    
    checkedBoxes.forEach(checkbox => {
        const hours = checkbox.value;
        if (hours === 'TBD' || hours === null || hours === '') {
            itemsWithTBD++;
        } else if (!isNaN(hours)) {
            totalHours += parseInt(hours);
        }
    });
    
    // Check capacity limit (260 hours)
    const CAPACITY_LIMIT = 260;
    const isOverCapacity = totalHours > CAPACITY_LIMIT;
    
    // Update checkbox states based on capacity
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            const hours = parseInt(checkbox.value);
            if (!isNaN(hours) && (totalHours + hours) > CAPACITY_LIMIT) {
                // Disable checkbox if adding it would exceed capacity
                checkbox.disabled = true;
                checkbox.closest('.checkbox-option').classList.add('disabled');
            } else {
                // Enable checkbox if it's within capacity
                checkbox.disabled = false;
                checkbox.closest('.checkbox-option').classList.remove('disabled');
            }
        }
    });
    
    // Check if form has minimum requirements
    const hasEmail = emailInput && emailInput.value.trim() !== '';
    const hasSelections = checkedBoxes.length > 0;
    
    // Remove all state classes first
    floatingBtn.classList.remove('pulse', 'celebrate', 'over-capacity');
    
    if (isOverCapacity) {
        // Over capacity - add warning state
        floatingBtn.classList.add('over-capacity');
        floatingBtn.style.opacity = '1';
    } else if (hasEmail && hasSelections) {
        // Form is ready - add celebration effect
        floatingBtn.classList.add('celebrate');
        floatingBtn.style.opacity = '1';
    } else if (hasSelections) {
        // Has selections but no email - add pulse
        floatingBtn.classList.add('pulse');
        floatingBtn.style.opacity = '0.9';
    } else {
        // Not ready - dim the button
        floatingBtn.style.opacity = '0.6';
    }
    
    // Update button text and icon based on selections and hours
    const btnText = floatingBtn.querySelector('.btn-text');
    const btnIcon = floatingBtn.querySelector('.btn-icon');
    
    if (checkedBoxes.length === 0) {
        btnText.textContent = 'Submit';
        btnIcon.textContent = '📝';
    } else {
        // Create dynamic text with hours
        let hoursText = '';
        if (totalHours > 0) {
            hoursText = `${totalHours}h`;
            if (itemsWithTBD > 0) {
                hoursText += ` +${itemsWithTBD}`;
            }
        } else if (itemsWithTBD > 0) {
            hoursText = `${itemsWithTBD} TBD`;
        }
        
        // Add capacity warning to text if over limit
        if (isOverCapacity) {
            const excess = totalHours - CAPACITY_LIMIT;
            btnText.textContent = `Over by ${excess}h!`;
            btnIcon.textContent = '⚠️';
        } else {
            // Set text based on selection count and hours - more concise
            if (checkedBoxes.length === 1) {
                btnText.textContent = hoursText ? `Submit ${hoursText}` : 'Submit 1 item';
                btnIcon.textContent = '🎯';
            } else if (totalHours > 0) {
                btnText.textContent = `Submit ${hoursText}`;
                if (checkedBoxes.length <= 3) {
                    btnIcon.textContent = '🚀';
                } else if (checkedBoxes.length <= 6) {
                    btnIcon.textContent = '⭐';
                } else {
                    btnIcon.textContent = '🎉';
                }
            } else {
                // Only TBD items
                btnText.textContent = `Submit ${checkedBoxes.length} TBD`;
                btnIcon.textContent = '🔮';
            }
        }
    }
    
    // Add visual feedback based on total hours with capacity awareness
    if (isOverCapacity) {
        // Over capacity - red warning theme
        floatingBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #8e44ad 100%)';
    } else if (totalHours === 0 && itemsWithTBD > 0) {
        // Only TBD items - purple theme
        floatingBtn.style.background = 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 50%, #e91e63 100%)';
    } else if (totalHours > 200) {
        // Very high hours but within capacity - orange theme
        floatingBtn.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #e74c3c 100%)';
    } else if (totalHours > 100) {
        // High hours - yellow/orange theme
        floatingBtn.style.background = 'linear-gradient(135deg, #f1c40f 0%, #f39c12 50%, #e67e22 100%)';
    } else if (totalHours > 50) {
        // Medium hours - green/yellow theme
        floatingBtn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 50%, #f1c40f 100%)';
    } else if (totalHours > 0) {
        // Low hours - green theme
        floatingBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 50%, #74b9ff 100%)';
    } else {
        // Default - original balloon colors
        floatingBtn.style.background = '';
    }
    
    // Add special animation for over capacity
    if (isOverCapacity) {
        floatingBtn.classList.add('high-hours');
    } else {
        floatingBtn.classList.remove('high-hours');
    }
}

function updateCapacityIndicator(currentHours, maxHours) {
    const counter = document.querySelector('.question-counter');
    if (!counter || currentHours === 0) return;
    
    // Get the original text without capacity indicators
    let originalText = counter.textContent;
    
    // Remove any existing capacity indicators
    originalText = originalText.replace(/\s*[✅⚡⚠️].*$/, '');
    
    const capacityPercentage = Math.round((currentHours / maxHours) * 100);
    
    if (currentHours > maxHours) {
        const excess = currentHours - maxHours;
        counter.innerHTML = `${originalText} <span class="capacity-warning">⚠️ OVER CAPACITY!</span>`;
    } else if (currentHours > maxHours * 0.9) {
        counter.innerHTML = `${originalText} <span class="capacity-warning">⚠️ Almost full!</span>`;
    } else if (currentHours > maxHours * 0.8) {
        counter.innerHTML = `${originalText} <span class="capacity-near">⚡ Getting full</span>`;
    } else if (currentHours > maxHours * 0.5) {
        counter.innerHTML = `${originalText} <span class="capacity-ok">✅ Good capacity</span>`;
    } else if (currentHours > 0) {
        counter.innerHTML = `${originalText} <span class="capacity-ok">✅ Light load</span>`;
    } else {
        // Reset to original text if no hours selected
        counter.innerHTML = originalText;
    }
}

// Initialize sticky header effects
function initializeStickyHeaders() {
    const formHeader = document.querySelector('.form-header');
    
    if (!formHeader) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Add subtle animation to form header when scrolling
        if (scrollY > 20) {
            formHeader.style.transform = 'translateY(-2px)';
            formHeader.style.boxShadow = '0 4px 20px rgba(0, 102, 204, 0.3)';
            formHeader.style.backdropFilter = 'blur(15px)';
        } else {
            formHeader.style.transform = 'translateY(0)';
            formHeader.style.boxShadow = '0 2px 12px rgba(0, 102, 204, 0.2)';
            formHeader.style.backdropFilter = 'blur(10px)';
        }
    });
}

// AWS API Configuration
const AWS_API_CONFIG = {
    endpoint: 'https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod/submit',
    timeout: 30000 // 30 seconds timeout
};

// Function to submit data to AWS
async function submitToAWS(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AWS_API_CONFIG.timeout);
    
    try {
        console.log('Submitting to AWS:', formData);
        
        const response = await fetch(AWS_API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Unknown server error');
        }
        
        console.log('AWS submission successful:', result);
        return result;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        
        console.error('AWS submission failed:', error);
        throw error;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    const sharePointIntegration = new SharePointIntegration();
    
    // Initialize sticky headers
    initializeStickyHeaders();
});

async function handleFormSubmission(formData) {
    const email = formData.get('email');
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Collect all responses
    const responses = {};
    let priorityCount = { high: 0, medium: 0, low: 0 };
    
    for (let [key, value] of formData.entries()) {
        responses[key] = value;
        if (key !== 'email') {
            priorityCount[value]++;
        }
    }
    
    // Prepare data for SharePoint
    const submissionData = {
        email: email,
        responses: responses,
        prioritySummary: priorityCount,
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitBtn = document.getElementById('floating-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Submitting...</span>';
    
    try {
        // Submit to SharePoint
        const result = await sharePointIntegration.submitToSharePoint(submissionData);
        
        if (result.success) {
            showSuccessMessage(email, priorityCount);
        } else {
            showErrorMessage(result.error);
        }
    } catch (error) {
        console.error('Submission error:', error);
        showErrorMessage('Failed to submit form. Please try again.');
    } finally {
        // Restore submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Submit</span>';
    }
}

function showSuccessMessage(email, priorityCount) {
    const resultMessage = document.getElementById('result-message');
    resultMessage.innerHTML = `
        <div class="success-message">
            <h3>✅ Successfully submitted to SharePoint!</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Summary:</strong></p>
            <ul>
                <li>High Priority (Sprint 23): ${priorityCount.high} items</li>
                <li>Medium Priority (Sprint 24): ${priorityCount.medium} items</li>
                <li>Low Priority (Future Sprints): ${priorityCount.low} items</li>
            </ul>
        </div>
    `;
    resultMessage.classList.add('show');
}

function showErrorMessage(error) {
    const resultMessage = document.getElementById('result-message');
    resultMessage.innerHTML = `
        <div class="error-message">
            <h3>❌ Submission Error</h3>
            <p>Failed to save to SharePoint: ${error}</p>
            <p>Please try again or contact support.</p>
        </div>
    `;
    resultMessage.classList.add('show');
}

function showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, capacityLimit, sharePointSuccess = true, error = null) {
    const resultMessage = document.getElementById('result-message');
    
    let hoursText = '';
    let capacityInfo = '';
    
    if (totalHours > 0) {
        hoursText = `<p><strong>Total estimated hours:</strong> ${totalHours}h`;
        if (itemsWithTBD > 0) {
            hoursText += ` (+ ${itemsWithTBD} items with TBD hours)`;
        }
        hoursText += '</p>';
        
        // Add capacity information
        const capacityPercentage = Math.round((totalHours / capacityLimit) * 100);
        if (capacityPercentage > 80) {
            capacityInfo = `<p class="capacity-info capacity-near">⚡ <strong>Sprint Capacity:</strong> ${capacityPercentage}% used (${capacityLimit - totalHours}h remaining)</p>`;
        } else {
            capacityInfo = `<p class="capacity-info capacity-ok">✅ <strong>Sprint Capacity:</strong> ${capacityPercentage}% used (${capacityLimit - totalHours}h remaining)</p>`;
        }
    }
    
    let itemsList = '<ul>';
    selectedItems.forEach(item => {
        itemsList += `<li><strong>Item ${item.questionNumber}:</strong> ${item.estimatedHours === 'TBD' ? 'TBD hours' : item.estimatedHours + ' hours'}</li>`;
    });
    itemsList += '</ul>';
    
    // SharePoint status message
    let sharePointStatus = '';
    if (sharePointSuccess) {
        sharePointStatus = '<div class="sharepoint-success">📊 <strong>Successfully saved to SharePoint Excel!</strong></div>';
    } else if (error) {
        sharePointStatus = `<div class="sharepoint-error">⚠️ <strong>Saved locally but failed to save to SharePoint:</strong> ${error}</div>`;
    }
    
    resultMessage.innerHTML = `
        <div class="success-header">
            <strong>✅ Thank you, ${email}! Your responses have been submitted successfully.</strong>
        </div>
        ${sharePointStatus}
        <div class="summary-section">
            <h3>Selected Items Summary:</h3>
            <p><strong>Total items selected:</strong> ${selectedItems.length}</p>
            ${hoursText}
            ${capacityInfo}
            <h4>Selected Items:</h4>
            ${itemsList}
            <p class="timestamp"><small>Submitted on: ${new Date().toLocaleString()}</small></p>
        </div>
    `;
    resultMessage.classList.add('show');
    resultMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}