'use client';

import type { Quiz, QuizAttempt } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAntiCheat } from '@/hooks/use-anti-cheat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, ShieldOff, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
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
  const [currentViolations, setCurrentViolations] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const supabase = useSupabaseClient();

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
          .from('quiz_attempts')
          .update({ is_flagged: true })
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

  const { violationCount, violationRecords } = useAntiCheat({ 
    enabled: quizState === QuizState.InProgress, 
    onViolation: handleViolation 
  });

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
        });

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
  
  useEffect(() => {
    setCurrentViolations(violationCount);
  }, [violationCount]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
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

  useEffect(() => {
    if (quizState === QuizState.Violation || quizState === QuizState.Finished) {
      const timer = setTimeout(() => router.push('/dashboard'), 5000);
      return () => clearTimeout(timer);
    }
  }, [quizState, router]);

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

  // Finished/Submitting/Violation states
  if (quizState === QuizState.Finished || quizState === QuizState.Submitting || quizState === QuizState.Violation) {
    const isSuccess = score >= 70;
    let FinalIcon, title, description;

    if (quizState === QuizState.Submitting) {
      FinalIcon = Loader2;
      title = 'Submitting...';
      description = 'Calculating your score and saving the attempt...';
    } else if (quizState === QuizState.Violation) {
      FinalIcon = ShieldOff;
      title = 'Quiz Terminated';
      description = `Your attempt was flagged with ${violationCount} violations and has been submitted. Final score: ${score}%.`;
    } else {
      FinalIcon = isSuccess ? CheckCircle : XCircle;
      title = 'Quiz Complete!';
      description = `You scored ${score}%.`;
    }

    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader className="items-center">
            <FinalIcon className={`h-16 w-16 ${quizState === QuizState.Submitting ? 'animate-spin text-primary' : quizState === QuizState.Violation ? 'text-destructive' : isSuccess ? 'text-green-500' : 'text-destructive'}`} />
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-3xl">{title}</CardTitle>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          <p className="text-xs text-muted-foreground">Redirecting automatically...</p>
        </CardFooter>
      </Card>
    );
  }

  // Quiz in progress
  return (
    <div className="relative">
      {isSubmitting && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Submitting...</p>
          </div>
        </div>
      )}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="font-headline text-xl">{quiz.title}</CardTitle>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {currentViolations} / 3
              </span>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <h2 className="mb-6 text-2xl font-semibold">{currentQuestion.question}</h2>
          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleSelectAnswer}
            className="space-y-4"
            disabled={isSubmitting}
          >
            {currentQuestion.options.map((option, index) => (
              <Label
                key={index}
                className="flex items-center space-x-3 p-4 rounded-md border border-input has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors cursor-pointer"
              >
                <RadioGroupItem value={option} id={`option-${index}`} disabled={isSubmitting} />
                <span className="text-lg">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={handleNext} disabled={!answers[currentQuestionIndex] || isSubmitting}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!answers[currentQuestionIndex] || isSubmitting}>
              Submit Quiz
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
