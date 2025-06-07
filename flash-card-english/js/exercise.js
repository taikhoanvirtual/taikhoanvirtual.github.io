/**
 * Exercise Page JavaScript
 * Handles the word family and practice sentence exercises
 */

class ExerciseApp {
    constructor() {
        this.exerciseContent = document.getElementById('exercise-content');
        this.progressBar = document.getElementById('exercise-progress');
        this.progressText = document.getElementById('progress-text');
        this.selectedWords = [];
        this.completedExercises = 0;
        this.totalExercises = 0;
        this.dictionaryCache = {}; // Cache for dictionary data
        
        // Initialize the app
        this.init();
    }
    
    /**
     * Initialize the app
     */
    async init() {
        try {
            // Make sure wordData is available
            if (typeof wordData === 'undefined') {
                this.showError('Word data not found. Please make sure new_data.js is loaded.');
                return;
            }
            
            // Get session data from IndexedDB
            const sessionData = await dbService.getSessionData();
            
            if (!sessionData || !sessionData.selectedWords || sessionData.selectedWords.length === 0) {
                this.showError('No words found. Please start a new flashcard session.');
                return;
            }
            
            // Filter out words that don't exist in wordData
            this.selectedWords = sessionData.selectedWords.filter(word => {
                if (wordData && wordData[word]) {
                    return true;
                } else {
                    console.warn(`Word "${word}" not found in word data.`);
                    return false;
                }
            });
            
            if (this.selectedWords.length === 0) {
                this.showError('No valid words found for exercises.');
                return;
            }
            
            this.loadExercises();
        } catch (error) {
            console.error('Error initializing exercise app:', error);
            this.showError('An error occurred while loading exercises. Please try again.');
        }
    }
    
