// This file contains the JavaScript code for the survey form logic.

let questionsLoaded = false; // Flag to prevent multiple loads
let questionsData = null; // Store questions data globally for access during submit

async function loadQuestions() {
    if (questionsLoaded) return; // Prevent multiple loads
    
    try {
        const response = await fetch('src/data/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store questions data globally for access during submit
        questionsData = data;
        
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
        
        if (question.hasImage) {
            cardHTML += `
                <div class="screenshot-container">
                    <img src="${question.imageSrc}" alt="${question.imageAlt}" class="screenshot">
                </div>
            `;
        }
        
        cardHTML += `
            ${devFeedbackHTML}
            
            <!-- Priority selection first -->
            <div class="priority-section" id="priority-${question.id}">
                <label class="priority-label">Select Priority for this item:</label>
                <div class="dropdown-group">
                    <select class="dropdown-select priority-dropdown" name="${question.id}_priority">
                        <option value="" disabled selected>Select Priority</option>
                        <option value="high">🔴 High Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="low">🟢 Low Priority</option>
                    </select>
                </div>
            </div>
            
            <!-- Checkbox gets checked automatically when priority is selected -->
            <div class="checkbox-group" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed; display: none;" id="checkbox-${question.id}">
                <label class="checkbox-option">
                    <input type="checkbox" name="${question.id}_selected" value="${question.estimatedHours || 'TBD'}" 
                           ${question.required ? 'required' : ''} disabled>
                    <span class="checkbox-label">✓ Selected - ${hoursText}</span>
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
    // Fallback static content with basic question data
    questionsData = {
        questions: [
            {
                id: "email",
                type: "email",
                title: "Email address"
            },
            {
                id: "question1",
                type: "checkbox", 
                title: "Sample question for testing purposes"
            }
        ]
    };
    
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

function initializeForm(totalQuestions) {
    const form = document.getElementById('survey-form');
    const resultMessage = document.getElementById('result-message');
    const floatingBtn = document.getElementById('floating-submit');
    
    // Initialize floating button
    initializeFloatingButton(floatingBtn);
    
    // Add change listeners for dropdowns and progress tracking
    form.addEventListener('change', function(e) {
        if (e.target.classList.contains('dropdown-select')) {
            handleDropdownChange(e.target);
        }
        updateProgress();
        updateFloatingButton();
    });
    
    form.addEventListener('input', function(e) {
        updateProgress();
        updateFloatingButton();
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const email = formData.get('email');
        
        // Validate email
        if (!email || !email.includes('@')) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Collect selected items and their priorities
        const selectedItems = [];
        let totalHours = 0;
        let itemsWithTBD = 0;
        const priorityCount = { high: 0, medium: 0, low: 0 };
        const responses = { email: email };
        
        // Check all checkboxes and their corresponding priorities
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            showError('Please select at least one item.');
            return;
        }
        
        for (const checkbox of checkboxes) {
            const questionId = checkbox.name.replace('_selected', '');
            const priorityDropdown = document.querySelector(`select[name="${questionId}_priority"]`);
            
            if (!priorityDropdown || !priorityDropdown.value) {
                showError('Please select a priority for all selected items.');
                return;
            }
            
            const hours = checkbox.value || 'TBD';
            const priority = priorityDropdown.value;
            
            // Find the question data to get the title
            const questionData = questionsData?.questions.find(q => q.id === questionId);
            const baseQuestionTitle = questionData?.title || 'Question not found';
            
            // Concatenate priority with question title
            const priorityLabel = priority === 'high' ? 'HIGH PRIORITY' : priority === 'medium' ? 'MEDIUM PRIORITY' : 'LOW PRIORITY';
            const questionTitle = `${baseQuestionTitle} - ${priorityLabel}`;
            
            // Include question title with priority, and hours
            selectedItems.push({
                questionId: questionId,
                questionTitle: questionTitle,
                priority: priority,
                hours: hours
            });
            
            // Add to responses object
            responses[`${questionId}_selected`] = hours;
            responses[`${questionId}_priority`] = priority;
            
            // Count hours
            if (hours !== 'TBD' && !isNaN(hours)) {
                totalHours += parseInt(hours);
            } else {
                itemsWithTBD++;
            }
            
            // Count priorities
            priorityCount[priority]++;
        }
        
        // Calculate total points (high=30, medium=20, low=10)
        const totalPoints = (priorityCount.high * 30) + (priorityCount.medium * 20) + (priorityCount.low * 10);
        
        // Calculate capacity used
        const CAPACITY_LIMIT = 260;
        const capacityUsed = Math.round((totalHours / CAPACITY_LIMIT) * 100);
        
        // Prepare enhanced submission data with priority information
        const submissionData = {
            email: email,
            selectedItems: selectedItems,
            totalHours: totalHours,
            itemsWithTBD: itemsWithTBD,
            capacityUsed: capacityUsed,
            priorityCount: priorityCount,
            totalPoints: totalPoints,
            responses: responses,
            timestamp: new Date().toISOString(),
            
            // Enhanced priority data for AWS
            highPriorityCount: priorityCount.high,
            mediumPriorityCount: priorityCount.medium,
            lowPriorityCount: priorityCount.low,
            priorityBreakdown: priorityCount,
            
            // Additional metadata
            sprintNumber: 23,
            formVersion: "v2.0-with-priority"
        };
        
        console.log('Form submitted with enhanced priority data:', submissionData);
        
        // Show loading state
        updateSubmitButtonLoading(true);
        
        try {
            // Submit to AWS with priority data
            const result = await window.AWSIntegration.submitToAWS(submissionData);
            
            if (result && result.success !== false) {
                showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, priorityCount, totalPoints, true);
            } else {
                // Show success but with warning about storage
                showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, priorityCount, totalPoints, false, result?.error);
            }
        } catch (error) {
            console.error('AWS submission error:', error);
            showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, priorityCount, totalPoints, false, error.message);
        } finally {
            updateSubmitButtonLoading(false);
        }
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
    
    // Calculate total hours and check priorities
    let totalHours = 0;
    let itemsWithTBD = 0;
    let allHavePriority = true;
    
    checkedBoxes.forEach(checkbox => {
        const questionId = checkbox.name.replace('_selected', '');
        const priorityDropdown = document.querySelector(`select[name="${questionId}_priority"]`);
        
        if (!priorityDropdown || !priorityDropdown.value) {
            allHavePriority = false;
        }
        
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
    const isComplete = hasEmail && hasSelections && allHavePriority;
    
    // Remove all state classes first
    floatingBtn.classList.remove('pulse', 'celebrate', 'over-capacity');
    
    if (isOverCapacity) {
        // Over capacity - add warning state
        floatingBtn.classList.add('over-capacity');
        floatingBtn.style.opacity = '1';
    } else if (isComplete) {
        // Form is ready - add celebration effect
        floatingBtn.classList.add('celebrate');
        floatingBtn.style.opacity = '1';
    } else if (hasSelections && hasEmail) {
        // Has selections but no priorities - add pulse
        floatingBtn.classList.add('pulse');
        floatingBtn.style.opacity = '0.9';
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
        } else if (isComplete) {
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
        } else {
            // Has items but missing priorities or email
            btnText.textContent = `Submit (${checkedBoxes.length} items)`;
            btnIcon.textContent = '📝';
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

function handleDropdownChange(dropdown) {
    const value = dropdown.value;
    const questionId = dropdown.name.replace('_priority', '');
    const checkboxSection = document.getElementById(`checkbox-${questionId}`);
    const checkbox = document.querySelector(`input[name="${questionId}_selected"]`);
    
    // Remove all priority classes
    dropdown.classList.remove('priority-high', 'priority-medium', 'priority-low');
    
    // Add appropriate class and animation
    if (value) {
        dropdown.classList.add(`priority-${value}`, 'selecting');
        
        // Show checkbox section and automatically check it
        checkboxSection.style.display = 'block';
        checkbox.checked = true;
        checkbox.disabled = false;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            dropdown.classList.remove('selecting');
        }, 300);
    } else {
        // If no priority selected, hide and uncheck checkbox
        checkboxSection.style.display = 'none';
        checkbox.checked = false;
        checkbox.disabled = true;
    }
}

function updateSubmitButtonLoading(isLoading) {
    const floatingBtn = document.getElementById('floating-submit');
    if (!floatingBtn) return;
    
    const btnText = floatingBtn.querySelector('.btn-text');
    const btnIcon = floatingBtn.querySelector('.btn-icon');
    
    if (isLoading) {
        btnText.textContent = 'Submitting...';
        btnIcon.textContent = '⏳';
        floatingBtn.disabled = true;
        floatingBtn.style.opacity = '0.7';
    } else {
        btnText.textContent = 'Submitted ✓';
        btnIcon.textContent = '✅';
        floatingBtn.disabled = true;
        floatingBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    }
}

function showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, priorityCount, totalPoints, savedToDatabase = true, error = null) {
    const resultMessage = document.getElementById('result-message');
    
    // Create detailed items list with priorities
    let itemsList = '<div class="items-grid" style="display: grid; gap: 8px; margin: 12px 0;">';
    selectedItems.forEach((item, index) => {
        // Use question title that already includes priority
        const questionTitle = item.questionTitle || 'Unknown Question';
        const hours = item.hours || 'TBD';
        const priority = item.priority || 'unknown';
        
        const borderColor = priority === 'high' ? '#dc2626' : priority === 'medium' ? '#f59e0b' : priority === 'low' ? '#059669' : '#6b7280';
        
        // Truncate very long titles for display
        const displayTitle = questionTitle.length > 120 ? questionTitle.substring(0, 120) + '...' : questionTitle;
        
        itemsList += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid ${borderColor};">
                <div style="margin-bottom: 4px; color: #374151; font-size: 14px; font-weight: 500;">${displayTitle}</div>
                <small style="color: #6b7280;">${hours} hours</small>
            </div>
        `;
    });
    itemsList += '</div>';
    
    // Database status message
    let dbStatusMessage = '';
    if (savedToDatabase) {
        dbStatusMessage = '<div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px; border-radius: 6px; margin: 12px 0;">💾 <strong>Successfully saved to database</strong></div>';
    } else {
        dbStatusMessage = `<div style="background: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 12px; border-radius: 6px; margin: 12px 0;">⚠️ <strong>Saved locally</strong> - Database connection issue: ${error || 'Unknown error'}</div>`;
    }
    
    resultMessage.innerHTML = `
        <div style="background: #f0fff4; border: 1px solid #bbf7d0; color: #166534; padding: 24px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0;">✅ Thank you, ${email}!</h3>
                <p style="margin: 0; color: #059669;">Your sprint prioritization has been submitted successfully.</p>
            </div>
            
            ${dbStatusMessage}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #bbf7d0;">
                <h4 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                    📋 Selected Items (${selectedItems.length})
                </h4>
                ${itemsList}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db;">
                        <h5 style="margin: 0 0 8px 0; color: #374151;">⏱️ Time Estimation</h5>
                        <p style="margin: 0; font-size: 18px; font-weight: 600;">${totalHours}h${itemsWithTBD > 0 ? ` + ${itemsWithTBD} TBD` : ''}</p>
                    </div>
                    
                    <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db;">
                        <h5 style="margin: 0 0 8px 0; color: #374151;">🎯 Priority Points</h5>
                        <p style="margin: 0; font-size: 18px; font-weight: 600; color: #059669;">${totalPoints}</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db; margin-top: 16px;">
                    <h5 style="margin: 0 0 12px 0; color: #374151;">📊 Priority Breakdown</h5>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🔴</div>
                            <div style="font-weight: 600; color: #dc2626;">${priorityCount.high}</div>
                            <div style="font-size: 12px; color: #6b7280;">High Priority</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🟡</div>
                            <div style="font-weight: 600; color: #f59e0b;">${priorityCount.medium}</div>
                            <div style="font-size: 12px; color: #6b7280;">Medium Priority</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px;">🟢</div>
                            <div style="font-weight: 600; color: #059669;">${priorityCount.low}</div>
                            <div style="font-size: 12px; color: #6b7280;">Low Priority</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultMessage.classList.add('show');
    resultMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeStickyHeaders();
    loadQuestions();
});