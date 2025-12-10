'use client';

import type { Quiz, QuizAttempt } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAntiCheat } from '@/hooks/use-anti-cheat';
import { useMobileAntiCheat } from '@/hooks/use-mobile-anti-cheat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WithId, useUser, useSupabaseClient } from '@/supabase';
import { v4 as uuidv4 } from 'uuid';
import { detectAndFlagCheatingAction } from '@/lib/actions';

enum QuizState {
  CollectingInfo,
  Starting,
  InProgress,
  Countdown,
  Submitting,
  Finished,
  Violation,
}

export function QuizTaker({ quiz }: { quiz: WithId<Quiz> }) {
  const [quizState, setQuizState] = useState(QuizState.CollectingInfo);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [studentName, setStudentName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0); // Seconds
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const { toast } = useToast();
  const { user } = useUser();
  const supabase: any = useSupabaseClient();

  // Use ref to store calculateAndSaveAttempt to avoid hoisting issues
  const calculateAndSaveAttemptRef = useRef<((isViolation?: boolean, violationRecords?: any[]) => Promise<void>) | null>(null);

  const runAiCheatDetection = useCallback(async (attempt: QuizAttempt) => {
    if (!user) return;
    const result = await detectAndFlagCheatingAction({
      quizAttemptDetails: `Score: ${attempt.score}%, Violations: ${attempt.violations}`,
      userDetails: `User ID: ${user.id}, Name: ${user.user_metadata?.display_name || attempt.studentName}`,
      quizDetails: `Quiz: ${quiz.title}, Topic: ${quiz.topic}, Difficulty: ${quiz.difficulty}`,
    });

    if (result.success && result.data?.isCheating) {
      await supabase
        .from('quiz_attempts' as any)
        .update({ is_flagged: true } as any)
        .eq('id', attempt.id);
    }
  }, [user, quiz, supabase]);

  const handleViolation = useCallback(
    (reason: string, violationRecords?: any[]) => {
      // Use functional updates to check current state
      setQuizState((currentState) => {
        if (currentState !== QuizState.InProgress) {
          return currentState; // Don't process if not in progress
        }

        // Use setTimeout to avoid nested state updates
        setTimeout(() => {
          setIsSubmitting((currentSubmitting) => {
            if (currentSubmitting) {
              return currentSubmitting; // Already submitting, ignore
            }

            // Start countdown before auto-submission
            setCountdown(3);

            // Clear any existing interval
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }

            // Countdown timer
            countdownIntervalRef.current = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  setIsSubmitting(true);
                  setQuizState(QuizState.Submitting);
                  // Use ref to call calculateAndSaveAttempt
                  setTimeout(() => {
                    if (calculateAndSaveAttemptRef.current) {
                      calculateAndSaveAttemptRef.current(true, violationRecords);
                    }
                  }, 0);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);

            return currentSubmitting; // Don't change submitting state yet
          });
        }, 0);

        return QuizState.Countdown;
      });
    },
    [] // No dependencies needed since we use ref
  );

  // Detect if mobile IMMEDIATELY (not in useEffect to avoid desktop anti-cheat running first)
  const [isMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
  });

  // Use mobile-specific anti-cheat on mobile devices
  const mobileAntiCheat = useMobileAntiCheat({
    enabled: isMobile && quizState === QuizState.InProgress,
    onViolation: handleViolation,
    maxViolations: 3,
  });

  // Use full anti-cheat on desktop
  const desktopAntiCheat = useAntiCheat({
    enabled: !isMobile && quizState === QuizState.InProgress,
    onViolation: handleViolation,
    maxViolations: 3,
  });

  const { tabSwitchCount, securityViolationCount } = isMobile
    ? {
      tabSwitchCount: mobileAntiCheat.tabSwitchCount,
      securityViolationCount: mobileAntiCheat.securityViolationCount
    }
    : {
      tabSwitchCount: desktopAntiCheat.tabSwitchCount,
      securityViolationCount: desktopAntiCheat.securityViolationCount
    };

  const violationCount = tabSwitchCount + securityViolationCount;
  const violationRecords = isMobile ? mobileAntiCheat.violations : desktopAntiCheat.violationRecords;

  const calculateAndSaveAttempt = useCallback(async (isViolation = false, violationRecords?: any[]) => {
    if (!startTime) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit quiz. Session data missing.' });
      setQuizState((current) => current === QuizState.InProgress ? QuizState.InProgress : current);
      return;
    }

    // Validate student information
    if (!studentName.trim() || !registrationNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Student name and registration number are required.'
      });
      return;
    }

    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);

    const attemptId = uuidv4();
    const userId = user?.id || 'anonymous';
    const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || studentName;

    const attempt: QuizAttempt = {
      id: attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      userId: userId,
      userName: userName,
      studentName: studentName.trim(),
      registrationNumber: registrationNumber.trim(),
      authorId: quiz.authorId,
      answers,
      score: finalScore,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      violations: violationCount,
      isFlagged: isViolation || violationCount >= 3,
    };

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          id: attemptId,
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          user_id: userId,
          user_name: userName,
          student_name: studentName.trim(),
          registration_number: registrationNumber.trim(),
          author_id: quiz.authorId,
          answers: answers as any,
          score: finalScore,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
          violations: violationCount,
          is_flagged: isViolation || violationCount >= 3,
        } as any);

      if (error) throw error;

      // Run AI cheat detection in the background (only for authenticated users)
      if (user) {
        runAiCheatDetection(attempt);
      }

      setTimeout(() => {
        setQuizState(isViolation ? QuizState.Violation : QuizState.Finished);
      }, 1500);

    } catch (error: any) {
      console.error('Error saving quiz attempt:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was an error saving your quiz attempt.',
      });
      setQuizState((current) => current === QuizState.Submitting ? QuizState.InProgress : current);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, supabase, startTime, quiz, answers, violationCount, studentName, registrationNumber, runAiCheatDetection, toast]);

  // Update ref when calculateAndSaveAttempt changes
  useEffect(() => {
    calculateAndSaveAttemptRef.current = calculateAndSaveAttempt;
  }, [calculateAndSaveAttempt]);



  // Timer logic
  useEffect(() => {
    if (quizState === QuizState.InProgress && quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [quizState, quiz.timeLimit]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestionIndex];
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      if (prev.includes(currentQuestionIndex)) return prev.filter(i => i !== currentQuestionIndex);
      return [...prev, currentQuestionIndex];
    });
    handleNext();
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setQuizState(QuizState.Submitting);
    calculateAndSaveAttempt(false);
  }

  const handleContinueToQuiz = () => {
    if (!studentName.trim() || !registrationNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both your name and registration number.',
      });
      return;
    }
    setQuizState(QuizState.Starting);
  };

  useEffect(() => {
    if (quizState === QuizState.InProgress && !startTime) {
      setStartTime(Date.now());
    }
  }, [quizState, startTime]);



  // Collecting student information
  if (quizState === QuizState.CollectingInfo) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{quiz.title}</CardTitle>
          <CardDescription>Please provide your information before starting the quiz.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              placeholder="Enter your full name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input
              id="registrationNumber"
              placeholder="Enter your registration number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={handleContinueToQuiz} className="w-full">
            Continue to Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Starting/Instructions screen
  if (quizState === QuizState.Starting) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.questions.length} questions on {quiz.topic}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-semibold">Student Information:</p>
            <p className="text-sm">Name: {studentName}</p>
            <p className="text-sm">Registration Number: {registrationNumber}</p>
          </div>
          <h3 className="font-bold text-lg text-destructive">Rules & Warnings</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>This quiz requires fullscreen mode.</li>
            <li>Do not exit fullscreen or switch tabs.</li>
            <li>Right-clicking and screenshots are disabled.</li>
            <li>Exceeding 3 violations will automatically terminate the quiz.</li>
            <li>Keyboard shortcuts (Ctrl+C, Ctrl+V, etc.) are disabled.</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={() => setQuizState(QuizState.InProgress)}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Countdown overlay
  if (quizState === QuizState.Countdown) {
    const recentViolations = violationRecords?.slice(-3) || [];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl text-destructive">Violation Detected</CardTitle>
            <CardDescription>Quiz will be auto-submitted in:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-destructive mb-4">{countdown}</div>
              <p className="text-muted-foreground">Maximum violations exceeded</p>
            </div>
            {recentViolations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Recent Violations:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {recentViolations.map((v: any, idx: number) => (
                    <li key={idx}>
                      {v.type}: {v.reason} ({new Date(v.timestamp).toLocaleTimeString()})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitting state
  if (quizState === QuizState.Submitting) {
    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader className="items-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-3xl">Submitting...</CardTitle>
          <CardDescription className="mt-2">Calculating your score...</CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Finished state - Show only the score
  if (quizState === QuizState.Finished || quizState === QuizState.Violation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center shadow-2xl border-2 border-green-500/20">
          <CardHeader className="items-center">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-500">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <CardTitle className="font-headline text-4xl">Test Submitted Successfully!</CardTitle>
            <p className="text-xl text-muted-foreground">Thank you, {studentName}.</p>
            <div className="bg-muted/30 p-8 rounded-xl border border-border">
              <div className="text-7xl font-bold text-primary mb-2">{score}%</div>
              <p className="text-lg text-muted-foreground uppercase tracking-wider font-medium">Your Score</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center gap-4 flex-col sm:flex-row">
            <Button
              onClick={() => {
                try {
                  window.close();
                } catch (e) {
                  toast({ description: "Browser blocked auto-close. Please close this tab manually." });
                }
              }}
              size="lg"
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Close Window
            </Button>
            <p className="text-sm text-muted-foreground w-full text-center mt-2">
              You may now safely close this tab.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Quiz in progress - JEE Style Layout
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-4 bg-card shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-xl font-bold truncate max-w-[200px] sm:max-w-md">{quiz.title}</h1>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">| {quiz.topic}</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Violation Counters */}
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${tabSwitchCount > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'}`}>
              <span>Tabs: {tabSwitchCount}/3</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${securityViolationCount > 0 ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'}`}>
              <span>Security: {securityViolationCount}/3</span>
            </div>
          </div>

          {/* Timer */}
          {quiz.timeLimit && (
            <div className="font-mono text-xl font-bold bg-muted px-4 py-1 rounded text-primary">
              {formatTime(timeLeft)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {studentName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <span className="text-lg font-medium text-muted-foreground">Question {currentQuestionIndex + 1}</span>
              <span className="text-sm text-muted-foreground">Marks: +4, -1</span>
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <h2 className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">{currentQuestion.question}</h2>

                <RadioGroup
                  value={answers[currentQuestionIndex]}
                  onValueChange={handleSelectAnswer}
                  className="space-y-4"
                  disabled={isSubmitting}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} className="peer sr-only" />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 p-4 rounded-lg border-2 border-muted hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer transition-all text-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center peer-checked:bg-primary peer-checked:text-primary-foreground shrink-0 text-xs">
                            {String.fromCharCode(65 + index)}
                          </div>
                          {option}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Right: Question Palette (Sidebar) */}
        <aside className="w-80 border-l bg-muted/10 overflow-y-auto flex flex-col shrink-0">
          <div className="p-4 border-b bg-card">
            <h3 className="font-semibold mb-4">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isMarked = markedForReview.includes(idx);
                const isCurrent = currentQuestionIndex === idx;



                let className = "h-8 w-8 text-xs font-semibold rounded-none border shadow-sm transition-all "; // Square, smaller buttons

                if (isCurrent) {
                  className += "ring-2 ring-primary ring-offset-1 z-10 ";
                }

                if (isMarked && isAnswered) {
                  className += "bg-purple-600 text-white relative after:content-[''] after:absolute after:bottom-0.5 after:right-0.5 after:w-1.5 after:h-1.5 after:bg-green-400 after:rounded-full";
                } else if (isMarked) {
                  className += "bg-purple-600 text-white";
                } else if (isAnswered) {
                  className += "bg-green-600 text-white";
                } else {
                  className += "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={className}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 space-y-3 text-xs text-muted-foreground flex-1">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded"></div> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-secondary border rounded"></div> Not Visited</div>
          </div>

          <div className="p-4 border-t bg-card space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</Button>
              <Button onClick={handleNext} disabled={currentQuestionIndex === quiz.questions.length - 1} variant="secondary">Next</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleClearResponse}>Clear Response</Button>
            <Button variant="secondary" className="w-full bg-purple-100 text-purple-900 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300" onClick={handleMarkForReview}>
              {markedForReview.includes(currentQuestionIndex) ? 'Unmark Review' : 'Mark for Review'}
            </Button>
            <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={isSubmitting}>Submit Test</Button>
          </div>
        </aside>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Submitting Assessment...</p>
          </div>
        </div>
      )}
    </div>
  );
}
