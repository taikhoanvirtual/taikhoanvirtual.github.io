# English Vocabulary Flashcards

A comprehensive, interactive web application to help Vietnamese users learn English vocabulary using flashcards and exercises. This application is built with pure HTML, CSS, and JavaScript without any frameworks or backend requirements. It features a modular design with separate pages for different functionalities, uses IndexedDB for data persistence between pages, and integrates with Oxford Learners Dictionary for real-time dictionary data.

## 📋 Overview

This flashcard application helps users learn English vocabulary by presenting words and allowing users to input their Vietnamese translations. The application fetches pronunciation and definitions from the Oxford Learners Dictionary to provide comprehensive learning resources. The application is split into separate HTML pages for better organization and uses IndexedDB to share data between pages, allowing for a seamless user experience. The application also includes word family exercises to help users learn related words and practice sentences to reinforce vocabulary in context.

## 🚀 Features

### Two Study Modes

1. **Manual Mode**
   - Users can select any number of words from the vocabulary list without limits
   - Clear selection button to quickly deselect all words
   - Study the selected words with interactive flashcards
   - Word selections are saved between sessions using IndexedDB

2. **Automatic Mode**
   - Users specify the number of words they want to study
   - Random word selection based on the specified quantity
   - Study the randomly selected words with interactive flashcards

### Flashcard Functionality

- **Word Display**: Shows the English word, IPA pronunciation, and definition
- **Translation Input**: Users enter the Vietnamese translation
- **Validation**: Users have 3 attempts to answer correctly
- **Reinforcement**: Incorrectly answered words reappear after the session ends
- **Real-time Feedback**: Immediate feedback on user answers
- **Audio Pronunciation**: British and American pronunciation options with audio playback
- **Progress Tracking**: Session statistics and history saved using IndexedDB

### User Interface

- Simple, clean, and minimalist design
- Mobile-friendly and responsive layout
- Progress tracking during flashcard sessions
- Visual feedback for correct and incorrect answers
- Separate pages for mode selection and flashcard sessions
- Progress history display on the main page

## 📁 Project Structure

```
flash-card-english/
├── css/
│   ├── main.css               # Main CSS file that imports all component CSS files
│   ├── base.css               # Base styles (variables, resets, typography)
│   ├── layout.css             # Layout styles (containers, grids, flexbox)
│   └── components/
│       ├── buttons.css        # Button styles
│       ├── flashcard.css      # Flashcard-specific styles
│       ├── exercise.css       # Exercise-specific styles
│       └── dictionary.css     # Dictionary-specific styles
├── js/
│   ├── data/
│   │   └── new_data.js        # English-Vietnamese word pairs with family words
│   ├── index.js               # Main page functionality
│   ├── flashcard.js           # Flashcard session functionality
│   ├── exercise.js            # Exercise page functionality
│   ├── modules/
│   │   ├── flashcard-manager.js # Core flashcard functionality
│   │   └── ui-controller.js   # UI manipulation and DOM updates
│   └── services/
│       ├── dictionary-service.js # Oxford Dictionary API integration
│       └── db-service.js      # IndexedDB data persistence
├── index.html                 # Main page with mode selection
├── flashcard.html             # Flashcard session page
├── exercise.html              # Word family exercises page
└── test.html                  # Test page for IndexedDB functionality
```

## 📄 File Descriptions

### HTML

- **index.html**: The main page with mode selection, word selection, and progress history.
- **flashcard.html**: The flashcard session page with flashcard display, input, and results.
- **test.html**: A test page for verifying IndexedDB functionality and data sharing between pages.

### CSS

The CSS has been refactored into a modular structure for better maintainability:

- **main.css**: Main CSS file that imports all component CSS files
- **base.css**: Contains variables, resets, typography, and basic element styles
- **layout.css**: Contains layout-related styles (containers, grids, flexbox utilities)
- **components/buttons.css**: All button styles including audio buttons and exercise check buttons
- **components/flashcard.css**: Styles for the flashcard component
- **components/exercise.css**: Styles for the exercise component
- **components/dictionary.css**: Styles specifically for the dictionary information display

