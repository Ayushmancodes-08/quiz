# Implementation Plan

- [ ] 1. Set up complete routing structure and navigation
  - Create all missing route files following Next.js App Router conventions
  - Implement route protection middleware for authenticated and admin routes
  - Add navigation components with active state indicators
  - _Requirements: Complete routing structure for Quiz Platform_

- [ ] 2. Implement server-side question and choice shuffling
- [ ] 2.1 Create database schema for shuffled questions
  - Add shuffled_questions table migration
  - Add indexes for performance optimization
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 2.2 Implement question selection and shuffling algorithm
  - Write server-side function to randomly select questions from pool
  - Implement Fisher-Yates shuffle algorithm for question ordering
  - Store shuffled order in database with attempt_id
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 2.3 Implement choice shuffling for multiple-choice questions
  - Write server-side function to shuffle answer options
  - Store correct answer position with shuffled choices
  - Ensure shuffling is independent for each question
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 2.4 Create API endpoint for quiz start with shuffling
  - Implement POST /api/quiz/start endpoint
  - Return shuffled questions and choices to client
  - Include anti-cheat configuration in response
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 3. Build quiz taking interface with anti-cheat integration
- [ ] 3.1 Create QuizTakingInterface component
  - Build question display with navigation controls
  - Implement answer selection and storage
  - Add timer display and auto-submit on timeout
  - Integrate with shuffled question data
  - _Requirements: 1.3, 1.4, 2.3, 2.4_

- [ ] 3.2 Implement useQuizSession hook
  - Manage quiz state (current question, answers, time)
  - Handle quiz start, answer submission, and quiz submission
  - Track violations and integrate with anti-cheat
  - _Requirements: 1.3, 2.3_

- [ ] 3.3 Create quiz submission API endpoint
  - Implement POST /api/quiz/submit endpoint
  - Validate answers against stored correct positions
  - Calculate score and store results
  - Handle violation data from client
  - _Requirements: 2.3, 2.4_

- [ ] 4. Implement anti-cheat monitoring system
- [ ] 4.1 Create useAntiCheat hook
  - Implement focus loss detection with visibility API
  - Track violation count and types
  - Provide methods to start/stop monitoring
  - Log violations to server in real-time
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 4.2 Implement copy/paste blocking
  - Disable text selection in quiz interface
  - Block Ctrl+C, Cmd+C, Ctrl+V, Cmd+V keyboard events
  - Allow typing in input fields while blocking paste
  - Log copy/paste attempts as violations
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 4.3 Implement context menu blocking
  - Prevent right-click context menu from appearing
  - Block keyboard shortcuts for context menu
  - Display brief message when blocked
  - Log context menu attempts
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 4.4 Implement full-screen mode enforcement
  - Request full-screen on quiz start for desktop
  - Detect full-screen exit events
  - Increment violation counter on exit
  - Show warning and prompt to re-enter full-screen
  - Handle mobile devices gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 4.5 Create security violation logging API
  - Implement POST /api/security/log endpoint
  - Store violations in security_violations table
  - Return current violation count and termination flag
  - Implement auto-submit when max violations reached
  - _Requirements: 3.6, 9.1, 9.2_

- [ ] 4.6 Implement screenshot detection for desktop
  - Create useScreenshotDetection hook
  - Monitor Print Screen key press events
  - Detect common screenshot keyboard shortcuts (Win+Shift+S, Cmd+Shift+3/4)
  - Monitor clipboard for image paste events
  - Log screenshot attempts as violations
  - Display warning when screenshot detected
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 4.7 Implement screen recording detection
  - Use getDisplayMedia API to detect active screen recording
  - Implement continuous monitoring (every 5 seconds)
  - Log screen recording detection as violations
  - Display prominent warning to stop recording
  - Show deterrent warning on browsers without detection support
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 4.8 Create mobile screenshot deterrent system
  - Build MobileScreenshotWarning component
  - Display warning before quiz start on mobile devices
  - Require acknowledgment before allowing quiz to begin
  - Show periodic reminders during quiz
  - Log policy acknowledgment in database
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 5. Implement device detection and responsive adaptations
- [ ] 5.1 Create useDeviceDetection hook
  - Detect device type (mobile, tablet, desktop)
  - Identify browser and OS
  - Detect touch capability
  - Return screen dimensions
  - _Requirements: 7.1, 7.2_

- [ ] 5.2 Adapt anti-cheat features for mobile devices
  - Disable keyboard-specific restrictions on mobile
  - Adapt full-screen enforcement for mobile browsers
  - Maintain focus loss detection for app switching
  - Ensure copy/paste prevention works on touch devices
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 5.3 Implement responsive UI for quiz interface
  - Create mobile-optimized question display
  - Ensure touch targets are minimum 44x44px
  - Implement responsive navigation controls
  - Test on screens as small as 320px wide
  - _Requirements: 7.6, 10.3_

