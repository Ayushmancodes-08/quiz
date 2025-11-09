export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
};

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  createdBy: string; // User ID
  createdAt: string; // ISO date string
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  userName: string;
  answers: { [questionIndex: number]: string };
  score: number;
  startedAt: string;
  completedAt: string;
  violations: number;
  isFlagged: boolean;
};
