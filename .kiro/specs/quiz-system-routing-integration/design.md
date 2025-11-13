# Design Document

## Overview

This design document outlines the architecture for a complete, production-ready quiz system with comprehensive routing, server-side question/answer shuffling, advanced anti-cheat features, and full device responsiveness. The system leverages Next.js 14+ App Router for routing, React hooks for client-side state management, and Supabase for backend data persistence and real-time security monitoring.

The design prioritizes:
- **Security First**: Server-side randomization and comprehensive anti-cheat detection
- **Mobile Responsive**: Adaptive UI and security features for all device types
- **Performance**: Minimal overhead for security monitoring (<50ms per event)
- **User Experience**: Clear warnings and smooth interactions despite security restrictions

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js App Router Pages                              │ │
│  │  - Home, Dashboard, Quiz Taking, Results, Admin        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Components & Hooks                              │ │
│  │  - Anti-Cheat Monitor, Quiz Interface, Navigation      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Client-Side Security Layer                            │ │
│  │  - Focus Detection, Copy/Paste Block, Context Menu     │ │
│  │  - Full-Screen Enforcement, Device Detection           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   Server (Next.js API Routes)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Endpoints                                          │ │
│  │  - /api/quiz/start, /api/quiz/submit                   │ │
│  │  - /api/security/log, /api/security/violations         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Server-Side Logic                                      │ │
│  │  - Question Selection & Shuffling                       │ │
│  │  - Answer Option Shuffling                              │ │
│  │  - Answer Validation, Violation Processing             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                       │
│  - quizzes, questions, quiz_attempts                        │
│  - security_violations, shuffled_questions                  │
│  - user_profiles, quiz_results                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes (Server Actions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context + Hooks
- **Security Monitoring**: Custom React hooks + Server-side logging

## Components and Interfaces

### 1. Routing Structure

Complete route hierarchy for the Quiz Platform:

```
/                                    # Landing page (public)
/auth                                # Authentication page (public)
/auth/callback                       # OAuth callback handler
/dashboard                           # Student dashboard (protected)
/quiz/[id]                          # Quiz taking interface (protected)
/quiz/review/[attemptId]            # Quiz results review (protected)
/admin                              # Admin dashboard (admin only)
/admin/quizzes                      # Quiz management (admin only)
/admin/quizzes/create               # Create new quiz (admin only)
/admin/quizzes/[id]/edit            # Edit quiz (admin only)
/admin/security-logs                # Security violations log (admin only)
/admin/results                      # All quiz results (admin only)
/admin/results/[attemptId]          # Detailed attempt review (admin only)
/settings                           # User settings (protected)
/security-violation                 # Violation warning page (protected)
/not-found                          # 404 page
/error                              # Error boundary page
```

### 2. Core Components

#### QuizTakingInterface Component
```typescript
interface QuizTakingInterfaceProps {
  quizId: string;
  attemptId: string;
  shuffledQuestions: ShuffledQuestion[];
  timeLimit?: number;
}

interface ShuffledQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  shuffledChoices?: ShuffledChoice[];
  originalQuestionId: string;
  orderIndex: number;
}

interface ShuffledChoice {
  id: string;
  choiceText: string;
  orderIndex: number;
  originalChoiceId: string;
}
```

#### AntiCheatMonitor Component
```typescript
interface AntiCheatConfig {
  enableFocusDetection: boolean;
  enableCopyPasteBlock: boolean;
  enableContextMenuBlock: boolean;
  enableFullScreen: boolean;
  maxViolations: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface ViolationEvent {
  type: 'focus_loss' | 'copy_attempt' | 'paste_attempt' | 'context_menu' | 'fullscreen_exit' | 'devtools_open';
  timestamp: Date;
  attemptId: string;
  metadata?: Record<string, any>;
}
```

#### NavigationGuard Component
```typescript
interface NavigationGuardProps {
  isQuizActive: boolean;
  onNavigationAttempt: () => void;
  allowedRoutes?: string[];
}
```

### 3. Custom Hooks

#### useAntiCheat Hook
```typescript
interface UseAntiCheatReturn {
  violations: ViolationEvent[];
  violationCount: number;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  logViolation: (type: ViolationEvent['type'], metadata?: Record<string, any>) => Promise<void>;
}

function useAntiCheat(attemptId: string, config: AntiCheatConfig): UseAntiCheatReturn;
```

#### useDeviceDetection Hook
```typescript
interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  browser: string;
  os: string;
}

function useDeviceDetection(): DeviceInfo;
```

#### useScreenshotDetection Hook
```typescript
interface ScreenshotDetectionConfig {
  enablePrintScreenDetection: boolean;
  enableClipboardMonitoring: boolean;
  enableScreenRecordingDetection: boolean;
}

interface UseScreenshotDetectionReturn {
  isScreenRecording: boolean;
  screenshotAttempts: number;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

function useScreenshotDetection(
  attemptId: string,
  config: ScreenshotDetectionConfig,
  onViolation: (type: string) => void
): UseScreenshotDetectionReturn;
```

#### useRealtimeSync Hook
```typescript
interface RealtimeSyncConfig {
  channel: string;
  table?: string;
  filter?: string;
}

interface UseRealtimeSyncReturn<T> {
  data: T[];
  isConnected: boolean;
  error: Error | null;
  subscribe: () => void;
  unsubscribe: () => void;
}

function useRealtimeSync<T>(config: RealtimeSyncConfig): UseRealtimeSyncReturn<T>;
```

#### useQuizSession Hook
```typescript
interface QuizSessionState {
  attemptId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isSubmitting: boolean;
  violations: ViolationEvent[];
}

interface UseQuizSessionReturn extends QuizSessionState {
  startQuiz: (quizId: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => void;
  submitQuiz: () => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

function useQuizSession(quizId: string): UseQuizSessionReturn;
```

### 4. API Endpoints

#### POST /api/quiz/start
```typescript
// Request
interface StartQuizRequest {
  quizId: string;
  userId: string;
}

// Response
interface StartQuizResponse {
  attemptId: string;
  shuffledQuestions: ShuffledQuestion[];
  timeLimit: number;
  antiCheatConfig: AntiCheatConfig;
}
```

#### POST /api/quiz/submit
```typescript
// Request
interface SubmitQuizRequest {
  attemptId: string;
  answers: Record<string, string>; // questionId -> answer
  timeSpent: number;
  violations: ViolationEvent[];
}

// Response
interface SubmitQuizResponse {
  success: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  resultId: string;
}
```

#### POST /api/security/log
```typescript
// Request
interface SecurityLogRequest {
  attemptId: string;
  violationType: ViolationEvent['type'];
  timestamp: string;
  metadata?: Record<string, any>;
}

// Response
interface SecurityLogResponse {
  success: boolean;
  violationId: string;
  totalViolations: number;
  shouldTerminate: boolean;
}
```

## Data Models

### Database Schema

#### quizzes table
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  time_limit INTEGER, -- in seconds
  passing_score INTEGER, -- percentage
  shuffle_questions BOOLEAN DEFAULT true,
  shuffle_choices BOOLEAN DEFAULT true,
  max_violations INTEGER DEFAULT 3,
  enable_anti_cheat BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### questions table
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### question_choices table
```sql
CREATE TABLE question_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### quiz_attempts table
```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  time_spent INTEGER, -- in seconds
  score DECIMAL(5,2),
  total_questions INTEGER,
  correct_answers INTEGER,
  violation_count INTEGER DEFAULT 0,
  was_terminated BOOLEAN DEFAULT false,
  device_type VARCHAR(20),
  browser VARCHAR(50),
  ip_address INET
);
```

#### shuffled_questions table
```sql
CREATE TABLE shuffled_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  original_question_id UUID REFERENCES questions(id),
  shuffled_order INTEGER NOT NULL,
  shuffled_choices JSONB, -- stores shuffled choice order
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### student_answers table
```sql
CREATE TABLE student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  answer_text TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP DEFAULT NOW()
);
```

