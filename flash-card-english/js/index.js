/**
 * Main Index Page Application
 * 
 * This is the entry point for the index page of the flashcard application
 * It handles mode selection and session initialization
 */

class IndexApp {
    constructor() {
        // Initialize UI elements
        this.initUIElements();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize flashcard manager
        this.initFlashcardManager();
        
        // Load progress history
        this.loadProgressHistory();
    }

    /**
     * Initialize UI elements
     */
    initUIElements() {
        // Mode toggle
        this.modeToggle = document.getElementById('mode-toggle');
        this.manualModeSection = document.getElementById('manual-mode');
        this.autoModeSection = document.getElementById('auto-mode');
        
        // Manual mode elements
        this.wordList = document.getElementById('word-list');
        this.startManualButton = document.getElementById('start-manual-button');
        this.clearSelectionButton = document.getElementById('clear-selection-button');
        this.selectedCountDisplay = document.getElementById('selected-count');
        
        // Auto mode elements
        this.wordCountInput = document.getElementById('word-count-input');
        this.randomizeButton = document.getElementById('randomize-button');
        this.startAutoButton = document.getElementById('start-auto-button');
        
        // History container
        this.historyContainer = document.getElementById('history-container');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mode toggle
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', this.handleModeChange.bind(this));
        });
        
        // Start buttons
        this.startManualButton.addEventListener('click', this.startManualSession.bind(this));
        this.startAutoButton.addEventListener('click', this.startAutoSession.bind(this));
        
        // Clear selection button
        this.clearSelectionButton.addEventListener('click', this.clearWordSelection.bind(this));
        
        // Random word selection
        this.randomizeButton.addEventListener('click', this.randomizeWordSelection.bind(this));
        
        // Word count input validation
        this.wordCountInput.addEventListener('input', this.validateWordCount.bind(this));
    }

    /**
     * Initialize flashcard manager
     */
    async initFlashcardManager() {
        try {
            // Populate word list for manual mode
            this.populateWordList();
            
            // Load previously selected words if any
            await this.loadSelectedWords();
            
            // Set default word count for automatic mode
            this.wordCountInput.value = 7;
            this.validateWordCount();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showNotification('Error loading word data. Please try again.');
        }
    }

    /**
     * Handle mode change
     * @param {Event} e - The change event
     */
    handleModeChange(e) {
        const mode = e.target.value;
        
        if (mode === 'manual') {
            this.manualModeSection.classList.add('active');
            this.autoModeSection.classList.remove('active');
        } else {
            this.manualModeSection.classList.remove('active');
            this.autoModeSection.classList.add('active');
        }
    }

    /**
     * Populate word list for manual mode
     */
    populateWordList() {
        const wordList = this.wordList;
        wordList.innerHTML = '';
        
        Object.keys(wordData).forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.textContent = word;
            wordItem.dataset.word = word;
            
            wordItem.addEventListener('click', () => {
                this.toggleWordSelection(wordItem);
            });
            
            wordList.appendChild(wordItem);
        });
    }

    /**
     * Toggle word selection for manual mode
     * @param {HTMLElement} wordItem - The word item element
     */
    async toggleWordSelection(wordItem) {
        const word = wordItem.dataset.word;
        
        if (wordItem.classList.contains('selected')) {
            // Deselect word
            wordItem.classList.remove('selected');
            flashcardManager.selectedWords = flashcardManager.selectedWords.filter(w => w !== word);
        } else {
            // Select word (no limit)
            wordItem.classList.add('selected');
            flashcardManager.selectedWords.push(word);
        }
        
        // Save selected words to IndexedDB
        await dbService.saveSelectedWords(flashcardManager.selectedWords);
        
        // Enable/disable start button based on selection
        this.startManualButton.disabled = flashcardManager.selectedWords.length === 0;
        
        // Update selected count display
        this.updateSelectedCountDisplay();
    }

    /**
     * Load previously selected words from IndexedDB
     */
    async loadSelectedWords() {
        try {
            const selectedWords = await dbService.getSelectedWords();
            
            if (selectedWords && selectedWords.length > 0) {
                flashcardManager.selectedWords = selectedWords;
                
                // Update UI to show selected words
                selectedWords.forEach(word => {
                    const wordItem = document.querySelector(`.word-item[data-word="${word}"]`);
                    if (wordItem) {
                        wordItem.classList.add('selected');
                    }
                });
                
                // Enable start button if words are selected
                this.startManualButton.disabled = selectedWords.length === 0;
                
                // Update selected count display
                this.updateSelectedCountDisplay();
            }
        } catch (error) {
            console.error('Error loading selected words:', error);
        }
    }

    /**
     * Update selected count display
     */
    updateSelectedCountDisplay() {
        if (this.selectedCountDisplay) {
            this.selectedCountDisplay.textContent = flashcardManager.selectedWords.length;
        }
        
        // Enable/disable clear selection button based on selection
        if (this.clearSelectionButton) {
            this.clearSelectionButton.disabled = flashcardManager.selectedWords.length === 0;
        }
    }
    
    /**
     * Clear all word selections
     */
    async clearWordSelection() {
        // Remove selected class from all word items
        document.querySelectorAll('.word-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Clear selected words array
        flashcardManager.selectedWords = [];
        
        // Update UI
        this.updateSelectedCountDisplay();
        
        // Disable start button
        this.startManualButton.disabled = true;
        
        // Save empty selection to IndexedDB
        await dbService.saveSelectedWords([]);
        
        // Show notification
        this.showNotification('All selections cleared');
    }
    
    /**
     * Validate word count input
     */
    validateWordCount() {
        const value = parseInt(this.wordCountInput.value);
        const totalWords = Object.keys(wordData).length;
        
        // Ensure value is a number between 1 and total words
        if (isNaN(value) || value < 1) {
            this.wordCountInput.value = 1;
        } else if (value > totalWords) {
            this.wordCountInput.value = totalWords;
        }
        
        // Enable/disable randomize button
        this.randomizeButton.disabled = false;
    }
    
    /**
     * Randomize word selection for automatic mode
     */
    randomizeWordSelection() {
        const wordCount = parseInt(this.wordCountInput.value);
        const allWords = Object.keys(wordData);
        
        // Shuffle all words
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        
        // Take the requested number of words
        const randomWords = shuffled.slice(0, wordCount);
        
        // Store in flashcard manager
        flashcardManager.randomWords = randomWords;
        
        // Enable start button
        this.startAutoButton.disabled = false;
        
        // Show notification
        this.showNotification(`${wordCount} random words selected!`);
    }

    /**
     * Start manual session
     */
    async startManualSession() {
        if (flashcardManager.selectedWords.length === 0) {
            this.showNotification('Please select at least one word.');
            return;
        }
        
        // Save session data to IndexedDB
        await dbService.saveSessionData({
            mode: 'manual',
            selectedWords: flashcardManager.selectedWords,
            currentEpoch: null
        });
        
        // Navigate to flashcard page
        window.location.href = 'flashcard.html';
    }

    /**
     * Start automatic session
     */
    async startAutoSession() {
        if (!flashcardManager.randomWords || flashcardManager.randomWords.length === 0) {
            this.showNotification('Please select random words first.');
            return;
        }
        
        // Save session data to IndexedDB
        await dbService.saveSessionData({
            mode: 'auto',
            selectedWords: flashcardManager.randomWords,
            currentEpoch: null
        });
        
        // Navigate to flashcard page
        window.location.href = 'flashcard.html';
    }

    /**
     * Load progress history from IndexedDB
     */
    async loadProgressHistory() {
        try {
            const history = await dbService.getProgressHistory(5);
            
            if (history && history.length > 0) {
                this.historyContainer.innerHTML = '';
                
                const historyList = document.createElement('ul');
                historyList.className = 'history-list';
                
                history.forEach(record => {
                    const item = document.createElement('li');
                    item.className = 'history-item';
                    
                    const date = new Date(record.date);
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    
                    item.innerHTML = `
                        <div class="history-date">${formattedDate}</div>
                        <div class="history-mode">${record.mode} Mode</div>
                        <div class="history-stats">
                            <span class="correct">${record.correct}</span> correct, 
                            <span class="incorrect">${record.incorrect}</span> incorrect
                        </div>
                    `;
                    
                    historyList.appendChild(item);
                });
                
                this.historyContainer.appendChild(historyList);
            }
        } catch (error) {
            console.error('Error loading progress history:', error);
        }
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
    const app = new IndexApp();
});
