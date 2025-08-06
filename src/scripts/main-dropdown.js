document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading questions...');
    loadQuestions();
});

async function loadQuestions() {
    try {
        const response = await fetch('src/data/questions.json');
        
        if (!response.ok) {
            console.log('JSON not found, loading static questions');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Questions loaded:', data);
        
        // Update form header
        document.getElementById('form-title').textContent = data.formTitle;
        
        // Add progress bar and counter
        addProgressIndicator(data.questions.length - 1); // -1 to exclude email
        
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
        // Keep original checkbox functionality for hours
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
                    <input type="checkbox" name="${question.id}_selected" value="${question.estimatedHours || 'TBD'}" 
                           ${question.required ? 'required' : ''}>
                    <span class="checkbox-label">${hoursText}</span>
                </label>
            </div>
            
            <!-- Add priority dropdown when item is selected -->
            <div class="priority-section" id="priority-${question.id}" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                <label class="priority-label">Select Priority for this item:</label>
                <div class="dropdown-group">
                    <select class="dropdown-select priority-dropdown" name="${question.id}_priority" disabled>
                        <option value="" disabled selected>Select Priority</option>
                        <option value="high">🔴 High Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="low">🟢 Low Priority</option>
                    </select>
                </div>
            </div>
        `;
    } else {
        // For questions without hours (pure priority questions)
        cardHTML += `
            <div class="dropdown-group">
                <select class="dropdown-select" name="${question.id}" ${question.required ? 'required' : ''}>
                    <option value="" disabled selected>Select Priority</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🟢 Low Priority</option>
                </select>
            </div>
        `;
    }
    
    cardHTML += '</div>';
    card.innerHTML = cardHTML;
    return card;
}

function loadStaticQuestions() {
    console.log('Loading static questions...');
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
                <label class="question-title">The feedback pointers such as strengths, opportunities, and best practices/resources should be included in the exported observation form report. *</label>
                
                <!-- Checkbox for hours -->
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question1_selected" value="8">
                        <span class="checkbox-label">8 hours</span>
                    </label>
                </div>
                
                <!-- Priority dropdown (hidden until checkbox selected) -->
                <div class="priority-section" id="priority-question1" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question1_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">3</div>
            <div class="question-content">
                <label class="question-title">The feature request involves adding a visual button, either in red or green, to help learning specialists easily identify which audits or observations are pending acknowledgment. *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question2_selected" value="12">
                        <span class="checkbox-label">12 hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question2" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question2_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">4</div>
            <div class="question-content">
                <label class="question-title">The system should automatically generate communication emails based on inputs provided. *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question3_selected" value="TBD">
                        <span class="checkbox-label">TBD hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question3" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question3_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">5</div>
            <div class="question-content">
                <label class="question-title">To address this requirement, we need to add functionality that allows users to type "NA" in the OJT KPI fields. *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question4_selected" value="16">
                        <span class="checkbox-label">16 hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question4" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question4_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">6</div>
            <div class="question-content">
                <label class="question-title">When a user creates a class but removes a learner, the class gets canceled. We propose introducing a new class status labeled "Cancelled". *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question5_selected" value="6">
                        <span class="checkbox-label">6 hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question5" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question5_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">7</div>
            <div class="question-content">
                <label class="question-title">After updating the logic for STAR, we are experiencing issues where the entire history is not visible. We would like to view the full history. *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question6_selected" value="24">
                        <span class="checkbox-label">24 hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question6" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question6_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">8</div>
            <div class="question-content">
                <label class="question-title">Admin should have the capability to edit the Employee ID (ECN) of learners individually and through a bulk uploader option. *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question7_selected" value="40">
                        <span class="checkbox-label">40 hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question7" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question7_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="question-card">
            <div class="question-number">9</div>
            <div class="question-content">
                <label class="question-title">OJT - Revamp *</label>
                
                <div class="checkbox-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="question8_selected" value="TBD">
                        <span class="checkbox-label">TBD hours</span>
                    </label>
                </div>
                
                <div class="priority-section" id="priority-question8" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e8eaed;">
                    <label class="priority-label">Select Priority for this item:</label>
                    <div class="dropdown-group">
                        <select class="dropdown-select priority-dropdown" name="question8_priority" disabled>
                            <option value="" disabled selected>Select Priority</option>
                            <option value="high">🔴 High Priority</option>
                            <option value="medium">🟡 Medium Priority</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    addProgressIndicator(8); // 8 questions (excluding email)
    initializeForm(9); // 9 total including email
}

function initializeForm(totalQuestions) {
    console.log('Initializing form with', totalQuestions, 'questions');
    const form = document.getElementById('survey-form');
    const floatingBtn = document.getElementById('floating-submit');
    
    // Add change listeners for both checkboxes and dropdowns
    form.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            handleCheckboxChange(e.target);
        } else if (e.target.classList.contains('dropdown-select')) {
            handleDropdownChange(e.target);
        }
        updateProgress();
        updateFloatingButton();
    });
    
    form.addEventListener('input', function(e) {
        updateProgress();
        updateFloatingButton();
    });
    
    // Initialize floating button
    initializeFloatingButton(floatingBtn);
    
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
            
            const hours = checkbox.value;
            const priority = priorityDropdown.value;
            const questionCard = checkbox.closest('.question-card');
            const questionTitle = questionCard.querySelector('.question-title').textContent.trim();
            
            selectedItems.push({
                questionId: questionId,
                questionTitle: questionTitle,
                hours: hours,
                priority: priority,
                isEstimated: hours !== 'TBD'
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

function handleCheckboxChange(checkbox) {
    const questionId = checkbox.name.replace('_selected', '');
    const prioritySection = document.getElementById(`priority-${questionId}`);
    const priorityDropdown = document.querySelector(`select[name="${questionId}_priority"]`);
    
    if (checkbox.checked) {
        // Show priority section and enable dropdown
        prioritySection.style.display = 'block';
        priorityDropdown.disabled = false;
        priorityDropdown.required = true;
    } else {
        // Hide priority section and disable dropdown
        prioritySection.style.display = 'none';
        priorityDropdown.disabled = true;
        priorityDropdown.required = false;
        priorityDropdown.value = '';
        handleDropdownChange(priorityDropdown); // Reset styling
    }
}

function handleDropdownChange(dropdown) {
    const value = dropdown.value;
    
    // Remove all priority classes
    dropdown.classList.remove('priority-high', 'priority-medium', 'priority-low');
    
    // Add appropriate class and animation
    if (value) {
        dropdown.classList.add(`priority-${value}`, 'selecting');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            dropdown.classList.remove('selecting');
        }, 300);
    }
}

function initializeFloatingButton(floatingBtn) {
    if (!floatingBtn) return;
    
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
    });
    
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
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    
    let totalHours = 0;
    let itemsWithTBD = 0;
    let allHavePriority = true;
    const CAPACITY_LIMIT = 260;
    
    // Check if all selected items have priorities
    checkboxes.forEach(checkbox => {
        const questionId = checkbox.name.replace('_selected', '');
        const priorityDropdown = document.querySelector(`select[name="${questionId}_priority"]`);
        
        if (!priorityDropdown || !priorityDropdown.value) {
            allHavePriority = false;
        }
        
        const hours = checkbox.value;
        if (hours !== 'TBD' && !isNaN(hours)) {
            totalHours += parseInt(hours);
        } else {
            itemsWithTBD++;
        }
    });
    
    const hasEmail = emailInput && emailInput.value.trim() !== '';
    const hasSelections = checkboxes.length > 0;
    const isComplete = hasEmail && hasSelections && allHavePriority;
    const isOverCapacity = totalHours > CAPACITY_LIMIT;
    
    // Remove all state classes first
    floatingBtn.classList.remove('pulse', 'celebrate', 'over-capacity', 'high-hours');
    
    // Update button text and icon with enhanced logic
    const btnText = floatingBtn.querySelector('.btn-text');
    const btnIcon = floatingBtn.querySelector('.btn-icon');
    
    if (isOverCapacity) {
        // Over capacity - add warning state
        floatingBtn.classList.add('over-capacity');
        const excess = totalHours - CAPACITY_LIMIT;
        btnText.textContent = `Over by ${excess}h!`;
        btnIcon.textContent = '⚠️';
        floatingBtn.style.opacity = '1';
        floatingBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #8e44ad 100%)';
    } else if (isComplete) {
        // Form is ready - add celebration effect
        floatingBtn.classList.add('celebrate');
        
        // Create dynamic text with hours and priorities
        let hoursInfo = '';
        if (totalHours > 0) {
            hoursInfo = `${totalHours}h`;
            if (itemsWithTBD > 0) {
                hoursInfo += ` +${itemsWithTBD}`;
            }
        } else if (itemsWithTBD > 0) {
            hoursInfo = `${itemsWithTBD} TBD`;
        }
        
        if (checkboxes.length === 1) {
            btnText.textContent = hoursInfo ? `Submit ${hoursInfo}` : 'Submit 1 item';
            btnIcon.textContent = '🎯';
        } else {
            btnText.textContent = `Submit ${hoursInfo}`;
            if (checkboxes.length <= 3) {
                btnIcon.textContent = '🚀';
            } else if (checkboxes.length <= 6) {
                btnIcon.textContent = '⭐';
            } else {
                btnIcon.textContent = '🎉';
            }
        }
        
        floatingBtn.style.opacity = '1';
        
        // Set background based on total hours
        if (totalHours === 0 && itemsWithTBD > 0) {
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
            // Default celebration - original colors
            floatingBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        }
    } else if (hasSelections && hasEmail) {
        // Has selections but no priorities - add pulse
        floatingBtn.classList.add('pulse');
        btnText.textContent = `Submit (${checkboxes.length} items)`;
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.9';
        floatingBtn.style.background = '';
    } else if (hasSelections) {
        // Has selections but no email - add pulse
        floatingBtn.classList.add('pulse');
        btnText.textContent = `Submit (${checkboxes.length} items)`;
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.9';
        floatingBtn.style.background = '';
    } else {
        // Not ready - dim the button
        btnText.textContent = 'Submit';
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.6';
        floatingBtn.style.background = '';
    }
    
    // Add special animation for high hours
    if (totalHours > 150 && !isOverCapacity) {
        floatingBtn.classList.add('high-hours');
    }
}

function updateProgress() {
    const form = document.getElementById('survey-form');
    const emailInput = form.querySelector('input[type="email"]');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    
    let answeredCount = 0;
    let totalHours = 0;
    let itemsWithTBD = 0;
    const CAPACITY_LIMIT = 260;
    
    // Check email
    if (emailInput && emailInput.value.trim() !== '') {
        answeredCount++;
    }
    
    // Count checked checkboxes and calculate hours
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
    
    // Calculate capacity progress
    const capacityProgress = Math.min((totalHours / CAPACITY_LIMIT) * 100, 100);
    const progressFill = document.querySelector('.progress-fill');
    const counter = document.querySelector('.question-counter');
    
    // Update progress bar
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
            progressFill.style.background = 'linear-gradient(90deg, var(--foundever-primary, #1a73e8) 0%, var(--foundever-secondary, #4285f4) 100%)';
        }
    }
    
    if (counter) {
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
        
        counter.innerHTML = counterText;
        
        // Add capacity indicator if needed
        if (totalHours > 0) {
            updateCapacityIndicator(totalHours, CAPACITY_LIMIT);
        }
    }
}

function updateCapacityIndicator(currentHours, maxHours) {
    const counter = document.querySelector('.question-counter');
    if (!counter || currentHours === 0) return;
    
    // Get the original text without capacity indicators
    let originalText = counter.innerHTML;
    
    // Remove any existing capacity indicators
    originalText = originalText.replace(/\s*<span class="capacity-[^"]*">.*?<\/span>/, '');
    
    const capacityPercentage = Math.round((currentHours / maxHours) * 100);
    
    if (currentHours > maxHours) {
        const excess = currentHours - maxHours;
        counter.innerHTML = `${originalText} <span class="capacity-warning" style="color: #e74c3c; font-weight: 600;">⚠️ OVER by ${excess}h!</span>`;
    } else if (currentHours > maxHours * 0.9) {
        counter.innerHTML = `${originalText} <span class="capacity-warning" style="color: #f39c12; font-weight: 600;">⚠️ Almost full!</span>`;
    } else if (currentHours > maxHours * 0.8) {
        counter.innerHTML = `${originalText} <span class="capacity-near" style="color: #f1c40f; font-weight: 600;">⚡ Getting full</span>`;
    } else if (currentHours > maxHours * 0.5) {
        counter.innerHTML = `${originalText} <span class="capacity-ok" style="color: #27ae60; font-weight: 600;">✅ Good capacity</span>`;
    }
}

function showError(message) {
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 16px;
        border-radius: 8px;
        margin: 16px 0;
        font-size: 14px;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    
    const form = document.getElementById('survey-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage(email, selectedItems, totalHours, itemsWithTBD, priorityCount, totalPoints, savedToDatabase = true, error = null) {
    const resultMessage = document.getElementById('result-message');
    
    // Create detailed items list with priorities
    let itemsList = '<div class="items-grid" style="display: grid; gap: 8px; margin: 12px 0;">';
    selectedItems.forEach((item, index) => {
        const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        const priorityLabel = item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low';
        itemsList += `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid ${item.priority === 'high' ? '#dc2626' : item.priority === 'medium' ? '#f59e0b' : '#059669'};">
                <strong>${priorityEmoji} ${priorityLabel} Priority</strong><br>
                <small style="color: #6b7280;">${item.hours} hours • Question ${index + 1}</small>
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

function updateFloatingButton() {
    const floatingBtn = document.getElementById('floating-submit');
    const form = document.getElementById('survey-form');
    
    if (!floatingBtn || !form) return;
    
    const emailInput = form.querySelector('input[type="email"]');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    
    let totalHours = 0;
    let itemsWithTBD = 0;
    let allHavePriority = true;
    const CAPACITY_LIMIT = 260;
    
    // Check if all selected items have priorities
    checkboxes.forEach(checkbox => {
        const questionId = checkbox.name.replace('_selected', '');
        const priorityDropdown = document.querySelector(`select[name="${questionId}_priority"]`);
        
        if (!priorityDropdown || !priorityDropdown.value) {
            allHavePriority = false;
        }
        
        const hours = checkbox.value;
        if (hours !== 'TBD' && !isNaN(hours)) {
            totalHours += parseInt(hours);
        } else {
            itemsWithTBD++;
        }
    });
    
    const hasEmail = emailInput && emailInput.value.trim() !== '';
    const hasSelections = checkboxes.length > 0;
    const isComplete = hasEmail && hasSelections && allHavePriority;
    const isOverCapacity = totalHours > CAPACITY_LIMIT;
    
    // Remove all state classes first
    floatingBtn.classList.remove('pulse', 'celebrate', 'over-capacity', 'high-hours');
    
    // Update button text and icon with enhanced logic
    const btnText = floatingBtn.querySelector('.btn-text');
    const btnIcon = floatingBtn.querySelector('.btn-icon');
    
    if (isOverCapacity) {
        // Over capacity - add warning state
        floatingBtn.classList.add('over-capacity');
        const excess = totalHours - CAPACITY_LIMIT;
        btnText.textContent = `Over by ${excess}h!`;
        btnIcon.textContent = '⚠️';
        floatingBtn.style.opacity = '1';
        floatingBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #8e44ad 100%)';
    } else if (isComplete) {
        // Form is ready - add celebration effect
        floatingBtn.classList.add('celebrate');
        
        // Create dynamic text with hours and priorities
        let hoursInfo = '';
        if (totalHours > 0) {
            hoursInfo = `${totalHours}h`;
            if (itemsWithTBD > 0) {
                hoursInfo += ` +${itemsWithTBD}`;
            }
        } else if (itemsWithTBD > 0) {
            hoursInfo = `${itemsWithTBD} TBD`;
        }
        
        if (checkboxes.length === 1) {
            btnText.textContent = hoursInfo ? `Submit ${hoursInfo}` : 'Submit 1 item';
            btnIcon.textContent = '🎯';
        } else {
            btnText.textContent = `Submit ${hoursInfo}`;
            if (checkboxes.length <= 3) {
                btnIcon.textContent = '🚀';
            } else if (checkboxes.length <= 6) {
                btnIcon.textContent = '⭐';
            } else {
                btnIcon.textContent = '🎉';
            }
        }
        
        floatingBtn.style.opacity = '1';
        
        // Set background based on total hours
        if (totalHours === 0 && itemsWithTBD > 0) {
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
            // Default celebration - original colors
            floatingBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
        }
    } else if (hasSelections && hasEmail) {
        // Has selections but no priorities - add pulse
        floatingBtn.classList.add('pulse');
        btnText.textContent = `Submit (${checkboxes.length} items)`;
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.9';
        floatingBtn.style.background = '';
    } else if (hasSelections) {
        // Has selections but no email - add pulse
        floatingBtn.classList.add('pulse');
        btnText.textContent = `Submit (${checkboxes.length} items)`;
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.9';
        floatingBtn.style.background = '';
    } else {
        // Not ready - dim the button
        btnText.textContent = 'Submit';
        btnIcon.textContent = '📝';
        floatingBtn.style.opacity = '0.6';
        floatingBtn.style.background = '';
    }
    
    // Add special animation for high hours
    if (totalHours > 150 && !isOverCapacity) {
        floatingBtn.classList.add('high-hours');
    }
}
