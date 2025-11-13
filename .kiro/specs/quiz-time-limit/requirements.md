# Requirements Document

## Introduction

This document specifies requirements for implementing configurable time limits on quizzes. The system shall allow administrators to set optional time constraints for quizzes, automatically submit quiz attempts when time expires, and provide clear visual feedback to students about remaining time through a countdown timer. This feature enhances quiz integrity by preventing unlimited time for research while maintaining flexibility for different assessment types.

## Glossary

- **Quiz System**: The web-based quiz application that presents questions to students and records their responses
- **Admin**: A user who creates and manages quizzes in the Quiz System
- **Student**: A user taking a quiz through the Quiz System
- **Time Limit**: The maximum duration in minutes that a Student has to complete a quiz
- **Countdown Timer**: A visual component that displays the remaining time counting down from the Time Limit to zero
- **Auto-Submit**: The automatic submission of a quiz attempt when the countdown reaches zero
- **Grace Period**: A brief additional time window after Time Limit expiration before forced submission
- **Time Remaining**: The calculated difference between current time and quiz expiration time, displayed in descending order
- **Quiz Attempt**: A single instance of a Student taking a quiz, tracked from start to completion
- **Server Time**: The authoritative timestamp maintained on the backend server
- **Client Time**: The timestamp displayed in the user's browser
- **Time Synchronization**: The process of aligning Client Time with Server Time for accurate countdown

## Requirements

### Requirement 1: Admin Time Limit Configuration

**User Story:** As an Admin, I want to set an optional time limit when creating a quiz, so that I can control how long students have to complete the assessment.

#### Acceptance Criteria

1. WHEN an Admin creates a new quiz, THE Quiz System SHALL provide an optional time limit input field measured in minutes
2. WHEN an Admin leaves the time limit field empty, THE Quiz System SHALL create a quiz with no time restrictions
3. WHEN an Admin enters a time limit value, THE Quiz System SHALL validate that the value is a positive integer between 1 and 480 minutes
4. WHEN an Admin saves a quiz with a time limit, THE Quiz System SHALL store the time limit value in the database
5. WHEN an Admin edits an existing quiz, THE Quiz System SHALL display the current time limit value and allow modification

### Requirement 2: Quiz Start Time Recording

**User Story:** As a Student, I want my quiz start time to be accurately recorded, so that the time limit is enforced fairly from when I begin the quiz.

#### Acceptance Criteria

1. WHEN a Student clicks the start quiz button, THE Quiz System SHALL record the Server Time as the quiz start timestamp
2. THE Quiz System SHALL store the start timestamp with the Quiz Attempt record in the database
3. WHEN a Student refreshes the page during a quiz, THE Quiz System SHALL retrieve the original start timestamp from the server
4. THE Quiz System SHALL calculate Time Remaining based on Server Time to prevent client-side manipulation
5. WHEN a Student starts a quiz with a time limit, THE Quiz System SHALL send the start time and time limit to the client for countdown display

### Requirement 3: Countdown Timer Display

**User Story:** As a Student, I want to see a countdown timer showing how much time I have remaining, so that I can pace myself appropriately during the quiz.

#### Acceptance Criteria

1. WHEN a Student is taking a timed quiz, THE Quiz System SHALL display the Countdown Timer prominently at the top of the quiz interface
2. THE Quiz System SHALL update the Countdown Timer display every second counting down from the Time Limit to zero
3. WHEN Time Remaining is greater than 5 minutes, THE Quiz System SHALL display the timer in normal styling
4. WHEN Time Remaining is 5 minutes or less, THE Quiz System SHALL display the timer in warning color (yellow/orange)
5. WHEN Time Remaining is 1 minute or less, THE Quiz System SHALL display the timer in critical color (red)
6. THE Quiz System SHALL format the countdown display as "MM:SS" for times under 60 minutes and "HH:MM:SS" for longer durations
7. THE Quiz System SHALL count down continuously from the assigned time limit to 00:00

### Requirement 4: Automatic Quiz Submission

**User Story:** As an Admin, I want quizzes to automatically submit when the countdown reaches zero, so that students cannot continue working beyond the allowed time.

#### Acceptance Criteria

1. WHEN the Countdown Timer reaches 00:00, THE Quiz System SHALL automatically submit the Quiz Attempt within 2 seconds
2. WHEN auto-submit occurs, THE Quiz System SHALL save all answered questions up to that point
3. WHEN auto-submit occurs, THE Quiz System SHALL mark unanswered questions as incomplete
4. THE Quiz System SHALL display a notification to the Student indicating that time has expired and the quiz was auto-submitted
5. WHEN auto-submit is triggered, THE Quiz System SHALL prevent any further answer modifications

