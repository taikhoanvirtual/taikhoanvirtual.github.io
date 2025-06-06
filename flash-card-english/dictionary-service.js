/**
 * Dictionary Service
 * 
 * This service handles fetching word information from Oxford Learners Dictionary
 * It uses a proxy approach to avoid CORS issues when making requests from the browser
 */

class DictionaryService {
    constructor() {
        this.baseUrl = 'https://www.oxfordlearnersdictionaries.com/definition/english/';
        this.proxyUrl = 'https://api.allorigins.win/raw?url=';
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
            return {
                pronunciation: 'Pronunciation not available',
                definition: 'Definition not available'
            };
        }
    }

    /**
     * Parse HTML to extract pronunciation and definition
     * @param {string} html - The HTML content from Oxford Dictionary
     * @param {string} word - The original word
     * @returns {Object} - Object containing pronunciation and definition
     */
    parseHtml(html, word) {
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract pronunciation
        let pronunciation = 'Pronunciation not available';
        const phoneticsElement = doc.querySelector('.phons_br');
        
        if (phoneticsElement) {
            const phoneticSpan = phoneticsElement.querySelector('.phon');
            if (phoneticSpan) {
                pronunciation = phoneticSpan.textContent;
            }
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
            pronunciation,
            definition
        };
    }

    /**
     * Fallback method if the Oxford API doesn't work
     * This creates mock data for demonstration purposes
     * @param {string} word - The word to generate mock data for
     * @returns {Object} - Object containing mock pronunciation and definition
     */
    getMockWordInfo(word) {
        // Mock IPA pronunciations for common words
        const commonPronunciations = {
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
        
        return {
            pronunciation: commonPronunciations[word.toLowerCase()] || `/ˈ${word}/`,
            definition: commonDefinitions[word.toLowerCase()] || `A word meaning "${word}".`
        };
    }
}

// Export the service
window.DictionaryService = new DictionaryService();