#### security_violations table
```sql
CREATE TABLE security_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  severity VARCHAR(20) DEFAULT 'medium' -- 'low', 'medium', 'high'
);
```

## Error Handling

### Client-Side Error Handling

1. **Network Errors**: Retry logic with exponential backoff for API calls
2. **Validation Errors**: Inline form validation with clear error messages
3. **Session Errors**: Automatic redirect to auth page with return URL
4. **Browser Compatibility**: Graceful degradation with feature detection

```typescript
class QuizError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'QuizError';
  }
}

// Error codes
const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BROWSER_UNSUPPORTED: 'BROWSER_UNSUPPORTED',
  MAX_VIOLATIONS_EXCEEDED: 'MAX_VIOLATIONS_EXCEEDED',
};
```

### Server-Side Error Handling

1. **Database Errors**: Transaction rollback and error logging
2. **Authentication Errors**: 401 responses with clear messages
3. **Authorization Errors**: 403 responses for insufficient permissions
4. **Validation Errors**: 400 responses with field-specific errors

```typescript
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Centralized error handler
function handleApiError(error: unknown): Response {
  if (error instanceof QuizError) {
    return new Response(JSON.stringify({
      error: {
        code: error.code,
        message: error.message,
      }
    }), {
      status: getStatusCode(error.code),
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  return new Response(JSON.stringify({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  }), { status: 500 });
}
```

