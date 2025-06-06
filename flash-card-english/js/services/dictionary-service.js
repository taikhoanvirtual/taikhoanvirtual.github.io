/**
 * Dictionary Service
 * 
 * This service handles fetching word information from Oxford Learners Dictionary
 * including definitions, pronunciations, and audio files
 */

class DictionaryService {
    constructor() {
        this.baseUrl = 'https://www.oxfordlearnersdictionaries.com/definition/english/';
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
        
        // Audio URLs for fallback
        this.audioBaseUrl = 'https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/';
        this.audioBaseUrlUS = 'https://www.oxfordlearnersdictionaries.com/media/english/us_pron/';
    }

    /**
     * Fetch word information from Oxford Learners Dictionary
     * @param {string} word - The word to look up
     * @returns {Promise<Object>} - Object containing pronunciation and definition
     */
    async fetchWordInfo(word) {
        try {
            // Clean the word (remove spaces, lowercase)
            const cleanWord = word.trim().toLowerCase().replace(/\s+/g, '-');
            
            // Create the URL to fetch
            const url = `${this.proxyUrl}${encodeURIComponent(this.baseUrl + cleanWord)}`;
            
            // Fetch the HTML content
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch dictionary data');
            }
            
            const html = await response.text();
            
            // Parse the HTML to extract pronunciation and definition
            return this.parseHtml(html, word);
        } catch (error) {
            console.error('Error fetching word info:', error);
            
            // Return default values if there's an error
            return this.getMockWordInfo(word);
        }
    }

    /**
     * Parse HTML to extract pronunciation, definition, and audio URLs
     * @param {string} html - The HTML content from Oxford Dictionary
     * @param {string} word - The original word
     * @returns {Object} - Object containing pronunciation, definition, and audio URLs
     */
    parseHtml(html, word) {
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract British pronunciation
        let pronunciationBr = 'Pronunciation not available';
        const phoneticsBrElement = doc.querySelector('.phons_br');
        if (phoneticsBrElement) {
            const phoneticSpan = phoneticsBrElement.querySelector('.phon');
            if (phoneticSpan) {
                pronunciationBr = phoneticSpan.textContent;
            }
        }
        
        // Extract American pronunciation
        let pronunciationUs = 'Pronunciation not available';
        const phoneticsUsElement = doc.querySelector('.phons_n_am');
        if (phoneticsUsElement) {
            const phoneticSpan = phoneticsUsElement.querySelector('.phon');
            if (phoneticSpan) {
                pronunciationUs = phoneticSpan.textContent;
            }
        }
        
        // Extract audio URLs
        let audioBrUrl = null;
        let audioUsUrl = null;
        
        // Try to find the audio elements
        const audioBrElement = doc.querySelector('.phons_br .sound');
        const audioUsElement = doc.querySelector('.phons_n_am .sound');
        
        if (audioBrElement && audioBrElement.getAttribute('data-src-mp3')) {
            audioBrUrl = audioBrElement.getAttribute('data-src-mp3');
        }
        
        if (audioUsElement && audioUsElement.getAttribute('data-src-mp3')) {
            audioUsUrl = audioUsElement.getAttribute('data-src-mp3');
        }
        
        // Extract definition
        let definition = 'Definition not available';
        const definitionElement = doc.querySelector('.def');
        
        if (definitionElement) {
            definition = definitionElement.textContent.trim();
        }
        
        // If we couldn't extract the definition, try a fallback method
        if (definition === 'Definition not available') {
            const senseElements = doc.querySelectorAll('.sense');
            if (senseElements.length > 0) {
                const firstSense = senseElements[0];
                const defElement = firstSense.querySelector('.def');
                if (defElement) {
                    definition = defElement.textContent.trim();
                }
            }
        }
        
        // Return the extracted information
        return {
            pronunciationBr,
            pronunciationUs,
            audioBrUrl,
            audioUsUrl,
            definition
        };
    }

    /**
     * Fallback method if the Oxford API doesn't work
     * This creates mock data for demonstration purposes
     * @param {string} word - The word to generate mock data for
     * @returns {Object} - Object containing mock pronunciation, audio URLs, and definition
     */
    getMockWordInfo(word) {
        // Mock IPA pronunciations for common words (British)
        const commonPronunciationsBr = {
            'hello': '/həˈləʊ/',
            'goodbye': '/ˌɡʊdˈbaɪ/',
            'thank you': '/ˈθæŋk juː/',
            'sorry': '/ˈsɒri/',
            'friend': '/frend/',
            'family': '/ˈfæməli/',
            'love': '/lʌv/',
            'happy': '/ˈhæpi/',
            'sad': '/sæd/',
            'food': '/fuːd/',
            'water': '/ˈwɔːtə(r)/',
            'book': '/bʊk/',
            'school': '/skuːl/',
            'teacher': '/ˈtiːtʃə(r)/',
            'student': '/ˈstjuːdnt/',
            'house': '/haʊs/',
            'car': '/kɑː(r)/',
            'time': '/taɪm/',
            'money': '/ˈmʌni/',
            'work': '/wɜːk/'
        };
        
        // Mock IPA pronunciations for common words (American)
        const commonPronunciationsUs = {
            'hello': '/həˈloʊ/',
            'goodbye': '/ˌɡʊdˈbaɪ/',
            'thank you': '/ˈθæŋk juː/',
            'sorry': '/ˈsɑːri/',
            'friend': '/frend/',
            'family': '/ˈfæməli/',
            'love': '/lʌv/',
            'happy': '/ˈhæpi/',
            'sad': '/sæd/',
            'food': '/fuːd/',
            'water': '/ˈwɔːtər/',
            'book': '/bʊk/',
            'school': '/skuːl/',
            'teacher': '/ˈtiːtʃər/',
            'student': '/ˈstuːdənt/',
            'house': '/haʊs/',
            'car': '/kɑːr/',
            'time': '/taɪm/',
            'money': '/ˈmʌni/',
            'work': '/wɜːrk/'
        };
        
        // Mock definitions
        const commonDefinitions = {
            'hello': 'Used as a greeting or to begin a phone conversation.',
            'goodbye': 'Used when leaving or ending a conversation.',
            'thank you': 'A polite expression used to acknowledge a gift, service, or compliment.',
            'sorry': 'Feeling regret, compunction, sympathy, pity, etc.',
            'friend': 'A person with whom one has a bond of mutual affection.',
            'family': 'A group consisting of parents and children living together in a household.',
            'love': 'An intense feeling of deep affection.',
            'happy': 'Feeling or showing pleasure or contentment.',
            'sad': 'Feeling or showing sorrow; unhappy.',
            'food': 'Any nutritious substance that people or animals eat or drink.',
            'water': 'A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain.',
            'book': 'A written or printed work consisting of pages glued or sewn together.',
            'school': 'An institution for educating children.',
            'teacher': 'A person who teaches, especially in a school.',
            'student': 'A person who is studying at a school or university.',
            'house': 'A building for human habitation.',
            'car': 'A road vehicle, typically with four wheels, powered by an engine.',
            'time': 'The indefinite continued progress of existence and events.',
            'money': 'A current medium of exchange in the form of coins and banknotes.',
            'work': 'Activity involving mental or physical effort done in order to achieve a purpose or result.'
        };
        
        // Generate audio URLs for text-to-speech fallback
        const cleanWord = word.trim().toLowerCase().replace(/\s+/g, '%20');
        const ttsUrlBr = `https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${cleanWord}&lang=en-GB&engine=g1&name=&pitch=0.5&rate=0.5&volume=1&key=PL3QYYuV&gender=female`;
        const ttsUrlUs = `https://texttospeech.responsivevoice.org/v1/text:synthesize?text=${cleanWord}&lang=en-US&engine=g1&name=&pitch=0.5&rate=0.5&volume=1&key=PL3QYYuV&gender=female`;
        
        return {
            pronunciationBr: commonPronunciationsBr[word.toLowerCase()] || `/ˈ${word}/`,
            pronunciationUs: commonPronunciationsUs[word.toLowerCase()] || `/ˈ${word}/`,
            audioBrUrl: ttsUrlBr,
            audioUsUrl: ttsUrlUs,
            definition: commonDefinitions[word.toLowerCase()] || `A word meaning "${word}".`
        };
    }
    
    /**
     * Play pronunciation audio
     * @param {string} audioUrl - URL of the audio file to play
     * @returns {Promise} - Promise that resolves when audio plays or rejects on error
     */
    playAudio(audioUrl) {
        return new Promise((resolve, reject) => {
            if (!audioUrl) {
                reject(new Error('No audio URL provided'));
                return;
            }
            
            const audio = new Audio(audioUrl);
            
            audio.onended = () => resolve();
            audio.onerror = (error) => reject(error);
            
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                reject(error);
            });
        });
    }
}

// Export the service
const dictionaryService = new DictionaryService();
