# Requirements Document

## Introduction

This document specifies requirements for implementing a complete, production-ready quiz system with comprehensive routing, question/answer shuffling, advanced anti-cheat features, and full mobile responsiveness. The Quiz Platform shall provide seamless navigation across all pages, robust security measures to prevent cheating, and an optimal user experience on all device types (desktop, tablet, and mobile).

## Glossary

- **Quiz Platform**: The complete web application including all pages, routes, and features for quiz creation, taking, and management
- **Route**: A URL path that maps to a specific page or functionality in the Quiz Platform
- **Student**: A user who takes quizzes through the Quiz Platform
- **Admin**: A user who creates, manages, and reviews quizzes in the Quiz Platform
- **Navigation Flow**: The sequence of pages a user moves through to complete a task
- **Quiz Session**: The active period from when a Student starts a quiz until submission or timeout
- **Anti-Cheat System**: The collection of security features that detect and prevent cheating during Quiz Sessions
- **Question Shuffling**: The process of randomizing the order of questions presented to Students
- **Choice Shuffling**: The process of randomizing the order of answer options for multiple-choice questions
- **Browser Lockdown**: Security restrictions that limit browser functionality during Quiz Sessions
- **Focus Loss**: When the Quiz Platform detects the user has switched away from the quiz interface
- **Violation**: A detected instance of suspicious behavior during a Quiz Session
- **Responsive Design**: User interface that adapts to different screen sizes and device types
- **Mobile Device**: Smartphones and tablets with touch interfaces and screen widths typically below 768 pixels
- **Desktop Device**: Computers with keyboard, mouse, and screen widths typically above 768 pixels
- **Copy/Paste Operation**: User actions involving text selection, copying (Ctrl+C), or pasting (Ctrl+V)
- **Context Menu**: The right-click menu that appears in web browsers
- **Full-Screen Mode**: A browser display state where the Quiz Platform occupies the entire screen
- **Screenshot**: A captured image of the screen content taken by the user
- **Print Screen**: A keyboard key or shortcut used to capture screenshots
- **Screen Recording**: Video capture of screen content during a Quiz Session
- **Real-Time Synchronization**: Immediate data updates across all connected clients without page refresh
- **WebSocket**: A communication protocol for real-time bidirectional data transfer
- **Violation Counter**: A numeric value tracking the total number of violations for a quiz attempt, persisted on the server
- **Deterrent Warning**: A message displayed to discourage prohibited behavior even when technical detection is not possible

### Requ
irement 11: Screenshot Detection

**User Story:** As an Admin, I want to detect when students attempt to take screenshots during quizzes, so that I can identify potential content sharing and cheating attempts.

#### Acceptance Criteria

1. WHEN a Student presses the Print Screen key on a Desktop Device during a quiz, THE Quiz System SHALL detect the key press within 100 milliseconds
2. WHEN a screenshot is detected, THE Quiz System SHALL increment the Violation Counter by one
3. WHEN a screenshot is detected, THE Quiz System SHALL display a warning message to the Student
4. THE Quiz System SHALL log each screenshot attempt with a timestamp and device information
5. WHEN a Student uses clipboard operations after a Print Screen event, THE Quiz System SHALL detect and log the clipboard access
6. THE Quiz System SHALL monitor for common screenshot keyboard shortcuts across different operating systems (Print Screen, Cmd+Shift+3, Cmd+Shift+4)

### Requirement 12: Screen Recording Detection

**User Story:** As an Admin, I want to detect when students attempt to record their screen during quizzes, so that I can prevent video sharing of quiz content.

#### Acceptance Criteria

1. WHEN a Student starts a quiz, THE Quiz System SHALL check for active screen recording using available browser APIs
2. WHEN screen recording is detected during a Quiz Session, THE Quiz System SHALL increment the Violation Counter by one
3. WHEN screen recording is detected, THE Quiz System SHALL display a prominent warning to stop recording
4. THE Quiz System SHALL continuously monitor for screen recording throughout the Quiz Session
5. WHEN screen recording cannot be detected due to browser limitations, THE Quiz System SHALL display a deterrent warning that recording is monitored
6. THE Quiz System SHALL log all screen recording detection events with timestamps

### Requirement 13: Mobile Screenshot Deterrent

**User Story:** As an Admin, I want to display warnings about screenshot monitoring on mobile devices, so that students are deterred from taking screenshots even when technical detection is not possible.

#### Acceptance Criteria

1. WHEN a Student starts a quiz on a Mobile Device, THE Quiz System SHALL display a prominent warning that screenshots are monitored
2. THE Quiz System SHALL display periodic reminders during the quiz that screenshot attempts are violations
3. WHEN a Student uses a Mobile Device, THE Quiz System SHALL display the screenshot warning before quiz start and require acknowledgment
4. THE Quiz System SHALL include screenshot policy information in the quiz instructions
5. THE Quiz System SHALL log that the Student acknowledged the screenshot policy

### Requirement 14: Real-Time Data Synchronization

**User Story:** As an Admin, I want all quiz data changes to reflect in real-time across all connected clients, so that I can monitor active quiz sessions and see violations as they occur.

#### Acceptance Criteria

1. WHEN a violation is logged during a Quiz Session, THE Quiz System SHALL update the violation count in real-time for all Admin viewers within 2 seconds
2. WHEN an Admin views the security violations dashboard, THE Quiz System SHALL display new violations as they occur without requiring page refresh
3. WHEN a Student submits a quiz, THE Quiz System SHALL update the results dashboard in real-time for Admins within 2 seconds
4. WHEN an Admin edits a quiz, THE Quiz System SHALL reflect changes to all users viewing that quiz within 2 seconds
5. WHEN an Admin deletes a quiz or quiz attempt, THE Quiz System SHALL remove it from all connected client views within 2 seconds
6. THE Quiz System SHALL use WebSocket connections or real-time database subscriptions for data synchronization
7. WHEN a real-time connection is lost, THE Quiz System SHALL attempt to reconnect automatically and display connection status to users

### Requirement 15: Violation Count Persistence

**User Story:** As an Admin, I want violation counts to persist accurately across tab switches and page refreshes, so that students cannot reset their violation count by refreshing the page.

#### Acceptance Criteria

1. WHEN a Student refreshes the quiz page during a Quiz Session, THE Quiz System SHALL restore the current Violation Counter from the server
2. WHEN a Student closes and reopens the quiz tab, THE Quiz System SHALL maintain the Violation Counter for that attempt
3. THE Quiz System SHALL store the Violation Counter on the server and synchronize with the client every 5 seconds
4. WHEN the Violation Counter reaches the maximum threshold, THE Quiz System SHALL prevent the Student from continuing the quiz even after page refresh
5. THE Quiz System SHALL display the current Violation Counter to the Student at all times during the quiz
6. WHEN a Quiz Session is resumed, THE Quiz System SHALL display all previous violations to the Student