## Testing Strategy

### Unit Tests

1. **Utility Functions**: Test shuffling algorithms, validation logic
2. **Hooks**: Test custom hooks with React Testing Library
3. **Components**: Test individual components in isolation
4. **API Handlers**: Test server-side logic with mocked database

```typescript
// Example: Testing shuffle algorithm
describe('shuffleArray', () => {
  it('should return array with same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });
  
  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.sort()).toEqual(input.sort());
  });
  
  it('should produce different order (probabilistic)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffleArray(input);
    expect(result).not.toEqual(input);
  });
});
```

### Integration Tests

1. **Quiz Flow**: Test complete quiz taking flow from start to submission
2. **Anti-Cheat**: Test violation detection and logging
3. **Routing**: Test navigation guards and protected routes
4. **API Integration**: Test client-server communication

```typescript
// Example: Testing quiz submission flow
describe('Quiz Submission Flow', () => {
  it('should submit quiz with answers and violations', async () => {
    const { result } = renderHook(() => useQuizSession('quiz-123'));
    
    await act(async () => {
      await result.current.startQuiz('quiz-123');
    });
    
    act(() => {
      result.current.submitAnswer('q1', 'answer1');
      result.current.submitAnswer('q2', 'answer2');
    });
    
    await act(async () => {
      await result.current.submitQuiz();
    });
    
    expect(result.current.isSubmitting).toBe(false);
    // Verify API was called with correct data
  });
});
```

### End-to-End Tests

1. **User Journeys**: Test complete user flows with Playwright/Cypress
2. **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge
3. **Mobile Responsive**: Test on various device sizes
4. **Anti-Cheat Features**: Test focus loss, copy/paste blocking, etc.

```typescript
// Example: E2E test with Playwright
test('student can take quiz with anti-cheat enabled', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=Start Quiz');
  
  // Verify full-screen request
  await expect(page).toBeInFullScreen();
  
  // Answer questions
  await page.click('[data-testid="answer-option-1"]');
  await page.click('text=Next');
  
  // Test focus loss detection
  await page.evaluate(() => window.blur());
  await expect(page.locator('[data-testid="violation-warning"]')).toBeVisible();
  
  // Submit quiz
  await page.click('text=Submit Quiz');
  await expect(page).toHaveURL(/\/quiz\/review/);
});
```

### Performance Tests

1. **Anti-Cheat Overhead**: Measure event processing time (<50ms)
2. **Page Load Times**: Measure initial load and navigation
3. **API Response Times**: Measure server-side processing
4. **Database Query Performance**: Optimize slow queries