### Requirement 5: Time Expiration Warnings

**User Story:** As a Student, I want to receive warnings as the countdown approaches zero, so that I am aware when I need to finish quickly.

#### Acceptance Criteria

1. WHEN the Countdown Timer reaches 5 minutes remaining, THE Quiz System SHALL display a warning notification to the Student
2. WHEN the Countdown Timer reaches 1 minute remaining, THE Quiz System SHALL display a critical warning notification to the Student
3. THE Quiz System SHALL make warning notifications dismissible without disrupting quiz interaction
4. THE Quiz System SHALL ensure warning notifications are visible on both desktop and mobile devices
5. THE Quiz System SHALL play a subtle audio alert when displaying time warnings if the Student has not muted notifications

### Requirement 6: Server-Side Time Validation

**User Story:** As an Admin, I want time limits to be enforced on the server, so that students cannot manipulate client-side timers to gain extra time.

#### Acceptance Criteria

1. WHEN a Student submits a quiz, THE Quiz System SHALL validate the submission time against the Server Time
2. WHEN a submission occurs after the Time Limit has expired, THE Quiz System SHALL accept the submission but flag it as late
3. THE Quiz System SHALL calculate the actual time taken based on Server Time timestamps
4. WHEN a Student attempts to submit more than 30 seconds after expiration, THE Quiz System SHALL reject the submission
5. THE Quiz System SHALL log any discrepancies between client-reported time and Server Time for security review

### Requirement 7: Time Synchronization

**User Story:** As a Student, I want the countdown timer to be accurate regardless of my device's clock settings, so that I receive fair time allocation.

#### Acceptance Criteria

1. WHEN a quiz starts, THE Quiz System SHALL synchronize Client Time with Server Time within 1 second
2. THE Quiz System SHALL periodically re-synchronize time every 60 seconds during the quiz
3. WHEN time synchronization detects a significant drift (more than 5 seconds), THE Quiz System SHALL adjust the displayed countdown
4. THE Quiz System SHALL handle time zone differences automatically using UTC timestamps
5. WHEN network latency affects synchronization, THE Quiz System SHALL account for round-trip time in calculations

### Requirement 8: Quiz Resume with Time Continuation

**User Story:** As a Student, I want the countdown timer to continue from where it left off if I accidentally close the browser, so that I don't lose my progress or remaining time.

#### Acceptance Criteria

1. WHEN a Student returns to an in-progress timed quiz, THE Quiz System SHALL calculate Time Remaining based on the original start time
2. THE Quiz System SHALL display the correct countdown immediately upon quiz resume
3. WHEN Time Remaining has already expired during the absence, THE Quiz System SHALL auto-submit the quiz upon return
4. THE Quiz System SHALL maintain countdown accuracy even if the Student was offline temporarily
5. WHEN a Student resumes a quiz, THE Quiz System SHALL verify the Quiz Attempt is still valid before allowing continuation

### Requirement 9: Admin Time Limit Reporting

**User Story:** As an Admin, I want to see how long students took to complete quizzes, so that I can analyze whether time limits are appropriate.

#### Acceptance Criteria

1. WHEN an Admin views quiz results, THE Quiz System SHALL display the actual time taken for each Quiz Attempt
2. THE Quiz System SHALL indicate whether a Quiz Attempt was auto-submitted due to time expiration
3. WHEN an Admin views aggregate quiz statistics, THE Quiz System SHALL show average completion time and time limit utilization
4. THE Quiz System SHALL highlight Quiz Attempts that used more than 90% of the available time
5. THE Quiz System SHALL provide filtering options to view only auto-submitted attempts

### Requirement 10: Mobile Timer Responsiveness

**User Story:** As a Student using a mobile device, I want the countdown timer to remain visible and functional, so that I can track my time on any device.

#### Acceptance Criteria

1. WHEN a Student takes a timed quiz on a mobile device, THE Quiz System SHALL display the Countdown Timer in a fixed position that remains visible while scrolling
2. THE Quiz System SHALL ensure the countdown display is readable on screens as small as 320 pixels wide
3. WHEN a mobile device goes to sleep during a quiz, THE Quiz System SHALL continue tracking time on the server
4. WHEN a Student wakes their mobile device, THE Quiz System SHALL immediately update the countdown to show current Time Remaining
5. THE Quiz System SHALL handle mobile browser background/foreground transitions without countdown disruption
