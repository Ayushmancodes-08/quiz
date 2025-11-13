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
import { AlertCircle, CheckCircle, Loader2, Home, Shield, ShieldOff, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { WithId, useUser, useSupabaseClient } from '@/supabase';
import { v4 as uuidv4 } from 'uuid';
import { detectAndFlagCheatingAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

enum QuizState {
  CollectingInfo,
  Instructions,
  InProgress,
  Submitting,
  Finished,
  Violation,
}

export function MobileQuizTaker({ quiz }: { quiz: WithId<Quiz> }) {
  const [quizState, setQuizState] = useState(QuizState.CollectingInfo);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentViolations, setCurrentViolations] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<{ [key: number]: string[] }>({});

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const supabase = useSupabaseClient();

  const calculateAndSaveAttemptRef = useRef<((isViolation?: boolean, violationRecords?: any[]) => Promise<void>) | null>(null);
  const attemptIdRef = useRef<string | null>(null);

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
          .update({ is_flagged: true } as any)
          .eq('id', attempt.id);
    }
  }, [user, quiz, supabase]);

  const handleViolation = useCallback(
    (reason: string, violationRecords?: any[]) => {
      setShowViolationWarning(true);
      setTimeout(() => setShowViolationWarning(false), 3000);
      
      if (violationRecords && violationRecords.length >= 3) {
        setQuizState(QuizState.Submitting);
        if (calculateAndSaveAttemptRef.current) {
          calculateAndSaveAttemptRef.current(true, violationRecords);
        }
      }
    },
    []
  );

  const { violationCount, violationRecords, flagCount, flagRecords } = useAntiCheat({
    enabled: quizState === QuizState.InProgress,
    onViolation: handleViolation,
    maxViolations: 3,
    maxFlags: 3, // 3 tab switches before violation
  });

  const calculateAndSaveAttempt = useCallback(async (isViolation = false, violationRecords?: any[]) => {
    if (!startTime) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit quiz. Session data missing.' });
      setQuizState((current) => current === QuizState.InProgress ? QuizState.InProgress : current);
      return;
    }

    setIsSubmitting(true);

    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);

    const attemptId = uuidv4();
    const userId = user?.id || 'anonymous';
    const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || studentName;
    const violationCount = violationRecords?.length || 0;

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
      
      // Store attempt ID for review
      localStorage.setItem('lastQuizAttemptId', attemptId);
      
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

  useEffect(() => {
    calculateAndSaveAttemptRef.current = calculateAndSaveAttempt;
  }, [calculateAndSaveAttempt]);
  
  useEffect(() => {
    setCurrentViolations(violationCount);
  }, [violationCount]);

  // FIX: Shuffle options once when quiz starts, not on every render
  useEffect(() => {
    if (quiz.questions.length > 0 && Object.keys(shuffledOptions).length === 0) {
      const newShuffledOptions: { [key: number]: string[] } = {};
      quiz.questions.forEach((question, index) => {
        const optionsSet = new Set(question.options);
        if (!optionsSet.has(question.correctAnswer)) {
          optionsSet.add(question.correctAnswer);
        }
        const allOptions = Array.from(optionsSet);
        
        const shuffled = [...allOptions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        newShuffledOptions[index] = shuffled;
      });
      setShuffledOptions(newShuffledOptions);
    }
  }, [quiz.questions, shuffledOptions]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const currentOptions = shuffledOptions[currentQuestionIndex] || [];

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

  const handleSubmit = () => {
    if (isSubmitting) return;
    
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      toast({
        title: 'Incomplete Quiz',
        description: `You have ${unanswered} unanswered question(s). Please answer all questions before submitting.`,
      });
      return;
    }
    
    setIsSubmitting(true);
    setQuizState(QuizState.Submitting);
    calculateAndSaveAttempt(false);
  };

  const handleStartQuiz = () => {
    if (!studentName.trim() || !registrationNumber.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both your name and registration number.',
      });
      return;
    }
    setQuizState(QuizState.Instructions);
  };

  const handleBeginQuiz = () => {
    setQuizState(QuizState.InProgress);
    setStartTime(Date.now());
  };

  // Collecting student information
  if (quizState === QuizState.CollectingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl md:text-3xl text-center">{quiz.title}</CardTitle>
            <CardDescription className="text-center text-base">
              Please provide your information to begin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentName" className="text-base">Full Name *</Label>
              <Input
                id="studentName"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-base">Registration Number *</Label>
              <Input
                id="registrationNumber"
                placeholder="Enter your registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Quiz Information
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Topic: {quiz.topic}</p>
                <p>• Difficulty: <span className="capitalize">{quiz.difficulty}</span></p>
                <p>• Questions: {quiz.questions.length}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleStartQuiz} 
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Continue to Instructions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Instructions screen
  if (quizState === QuizState.Instructions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-destructive/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="font-headline text-2xl md:text-3xl text-center">Anti-Cheat Rules</CardTitle>
            <CardDescription className="text-center text-base">
              Please read carefully before starting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Browser Lockdown Mode
              </h3>
              <ul className="space-y-3 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Fullscreen mode:</strong> Quiz will open in fullscreen automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Keyboard locked:</strong> Alt+Tab, Windows key, and other shortcuts disabled</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Screen stays on:</strong> Your screen won't sleep during the quiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Exit prevention:</strong> Warnings before closing or leaving the page</span>
                </li>
              </ul>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ShieldOff className="w-5 h-5" />
                Prohibited Actions
              </h3>
              <ul className="space-y-3 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span><strong>No tab switching:</strong> Stay on this page throughout the quiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span><strong>No screenshots:</strong> Screen capture is disabled</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span><strong>No AI tools:</strong> ChatGPT, Google Lens, etc. are prohibited</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span><strong>No external help:</strong> Complete the quiz independently</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Warning & Violation Policy
              </h3>
              <p className="text-sm md:text-base">
                <strong>Warnings:</strong> You get <strong>3 warnings</strong> for tab switches. After 3 warnings, it becomes 1 violation.<br/>
                <strong>Violations:</strong> You are allowed <strong>2 violations</strong>. On the <strong>3rd violation</strong>, your quiz will be automatically submitted and flagged for review.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                By clicking "Start Quiz", you agree to follow these rules
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setQuizState(QuizState.CollectingInfo)}
              className="flex-1 h-12"
            >
              Go Back
            </Button>
            <Button 
              onClick={handleBeginQuiz} 
              className="flex-1 h-12 text-base font-semibold"
              size="lg"
            >
              I Understand, Start Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Quiz in progress
  if (quizState === QuizState.InProgress) {
    return (
      <div className="min-h-screen bg-background p-2 md:p-4">
        {/* Warning/Violation Banner */}
        {showViolationWarning && (
          <div className={cn(
            "fixed top-0 left-0 right-0 z-50 p-4 text-center font-semibold animate-in slide-in-from-top",
            flagCount > 0 && flagCount < 3 && "bg-yellow-500 text-yellow-950",
            flagCount >= 3 && "bg-orange-500 text-orange-950",
            violationCount > 0 && "bg-destructive text-destructive-foreground"
          )}>
            {flagCount > 0 && flagCount < 3 && (
              <>⚠️ Warning {flagCount}/3: Tab Switch Detected. {3 - flagCount} warnings remaining before violation.</>
            )}
            {flagCount >= 3 && violationCount === 0 && (
              <>🚫 Violation: Excessive Tab Switching! Violations: {violationCount + 1}/3</>
            )}
            {violationCount > 0 && (
              <>🚫 Violation Detected! ({violationCount}/3)</>
            )}
          </div>
        )}

        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b p-3 md:p-4 mb-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg md:text-xl truncate">{quiz.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Warnings/Flags Counter */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  flagCount === 0 && "bg-green-500/10 text-green-500",
                  flagCount === 1 && "bg-yellow-500/10 text-yellow-500",
                  flagCount === 2 && "bg-orange-500/10 text-orange-500",
                  flagCount >= 3 && "bg-red-500/10 text-red-500"
                )}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Warnings:</span>
                  <span className="font-bold">{flagCount}/3</span>
                </div>

                {/* Violations Counter */}
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  violationCount === 0 && "bg-green-500/10 text-green-500",
                  violationCount === 1 && "bg-yellow-500/10 text-yellow-500",
                  violationCount === 2 && "bg-orange-500/10 text-orange-500",
                  violationCount >= 3 && "bg-destructive/10 text-destructive"
                )}>
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Violations:</span>
                  <span className="font-bold">{violationCount}/3</span>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <div className="max-w-4xl mx-auto pb-24">
          <Card className="shadow-lg">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl md:text-2xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {currentQuestionIndex + 1}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestionIndex] || ''}
                onValueChange={handleSelectAnswer}
                className="space-y-3"
              >
                {currentOptions.map((option, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-accent",
                      answers[currentQuestionIndex] === option
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    onClick={() => handleSelectAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} className="flex-shrink-0" />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base md:text-lg leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t p-3 md:p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 h-12 text-base"
            >
              Previous
            </Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestionIndex]}
                className="flex-1 h-12 text-base font-semibold"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!answers[currentQuestionIndex] || isSubmitting}
                className="flex-1 h-12 text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Submitting state
  if (quizState === QuizState.Submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl">
          <CardContent className="pt-12 pb-12 space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Submitting Your Quiz...</h3>
              <p className="text-muted-foreground">Please wait while we save your answers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Store attempt ID when quiz is finished
  // Finished state - Show only the score
  if (quizState === QuizState.Finished || quizState === QuizState.Violation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-green-500/5">
        <Card className="w-full max-w-2xl text-center shadow-2xl">
          <CardContent className="pt-12 pb-12 space-y-8">
            <div className="flex items-center justify-center w-24 h-24 mx-auto bg-green-500/10 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Quiz Completed!</h2>
              <p className="text-xl text-muted-foreground">Great job, {studentName}!</p>
            </div>
            <div className="bg-muted/50 p-8 rounded-lg space-y-4">
              <div className="text-6xl md:text-7xl font-bold text-primary">{score}%</div>
              <p className="text-lg text-muted-foreground">Your Score</p>
            </div>
            <Button 
              onClick={() => router.push('/')} 
              size="lg"
              className="w-full h-12 text-base font-semibold"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