```typescript
// Example: Performance test
test('anti-cheat monitoring has minimal overhead', async () => {
  const startTime = performance.now();
  
  // Simulate 100 focus events
  for (let i = 0; i < 100; i++) {
    await logViolation('focus_loss', {});
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / 100;
  
  expect(avgTime).toBeLessThan(50); // <50ms per event
});
```

## Screenshot and Screen Recording Detection

### Desktop Screenshot Detection

```typescript
// Print Screen key detection
function setupPrintScreenDetection(onScreenshot: () => void) {
  // Monitor Print Screen key
  document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      onScreenshot();
    }
  });
  
  // Monitor clipboard for screenshot paste
  navigator.clipboard.addEventListener('clipboardchange', async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('image/png')) {
          onScreenshot();
        }
      }
    } catch (err) {
      // Clipboard access denied
    }
  });
  
  // Monitor common screenshot shortcuts
  document.addEventListener('keydown', (e) => {
    // Windows: Win + Shift + S
    if (e.key === 's' && e.shiftKey && e.metaKey) {
      onScreenshot();
    }
    // Mac: Cmd + Shift + 3 or 4
    if ((e.key === '3' || e.key === '4') && e.shiftKey && e.metaKey) {
      onScreenshot();
    }
  });
}
```

### Screen Recording Detection

```typescript
// Use experimental getDisplayMedia API
async function detectScreenRecording(): Promise<boolean> {
  try {
    // Check if screen capture is active
    const mediaDevices = navigator.mediaDevices as any;
    
    if (mediaDevices.getDisplayMedia) {
      // Monitor for active screen capture
      const stream = await mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      
      // If we get here, recording was started
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
  } catch (err) {
    // User denied or not supported
    return false;
  }
  
  return false;
}

// Continuous monitoring
function monitorScreenRecording(onDetected: () => void) {
  setInterval(async () => {
    const isRecording = await detectScreenRecording();
    if (isRecording) {
      onDetected();
    }
  }, 5000); // Check every 5 seconds
}
```

### Mobile Screenshot Warning

```typescript
interface ScreenshotWarningProps {
  onAcknowledge: () => void;
}

function MobileScreenshotWarning({ onAcknowledge }: ScreenshotWarningProps) {
  return (
    <div className="screenshot-warning-overlay">
      <div className="warning-content">
        <AlertTriangle size={48} />
        <h2>Screenshot Monitoring Active</h2>
        <p>
          This quiz is monitored for academic integrity. 
          Taking screenshots is prohibited and will be logged as a violation.
        </p>
        <ul>
          <li>Screenshots are tracked and reported</li>
          <li>Screen recording is prohibited</li>
          <li>Violations may result in quiz termination</li>
        </ul>
        <button onClick={onAcknowledge}>
          I Understand and Agree
        </button>
      </div>
    </div>
  );
}
```

## Real-Time Data Synchronization

### Supabase Realtime Integration

```typescript
// Real-time violation monitoring
function useRealtimeViolations(attemptId: string) {
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`violations:${attemptId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_violations',
          filter: `attempt_id=eq.${attemptId}`
        },
        (payload) => {
          setViolations(prev => [...prev, payload.new as ViolationEvent]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [attemptId]);
  
  return violations;
}

// Real-time quiz results for admin
function useRealtimeQuizResults(quizId?: string) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const filter = quizId ? `quiz_id=eq.${quizId}` : undefined;
    
    const channel = supabase
      .channel('quiz-results')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'quiz_attempts',
          filter
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAttempts(prev => [...prev, payload.new as QuizAttempt]);
          } else if (payload.eventType === 'UPDATE') {
            setAttempts(prev => 
              prev.map(a => a.id === payload.new.id ? payload.new as QuizAttempt : a)
            );
          } else if (payload.eventType === 'DELETE') {
            setAttempts(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId]);
  
  return attempts;
}

