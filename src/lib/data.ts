import type { Quiz, QuizAttempt } from './types';

// This data is now only used for fallback or initial structure reference.
// The application primarily uses real-time data from Supabase.

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz_space_101',
    title: 'Cosmic Beginners',
    topic: 'Basics of Space Exploration',
    difficulty: 'easy',
    authorId: 'usr_admin001',
    createdAt: '2024-05-20T10:00:00Z',
    questions: [
      { question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars' },
      { question: 'What is the name of the galaxy we live in?', options: ['Andromeda', 'Triangulum', 'Milky Way', 'Whirlpool'], correctAnswer: 'Milky Way' },
      { question: 'Who was the first human to walk on the moon?', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins', 'Neil Armstrong'], correctAnswer: 'Neil Armstrong' },
    ],
  }
];


export const MOCK_ATTEMPTS: QuizAttempt[] = [
    { 
      id: 'att_001', 
      quizId: 'quiz_space_101', 
      quizTitle: 'Cosmic Beginners', 
      userId: 'usr_student01', 
      userName: 'Alice', 
      studentName: 'Alice Johnson',
      registrationNumber: 'REG001',
      authorId: 'usr_admin001', 
      score: 100, 
      answers: {}, 
      startedAt: '2024-05-23T10:00:00Z', 
      completedAt: '2024-05-23T10:05:00Z', 
      violations: 0, 
      isFlagged: false 
    },
];
