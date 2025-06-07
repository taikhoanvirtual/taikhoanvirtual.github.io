/**
 * Flashcard Session Application
 * 
 * This is the entry point for the flashcard session page
 * It handles the flashcard session flow and user interactions
 */

class FlashcardApp {
    constructor() {
        this.sessionData = null;
        this.selectedWords = [];
        this.currentWordIndex = 0;
        this.incorrectWords = [];
        this.attemptsLeft = 3;
        this.stats = {
            correct: 0,
            incorrect: 0
        };
        
        // Initialize UI elements
        this.initUIElements();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load session data and start
        this.loadSessionData();
    }

    /**
     * Initialize UI elements
     */
    initUIElements() {
        // Session info
        this.sessionModeDisplay = document.getElementById('session-mode');
        
        // Flashcard elements
        this.flashcardContainer = document.getElementById('flashcard-container');
        this.wordDisplay = document.getElementById('word-display');
        this.pronunciationDisplay = document.getElementById('pronunciation');
        this.pronunciationBrButton = document.getElementById('pronunciation-br-button');
        this.pronunciationUsButton = document.getElementById('pronunciation-us-button');
        this.definitionDisplay = document.getElementById('definition');
        this.translationInput = document.getElementById('translation-input');
        this.checkButton = document.getElementById('check-button');
        this.nextButton = document.getElementById('next-button');
        this.feedbackElement = document.getElementById('feedback');
        this.attemptsElement = document.getElementById('attempts');
        this.progressBar = document.getElementById('progress');
        this.progressText = document.getElementById('progress-text');
        this.loadingElement = document.getElementById('loading');
        
        // Results elements
        this.resultsContainer = document.getElementById('results-container');
        this.correctCountElement = document.getElementById('correct-count');
        this.incorrectCountElement = document.getElementById('incorrect-count');
        this.accuracyElement = document.getElementById('accuracy');
        this.restartButton = document.getElementById('restart-button');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Check button
        this.checkButton.addEventListener('click', this.checkAnswer.bind(this));
        
        // Next button
        this.nextButton.addEventListener('click', this.nextWord.bind(this));
        
        // Translation input - check on Enter key
        this.translationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // Pronunciation buttons
        this.pronunciationBrButton.addEventListener('click', () => this.playPronunciation('br'));
        this.pronunciationUsButton.addEventListener('click', () => this.playPronunciation('us'));
        
        // Restart button
        this.restartButton.addEventListener('click', this.restartSession.bind(this));
    }