// Real-time violation count sync
function useRealtimeViolationCount(attemptId: string) {
  const [count, setCount] = useState(0);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    // Initial fetch
    const fetchCount = async () => {
      const { count: initialCount } = await supabase
        .from('security_violations')
        .select('*', { count: 'exact', head: true })
        .eq('attempt_id', attemptId);
      
      setCount(initialCount || 0);
    };
    
    fetchCount();
    
    // Subscribe to changes
    const channel = supabase
      .channel(`violation-count:${attemptId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_violations',
          filter: `attempt_id=eq.${attemptId}`
        },
        () => {
          setCount(prev => prev + 1);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [attemptId]);
  
  return count;
}
```

### Connection Status Monitoring

```typescript
function ConnectionStatusIndicator() {
  const [isConnected, setIsConnected] = useState(true);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', { event: 'connected' }, () => {
        setIsConnected(true);
      })
      .on('system', { event: 'disconnected' }, () => {
        setIsConnected(false);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  if (!isConnected) {
    return (
      <div className="connection-warning">
        <WifiOff size={16} />
        <span>Connection lost. Reconnecting...</span>
      </div>
    );
  }
  
  return null;
}
```

## Security Considerations

### Server-Side Security

1. **Question Shuffling**: Always performed server-side to prevent client manipulation
2. **Answer Validation**: Validate against server-stored correct answers
3. **Rate Limiting**: Prevent API abuse with rate limiting
4. **Input Sanitization**: Sanitize all user inputs to prevent XSS/SQL injection
5. **Violation Count Persistence**: Store violation counts server-side to prevent client manipulation

### Client-Side Security

1. **Anti-Cheat Monitoring**: Detect but don't prevent (log violations)
2. **Browser Feature Detection**: Graceful degradation for unsupported features
3. **Secure Communication**: All API calls over HTTPS
4. **Token Management**: Secure storage of auth tokens
5. **Screenshot Detection**: Monitor but inform users of monitoring

### Privacy Considerations

1. **Data Minimization**: Only collect necessary violation data
2. **Anonymization**: Option to anonymize IP addresses
3. **Retention Policy**: Auto-delete old violation logs
4. **User Consent**: Clear disclosure of monitoring features
5. **Screenshot Policy**: Transparent communication about screenshot monitoring

## Mobile Responsiveness

### Adaptive UI

1. **Breakpoints**:
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

2. **Touch Optimization**:
   - Larger tap targets (min 44x44px)
   - Swipe gestures for navigation
   - Touch-friendly form inputs

3. **Layout Adaptations**:
   - Single column on mobile
   - Collapsible navigation
   - Bottom-sheet modals

### Adaptive Anti-Cheat

1. **Mobile-Specific**:
   - Disable keyboard shortcuts
   - Adapt full-screen enforcement
   - Detect app switching instead of tab switching

2. **Performance**:
   - Reduce monitoring frequency on low-end devices
   - Lazy load non-critical features
   - Optimize bundle size

## Cleanup and Maintenance Architecture

### Automated Cleanup System

```typescript
interface CleanupConfig {
  abandonedAttemptGracePeriod: number; // hours after time limit
  violationRetentionPeriod: number; // days
  archivedDataRetentionPeriod: number; // days
  enableAutoCleanup: boolean;
  cleanupSchedule: string; // cron expression
}

interface CleanupResult {
  abandonedAttempts: number;
  orphanedRecords: number;
  archivedViolations: number;
  deletedViolations: number;
  timestamp: Date;
}
```

### Data Rectification System

```typescript
interface RectificationAction {
  id: string;
  type: 'score_recalculation' | 'answer_correction' | 'violation_update' | 'question_fix';
  targetId: string; // attempt_id, question_id, etc.
  performedBy: string; // admin user_id
  timestamp: Date;
  changes: Record<string, { old: any; new: any }>;
  reason: string;
}

interface ScoreRecalculationRequest {
  attemptIds?: string[]; // specific attempts or null for all
  quizId?: string; // all attempts for a quiz
  dateRange?: { start: Date; end: Date };
  reason: string;
}
```

### Cleanup API Endpoints

#### POST /api/admin/cleanup/abandoned-attempts
```typescript
// Request
interface CleanupAbandonedRequest {
  gracePeriodHours?: number;
  dryRun?: boolean; // preview without executing
}

// Response
interface CleanupAbandonedResponse {
  success: boolean;
  attemptsCleaned: number;
  recordsDeleted: number;
  details: Array<{
    attemptId: string;
    userId: string;
    quizId: string;
    startedAt: Date;
  }>;
}
```

#### POST /api/admin/cleanup/violations
```typescript
// Request
interface CleanupViolationsRequest {
  retentionDays: number;
  archiveBeforeDelete: boolean;
  dryRun?: boolean;
}

// Response
interface CleanupViolationsResponse {
  success: boolean;
  violationsArchived: number;
  violationsDeleted: number;
  oldestRetained: Date;
}
```

#### POST /api/admin/rectify/recalculate-scores
```typescript
// Request
interface RecalculateScoresRequest {
  attemptIds?: string[];
  quizId?: string;
  dateRange?: { start: string; end: string };
  reason: string;
}

// Response
interface RecalculateScoresResponse {
  success: boolean;
  attemptsUpdated: number;
  changes: Array<{
    attemptId: string;
    oldScore: number;
    newScore: number;
    reason: string;
  }>;
}
```

### Database Maintenance Queries

```sql
-- Find abandoned attempts (started but not submitted after grace period)
SELECT id, user_id, quiz_id, started_at
FROM quiz_attempts
WHERE submitted_at IS NULL
  AND started_at < NOW() - INTERVAL '24 hours'
  AND (
    SELECT time_limit FROM quizzes WHERE id = quiz_attempts.quiz_id
  ) + 3600 < EXTRACT(EPOCH FROM (NOW() - started_at));

-- Find orphaned shuffled_questions
SELECT sq.id, sq.attempt_id
FROM shuffled_questions sq
LEFT JOIN quiz_attempts qa ON sq.attempt_id = qa.id
WHERE qa.id IS NULL;

-- Find orphaned student_answers
SELECT sa.id, sa.attempt_id
FROM student_answers sa
LEFT JOIN quiz_attempts qa ON sa.attempt_id = qa.id
WHERE qa.id IS NULL;

-- Archive old security violations
INSERT INTO security_violations_archive
SELECT * FROM security_violations
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Vacuum and analyze tables for optimization
VACUUM ANALYZE quiz_attempts;
VACUUM ANALYZE security_violations;
VACUUM ANALYZE shuffled_questions;
```

### Audit Trail Schema

```sql
CREATE TABLE rectification_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'quiz_attempt', 'question', 'violation'
  target_id UUID NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  changes JSONB NOT NULL, -- { field: { old: value, new: value } }
  reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_rectification_audit_target ON rectification_audit(target_type, target_id);
CREATE INDEX idx_rectification_audit_timestamp ON rectification_audit(timestamp DESC);
```

### Scheduled Cleanup Jobs

```typescript
// Example using node-cron or similar
import cron from 'node-cron';

// Run cleanup daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running automated cleanup...');
  
  // Clean up abandoned attempts
  await cleanupAbandonedAttempts({ gracePeriodHours: 24 });
  
  // Archive old violations
  await archiveOldViolations({ retentionDays: 90 });
  
  // Remove orphaned records
  await cleanupOrphanedRecords();
  
  // Optimize database
  await vacuumDatabase();
  
  console.log('Cleanup completed');
});
```

## Implementation Notes

### Phase 1: Core Routing & Navigation
- Set up all route files
- Implement navigation components
- Add route protection middleware

### Phase 2: Server-Side Shuffling
- Implement question selection algorithm
- Implement choice shuffling
- Create shuffled_questions table and API

### Phase 3: Anti-Cheat Features
- Implement focus loss detection
- Add copy/paste blocking
- Add context menu blocking
- Implement full-screen enforcement

### Phase 4: Mobile Optimization
- Add device detection
- Implement responsive layouts
- Adapt anti-cheat for mobile

### Phase 5: Testing & Polish
- Write comprehensive tests
- Performance optimization
- Cross-browser testing
- Security audit

### Phase 6: Cleanup & Maintenance
- Implement automated cleanup processes
- Build data rectification tools
- Add monitoring and health checks
- Create backup and restore functionality
