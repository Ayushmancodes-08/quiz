import { MOCK_QUIZZES } from '@/lib/data';
import { QuizTaker } from '@/components/quiz/quiz-taker';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function QuizPage({ params }: { params: { id: string } }) {
  const quiz = MOCK_QUIZZES.find((q) => q.id === params.id);

  if (!quiz) {
    return notFound();
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <QuizTaker quiz={quiz} />
    </div>
  );
}

export function generateStaticParams() {
  return MOCK_QUIZZES.map(quiz => ({ id: quiz.id }));
}
