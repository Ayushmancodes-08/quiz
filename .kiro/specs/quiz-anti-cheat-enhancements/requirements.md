# Requirements Document

## Introduction

This document specifies requirements for enhancing the quiz platform's anti-cheating capabilities and question randomization features. The system shall provide comprehensive security measures to ensure quiz integrity while maintaining a seamless, device-friendly user experience across desktop, tablet, and mobile devices. The enhancements focus on preventing common cheating methods including external resource access, content copying, and answer sharing, while implementing intelligent question and answer randomization.

## Glossary

- **Quiz System**: The web-based quiz application that presents questions to students and records their responses
- **Student**: A user taking a quiz through the Quiz System
- **Admin**: A user who creates and manages quizzes in the Quiz System
- **Browser Lockdown**: A security mechanism that restricts browser functionality during quiz sessions
- **Focus Loss Event**: An occurrence when the Quiz System detects the user has switched away from the quiz interface
- **Violation Counter**: A numeric tracker that increments when the Quiz System detects suspicious behavior
- **Question Pool**: The complete set of questions available for a specific quiz
- **Selected Questions**: The subset of questions from the Question Pool that will be presented to a Student
- **Answer Options**: The multiple choice alternatives (A, B, C, D) presented for a question
- **Correct Answer Position**: The index location of the correct answer within the shuffled Answer Options
- **Client-Side Randomization**: Shuffling performed in the user's browser
- **Server-Side Randomization**: Shuffling performed on the backend server before sending to the client
- **Copy/Paste Operation**: User actions involving Ctrl+C, Ctrl+V, or right-click context menu operations
- **Context Menu**: The right-click menu that appears in web browsers
- **Full-Screen Mode**: A browser display state where the Quiz System occupies the entire screen
- **Mobile Device**: Smartphones and tablets with touch interfaces
- **Desktop Device**: Computers with keyboard and mouse interfaces
- **Responsive Design**: User interface that adapts layout and functionality based on device screen size

## Requirements

### Requirement 1: Question Randomization

**User Story:** As an Admin, I want questions to be randomly selected and shuffled for each quiz attempt, so that students cannot share question sequences or predict which questions will appear.

#### Acceptance Criteria

1. WHEN an Admin creates a quiz with more questions than the quiz length, THE Quiz System SHALL randomly select the specified number of questions from the Question Pool on the server side
2. WHEN a Student starts a quiz attempt, THE Quiz System SHALL shuffle the order of Selected Questions on the server side before sending to the client
3. THE Quiz System SHALL store the shuffled question order with each quiz attempt for review purposes
4. WHEN an Admin reviews a completed quiz attempt, THE Quiz System SHALL display questions in the order they were presented to the Student
5. THE Quiz System SHALL ensure that each Student receives a different random selection and order of questions for the same quiz

### Requirement 2: Answer Option Randomization

**User Story:** As an Admin, I want answer options to be randomized for each quiz attempt, so that students cannot memorize answer positions or share answers by letter (A, B, C, D).

#### Acceptance Criteria

1. WHEN a Student starts a quiz with multiple-choice questions, THE Quiz System SHALL shuffle the order of Answer Options on the server side
2. THE Quiz System SHALL store the Correct Answer Position for each shuffled question on the server side
3. THE Quiz System SHALL validate student answers against the stored Correct Answer Position
4. WHEN an Admin reviews a completed quiz, THE Quiz System SHALL display the answer options in the order they were presented to the Student
5. THE Quiz System SHALL ensure Answer Options are shuffled independently for each question

### Requirement 3: Browser Focus Loss Detection

**User Story:** As an Admin, I want to detect when students switch tabs or minimize the browser, so that I can identify potential cheating attempts and enforce quiz integrity.

#### Acceptance Criteria

1. WHEN a Student switches to a different browser tab during a quiz, THE Quiz System SHALL detect the Focus Loss Event within 500 milliseconds
2. WHEN a Student minimizes the browser window during a quiz, THE Quiz System SHALL detect the Focus Loss Event within 500 milliseconds
3. WHEN a Focus Loss Event is detected, THE Quiz System SHALL increment the Violation Counter by one
4. WHEN a Focus Loss Event is detected, THE Quiz System SHALL display a warning message to the Student
5. WHEN the Violation Counter reaches three, THE Quiz System SHALL automatically submit the quiz and record all violations
6. THE Quiz System SHALL log each Focus Loss Event with a timestamp for Admin review

### Requirement 4: Copy and Paste Prevention

**User Story:** As an Admin, I want to prevent students from copying quiz content, so that they cannot share questions or search for answers online.

#### Acceptance Criteria

1. WHEN a Student attempts to select text within the quiz interface, THE Quiz System SHALL prevent text selection
2. WHEN a Student presses Ctrl+C or Cmd+C within the quiz interface, THE Quiz System SHALL block the Copy/Paste Operation
3. WHEN a Student presses Ctrl+V or Cmd+V within answer input fields, THE Quiz System SHALL block the Copy/Paste Operation
4. WHEN a Student attempts to use browser developer tools to copy content, THE Quiz System SHALL detect and log the attempt
5. THE Quiz System SHALL allow typing in text input fields while blocking Copy/Paste Operations