    /**
     * Load exercises for the selected words
     */
    loadExercises() {
        // Clear loading indicator
        this.exerciseContent.innerHTML = '';
        
        // Create container for exercises
        const exercisesContainer = document.createElement('div');
        exercisesContainer.className = 'exercises-container';
        
        let totalExerciseCount = 0;
        let exercisesAdded = false;
        
        // Create exercises for each word
        this.selectedWords.forEach(word => {
            // Double-check that the word exists in wordData
            if (!wordData || !wordData[word]) {
                return;
            }
            
            const wordInfo = wordData[word];
            
            const wordExercise = document.createElement('div');
            wordExercise.className = 'exercise-word';
            
            // Create word header
            const wordHeader = document.createElement('div');
            wordHeader.className = 'exercise-word-header';
            wordHeader.innerHTML = `
                <div class="exercise-word-title">${word}</div>
                <div class="exercise-word-type">${wordInfo.type || 'unknown'}</div>
            `;
            wordExercise.appendChild(wordHeader);
            
            let wordHasExercises = false;
            
            // Create family exercises section if there are family words
            if (wordInfo.family && Object.keys(wordInfo.family).length > 0) {
                const familySection = document.createElement('div');
                familySection.className = 'exercise-family-section';
                familySection.innerHTML = '<h3 class="exercise-family-title">Word Family</h3>';
                
                Object.keys(wordInfo.family).forEach(familyWord => {
                    const familyData = wordInfo.family[familyWord];
                    const familyItem = document.createElement('div');
                    familyItem.className = 'exercise-family-item';
                    familyItem.innerHTML = `
                        <div class="exercise-family-word">${familyWord}</div>
                        <div class="exercise-family-type">${familyData.type || ''}</div>
                        <input type="text" class="exercise-input" placeholder="Enter Vietnamese meaning" data-correct="${familyData.vn || ''}">
                        <button class="exercise-check-button">Check</button>
                        <div class="exercise-feedback"></div>
                        <div class="dictionary-info" data-word="${familyWord}">
                            <div class="dictionary-loading">Loading dictionary data...</div>
                            <div class="dictionary-content" style="display: none;">
                                <div class="dictionary-definition"></div>
                                <div class="dictionary-pronunciation">
                                    <div class="pronunciation-uk">
                                        <span class="pronunciation-label">UK:</span>
                                        <span class="pronunciation-text"></span>
                                        <button class="audio-button uk" title="Play UK pronunciation">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                    </div>
                                    <div class="pronunciation-us">
                                        <span class="pronunciation-label">US:</span>
                                        <span class="pronunciation-text"></span>
                                        <button class="audio-button us" title="Play US pronunciation">
                                            <i class="fas fa-volume-up"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="dictionary-error" style="display: none;">Failed to load dictionary data</div>
                        </div>
                    `;
                    
                    // Add event listener to check button
                    const checkButton = familyItem.querySelector('.exercise-check-button');
                    checkButton.addEventListener('click', () => this.checkFamilyAnswer(familyItem));
                    
                    // Fetch dictionary data for this family word
                    this.fetchDictionaryInfo(familyWord, familyItem);
                    
                    familySection.appendChild(familyItem);
                    totalExerciseCount++;
                });
                
                wordExercise.appendChild(familySection);
                wordHasExercises = true;
            }
            
            // Create practice exercises section if there are practice sentences
            if (wordInfo.practice && wordInfo.practice.length > 0) {
                const practiceSection = document.createElement('div');
                practiceSection.className = 'exercise-practice-section';
                practiceSection.innerHTML = '<h3 class="exercise-practice-title">Practice Sentences</h3>';
                
                wordInfo.practice.forEach((sentence, index) => {
                    const practiceItem = document.createElement('div');
                    practiceItem.className = 'exercise-practice-item';
                    
                    // Format sentence to highlight the blank
                    const formattedSentence = sentence.replace(/_{5,}/, '<span class="exercise-practice-blank">_______</span>');
                    
                    practiceItem.innerHTML = `
                        <div class="exercise-practice-sentence">${formattedSentence}</div>
                        <input type="text" class="exercise-practice-input" placeholder="Fill in the blank" data-sentence-index="${index}">
                        <button class="exercise-check-button">Check</button>
                        <div class="exercise-feedback"></div>
                    `;
                    
                    // Add event listener to check button
                    const checkButton = practiceItem.querySelector('.exercise-check-button');
                    checkButton.addEventListener('click', () => this.checkPracticeAnswer(practiceItem));
                    
                    practiceSection.appendChild(practiceItem);
                    totalExerciseCount++;
                });
                
                wordExercise.appendChild(practiceSection);
                wordHasExercises = true;
            }
            
            // Only add word if it has exercises
            if (wordHasExercises) {
                exercisesContainer.appendChild(wordExercise);
                exercisesAdded = true;
            }
        });
        
        // Check if any exercises were added
        if (!exercisesAdded) {
            this.showError('No exercises could be generated for the selected words.');
            return;
        }
        
        // Update total exercise count
        this.totalExercises = totalExerciseCount;
        this.updateProgress();
        
        // Add exercises to container
        this.exerciseContent.appendChild(exercisesContainer);
    }
    
    /**
     * Check family word answer
     * @param {HTMLElement} familyItem - The family item element
     */
    checkFamilyAnswer(familyItem) {
        const input = familyItem.querySelector('.exercise-input');
        const feedback = familyItem.querySelector('.exercise-feedback');
        const userAnswer = input.value.trim().toLowerCase().normalize('NFC');
        const correctAnswer = input.dataset.correct.toLowerCase().normalize('NFC');
        
        if (userAnswer === correctAnswer) {
            feedback.textContent = 'Correct! 🎉';
            feedback.className = 'exercise-feedback correct';
            input.disabled = true;
            familyItem.querySelector('.exercise-check-button').disabled = true;
            this.completedExercises++;
            this.updateProgress();
            
            // Show dictionary info when answer is correct
            const dictionaryInfo = familyItem.querySelector('.dictionary-content');
            if (dictionaryInfo) {
                dictionaryInfo.style.display = 'block';
                familyItem.querySelector('.dictionary-loading').style.display = 'none';
            }
        } else {
            feedback.textContent = `Incorrect. The correct answer is: ${input.dataset.correct}`;
            feedback.className = 'exercise-feedback incorrect';
        }
    }
    