- [ ] 6. Build admin features for quiz management
- [ ] 6.1 Create quiz creation and editing pages
  - Implement /admin/quizzes/create route and form
  - Implement /admin/quizzes/[id]/edit route and form
  - Add question and choice management UI
  - Include anti-cheat configuration options
  - _Requirements: Admin quiz management_

- [ ] 6.2 Implement security violations dashboard
  - Create /admin/security-logs page
  - Display violation summary with filtering
  - Show detailed violation logs per attempt
  - Highlight attempts with high violation counts
  - _Requirements: 9.3, 9.4, 9.5, 9.6_

- [ ] 6.3 Create quiz results review interface
  - Implement /admin/results page with all attempts
  - Create /admin/results/[attemptId] detailed view
  - Display questions in order presented to student
  - Show answer choices in shuffled order
  - Include violation data in review
  - _Requirements: 1.4, 2.4, 9.3, 9.4_

- [ ] 7. Implement student-facing features
- [ ] 7.1 Create student dashboard
  - Display available quizzes
  - Show past quiz attempts and scores
  - Add quiz start buttons with confirmation
  - _Requirements: Student dashboard navigation_

- [ ] 7.2 Implement quiz review page for students
  - Create /quiz/review/[attemptId] route
  - Display score and correct/incorrect answers
  - Show questions and choices as they were presented
  - Include feedback and explanations if available
  - _Requirements: 1.4, 2.4_

- [ ] 7.3 Create security violation warning page
  - Implement /security-violation route
  - Display clear explanation of violations
  - Show current violation count
  - Provide option to return to quiz or exit
  - _Requirements: 3.4, 6.4_

- [ ] 8. Implement cross-browser compatibility
- [ ] 8.1 Add browser feature detection
  - Detect support for Fullscreen API
  - Detect support for Visibility API
  - Detect support for Clipboard API
  - Provide fallbacks for unsupported features
  - _Requirements: 8.1, 8.2, 8.5_

- [ ] 8.2 Implement graceful degradation
  - Continue quiz operation when features unavailable
  - Display compatibility notices for limited browsers
  - Log browser limitations for admin awareness
  - Maintain core anti-cheat across all browsers
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 9. Add performance optimizations
- [ ] 9.1 Optimize anti-cheat event processing
  - Implement debouncing for high-frequency events
  - Batch violation logs to reduce API calls
  - Ensure <50ms processing overhead per event
  - _Requirements: 10.1, 10.3_

- [ ] 9.2 Optimize page load and navigation
  - Implement code splitting for routes
  - Lazy load non-critical components
  - Preload quiz data on dashboard
  - Optimize bundle size for mobile
  - _Requirements: 10.2, 10.3_

- [ ] 9.3 Optimize database queries
  - Add indexes for frequently queried fields
  - Implement query result caching where appropriate
  - Use database transactions for data consistency
  - _Requirements: Performance optimization_

- [ ] 9.4 Implement real-time data synchronization
  - Set up Supabase Realtime channels for quiz attempts
  - Create useRealtimeViolations hook for live violation monitoring
  - Implement useRealtimeQuizResults hook for admin dashboard
  - Create useRealtimeViolationCount hook for persistent count sync
  - Add connection status monitoring and reconnection logic
  - Display connection status indicator to users
  - Sync violation count from server every 5 seconds
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

- [ ] 9.5 Implement violation count persistence
  - Store violation count on server with each quiz attempt
  - Restore violation count from server on page refresh
  - Prevent quiz continuation when max violations exceeded (even after refresh)
  - Display current violation count to student at all times
  - Show violation history when quiz session is resumed
  - Synchronize client and server violation counts continuously
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 10. Write comprehensive tests
- [ ] 10.1 Write unit tests for core functions
  - Test shuffling algorithms (question and choice)
  - Test validation logic for answers
  - Test device detection logic
  - Test violation tracking logic
  - _Requirements: All requirements_

- [ ] 10.2 Write integration tests for API endpoints
  - Test /api/quiz/start with shuffling
  - Test /api/quiz/submit with validation
  - Test /api/security/log with violation tracking
  - _Requirements: All requirements_

- [ ] 10.3 Write end-to-end tests for user flows
  - Test complete quiz taking flow with anti-cheat
  - Test admin quiz creation and management
  - Test violation detection and auto-submit
  - Test mobile responsive behavior
  - _Requirements: All requirements_

- [ ] 11. Final integration and polish
- [ ] 11.1 Integrate all components and routes
  - Wire up navigation between all pages
  - Ensure consistent styling across routes
  - Add loading states and error boundaries
  - Test complete user journeys
  - _Requirements: All requirements_

