
"use client";

import type { Quiz } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { useAntiCheat } from "@/hooks/use-anti-cheat";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Clock, Loader2, ShieldOff, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { WithId } from "@/firebase";

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
  const router = useRouter();
  const { toast } = useToast();

  const handleViolation = useCallback((reason: string) => {
      if (quizState === QuizState.InProgress) {
        toast({
            variant: "destructive",
            title: "Quiz Terminated",
            description: reason,
        });
        setQuizState(QuizState.Violation);
      }
    }, [quizState, toast]);

  const { violationCount } = useAntiCheat({ enabled: quizState === QuizState.InProgress, onViolation: handleViolation });
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    setQuizState(QuizState.Submitting);
    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);

    setTimeout(() => {
        setQuizState(QuizState.Finished);
        // In a real app, you would also save the attempt to the DB here.
    }, 1500);
  };
  
  useEffect(() => {
    if (quizState === QuizState.Violation) {
      setTimeout(() => router.push('/dashboard'), 3000);
    }
  }, [quizState, router]);

  if (quizState === QuizState.Starting) {
    return (
      <Card className="w-full max-w-2xl gradient-border">
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
          <Button size="lg" onClick={() => setQuizState(QuizState.InProgress)}>Start Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizState === QuizState.Finished || quizState === QuizState.Submitting || quizState === QuizState.Violation) {
    const isSuccess = score >= 70;
    const FinalIcon = quizState === QuizState.Violation ? ShieldOff : isSuccess ? CheckCircle : XCircle;
    const title = quizState === QuizState.Violation ? "Quiz Terminated" : "Quiz Complete!";
    const description = quizState === QuizState.Violation ? "Your quiz has been submitted due to violations." : `You scored ${score}%.`;

    return (
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
            {quizState === QuizState.Submitting ? (
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
            ) : (
                <FinalIcon className={`mx-auto h-16 w-16 ${quizState === QuizState.Violation ? 'text-destructive' : isSuccess ? 'text-green-500' : 'text-destructive'}`} />
            )}
        </CardHeader>
        <CardContent>
          <CardTitle className="font-headline text-3xl">{quizState === QuizState.Submitting ? 'Submitting...' : title}</CardTitle>
          <CardDescription className="mt-2">{quizState === QuizState.Submitting ? 'Calculating your score...' : description}</CardDescription>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
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
                    <AlertCircle className="h-4 w-4" /> {violationCount} / 3
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
            <Label key={index} className="flex items-center space-x-3 p-4 rounded-md border border-input has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-colors cursor-pointer">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <span className="text-lg">{option}</span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!answers[currentQuestionIndex]}>Submit Quiz</Button>
        )}
      </CardFooter>
    </Card>
  );
}
