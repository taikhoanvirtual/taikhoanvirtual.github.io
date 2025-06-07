/**
 * Flashcard Manager Module
 * 
 * Handles the core flashcard functionality including word selection,
 * epoch management, and session control
 */

class FlashcardManager {
    constructor() {
        this.selectedWords = [];
        this.currentWordIndex = 0;
        this.currentEpoch = 0;
        this.epochs = [];
        this.incorrectWords = [];
        this.attemptsLeft = 3;
        this.mode = 'manual'; // Default mode
    }

    /**
     * Create epochs for automatic mode
     * @param {Object} wordData - The word data object
     */
    createEpochs(wordData) {
        const allWords = Object.keys(wordData);
        this.epochs = [];
        
        // Shuffle words
        const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
        
        // Create epochs with 7 words each
        for (let i = 0; i < shuffledWords.length; i += 7) {
            const epochWords = shuffledWords.slice(i, i + 7);
            if (epochWords.length > 0) {
                this.epochs.push(epochWords);
            }
        }
        
        // If the last epoch has fewer than 7 words, add random words from the beginning
        // to make it 7 (ensuring no duplicates within the epoch)
        const lastEpoch = this.epochs[this.epochs.length - 1];
        if (lastEpoch && lastEpoch.length < 7) {
            const wordsNeeded = 7 - lastEpoch.length;
            const additionalWords = shuffledWords.filter(word => !lastEpoch.includes(word)).slice(0, wordsNeeded);
            this.epochs[this.epochs.length - 1] = [...lastEpoch, ...additionalWords];
        }
    }

    /**
     * Toggle word selection for manual mode
     * @param {HTMLElement} wordItem - The word item element
     * @param {Function} updateStartButton - Function to update start button state
     * @param {Function} showNotification - Function to show notification
     */
    toggleWordSelection(wordItem, updateStartButton, showNotification) {
        const word = wordItem.dataset.word;
        
        if (wordItem.classList.contains('selected')) {
            // Deselect word
            wordItem.classList.remove('selected');
            this.selectedWords = this.selectedWords.filter(w => w !== word);
        } else {
            // Check if already selected 7 words
            if (this.selectedWords.length >= 7) {
                showNotification('You can only select up to 7 words.');
                return;
            }
            
            // Select word
            wordItem.classList.add('selected');
            this.selectedWords.push(word);
        }
        
        // Enable/disable start button based on selection
        updateStartButton(this.selectedWords.length > 0);
    }

    /**
     * Navigate between epochs
     * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
     */
    navigateEpoch(direction) {
        this.currentEpoch = Math.max(0, Math.min(this.epochs.length - 1, this.currentEpoch + direction));
        return this.currentEpoch;
    }

    /**
     * Start flashcard session
     * @param {string} mode - The selected mode ('manual' or 'auto')
     * @param {Function} showNotification - Function to show notification
     * @returns {boolean} - Whether the session was successfully started
     */
    startSession(mode) {
        // Reset session variables
        this.currentWordIndex = 0;
        this.incorrectWords = [];
        this.mode = mode;
        
        // Get words based on mode
        if (mode === 'manual') {
            if (this.selectedWords.length === 0) {
                return false;
            }
        } else {
            // Automatic mode - use current epoch
            if (this.epochs.length === 0 || !this.epochs[this.currentEpoch]) {
                return false;
            }
            this.selectedWords = [...this.epochs[this.currentEpoch]];
        }
        
        return true;
    }

    /**
     * Check user's answer
     * @param {string} userInput - The user's input
     * @param {Object} wordData - The word data object
     * @returns {Object} - Result object with isCorrect, message, and other state
     */
    checkAnswer(userInput, wordData) {
        const currentWord = this.selectedWords[this.currentWordIndex];
        const correctAnswer = wordData[currentWord].vn.toLowerCase();
        const normalizedInput = userInput.trim().toLowerCase();
        
        if (normalizedInput === correctAnswer) {
            // Correct answer
            return {
                isCorrect: true,
                message: 'Correct! 🎉',
                attemptsLeft: this.attemptsLeft,
                shouldMoveNext: true
            };
        } else {
            // Incorrect answer
            this.attemptsLeft--;
            
            if (this.attemptsLeft > 0) {
                // Still has attempts left
                return {
                    isCorrect: false,
                    message: 'Incorrect. Try again.',
                    attemptsLeft: this.attemptsLeft,
                    shouldMoveNext: false
                };
            } else {
                // No attempts left
                // Add to incorrect words for review
                if (!this.incorrectWords.includes(currentWord)) {
                    this.incorrectWords.push(currentWord);
                }
                
                return {
                    isCorrect: false,
                    message: `Incorrect. The correct answer is: ${wordData[currentWord].vn}`,
                    attemptsLeft: this.attemptsLeft,
                    shouldMoveNext: true
                };
            }
        }
    }

    /**
     * Move to next word
     * @returns {Object} - Next state information
     */
    nextWord() {
        this.currentWordIndex++;
        this.attemptsLeft = 3; // Reset attempts for new word
        
        if (this.currentWordIndex < this.selectedWords.length) {
            // Show next word
            return {
                isSessionComplete: false,
                isReviewMode: false
            };
        } else if (this.incorrectWords.length > 0) {
            // Review incorrect words
            this.selectedWords = [...this.incorrectWords];
            this.incorrectWords = [];
            this.currentWordIndex = 0;
            
            return {
                isSessionComplete: false,
                isReviewMode: true
            };
        } else {
            // End of session
            return {
                isSessionComplete: true,
                isReviewMode: false
            };
        }
    }

    /**
     * Reset selected words in manual mode
     */
    resetManualSelection() {
        this.selectedWords = [];
    }

    /**
     * Get current word
     * @returns {string} - The current word
     */
    getCurrentWord() {
        return this.selectedWords[this.currentWordIndex];
    }

    /**
     * Get current word index
     * @returns {number} - The current word index
     */
    getCurrentWordIndex() {
        return this.currentWordIndex;
    }

    /**
     * Get total words count
     * @returns {number} - The total number of words
     */
    getTotalWords() {
        return this.selectedWords.length;
    }

    /**
     * Get current epoch
     * @returns {number} - The current epoch
     */
    getCurrentEpoch() {
        return this.currentEpoch;
    }

    /**
     * Get total epochs count
     * @returns {number} - The total number of epochs
     */
    getTotalEpochs() {
        return this.epochs.length;
    }
}

// Export the manager
const flashcardManager = new FlashcardManager();