### JavaScript

#### Data

- **word-data.js**: Contains the English-Vietnamese word pairs used in the flashcards. Structured as a JavaScript object to avoid CORS issues.

#### Core Application

- **index.js**: Handles the main page functionality including mode selection, word selection, and epoch navigation.
- **flashcard.js**: Manages the flashcard session including word display, answer checking, and session results.

#### Modules

- **flashcard-manager.js**: Manages the core flashcard functionality including:
  - Word selection and session management
  - Epoch creation and navigation
  - Answer validation
  - Progress tracking

- **ui-controller.js**: Handles all UI-related functionality:
  - DOM manipulation
  - Event handling
  - Visual feedback
  - Notifications

#### Services

- **dictionary-service.js**: Handles fetching and parsing word information from the Oxford Learners Dictionary:
  - Fetches word definitions and pronunciations
  - Parses HTML responses
  - Provides fallback mock data when API fails
  - Handles audio playback for pronunciations
  - Caches dictionary data to improve performance

- **db-service.js**: Manages IndexedDB operations for data persistence:
  - Stores and retrieves session data between pages
  - Saves selected words for manual mode
  - Records progress history
  - Provides a consistent API for database operations

## 🔧 How It Works

1. **Mode and Word Selection** (index.html):
   - Users choose between Manual and Automatic modes
   - In Manual Mode: Users select up to 7 words from the vocabulary list
   - In Automatic Mode: Users navigate through pre-defined epochs of 7 words each
   - Selected mode and words are saved to IndexedDB

2. **Flashcard Session** (flashcard.html):
   - Session data is loaded from IndexedDB
   - For each word, the application displays:
     - The English word
     - IPA pronunciation (fetched from Oxford Dictionary)
     - Definition (fetched from Oxford Dictionary)
     - Audio pronunciation options (British and American)

3. **User Input**:
   - Users enter the Vietnamese translation
   - The system validates the answer
   - Users have 3 attempts to answer correctly

4. **Feedback and Results**:
   - Correct answers: Move to the next word
   - Incorrect answers after 3 attempts: Show correct answer and move to next word
   - Incorrectly answered words reappear after the session ends
   - Session results are displayed with statistics
   - Progress is saved to IndexedDB and displayed in the history section

5. **Word Family Exercises** (exercise.html):
   - Users practice with word families (related words)
   - For each word, users see:
     - The main word and its Vietnamese meaning
     - Family words to translate from English to Vietnamese
     - Dictionary information for each family word (shown after correct answer)
     - Audio pronunciation options for each family word
   - Practice sentences using the word family in context
   - Progress tracking during the exercise session

## 🌐 Technical Implementation

- **No Backend Required**: Pure client-side application
- **No Frameworks**: Built with vanilla HTML, CSS, and JavaScript
- **Modular Design**: Separation of concerns with multiple HTML pages
- **IndexedDB**: Client-side database for data persistence between pages
- **CORS Handling**: Uses a proxy (allorigins.win) to fetch data from Oxford Dictionary
- **Fallback Mechanism**: Provides mock data when API calls fail
- **Unicode Normalization**: Uses `normalize('NFC')` to handle Vietnamese text comparison correctly
- **CSS Modularity**: Refactored CSS into multiple files for better maintainability
- **Dictionary Integration**: Real-time dictionary data fetching and caching
- **Audio Playback**: HTML5 Audio API for pronunciation playback
- **Audio Integration**: Plays pronunciation audio from Oxford Dictionary

## 📱 Responsive Design

The application is designed to work on various screen sizes:
- Adapts layout for mobile devices
- Maintains usability on smaller screens
- Optimizes touch interactions for mobile users

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No installation or setup required!
4. Use the test page (`test.html`) to verify IndexedDB functionality

---

Built with ❤️ to help Vietnamese users learn English vocabulary efficiently.
