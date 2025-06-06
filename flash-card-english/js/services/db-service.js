/**
 * IndexedDB Service
 * 
 * Handles data persistence between HTML pages using IndexedDB
 */

class DBService {
    constructor() {
        this.dbName = 'flashcardDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    /**
     * Initialize the database
     * @returns {Promise} - Promise that resolves when DB is ready
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB connected successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('sessionData')) {
                    const sessionStore = db.createObjectStore('sessionData', { keyPath: 'id' });
                    sessionStore.createIndex('mode', 'mode', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('selectedWords')) {
                    db.createObjectStore('selectedWords', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
                    progressStore.createIndex('date', 'date', { unique: false });
                }
            };
        });
    }

    /**
     * Save session data
     * @param {Object} data - Session data to save
     * @returns {Promise} - Promise that resolves when data is saved
     */
    async saveSessionData(data) {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessionData'], 'readwrite');
            const store = transaction.objectStore('sessionData');
            
            // Always use the same ID to overwrite previous session data
            const sessionData = {
                id: 'currentSession',
                ...data,
                timestamp: Date.now()
            };
            
            const request = store.put(sessionData);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Get session data
     * @returns {Promise<Object>} - Promise that resolves with session data
     */
    async getSessionData() {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessionData'], 'readonly');
            const store = transaction.objectStore('sessionData');
            const request = store.get('currentSession');
            
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Save selected words
     * @param {Array} words - Array of selected words
     * @returns {Promise} - Promise that resolves when words are saved
     */
    async saveSelectedWords(words) {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['selectedWords'], 'readwrite');
            const store = transaction.objectStore('selectedWords');
            
            const data = {
                id: 'manualSelection',
                words,
                timestamp: Date.now()
            };
            
            const request = store.put(data);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Get selected words
     * @returns {Promise<Array>} - Promise that resolves with array of selected words
     */
    async getSelectedWords() {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['selectedWords'], 'readonly');
            const store = transaction.objectStore('selectedWords');
            const request = store.get('manualSelection');
            
            request.onsuccess = () => {
                const data = request.result;
                resolve(data ? data.words : []);
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Save progress data
     * @param {Object} progressData - Progress data to save
     * @returns {Promise} - Promise that resolves when data is saved
     */
    async saveProgress(progressData) {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readwrite');
            const store = transaction.objectStore('progress');
            
            const data = {
                id: `progress_${Date.now()}`,
                ...progressData,
                date: new Date().toISOString()
            };
            
            const request = store.add(data);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Get progress history
     * @param {number} limit - Maximum number of records to return
     * @returns {Promise<Array>} - Promise that resolves with array of progress records
     */
    async getProgressHistory(limit = 10) {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const index = store.index('date');
            
            // Get all records, sorted by date descending
            const request = index.openCursor(null, 'prev');
            const results = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Clear all session data
     * @returns {Promise} - Promise that resolves when data is cleared
     */
    async clearSessionData() {
        await this.ensureDBReady();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessionData'], 'readwrite');
            const store = transaction.objectStore('sessionData');
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Ensure database is ready before operations
     * @returns {Promise} - Promise that resolves when DB is ready
     */
    async ensureDBReady() {
        if (this.db) return Promise.resolve();
        return this.initDB();
    }
}

// Export the service
const dbService = new DBService();
