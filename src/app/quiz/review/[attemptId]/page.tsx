'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Home, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizAttempt, Quiz } from '@/lib/types';

export default function QuizReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReview() {
      try {
        const { data: attemptData, error: attemptError } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('id', attemptId)
          .single();

        if (attemptError) throw attemptError;
        if (!attemptData) throw new Error('Quiz attempt not found');

        const mappedAttempt: QuizAttempt = {
          id: (attemptData as any).id,
          quizId: (attemptData as any).quiz_id,
          quizTitle: (attemptData as any).quiz_title,
          userId: (attemptData as any).user_id,
          userName: (attemptData as any).user_name,
          studentName: (attemptData as any).student_name,
          registrationNumber: (attemptData as any).registration_number,
          authorId: (attemptData as any).author_id,
          answers: (attemptData as any).answers,
          score: (attemptData as any).score,
          startedAt: (attemptData as any).started_at,
          completedAt: (attemptData as any).completed_at,
          violations: (attemptData as any).violations,
          isFlagged: (attemptData as any).is_flagged,
        };

        setAttempt(mappedAttempt);

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', (attemptData as any).quiz_id)
          .single();

        if (quizError) throw quizError;
        if (!quizData) throw new Error('Quiz not found');

        const mappedQuiz: Quiz = {
          id: (quizData as any).id,
          authorId: (quizData as any).author_id,
          title: (quizData as any).title,
          topic: (quizData as any).topic,
          difficulty: (quizData as any).difficulty as 'easy' | 'medium' | 'hard',
          questions: (quizData as any).questions,
          createdAt: (quizData as any).created_at,
        };

        setQuiz(mappedQuiz);
      } catch (err: any) {
        console.error('Error loading review:', err);
        setError(err.message || 'Failed to load quiz review');
      } finally {
        setIsLoading(false);
      }
    }

    if (attemptId) {
      loadReview();
    }
  }, [attemptId, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl">
          <CardContent className="pt-12 pb-12 space-y-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Loading Review...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-2xl border-destructive">
          <CardContent className="pt-12 pb-12 space-y-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-destructive/10 rounded-full">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Review Not Available</h3>
              <p className="text-muted-foreground">{error || 'Quiz review could not be loaded'}</p>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = quiz.questions.filter((q, index) => 
    attempt.answers[index] === q.correctAnswer
  ).length;

  const incorrectCount = quiz.questions.length - correctCount;
  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">Quiz Review</h1>
              <p className="text-sm text-muted-foreground truncate">{quiz.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-6 pb-20">
        {/* Summary Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Your Performance</CardTitle>
            <CardDescription>Review your answers and see where you can improve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary">{percentage}%</div>
              <Progress value={percentage} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{quiz.questions.length}</p>
              </div>
              <div className="bg-green-500/10 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-green-500">{correctCount}</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-red-500">{incorrectCount}</p>
              </div>
              <div className="bg-yellow-500/10 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold text-yellow-500">{attempt.violations}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-medium">{attempt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration:</span>
                <span className="font-medium">{attempt.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">
                  {new Date(attempt.completedAt).toLocaleString()}
                </span>
              </div>
              {attempt.isFlagged && (
                <div className="flex items-center gap-2 text-destructive pt-2 border-t">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">This attempt was flagged for review</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Question by Question Review</h2>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = attempt.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const allOptions = [question.correctAnswer, ...question.options];

            return (
              <Card 
                key={index} 
                className={cn(
                  "shadow-md transition-all",
                  isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                          isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )}>
                          {index + 1}
                        </div>
                        <Badge variant={isCorrect ? "default" : "destructive"} className="flex items-center gap-1">
                          {isCorrect ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Incorrect
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg md:text-xl leading-relaxed">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Answer Options */}
                  <div className="space-y-3">
                    {allOptions.map((option, optIndex) => {
                      const isUserAnswer = option === userAnswer;
                      const isCorrectAnswer = option === question.correctAnswer;

                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            isCorrectAnswer && "border-green-500 bg-green-500/10",
                            isUserAnswer && !isCorrectAnswer && "border-red-500 bg-red-500/10",
                            !isUserAnswer && !isCorrectAnswer && "border-border bg-muted/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {isCorrectAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-base leading-relaxed">{option}</p>
                              {isCorrectAnswer && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                                  ✓ Correct Answer
                                </p>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">
                                  ✗ Your Answer
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation for incorrect answers */}
                  {!isCorrect && (
                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">💡 Remember:</p>
                      <p className="text-sm text-muted-foreground">
                        The correct answer is: <span className="font-semibold text-foreground">{question.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">
                {percentage >= 80 ? "🎉 Excellent Work!" : 
                 percentage >= 60 ? "👍 Good Job!" : 
                 "💪 Keep Practicing!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {percentage >= 80 ? "You've mastered this topic!" : 
                 percentage >= 60 ? "You're on the right track!" : 
                 "Review the questions and try again!"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => router.push('/')} 
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
              <Button 
                onClick={() => router.push(`/quiz/${quiz.id}`)} 
                className="flex-1"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
