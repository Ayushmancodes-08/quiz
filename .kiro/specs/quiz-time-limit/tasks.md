# Implementation Plan

- [ ] 1. Update database schema for time limits
  - Add time_limit_minutes column to quizzes table with CHECK constraint (1-480)
  - Add start_time, actual_time_seconds, auto_submitted, and is_late columns to quiz_attempts table
  - Create time_metrics table with indexes
  - Write database migration script
  - _Requirements: 1.4, 2.2_

- [ ] 2. Implement server-side time validation service
  - [ ] 2.1 Create TimeValidator service
    - Implement validateSubmission() method to check submission time against server time
    - Implement calculateActualTime() to compute time taken
    - Implement isLateSubmission() to check if submission is after time limit
    - Add 30-second grace period for late submissions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 2.2 Add time validation to quiz submission endpoint
    - Validate submission time on server
    - Flag late submissions
    - Reject submissions > 30 seconds late
    - Log time discrepancies for security review
    - _Requirements: 6.1, 6.5_

- [ ] 3. Implement time synchronization service
  - Create TimeSyncService with server time offset calculation
  - Implement getCurrentTime() using server offset
  - Add syncWithServer() method with latency compensation
  - Implement periodic sync every 60 seconds
  - Add drift detection (threshold: 5 seconds)
  - Handle time zone differences using UTC
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4. Create countdown timer component
  - [ ] 4.1 Build CountdownTimer React component
    - Accept startTime, timeLimitMinutes, and callback props
    - Calculate time remaining: (startTime + timeLimit) - currentTime
    - Update display every second counting DOWN to 00:00
    - Format as MM:SS for < 60 minutes, HH:MM:SS for >= 60 minutes
    - _Requirements: 3.1, 3.2, 3.6, 3.7_

  - [ ] 4.2 Implement status-based styling
    - Normal styling when > 5 minutes remaining
    - Warning styling (yellow/orange) when <= 5 minutes
    - Critical styling (red) when <= 1 minute
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ] 4.3 Add timer callbacks
    - Trigger onWarning callback at 5 minutes
    - Trigger onWarning callback at 1 minute
    - Trigger onTimeExpired callback at 00:00
    - _Requirements: 5.1, 5.2, 4.1_

  - [ ] 4.4 Make timer mobile-responsive
    - Fixed position at top of quiz interface
    - Remains visible while scrolling
    - Readable on screens as small as 320px wide
    - _Requirements: 10.1, 10.2_

- [ ] 5. Implement auto-submit functionality
  - [ ] 5.1 Create AutoSubmitHandler
    - Trigger when countdown reaches 00:00
    - Collect all current answers
    - Mark unanswered questions as incomplete
    - Call quiz submission API
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 5.2 Add auto-submit error handling
    - Implement retry logic (3 attempts with exponential backoff)
    - Cache answers locally to prevent data loss
    - Show error message if all retries fail
    - _Requirements: 4.1_

  - [ ] 5.3 Prevent further modifications after auto-submit
    - Disable answer inputs after auto-submit
    - Show time expired notification
    - Display auto-submit indicator
    - _Requirements: 4.4, 4.5_

- [ ] 6. Add time limit configuration to admin quiz form
  - Add optional time_limit_minutes input field to quiz creation form
  - Add validation: must be integer between 1 and 480 minutes
  - Display current time limit in quiz edit form
  - Allow modification of time limit
  - Show time limit in quiz list/details
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 7. Update quiz start API endpoint
  - Record server start time when quiz attempt created
  - Store start_time in quiz_attempts table
  - Return startTime and timeLimitMinutes to client
  - Calculate expiration time on server
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 8. Implement quiz resume with time continuation
  - [ ] 8.1 Add resume logic to quiz component
    - Retrieve original start time from server on resume
    - Calculate time remaining based on server time
    - Initialize countdown with correct remaining time
    - _Requirements: 8.1, 8.2_

  - [ ] 8.2 Handle expired time on resume
    - Check if time already expired during absence
    - Auto-submit quiz immediately if time expired
    - Show time expired message
    - _Requirements: 8.3_

  - [ ] 8.3 Maintain accuracy during offline periods
    - Continue server-side time tracking
    - Verify quiz attempt is still valid
    - Update countdown on reconnection
    - _Requirements: 8.4, 8.5_

- [ ] 9. Add time expiration warnings
  - Display warning notification at 5 minutes remaining
  - Display critical warning at 1 minute remaining
  - Make notifications dismissible without disrupting quiz
  - Ensure warnings visible on desktop and mobile
  - Add optional audio alert for warnings
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10. Implement mobile-specific time handling
  - Handle mobile browser background/foreground transitions
  - Detect device sleep and continue server-side tracking
  - Update countdown immediately on device wake
  - Ensure countdown continues accurately during sleep
  - _Requirements: 10.3, 10.4, 10.5_