    /**
     * Check practice sentence answer
     * @param {HTMLElement} practiceItem - The practice item element
     */
    checkPracticeAnswer(practiceItem) {
        const input = practiceItem.querySelector('.exercise-practice-input');
        const feedback = practiceItem.querySelector('.exercise-feedback');
        const userAnswer = input.value.trim().normalize('NFC');
        
        // For practice sentences, any answer is accepted as correct for now
        feedback.textContent = 'Answer accepted! 🎉';
        feedback.className = 'exercise-feedback correct';
        input.disabled = true;
        practiceItem.querySelector('.exercise-check-button').disabled = true;
        this.completedExercises++;
        this.updateProgress();
    }
    
    /**
     * Update progress bar and text
     */
    updateProgress() {
        const percentage = this.totalExercises > 0 ? (this.completedExercises / this.totalExercises) * 100 : 0;
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${this.completedExercises}/${this.totalExercises} completed`;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    /**
     * Fetch dictionary information for a word
     * @param {string} word - The word to fetch dictionary info for
     * @param {HTMLElement} familyItem - The family item element to update with dictionary info
     */
    async fetchDictionaryInfo(word, familyItem) {
        try {
            // Check if we already have this word in cache
            if (!this.dictionaryCache[word]) {
                // Fetch dictionary data
                this.dictionaryCache[word] = await dictionaryService.fetchWordInfo(word);
            }
            
            const wordInfo = this.dictionaryCache[word];
            const dictionaryContent = familyItem.querySelector('.dictionary-content');
            const dictionaryLoading = familyItem.querySelector('.dictionary-loading');
            const dictionaryError = familyItem.querySelector('.dictionary-error');
            
            // Update dictionary content
            if (wordInfo) {
                // Update definition
                const definitionElement = familyItem.querySelector('.dictionary-definition');
                definitionElement.textContent = wordInfo.definition;
                
                // Update pronunciations
                const ukPronunciation = familyItem.querySelector('.pronunciation-uk .pronunciation-text');
                const usPronunciation = familyItem.querySelector('.pronunciation-us .pronunciation-text');
                
                ukPronunciation.textContent = wordInfo.pronunciationBr || 'Not available';
                usPronunciation.textContent = wordInfo.pronunciationUs || 'Not available';
                
                // Add event listeners for audio buttons
                const ukAudioButton = familyItem.querySelector('.audio-button.uk');
                const usAudioButton = familyItem.querySelector('.audio-button.us');
                
                if (wordInfo.audioBrUrl) {
                    ukAudioButton.addEventListener('click', () => {
                        dictionaryService.playAudio(wordInfo.audioBrUrl)
                            .catch(error => console.error('Error playing UK audio:', error));
                    });
                } else {
                    ukAudioButton.disabled = true;
                }
                
                if (wordInfo.audioUsUrl) {
                    usAudioButton.addEventListener('click', () => {
                        dictionaryService.playAudio(wordInfo.audioUsUrl)
                            .catch(error => console.error('Error playing US audio:', error));
                    });
                } else {
                    usAudioButton.disabled = true;
                }
                
                // Hide loading, show content immediately
                dictionaryLoading.style.display = 'none';
                dictionaryContent.style.display = 'block'; // Show dictionary content immediately
                dictionaryError.style.display = 'none';
            } else {
                // Show error
                dictionaryLoading.style.display = 'none';
                dictionaryContent.style.display = 'none';
                dictionaryError.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching dictionary info:', error);
            
            // Show error
            const dictionaryLoading = familyItem.querySelector('.dictionary-loading');
            const dictionaryContent = familyItem.querySelector('.dictionary-content');
            const dictionaryError = familyItem.querySelector('.dictionary-error');
            
            dictionaryLoading.style.display = 'none';
            dictionaryContent.style.display = 'none';
            dictionaryError.style.display = 'block';
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.exerciseContent.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <a href="index.html" class="button home-button">Back to Home</a>
            </div>
        `;
    }
}

// Initialize the exercise app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExerciseApp();
});
