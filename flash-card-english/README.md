# English Vocabulary Flashcards

A simple, interactive web application to help Vietnamese users learn English vocabulary using flashcards. This application is built with pure HTML, CSS, and JavaScript without any frameworks or backend requirements.

## 📋 Overview

This flashcard application helps users learn English vocabulary by presenting words and allowing users to input their Vietnamese translations. The application fetches pronunciation and definitions from the Oxford Learners Dictionary to provide comprehensive learning resources.

## 🚀 Features

### Two Study Modes

1. **Manual Mode**
   - Users can select any 7 words from the vocabulary list
   - Study the selected words with interactive flashcards

2. **Automatic Mode**
   - Words are automatically divided into epochs of 7 words each
   - Users can navigate through epochs sequentially

### Flashcard Functionality

- **Word Display**: Shows the English word, IPA pronunciation, and definition
- **Translation Input**: Users enter the Vietnamese translation
- **Validation**: Users have 3 attempts to answer correctly
- **Reinforcement**: Incorrectly answered words reappear after the session ends
- **Real-time Feedback**: Immediate feedback on user answers

### User Interface

- Simple, clean, and minimalist design
- Mobile-friendly and responsive layout
- Progress tracking during flashcard sessions
- Visual feedback for correct and incorrect answers

## 📁 Project Structure

```
flash-card-english/
├── css/
│   └── styles.css              # All styling for the application
├── data/
│   └── data.js                 # English-Vietnamese word pairs
├── js/
│   ├── app.js                  # Main application entry point
│   ├── modules/
│   │   ├── flashcard-manager.js # Core flashcard functionality
│   │   └── ui-controller.js    # UI manipulation and DOM updates
│   └── services/
│       └── dictionary-service.js # Oxford Dictionary API integration
└── index.html                  # Main HTML structure
```

## 📄 File Descriptions

### HTML

- **index.html**: The main HTML file that structures the application and includes all necessary scripts and stylesheets.

### CSS

- **styles.css**: Contains all styling for the application, including responsive design for mobile devices.

### JavaScript

#### Data

- **data.js**: Contains the English-Vietnamese word pairs used in the flashcards. Structured as a JavaScript object to avoid CORS issues.

#### Core Application

- **app.js**: The main entry point for the application. Coordinates between the UI controller, flashcard manager, and dictionary service.

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

## 🔧 How It Works

1. **Word Selection**:
   - In Manual Mode: Users select 7 words from the vocabulary list
   - In Automatic Mode: The system automatically divides words into epochs of 7 words each

2. **Flashcard Session**:
   - For each word, the application displays:
     - The English word
     - IPA pronunciation (fetched from Oxford Dictionary)
     - Definition (fetched from Oxford Dictionary)

3. **User Input**:
   - Users enter the Vietnamese translation
   - The system validates the answer
   - Users have 3 attempts to answer correctly

4. **Feedback**:
   - Correct answers: Move to the next word
   - Incorrect answers after 3 attempts: Show correct answer and move to next word
   - Incorrectly answered words reappear after the session ends

## 🌐 Technical Implementation

- **No Backend Required**: Pure client-side application
- **No Frameworks**: Built with vanilla HTML, CSS, and JavaScript
- **Modular Design**: Separation of concerns for better maintainability
- **CORS Handling**: Uses a proxy to fetch data from Oxford Dictionary
- **Fallback Mechanism**: Provides mock data when API calls fail

## 📱 Responsive Design

The application is designed to work on various screen sizes:
- Adapts layout for mobile devices
- Maintains usability on smaller screens
- Optimizes touch interactions for mobile users

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No installation or setup required!

---

Built with ❤️ to help Vietnamese users learn English vocabulary efficiently.
