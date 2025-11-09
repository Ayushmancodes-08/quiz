'use client';

import type { Quiz, QuizAttempt } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useAntiCheat } from '@/hooks/use-anti-cheat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, ShieldOff, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { WithId, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

enum QuizState {
  Starting,
  InProgress,
  Submitting,
  Finished,
  Violation,
}

export function QuizTaker({ quiz }: { quiz: WithId<Quiz> }) {
  const [quizState, setQuizState] = useState(QuizState.Starting);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentViolations, setCurrentViolations] = useState(0);

  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleViolation = useCallback(
    (reason: string) => {
      // This check is important. If we are already submitting due to a violation,
      // we don't want to trigger the submission logic again.
      if (quizState === QuizState.InProgress) {
        toast({
          variant: 'destructive',
          title: 'Quiz Terminated',
          description: reason,
        });
        setQuizState(QuizState.Violation);
        // The submission logic is now handled in the useEffect hook watching quizState
      }
    },
    [quizState, toast]
  );

  const { violationCount } = useAntiCheat({ enabled: quizState === QuizState.InProgress, onViolation: handleViolation });
  
  useEffect(() => {
    setCurrentViolations(violationCount);
  }, [violationCount]);

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

  const calculateAndSaveAttempt = useCallback(async (isViolation = false) => {
    if (!user || !firestore || !startTime) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit quiz. User or session data missing.' });
      setQuizState(QuizState.InProgress); // Revert state
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
    const attempt: QuizAttempt = {
      id: attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      authorId: quiz.authorId,
      answers,
      score: finalScore,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      violations: violationCount,
      isFlagged: isViolation || violationCount >= 3,
    };

    try {
      // Save attempt to the root `quiz_attempts` collection.
      // This makes querying for results by author much easier.
      const attemptsRef = doc(firestore, "quiz_attempts", attemptId);
      await setDocumentNonBlocking(attemptsRef, attempt, {});

      // Optionally, still save a reference to the user's own attempts if needed for their history
      const userAttemptRef = doc(firestore, `users/${user.uid}/quiz_attempts`, attemptId);
      await setDocumentNonBlocking(userAttemptRef, attempt, {});

      setTimeout(() => {
        setQuizState(isViolation ? QuizState.Violation : QuizState.Finished);
      }, 1500);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was an error saving your quiz attempt.',
      });
      setQuizState(QuizState.InProgress); // Revert state
    }
  }, [user, firestore, startTime, quiz, answers, violationCount]);

  const handleSubmit = () => {
     setQuizState(QuizState.Submitting);
     calculateAndSaveAttempt(false);
  }

  useEffect(() => {
    if (quizState === QuizState.Violation) {
      // A violation has occurred, we must now submit the results.
      setQuizState(QuizState.Submitting);
      calculateAndSaveAttempt(true);
    }
  }, [quizState, calculateAndSaveAttempt]);
  
  useEffect(() => {
    if (quizState === QuizState.InProgress && !startTime) {
      setStartTime(Date.now());
    }
  }, [quizState, startTime]);

  useEffect(() => {
    if (quizState === QuizState.Violation || quizState === QuizState.Finished) {
      // After submission and result display, wait before redirecting
      const timer = setTimeout(() => router.push('/dashboard'), 5000);
      return () => clearTimeout(timer);
    }
  }, [quizState, router]);


  if (quizState === QuizState.Starting) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.questions.length} questions on {quiz.topic}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-bold text-lg text-destructive">Rules & Warnings</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>This quiz requires fullscreen mode.</li>
            <li>Do not exit fullscreen or switch tabs.</li>
            <li>Right-clicking and screenshots are disabled.</li>
            <li>Exceeding 3 violations will automatically terminate the quiz.</li>
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

  return (
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
        >
          {currentQuestion.options.map((option, index) => (
            <Label
              key={index}
              className="flex items-center space-x-3 p-4 rounded-md border border-input has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
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
          <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!answers[currentQuestionIndex]}>
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