    /**
     * Load session data from IndexedDB
     */
    async loadSessionData() {
        try {
            this.showLoading(true);
            
            // Get session data from IndexedDB
            const sessionData = await dbService.getSessionData();
            
            if (!sessionData) {
                // No session data found, redirect to index page
                window.location.href = 'index.html';
                return;
            }
            
            this.sessionData = sessionData;
            
            // Set mode display with word count
            const wordCount = sessionData.selectedWords ? sessionData.selectedWords.length : 0;
            this.sessionModeDisplay.textContent = `${sessionData.mode.charAt(0).toUpperCase() + sessionData.mode.slice(1)} Mode - ${wordCount} words`;
            
            // Use selected words from session data for both manual and auto modes
            this.selectedWords = sessionData.selectedWords || [];
            
            if (this.selectedWords.length === 0) {
                this.showNotification('No words selected. Redirecting to home page...');
                
                // Redirect to index page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            // Start the session
            this.startSession();
        } catch (error) {
            console.error('Error loading session data:', error);
            this.showNotification('Error loading session data. Redirecting to home page...');
            
            // Redirect to index page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    /**
     * Start flashcard session
     */
    startSession() {
        // Reset session variables
        this.currentWordIndex = 0;
        this.incorrectWords = [];
        this.stats = {
            correct: 0,
            incorrect: 0
        };
        
        // Show flashcard UI
        this.flashcardContainer.style.display = 'block';
        this.resultsContainer.style.display = 'none';
        
        // Show first word
        this.showCurrentWord();
    }

    /**
     * Show current word
     */
    async showCurrentWord() {
        // Reset UI state
        this.resetWordUI();
        
        // Reset attempts
        this.attemptsLeft = 3;
        this.updateAttemptsDisplay();
        
        // Get current word
        const currentWord = this.selectedWords[this.currentWordIndex];
        
        // Show loading indicator
        this.showLoading(true);
        
        try {
            // Fetch pronunciation and definition from Oxford Dictionary
            const wordInfo = await dictionaryService.fetchWordInfo(currentWord);
            
            // Create flashcard data object with all the information
            const flashcardData = {
                word: currentWord,
                pronunciationBr: wordInfo.pronunciationBr || wordInfo.pronunciation || '',
                pronunciationUs: wordInfo.pronunciationUs || wordInfo.pronunciation || '',
                audioBrUrl: wordInfo.audioBrUrl || '',
                audioUsUrl: wordInfo.audioUsUrl || '',
                definition: wordInfo.definition || ''
            };
            
            // Display flashcard
            this.displayFlashcard(flashcardData);
        } catch (error) {
            console.error('Error fetching word info:', error);
            
            // Create flashcard data with default values
            const flashcardData = {
                word: currentWord,
                pronunciationBr: 'Pronunciation not available',
                pronunciationUs: 'Pronunciation not available',
                audioBrUrl: '',
                audioUsUrl: '',
                definition: 'Definition not available'
            };
            
            this.displayFlashcard(flashcardData);
        } finally {
            // Hide loading indicator
            this.showLoading(false);
        }
        
        // Update progress
        this.updateProgress();
    }

    /**
     * Display a flashcard
     * @param {Object} flashcardData - The flashcard data
     */
    displayFlashcard(flashcardData) {
        // Display word with its type (e.g., "ability (noun)")
        const currentWord = this.selectedWords[this.currentWordIndex];
        const wordType = wordData[currentWord].type;
        this.wordDisplay.textContent = `${flashcardData.word} (${wordType})`;
        
        // Display both pronunciations if available
        const brPron = flashcardData.pronunciationBr || '';
        const usPron = flashcardData.pronunciationUs || '';
        
        // If we have both pronunciations, show them both with labels
        if (brPron && usPron && brPron !== usPron) {
            this.pronunciationDisplay.innerHTML = `<span class="uk-pron">${brPron}</span> <span class="us-pron">${usPron}</span>`;
        } else {
            // Otherwise just show one pronunciation
            this.pronunciationDisplay.textContent = brPron || usPron || '';
        }
        
        // Store audio URLs for the pronunciation buttons
        this.pronunciationBrButton.dataset.audioUrl = flashcardData.audioBrUrl || '';
        this.pronunciationUsButton.dataset.audioUrl = flashcardData.audioUsUrl || '';
        
        // Enable/disable pronunciation buttons based on available audio
        this.pronunciationBrButton.disabled = !flashcardData.audioBrUrl;
        this.pronunciationUsButton.disabled = !flashcardData.audioUsUrl;
        
        this.definitionDisplay.textContent = flashcardData.definition || '';
        this.translationInput.value = '';
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = 'feedback';
        
        // Reset button states
        this.checkButton.disabled = false;
        this.nextButton.disabled = true;
        
        // Focus on the answer input
        this.translationInput.focus();
    }

    /**
     * Check user's answer
     */
    checkAnswer() {
        const userInput = this.translationInput.value.trim();
        
        if (!userInput) {
            this.showNotification('Please enter a translation.');
            return;
        }
        
        const currentWord = this.selectedWords[this.currentWordIndex];
        const correctAnswer = wordData[currentWord].vn.toLowerCase();
        const normalizedInput = userInput.toLowerCase();
        
        if (normalizedInput === correctAnswer) {
            // Correct answer
            this.stats.correct++;
            this.showFeedback(true, 'Correct! 🎉');
            
            // Disable check button, enable next button
            this.checkButton.disabled = true;
            this.nextButton.disabled = false;
            
            // Focus on next button
            this.nextButton.focus();
        } else {
            // Incorrect answer
            this.attemptsLeft--;
            this.updateAttemptsDisplay();
            
            if (this.attemptsLeft > 0) {
                // Still has attempts left
                this.showFeedback(false, 'Incorrect. Try again.');
                
                // Clear input and focus
                this.translationInput.value = '';
                this.translationInput.focus();
            } else {
                // No attempts left
                this.stats.incorrect++;
                
                // Add to incorrect words for review
                if (!this.incorrectWords.includes(currentWord)) {
                    this.incorrectWords.push(currentWord);
                }
                
                this.showFeedback(false, `Incorrect. The correct answer is: ${wordData[currentWord].vn}`);
                
                // Disable check button, enable next button
                this.checkButton.disabled = true;
                this.nextButton.disabled = false;
                
                // Focus on next button
                this.nextButton.focus();
            }
        }
    }

    /**
     * Move to next word
     */
    nextWord() {
        this.currentWordIndex++;
        
        if (this.currentWordIndex < this.selectedWords.length) {
            // Show next word
            this.showCurrentWord();
        } else if (this.incorrectWords.length > 0) {
            // Review incorrect words
            this.selectedWords = [...this.incorrectWords];
            this.incorrectWords = [];
            this.currentWordIndex = 0;
            
            this.showNotification('Now reviewing words you missed...');
            this.showCurrentWord();
        } else {
            // End of session
            this.endSession();
        }
    }

    /**
     * End flashcard session
     */
    async endSession() {
        // Show end session UI
        this.flashcardContainer.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        
        // Update stats display
        const totalWords = this.stats.correct + this.stats.incorrect;
        const accuracy = totalWords > 0 ? Math.round((this.stats.correct / totalWords) * 100) : 0;
        
        this.correctCountElement.textContent = this.stats.correct;
        this.incorrectCountElement.textContent = this.stats.incorrect;
        this.accuracyElement.textContent = `${accuracy}%`;
        
        // Add Exercise button to the buttons container
        const buttonsContainer = this.resultsContainer.querySelector('.buttons');
        
        // Check if the exercise button already exists
        if (!buttonsContainer.querySelector('.exercise-button')) {
            const exerciseButton = document.createElement('a');
            exerciseButton.href = 'exercise.html';
            exerciseButton.className = 'button exercise-button';
            exerciseButton.innerHTML = '<i class="fas fa-dumbbell"></i> Practice Exercises';
            
            // Insert the exercise button at the beginning of the buttons container
            buttonsContainer.insertBefore(exerciseButton, buttonsContainer.firstChild);
        }
        
        // Save progress to IndexedDB
        try {
            await dbService.saveProgress({
                mode: this.sessionData.mode,
                correct: this.stats.correct,
                incorrect: this.stats.incorrect,
                accuracy: accuracy
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    /**
     * Restart session
     */
    restartSession() {
        // Start a new session with the same words
        this.startSession();
    }

    /**
     * Play pronunciation audio
     * @param {string} type - The type of pronunciation ('br' for British, 'us' for American)
     */
    async playPronunciation(type) {
        try {
            const button = type === 'br' ? this.pronunciationBrButton : this.pronunciationUsButton;
            const audioUrl = button.dataset.audioUrl;
            
            if (!audioUrl) {
                throw new Error('No audio URL available');
            }
            
            // Disable both buttons during playback
            this.pronunciationBrButton.disabled = true;
            this.pronunciationUsButton.disabled = true;
            
            // Add visual feedback
            button.classList.add('playing');
            
            // Play the audio
            await dictionaryService.playAudio(audioUrl);
            
            // Remove visual feedback
            button.classList.remove('playing');
            
            // Re-enable buttons
            this.pronunciationBrButton.disabled = !this.pronunciationBrButton.dataset.audioUrl;
            this.pronunciationUsButton.disabled = !this.pronunciationUsButton.dataset.audioUrl;
        } catch (error) {
            console.error('Error playing pronunciation:', error);
            this.showNotification('Could not play pronunciation audio');
            
            // Re-enable buttons
            this.pronunciationBrButton.disabled = !this.pronunciationBrButton.dataset.audioUrl;
            this.pronunciationUsButton.disabled = !this.pronunciationUsButton.dataset.audioUrl;
        }
    }

    /**
     * Reset word UI for a new word
     */
    resetWordUI() {
        this.translationInput.value = '';
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = 'feedback';
        this.checkButton.disabled = false;
        this.nextButton.disabled = true;
        this.nextButton.style.display = 'inline-block'; // Ensure the next button is visible
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
     * Update attempts display
     */
    updateAttemptsDisplay() {
        this.attemptsElement.textContent = `Attempts left: ${this.attemptsLeft}`;
    }

    /**
     * Update progress display
     */
    updateProgress() {
        const current = this.currentWordIndex + 1;
        const total = this.selectedWords.length;
        const percentage = (current / total) * 100;
        
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${current} of ${total}`;
    }

    /**
     * Show or hide loading indicator
     * @param {boolean} show - Whether to show the loading indicator
     */
    showLoading(show) {
        this.loadingElement.style.display = show ? 'flex' : 'none';
    }

    /**
     * Show notification message
     * @param {string} message - The message to show
     */
    showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FlashcardApp();
});
