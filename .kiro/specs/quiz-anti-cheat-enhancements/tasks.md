# Implementation Plan

- [ ] 1. Create device detection module
  - Implement device type detection based on screen width, touch support, and user agent
  - Create DeviceDetector interface with isMobile(), isDesktop(), and getDeviceInfo() methods
  - Add caching mechanism for device detection result
  - _Requirements: 7.1, 10.1_

- [ ] 2. Implement mobile-specific anti-cheat hook
  - [ ] 2.1 Create MobileAntiCheat hook with limited detection scope
    - Implement tab switch detection with 1000ms debouncing
    - Add grace period handling for normal mobile app switching
    - Use visibilitychange and blur events with mobile-specific throttling
    - _Requirements: 7.2, 7.6_

  - [ ] 2.2 Implement Circle to Search detection
    - Detect long-press gestures (> 500ms)
    - Monitor for selection overlay patterns
    - Check for Google Lens API indicators
    - Add grace period to prevent false positives from normal text selection
    - _Requirements: 8.1, 8.5, 8.6_

  - [ ] 2.3 Explicitly disable desktop-only detections on mobile
    - Ensure NO headless browser checks run on mobile devices
    - Ensure NO AI extension detection runs on mobile devices
    - Ensure NO screen recording detection runs on mobile devices
    - Ensure NO developer tools detection runs on mobile devices
    - _Requirements: 7.3, 7.4, 7.5, 10.5_

- [ ] 3. Update desktop anti-cheat hook
  - [ ] 3.1 Separate desktop-specific detection logic
    - Keep existing tab switch detection without mobile debouncing
    - Maintain full-screen mode enforcement
    - Keep context menu blocking
    - _Requirements: 3.1, 3.2, 6.1, 6.2, 5.1_

  - [ ] 3.2 Implement advanced desktop-only detections
    - Add headless browser detection (navigator.webdriver, chrome.runtime checks)
    - Implement AI extension detection (DOM mutations, extension ID checks)
    - Add screen recording detection (mediaDevices enumeration)
    - Implement developer tools detection (debugger statements, console checks)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 4. Update quiz initialization to use device-specific hooks
  - Detect device type on quiz start
  - Initialize MobileAntiCheat for mobile devices
  - Initialize DesktopAntiCheat for desktop devices
  - Pass device type to server API for logging
  - _Requirements: 7.1_

- [ ] 5. Implement server-side question randomization
  - [ ] 5.1 Create RandomizationService with Fisher-Yates shuffle
    - Implement selectRandomQuestions() to pick subset from question pool
    - Implement shuffleQuestions() to randomize question order
    - Use cryptographically secure random number generation
    - _Requirements: 1.1, 1.2_

  - [ ] 5.2 Implement answer option shuffling
    - Create shuffleAnswerOptions() method
    - Shuffle each question's answers independently
    - Store correct answer position after shuffling
    - _Requirements: 2.1, 2.2_

  - [ ] 5.3 Store randomization mappings in database
    - Save question order array with quiz attempt
    - Save answer mappings for each question
    - Create database schema for randomization_mappings table
    - _Requirements: 1.3, 2.2_

- [ ] 6. Update quiz API routes for randomization
  - Modify quiz start endpoint to apply randomization before sending to client
  - Store randomization mapping when quiz attempt is created
  - Update quiz submission endpoint to fetch mapping for validation
  - Validate submitted answers against original positions using mapping
  - _Requirements: 1.2, 2.3_

- [ ] 7. Implement violation logging system
  - [ ] 7.1 Create ViolationLogger service
    - Implement logViolation() method with device type tracking
    - Create getViolations() and getViolationCount() methods
    - Add database schema for security_violations table
    - _Requirements: 9.1, 11.1_

  - [ ] 7.2 Update anti-cheat hooks to log violations
    - Call ViolationLogger when tab switch detected
    - Call ViolationLogger when Circle to Search detected (mobile only)
    - Call ViolationLogger for desktop-specific violations
    - Include device type and metadata in violation logs
    - _Requirements: 3.6, 8.4, 10.6_

  - [ ] 7.3 Implement violation counter and auto-submit
    - Track violation count in quiz attempt state
    - Display warning messages when violations detected
    - Auto-submit quiz when violation count reaches threshold (3)
    - Mark quiz attempt as auto-submitted in database
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 8. Create admin violation reporting interface
  - Display violation count prominently in quiz results
  - Show detailed violation log when admin clicks on count
  - Implement filtering to view only flagged attempts
  - Highlight attempts with 3+ violations for review
  - Show device type for each quiz attempt
  - _Requirements: 11.3, 11.4, 11.5, 11.6_

