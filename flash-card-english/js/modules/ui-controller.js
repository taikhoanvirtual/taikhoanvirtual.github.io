/**
 * UI Controller Module
 * 
 * Handles UI interactions and DOM manipulations
 */

class UIController {
    constructor() {
        // DOM Elements
        this.modeToggle = document.getElementById('mode-toggle');
        this.manualModeSection = document.getElementById('manual-mode');
        this.autoModeSection = document.getElementById('auto-mode');
        this.wordListContainer = document.getElementById('word-list');
        this.startButton = document.getElementById('start-button');
        this.flashcardContainer = document.getElementById('flashcard-container');
        this.wordDisplay = document.getElementById('word-display');
        this.pronunciationDisplay = document.getElementById('pronunciation');
        this.definitionDisplay = document.getElementById('definition');
        this.translationInput = document.getElementById('translation-input');
        this.checkButton = document.getElementById('check-button');
        this.nextButton = document.getElementById('next-button');
        this.feedbackElement = document.getElementById('feedback');
        this.attemptsElement = document.getElementById('attempts');
        this.progressBar = document.getElementById('progress');
        this.progressText = document.getElementById('progress-text');
        this.loadingElement = document.getElementById('loading');
        this.resultsContainer = document.getElementById('results-container');
        this.resultsList = document.getElementById('results-list');
        this.epochNavigation = document.getElementById('epoch-navigation');
        this.currentEpochDisplay = document.getElementById('current-epoch');
        this.totalEpochsDisplay = document.getElementById('total-epochs');
        this.prevEpochButton = document.getElementById('prev-epoch');
        this.nextEpochButton = document.getElementById('next-epoch');
    }

    /**
     * Populate word list for manual selection
     * @param {Object} wordData - The word data object
     * @param {Function} toggleWordSelection - Function to handle word selection
     */
    populateWordList(wordData, toggleWordSelection) {
        this.wordListContainer.innerHTML = '';
        
        Object.keys(wordData).forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.classList.add('word-item');
            wordItem.textContent = word;
            wordItem.dataset.word = word;
            
            wordItem.addEventListener('click', () => toggleWordSelection(wordItem));
            
            this.wordListContainer.appendChild(wordItem);
        });
    }

    /**
     * Update the mode display based on selected mode
     * @param {string} mode - The selected mode ('manual' or 'auto')
     */
    updateModeDisplay(mode) {
        if (mode === 'manual') {
            this.manualModeSection.classList.add('active');
            this.autoModeSection.classList.remove('active');
            this.epochNavigation.classList.remove('active');
        } else {
            this.manualModeSection.classList.remove('active');
            this.autoModeSection.classList.add('active');
            this.epochNavigation.classList.add('active');
        }
    }

    /**
     * Update epoch navigation display
     * @param {number} currentEpoch - The current epoch index
     * @param {number} totalEpochs - The total number of epochs
     */
    updateEpochNavigation(currentEpoch, totalEpochs) {
        this.currentEpochDisplay.textContent = currentEpoch + 1;
        this.totalEpochsDisplay.textContent = totalEpochs;
        
        // Enable/disable navigation buttons
        this.prevEpochButton.disabled = currentEpoch === 0;
        this.nextEpochButton.disabled = currentEpoch === totalEpochs - 1;
    }

    /**
     * Show the current word in the flashcard
     * @param {string} word - The current word
     * @param {string} pronunciation - The pronunciation of the word
     * @param {string} definition - The definition of the word
     */
    showWord(word, pronunciation, definition) {
        // Update word display
        this.wordDisplay.textContent = word;
        this.pronunciationDisplay.textContent = pronunciation;
        this.definitionDisplay.textContent = definition;
        
        // Focus on input
        this.translationInput.focus();
    }

    /**
     * Show loading indicator
     * @param {boolean} isLoading - Whether to show or hide the loading indicator
     */
    showLoading(isLoading) {
        if (isLoading) {
            this.loadingElement.classList.add('active');
        } else {
            this.loadingElement.classList.remove('active');
        }
    }

    /**
     * Update progress display
     * @param {number} currentIndex - The current word index
     * @param {number} total - The total number of words
     */
    updateProgress(currentIndex, total) {
        const progress = ((currentIndex + 1) / total) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${currentIndex + 1} of ${total}`;
    }

    /**
     * Update attempts display
     * @param {number} attemptsLeft - The number of attempts left
     */
    updateAttemptsDisplay(attemptsLeft) {
        this.attemptsElement.textContent = `Attempts left: ${attemptsLeft}`;
    }

    /**
     * Show feedback for the user's answer
     * @param {boolean} isCorrect - Whether the answer is correct
     * @param {string} message - The feedback message
     */
    showFeedback(isCorrect, message) {
        this.feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        this.feedbackElement.textContent = message;
    }

    /**
     * Reset UI for a new word
     */
    resetWordUI() {
        this.translationInput.value = '';
        this.feedbackElement.className = 'feedback';
        this.feedbackElement.textContent = '';
        
        // Enable check button, disable next button
        this.checkButton.disabled = false;
        this.nextButton.disabled = true;
    }

    /**
     * Show session start UI
     */
    showSessionStartUI() {
        document.getElementById('word-selection').classList.remove('active');
        this.flashcardContainer.classList.add('active');
        this.resultsContainer.classList.remove('active');
    }

    /**
     * Show session end UI
     */
    showSessionEndUI() {
        this.flashcardContainer.classList.remove('active');
        this.resultsContainer.classList.add('active');
        document.getElementById('word-selection').classList.add('active');
    }

    /**
     * Show notification
     * @param {string} message - The notification message
     */
    showNotification(message) {
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
}

// Export the controller
const uiController = new UIController();
