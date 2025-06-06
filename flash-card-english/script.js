// Global variables
let wordData = {};
let selectedWords = [];
let currentWordIndex = 0;
let currentEpoch = 0;
let epochs = [];
let incorrectWords = [];
let attemptsLeft = 3;
let mode = 'manual'; // Default mode

// DOM Elements
const modeToggle = document.getElementById('mode-toggle');
const manualModeSection = document.getElementById('manual-mode');
const autoModeSection = document.getElementById('auto-mode');
const wordListContainer = document.getElementById('word-list');
const startButton = document.getElementById('start-button');
const flashcardContainer = document.getElementById('flashcard-container');
const wordDisplay = document.getElementById('word-display');
const pronunciationDisplay = document.getElementById('pronunciation');
const definitionDisplay = document.getElementById('definition');
const translationInput = document.getElementById('translation-input');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const feedbackElement = document.getElementById('feedback');
const attemptsElement = document.getElementById('attempts');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const loadingElement = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const resultsList = document.getElementById('results-list');
const epochNavigation = document.getElementById('epoch-navigation');
const currentEpochDisplay = document.getElementById('current-epoch');
const totalEpochsDisplay = document.getElementById('total-epochs');
const prevEpochButton = document.getElementById('prev-epoch');
const nextEpochButton = document.getElementById('next-epoch');

// Initialize the application
async function init() {
    try {
        // Load word data
        const response = await fetch('data.json');
        wordData = await response.json();
        
        // Set up event listeners
        setupEventListeners();
        
        // Populate word list for manual mode
        populateWordList();
        
        // Create epochs for automatic mode
        createEpochs();
        
        // Update epoch navigation
        updateEpochNavigation();
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading word data. Please try again.');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Mode toggle
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    // Start button
    startButton.addEventListener('click', startSession);
    
    // Check button
    checkButton.addEventListener('click', checkAnswer);
    
    // Next button
    nextButton.addEventListener('click', nextWord);
    
    // Translation input - check on Enter key
    translationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Epoch navigation
    prevEpochButton.addEventListener('click', () => navigateEpoch(-1));
    nextEpochButton.addEventListener('click', () => navigateEpoch(1));
}

// Handle mode change
function handleModeChange(e) {
    mode = e.target.value;
    
    if (mode === 'manual') {
        manualModeSection.classList.add('active');
        autoModeSection.classList.remove('active');
        epochNavigation.classList.remove('active');
    } else {
        manualModeSection.classList.remove('active');
        autoModeSection.classList.add('active');
        epochNavigation.classList.add('active');
        updateEpochNavigation();
    }
}

// Populate word list for manual selection
function populateWordList() {
    wordListContainer.innerHTML = '';
    
    Object.keys(wordData).forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.classList.add('word-item');
        wordItem.textContent = word;
        wordItem.dataset.word = word;
        
        wordItem.addEventListener('click', () => toggleWordSelection(wordItem));
        
        wordListContainer.appendChild(wordItem);
    });
}

// Toggle word selection
function toggleWordSelection(wordItem) {
    const word = wordItem.dataset.word;
    
    if (wordItem.classList.contains('selected')) {
        // Deselect word
        wordItem.classList.remove('selected');
        selectedWords = selectedWords.filter(w => w !== word);
    } else {
        // Check if already selected 7 words
        if (selectedWords.length >= 7) {
            showNotification('You can only select up to 7 words.');
            return;
        }
        
        // Select word
        wordItem.classList.add('selected');
        selectedWords.push(word);
    }
    
    // Enable/disable start button based on selection
    startButton.disabled = selectedWords.length === 0;
}

// Create epochs for automatic mode
function createEpochs() {
    const allWords = Object.keys(wordData);
    epochs = [];
    
    // Shuffle words
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    
    // Create epochs with 7 words each
    for (let i = 0; i < shuffledWords.length; i += 7) {
        const epochWords = shuffledWords.slice(i, i + 7);
        if (epochWords.length > 0) {
            epochs.push(epochWords);
        }
    }
    
    // If the last epoch has fewer than 7 words, add random words from the beginning
    // to make it 7 (ensuring no duplicates within the epoch)
    const lastEpoch = epochs[epochs.length - 1];
    if (lastEpoch && lastEpoch.length < 7) {
        const wordsNeeded = 7 - lastEpoch.length;
        const additionalWords = shuffledWords.filter(word => !lastEpoch.includes(word)).slice(0, wordsNeeded);
        epochs[epochs.length - 1] = [...lastEpoch, ...additionalWords];
    }
}

// Update epoch navigation display
function updateEpochNavigation() {
    if (epochs.length === 0) return;
    
    currentEpochDisplay.textContent = currentEpoch + 1;
    totalEpochsDisplay.textContent = epochs.length;
    
    // Enable/disable navigation buttons
    prevEpochButton.disabled = currentEpoch === 0;
    nextEpochButton.disabled = currentEpoch === epochs.length - 1;
}

// Navigate between epochs
function navigateEpoch(direction) {
    currentEpoch = Math.max(0, Math.min(epochs.length - 1, currentEpoch + direction));
    updateEpochNavigation();
}