- [ ] 11. Create time logger service
  - [ ] 11.1 Implement TimeLogger service
    - Create logAttemptTime() method to record actual time taken
    - Store auto_submitted flag with attempt
    - Store is_late flag for late submissions
    - Write to time_metrics table
    - _Requirements: 9.1, 9.2_

  - [ ] 11.2 Calculate time metrics
    - Implement getTimeMetrics() for aggregate statistics
    - Calculate average and median completion time
    - Calculate time limit utilization percentage
    - Calculate auto-submit rate
    - Count attempts using > 90% of time
    - _Requirements: 9.3, 9.4_

- [ ] 12. Build admin time reporting interface
  - Display actual time taken for each quiz attempt in results
  - Show auto-submit indicator for auto-submitted attempts
  - Highlight attempts that used > 90% of available time
  - Add filter to view only auto-submitted attempts
  - Show aggregate time statistics for quiz
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Add time sync to quiz component
  - Initialize time sync service on quiz start
  - Sync with server every 60 seconds during quiz
  - Adjust countdown if drift > 5 seconds detected
  - Handle sync failures gracefully
  - Log sync errors for admin review
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 14. Implement countdown timer integration
  - Add countdown timer to quiz interface
  - Connect timer to time sync service
  - Wire up auto-submit handler to timer expiration
  - Connect warning callbacks to notification system
  - Ensure timer cleans up on quiz completion
  - _Requirements: 3.1, 3.2, 4.1_

- [ ] 15. Add client-side error handling
  - Handle countdown timer initialization failures
  - Implement timer restart on update failures
  - Handle auto-submit failures with retries
  - Show user-friendly error messages
  - Cache answers locally to prevent data loss
  - _Requirements: 4.1, 6.1_

- [ ] 16. Add server-side error handling
  - Handle missing start time in validation
  - Log time calculation errors
  - Implement graceful degradation for validation failures
  - Retry failed database writes
  - Return clear error messages to client
  - _Requirements: 6.1, 6.2_

- [ ] 17. Optimize performance
  - Use single setInterval for countdown updates
  - Clear intervals on component unmount
  - Only re-render when display time changes
  - Minimize mobile battery usage
  - Batch time sync with other API calls
  - Index database columns for time queries
  - _Requirements: 3.2, 10.1_

- [ ] 18. Create comprehensive test suite
  - [ ] 18.1 Write unit tests for countdown timer
    - Test countdown from various time limits
    - Test formatting (MM:SS and HH:MM:SS)
    - Test status changes (normal, warning, critical)
    - Test callback triggers at 5 min, 1 min, 0:00
    - Test display updates every second
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 18.2 Write unit tests for time synchronization
    - Test server time offset calculation
    - Test drift detection and adjustment
    - Test periodic sync intervals
    - Test latency compensation
    - Test time zone handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 18.3 Write unit tests for auto-submit handler
    - Test trigger on countdown expiration
    - Test answer collection
    - Test submission retry logic
    - Test error handling
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 18.4 Write unit tests for time validator
    - Test valid submissions
    - Test late submissions (within grace period)
    - Test rejected submissions (beyond grace period)
    - Test time calculation accuracy
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 18.5 Write integration tests for quiz flow
    - Test quiz start with time limit
    - Test countdown display during quiz
    - Test submission before time expires
    - Test time recorded accurately
    - _Requirements: 2.1, 3.1, 6.1_

  - [ ] 18.6 Write integration tests for auto-submit
    - Test quiz with short time limit
    - Test countdown reaches 00:00
    - Test auto-submit triggers correctly
    - Test answers saved correctly
    - Test auto-submit flag set
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 18.7 Write integration tests for quiz resume
    - Test quiz start and browser close
    - Test resume with countdown continuation
    - Test expired time on resume triggers auto-submit
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 18.8 Write tests for time manipulation prevention
    - Test client time modification attempts
    - Test server validation rejects manipulation
    - Test time discrepancies logged
    - _Requirements: 6.1, 6.5_

  - [ ] 18.9 Write mobile-specific tests
    - Test fixed position while scrolling
    - Test readability on 320px screens
    - Test orientation changes
    - Test background/foreground transitions
    - Test device sleep/wake handling
    - Test on iOS Safari and Android Chrome
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 19. Add monitoring and analytics
  - Track time limit usage statistics
  - Monitor completion metrics (time taken vs limit)
  - Track auto-submit rate
  - Monitor time sync latency and drift
  - Set up alerts for high auto-submit rates
  - Set up alerts for time sync failures
  - _Requirements: 9.3_