- [ ] 11.2 Add error handling and user feedback
  - Implement toast notifications for actions
  - Add error messages for failed operations
  - Provide clear instructions for anti-cheat warnings
  - Handle network errors with retry logic
  - _Requirements: 10.4, Error handling_

- [ ] 11.3 Perform security audit
  - Review server-side validation
  - Test for XSS and SQL injection vulnerabilities
  - Verify secure token storage
  - Test rate limiting on API endpoints
  - _Requirements: Security considerations_

- [ ] 11.4 Conduct cross-browser and device testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test on iOS and Android devices
  - Test on various screen sizes (320px to 1920px+)
  - Verify anti-cheat features work consistently
  - _Requirements: 8.1, 7.6, Mobile responsiveness_

- [ ] 12. Implement cleanup and maintenance processes
- [x] 12.1 Create quiz attempt cleanup utilities



  - Write function to clean up abandoned quiz attempts (not submitted after time limit + grace period)
  - Implement automatic marking of timed-out attempts as incomplete
  - Create API endpoint for manual cleanup trigger by admins
  - Add scheduled job configuration for automatic cleanup
  - _Requirements: Data integrity and maintenance_

- [ ] 12.2 Implement security violation data retention
  - Create function to archive old security violations (older than retention period)
  - Implement automatic deletion of archived violations after extended period
  - Add admin configuration for retention periods
  - Ensure compliance with privacy policies
  - _Requirements: 9.1, 9.2, Privacy considerations_

- [ ] 12.3 Create database cleanup scripts
  - Write migration to add cleanup-related indexes
  - Implement function to remove orphaned shuffled_questions records
  - Create function to clean up student_answers without valid attempts
  - Add function to vacuum and optimize database tables
  - _Requirements: Database maintenance_

- [ ] 12.4 Build admin cleanup dashboard
  - Create /admin/maintenance page for cleanup operations
  - Display statistics on orphaned records and old data
  - Add manual trigger buttons for cleanup operations
  - Show cleanup history and logs
  - _Requirements: Admin maintenance tools_

- [ ] 13. Implement data rectification and recovery processes
- [ ] 13.1 Create quiz attempt rectification utilities
  - Write function to recalculate scores for quiz attempts
  - Implement function to fix incorrect answer validations
  - Create utility to update violation counts from logs
  - Add function to restore accidentally deleted attempts (soft delete)
  - _Requirements: Data integrity and recovery_

- [ ] 13.2 Implement question and choice correction tools
  - Create function to update correct answers for questions
  - Implement batch update for question text corrections
  - Add utility to fix shuffled choice mappings
  - Create function to re-shuffle and update existing attempts if needed
  - _Requirements: Data correction and maintenance_

- [ ] 13.3 Build violation log rectification
  - Write function to merge duplicate violation entries
  - Implement utility to correct violation timestamps
  - Create function to reclassify violation types
  - Add bulk delete for false positive violations
  - _Requirements: 9.1, 9.2, Security log maintenance_

- [ ] 13.4 Create admin rectification interface
  - Implement /admin/rectification page with correction tools
  - Add forms for score recalculation with filters
  - Create interface for bulk question corrections
  - Add violation log management tools
  - Include audit trail for all rectification actions
  - _Requirements: Admin data management_

- [ ] 14. Implement monitoring and health checks
- [ ] 14.1 Create system health check endpoints
  - Implement /api/health endpoint for basic health check
  - Add /api/health/database endpoint for database connectivity
  - Create /api/health/storage endpoint for file storage check
  - Include response time metrics in health checks
  - _Requirements: System monitoring_

- [ ] 14.2 Build data integrity validation
  - Write function to validate quiz attempt data consistency
  - Implement check for orphaned records across tables
  - Create validation for shuffled question mappings
  - Add check for answer validation correctness
  - _Requirements: Data integrity_

- [ ] 14.3 Create automated monitoring dashboard
  - Implement /admin/monitoring page with system metrics
  - Display active quiz sessions count
  - Show database health and performance metrics
  - Add alerts for data integrity issues
  - Include cleanup recommendations
  - _Requirements: System monitoring and maintenance_

- [ ] 15. Implement backup and restore functionality
- [ ] 15.1 Create quiz data export utilities
  - Write function to export quiz with all questions and choices
  - Implement export of quiz attempts with answers and violations
  - Create JSON export format for portability
  - Add CSV export for reporting purposes
  - _Requirements: Data portability_

- [ ] 15.2 Implement quiz data import utilities
  - Write function to import quiz from JSON format
  - Implement validation of imported data structure
  - Create conflict resolution for duplicate quizzes
  - Add preview before import confirmation
  - _Requirements: Data portability_

- [ ] 15.3 Build backup and restore interface
  - Create /admin/backup page for data management
  - Add export buttons for quizzes and attempts
  - Implement import interface with file upload
  - Show backup history and restore points
  - _Requirements: Data backup and recovery_
