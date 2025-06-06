/**
 * Main Application
 * 
 * This is the main entry point for the flashcard application
 * It coordinates between the UI controller, flashcard manager, and dictionary service
 */

class FlashcardApp {
    constructor() {
        // Initialize event listeners
        this.setupEventListeners();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Populate word list for manual mode
            uiController.populateWordList(wordData, this.handleWordSelection.bind(this));
            
            // Create epochs for automatic mode
            flashcardManager.createEpochs(wordData);
            
            // Update epoch navigation
            uiController.updateEpochNavigation(
                flashcardManager.getCurrentEpoch(),
                flashcardManager.getTotalEpochs()
            );
        } catch (error) {
            console.error('Error initializing app:', error);
            uiController.showNotification('Error loading word data. Please try again.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mode toggle
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', this.handleModeChange.bind(this));
        });
        
        // Start button
        uiController.startButton.addEventListener('click', this.startSession.bind(this));
        
        // Check button
        uiController.checkButton.addEventListener('click', this.checkAnswer.bind(this));
        
        // Next button
        uiController.nextButton.addEventListener('click', this.nextWord.bind(this));
        
        // Translation input - check on Enter key
        uiController.translationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // Epoch navigation
        uiController.prevEpochButton.addEventListener('click', () => this.navigateEpoch(-1));
        uiController.nextEpochButton.addEventListener('click', () => this.navigateEpoch(1));
    }

    /**
     * Handle mode change
     * @param {Event} e - The change event
     */
    handleModeChange(e) {
        const mode = e.target.value;
        uiController.updateModeDisplay(mode);
        
        if (mode === 'auto') {
            uiController.updateEpochNavigation(
                flashcardManager.getCurrentEpoch(),
                flashcardManager.getTotalEpochs()
            );
        }
    }

    /**
     * Handle word selection in manual mode
     * @param {HTMLElement} wordItem - The word item element
     */
    handleWordSelection(wordItem) {
        flashcardManager.toggleWordSelection(
            wordItem,
            (enabled) => uiController.startButton.disabled = !enabled,
            uiController.showNotification
        );
    }

    /**
     * Navigate between epochs
     * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
     */
    navigateEpoch(direction) {
        const newEpoch = flashcardManager.navigateEpoch(direction);
        uiController.updateEpochNavigation(newEpoch, flashcardManager.getTotalEpochs());
    }

    /**
     * Start flashcard session
     */
    startSession() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        const sessionStarted = flashcardManager.startSession(mode);
        if (!sessionStarted) {
            uiController.showNotification('Please select at least one word.');
            return;
        }
        
        // Show flashcard UI
        uiController.showSessionStartUI();
        
        // Show first word
        this.showCurrentWord();
    }

    /**
     * Show current word
     */
    async showCurrentWord() {
        // Reset UI state
        uiController.resetWordUI();
        
        // Reset attempts
        flashcardManager.attemptsLeft = 3;
        uiController.updateAttemptsDisplay(flashcardManager.attemptsLeft);
        
        // Get current word
        const currentWord = flashcardManager.getCurrentWord();
        
        // Show loading indicator
        uiController.showLoading(true);
        
        try {
            // Fetch pronunciation and definition from Oxford Dictionary
            const wordInfo = await dictionaryService.fetchWordInfo(currentWord);
            
            // Update word display
            uiController.showWord(currentWord, wordInfo.pronunciation, wordInfo.definition);
        } catch (error) {
            console.error('Error fetching word info:', error);
            uiController.showWord(
                currentWord, 
                'Pronunciation not available', 
                'Definition not available'
            );
        } finally {
            // Hide loading indicator
            uiController.showLoading(false);
        }
        
        // Update progress
        uiController.updateProgress(
            flashcardManager.getCurrentWordIndex(),
            flashcardManager.getTotalWords()
        );
    }

    /**
     * Check user's answer
     */
    checkAnswer() {
        const userInput = uiController.translationInput.value;
        
        const result = flashcardManager.checkAnswer(userInput, wordData);
        
        // Update UI based on result
        uiController.showFeedback(result.isCorrect, result.message);
        uiController.updateAttemptsDisplay(result.attemptsLeft);
        
        if (result.shouldMoveNext) {
            // Disable check button, enable next button
            uiController.checkButton.disabled = true;
            uiController.nextButton.disabled = false;
            
            // Focus on next button
            uiController.nextButton.focus();
        } else {
            // Clear input and focus
            uiController.translationInput.value = '';
            uiController.translationInput.focus();
        }
    }

    /**
     * Move to next word
     */
    nextWord() {
        const result = flashcardManager.nextWord();
        
        if (!result.isSessionComplete) {
            // Show next word
            if (result.isReviewMode) {
                uiController.showNotification('Now reviewing words you missed...');
            }
            this.showCurrentWord();
        } else {
            // End of session
            this.endSession();
        }
    }

    /**
     * End flashcard session
     */
    endSession() {
        // Show end session UI
        uiController.showSessionEndUI();
        
        // Reset selected words in manual mode
        if (flashcardManager.mode === 'manual') {
            flashcardManager.resetManualSelection();
            document.querySelectorAll('.word-item.selected').forEach(item => {
                item.classList.remove('selected');
            });
            uiController.startButton.disabled = true;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FlashcardApp();
    app.init();
});