### Requirement 5: Context Menu Restriction

**User Story:** As an Admin, I want to disable right-click functionality during quizzes, so that students cannot access browser tools or copy content through the Context Menu.

#### Acceptance Criteria

1. WHEN a Student right-clicks anywhere within the quiz interface, THE Quiz System SHALL prevent the Context Menu from appearing
2. WHEN a Student uses keyboard shortcuts to open the Context Menu, THE Quiz System SHALL block the action
3. THE Quiz System SHALL display a brief message indicating that right-click is disabled during the quiz
4. WHEN a Student completes or exits the quiz, THE Quiz System SHALL restore normal Context Menu functionality
5. THE Quiz System SHALL log Context Menu access attempts with timestamps

### Requirement 6: Full-Screen Mode Enforcement

**User Story:** As an Admin, I want quizzes to run in full-screen mode, so that students have minimal distractions and limited access to other applications.

#### Acceptance Criteria

1. WHEN a Student starts a quiz on a Desktop Device, THE Quiz System SHALL request Full-Screen Mode activation
2. WHEN a Student exits Full-Screen Mode during a quiz, THE Quiz System SHALL detect the change within 500 milliseconds
3. WHEN Full-Screen Mode is exited, THE Quiz System SHALL increment the Violation Counter by one
4. WHEN Full-Screen Mode is exited, THE Quiz System SHALL display a warning and prompt the Student to re-enter Full-Screen Mode
5. THE Quiz System SHALL allow Students to decline Full-Screen Mode on Mobile Devices without penalty
6. WHEN Full-Screen Mode is not supported by the browser, THE Quiz System SHALL continue the quiz without Full-Screen Mode and log the limitation

### Requirement 7: Mobile-Responsive Anti-Cheat Implementation

**User Story:** As a Student using a mobile device, I want anti-cheat features to work appropriately for my device, so that I can take quizzes fairly without desktop-specific restrictions interfering with my experience.

#### Acceptance Criteria

1. WHEN a Student accesses the quiz on a Mobile Device, THE Quiz System SHALL detect the device type within 100 milliseconds
2. WHEN a Student uses a Mobile Device, THE Quiz System SHALL disable keyboard-specific restrictions that are not applicable to touch interfaces
3. WHEN a Student uses a Mobile Device, THE Quiz System SHALL adapt Full-Screen Mode enforcement to respect mobile browser limitations
4. WHEN a Student uses a Mobile Device, THE Quiz System SHALL maintain focus loss detection for app switching
5. THE Quiz System SHALL apply copy/paste prevention consistently across Desktop Devices and Mobile Devices
6. THE Quiz System SHALL ensure all anti-cheat UI warnings and messages are readable and accessible on screens as small as 320 pixels wide

### Requirement 8: Cross-Browser Compatibility

**User Story:** As a Student, I want anti-cheat features to work consistently across different browsers, so that I have a fair testing experience regardless of my browser choice.

#### Acceptance Criteria

1. THE Quiz System SHALL implement anti-cheat features that function on Chrome, Edge, Firefox, and Safari browsers
2. WHEN a browser does not support a specific anti-cheat feature, THE Quiz System SHALL gracefully degrade and log the limitation
3. THE Quiz System SHALL display a browser compatibility notice to Students using browsers with limited anti-cheat support
4. THE Quiz System SHALL maintain core anti-cheat functionality (focus detection, copy prevention) across all supported browsers
5. WHEN advanced features like keyboard lock are unavailable, THE Quiz System SHALL continue quiz operation with available security measures

### Requirement 9: Violation Tracking and Reporting

**User Story:** As an Admin, I want detailed violation reports for each quiz attempt, so that I can identify suspicious behavior and make informed decisions about quiz validity.

#### Acceptance Criteria

1. THE Quiz System SHALL record each violation with a timestamp, violation type, and description
2. WHEN a quiz attempt is completed, THE Quiz System SHALL store the total Violation Counter value with the attempt record
3. WHEN an Admin views quiz results, THE Quiz System SHALL display the Violation Counter prominently for each attempt
4. WHEN an Admin clicks on a violation count, THE Quiz System SHALL display a detailed log of all violations for that attempt
5. THE Quiz System SHALL flag quiz attempts with three or more violations for Admin review
6. THE Quiz System SHALL provide filtering options to view only flagged attempts

### Requirement 10: Performance and User Experience

**User Story:** As a Student, I want anti-cheat features to run smoothly without causing lag or disrupting my quiz-taking experience, so that I can focus on answering questions.

#### Acceptance Criteria

1. THE Quiz System SHALL implement anti-cheat monitoring with less than 50 milliseconds of processing overhead per event
2. THE Quiz System SHALL load and initialize all anti-cheat features within 2 seconds of quiz start
3. WHEN anti-cheat features are active, THE Quiz System SHALL maintain smooth scrolling and interaction responsiveness
4. THE Quiz System SHALL display clear, non-intrusive warnings that do not block the quiz interface
5. WHEN a Student has a slow internet connection, THE Quiz System SHALL prioritize quiz functionality over anti-cheat telemetry transmission
