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
        
        // Auto mode elements
        this.currentEpochDisplay = document.getElementById('current-epoch');
        this.totalEpochsDisplay = document.getElementById('total-epochs');
        this.prevEpochButton = document.getElementById('prev-epoch');
        this.nextEpochButton = document.getElementById('next-epoch');
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
        
        // Epoch navigation
        this.prevEpochButton.addEventListener('click', () => this.navigateEpoch(-1));
        this.nextEpochButton.addEventListener('click', () => this.navigateEpoch(1));
    }

    /**
     * Initialize flashcard manager
     */
    async initFlashcardManager() {
        try {
            // Populate word list for manual mode
            this.populateWordList();
            
            // Create epochs for automatic mode
            flashcardManager.createEpochs(wordData);
            
            // Update epoch navigation
            this.updateEpochNavigation(
                flashcardManager.getCurrentEpoch(),
                flashcardManager.getTotalEpochs()
            );
            
            // Load previously selected words if any
            await this.loadSelectedWords();
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
            
            this.updateEpochNavigation(
                flashcardManager.getCurrentEpoch(),
                flashcardManager.getTotalEpochs()
            );
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
            // Check if already selected 7 words
            if (flashcardManager.selectedWords.length >= 7) {
                this.showNotification('You can only select up to 7 words.');
                return;
            }
            
            // Select word
            wordItem.classList.add('selected');
            flashcardManager.selectedWords.push(word);
        }
        
        // Save selected words to IndexedDB
        await dbService.saveSelectedWords(flashcardManager.selectedWords);
        
        // Enable/disable start button based on selection
        this.startManualButton.disabled = flashcardManager.selectedWords.length === 0;
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
            }
        } catch (error) {
            console.error('Error loading selected words:', error);
        }
    }

    /**
     * Navigate between epochs
     * @param {number} direction - The direction to navigate (-1 for previous, 1 for next)
     */
    navigateEpoch(direction) {
        const newEpoch = flashcardManager.navigateEpoch(direction);
        this.updateEpochNavigation(newEpoch, flashcardManager.getTotalEpochs());
    }

    /**
     * Update epoch navigation display
     * @param {number} currentEpoch - The current epoch
     * @param {number} totalEpochs - The total number of epochs
     */
    updateEpochNavigation(currentEpoch, totalEpochs) {
        this.currentEpochDisplay.textContent = currentEpoch + 1; // 1-based for display
        this.totalEpochsDisplay.textContent = totalEpochs;
        
        // Disable prev/next buttons at boundaries
        this.prevEpochButton.disabled = currentEpoch === 0;
        this.nextEpochButton.disabled = currentEpoch === totalEpochs - 1;
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
        const currentEpoch = flashcardManager.getCurrentEpoch();
        const epochWords = flashcardManager.epochs[currentEpoch];
        
        if (!epochWords || epochWords.length === 0) {
            this.showNotification('No words available in this epoch.');
            return;
        }
        
        // Save session data to IndexedDB
        await dbService.saveSessionData({
            mode: 'auto',
            selectedWords: null,
            currentEpoch: currentEpoch
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