- [ ] 9. Implement copy/paste prevention
  - Block text selection in quiz interface using CSS and JavaScript
  - Prevent Ctrl+C/Cmd+C operations
  - Block Ctrl+V/Cmd+V in answer input fields
  - Allow typing in text fields while blocking paste
  - Apply consistently across desktop and mobile devices
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 10. Implement context menu blocking
  - Prevent right-click context menu from appearing
  - Block keyboard shortcuts for context menu
  - Display brief message when context menu is blocked
  - Restore context menu functionality after quiz completion
  - Log context menu access attempts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Implement full-screen mode enforcement for desktop
  - Request full-screen mode on quiz start for desktop devices
  - Detect full-screen exit within 500ms
  - Increment violation counter when full-screen exited
  - Display warning and prompt to re-enter full-screen
  - Allow mobile devices to decline full-screen without penalty
  - Handle browsers that don't support full-screen gracefully
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 12. Implement cross-browser compatibility handling
  - Add feature detection for all anti-cheat APIs
  - Implement graceful degradation when features unavailable
  - Display browser compatibility notice for limited support browsers
  - Test on Chrome, Edge, Firefox, and Safari
  - Ensure core features (focus detection, copy prevention) work on all browsers
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 13. Optimize performance and user experience
  - Implement event throttling to limit handler frequency
  - Add lazy loading for anti-cheat modules
  - Ensure mobile detection overhead is < 10ms per check
  - Display non-intrusive warnings that don't block quiz interface
  - Clean up event listeners on quiz completion
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 14. Update database schema
  - Add device_type column to quiz_attempts table
  - Add question_order and answer_mappings columns to quiz_attempts
  - Create security_violations table with device_type and metadata columns
  - Add indexes for efficient violation queries
  - Create migration scripts for schema updates
  - _Requirements: 1.3, 2.2, 9.1, 11.1_

- [ ] 15. Add mobile-specific UI adaptations
  - Ensure warning messages are readable on 320px wide screens
  - Make violation warnings dismissible without disrupting quiz
  - Adapt full-screen prompts for mobile browser limitations
  - Test UI on various mobile screen sizes
  - _Requirements: 7.8_

- [ ] 16. Create comprehensive test suite
  - [ ] 16.1 Write unit tests for device detection
    - Test mobile detection accuracy
    - Test desktop detection accuracy
    - Test edge cases (tablets, hybrid devices)
    - _Requirements: 7.1_

  - [ ] 16.2 Write unit tests for mobile anti-cheat
    - Test tab switch detection with debouncing
    - Test Circle to Search detection
    - Verify NO headless browser checks on mobile
    - Verify NO AI extension checks on mobile
    - Test grace period handling
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 16.3 Write unit tests for desktop anti-cheat
    - Test all detection methods
    - Test violation counting
    - Test auto-submit trigger
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 16.4 Write integration tests for randomization
    - Test question selection randomness
    - Test answer shuffling
    - Test mapping storage and retrieval
    - Test validation against original positions
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 16.5 Write mobile-specific tests
    - Test false positive prevention
    - Test normal app switching doesn't trigger immediate violations
    - Test screen rotation doesn't cause violations
    - Test on iOS Safari and Android Chrome
    - _Requirements: 7.6, 8.6_

- [ ] 17. Add monitoring and analytics
  - Track violation rates by device type
  - Monitor most common violation types
  - Track performance metrics (initialization time, detection overhead)
  - Monitor device distribution (mobile vs desktop)
  - Set up alerts for unusual violation spikes
  - _Requirements: 10.1, 10.2_