// Start flashcard session
function startSession() {
    // Reset session variables
    currentWordIndex = 0;
    incorrectWords = [];
    
    // Get words based on mode
    if (mode === 'manual') {
        if (selectedWords.length === 0) {
            showNotification('Please select at least one word.');
            return;
        }
    } else {
        // Automatic mode - use current epoch
        if (epochs.length === 0 || !epochs[currentEpoch]) {
            showNotification('No words available for this epoch.');
            return;
        }
        selectedWords = [...epochs[currentEpoch]];
    }
    
    // Hide word selection, show flashcard
    document.getElementById('word-selection').classList.remove('active');
    flashcardContainer.classList.add('active');
    resultsContainer.classList.remove('active');
    
    // Show first word
    showCurrentWord();
}

// Show current word
async function showCurrentWord() {
    // Reset UI state
    translationInput.value = '';
    feedbackElement.className = 'feedback';
    feedbackElement.textContent = '';
    attemptsLeft = 3;
    updateAttemptsDisplay();
    
    // Enable check button, disable next button
    checkButton.disabled = false;
    nextButton.disabled = true;
    
    // Get current word
    const currentWord = selectedWords[currentWordIndex];
    
    // Update word display
    wordDisplay.textContent = currentWord;
    
    // Show loading indicator
    loadingElement.classList.add('active');
    
    try {
        // Fetch pronunciation and definition from Oxford Dictionary
        const wordInfo = await fetchWordInfo(currentWord);
        
        // Update pronunciation and definition
        pronunciationDisplay.textContent = wordInfo.pronunciation || 'Pronunciation not available';
        definitionDisplay.textContent = wordInfo.definition || 'Definition not available';
    } catch (error) {
        console.error('Error fetching word info:', error);
        pronunciationDisplay.textContent = 'Pronunciation not available';
        definitionDisplay.textContent = 'Definition not available';
    } finally {
        // Hide loading indicator
        loadingElement.classList.remove('active');
    }
    
    // Update progress
    updateProgress();
    
    // Focus on input
    translationInput.focus();
}

// Fetch word information from Oxford Dictionary
async function fetchWordInfo(word) {
    try {
        // Use the dictionary service to fetch word information
        return await window.DictionaryService.fetchWordInfo(word);
    } catch (error) {
        console.error('Error fetching word info:', error);
        
        // Fallback to mock data if the service fails
        return window.DictionaryService.getMockWordInfo(word);
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    attemptsElement.textContent = `Attempts left: ${attemptsLeft}`;
}

// Update progress display
function updateProgress() {
    const progress = ((currentWordIndex + 1) / selectedWords.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${currentWordIndex + 1} of ${selectedWords.length}`;
}

// Check user's answer
function checkAnswer() {
    const userInput = translationInput.value.trim().toLowerCase();
    const currentWord = selectedWords[currentWordIndex];
    const correctAnswer = wordData[currentWord].toLowerCase();
    
    if (userInput === correctAnswer) {
        // Correct answer
        feedbackElement.className = 'feedback correct';
        feedbackElement.textContent = 'Correct! 🎉';
        
        // Disable check button, enable next button
        checkButton.disabled = true;
        nextButton.disabled = false;
        
        // Focus on next button
        nextButton.focus();
    } else {
        // Incorrect answer
        attemptsLeft--;
        updateAttemptsDisplay();
        
        if (attemptsLeft > 0) {
            // Still has attempts left
            feedbackElement.className = 'feedback incorrect';
            feedbackElement.textContent = 'Incorrect. Try again.';
            
            // Clear input and focus
            translationInput.value = '';
            translationInput.focus();
        } else {
            // No attempts left
            feedbackElement.className = 'feedback incorrect';
            feedbackElement.textContent = `Incorrect. The correct answer is: ${wordData[currentWord]}`;
            
            // Add to incorrect words for review
            if (!incorrectWords.includes(currentWord)) {
                incorrectWords.push(currentWord);
            }
            
            // Disable check button, enable next button
            checkButton.disabled = true;
            nextButton.disabled = false;
            
            // Focus on next button
            nextButton.focus();
        }
    }
}

// Move to next word
function nextWord() {
    currentWordIndex++;
    
    if (currentWordIndex < selectedWords.length) {
        // Show next word
        showCurrentWord();
    } else if (incorrectWords.length > 0) {
        // Review incorrect words
        selectedWords = [...incorrectWords];
        incorrectWords = [];
        currentWordIndex = 0;
        
        showNotification('Now reviewing words you missed...');
        showCurrentWord();
    } else {
        // End of session
        endSession();
    }
}

// End flashcard session
function endSession() {
    // Hide flashcard, show results
    flashcardContainer.classList.remove('active');
    resultsContainer.classList.add('active');
    
    // Show word selection again
    document.getElementById('word-selection').classList.add('active');
    
    // Reset selected words in manual mode
    if (mode === 'manual') {
        selectedWords = [];
        document.querySelectorAll('.word-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        startButton.disabled = true;
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after transition
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
