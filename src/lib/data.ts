import type { Quiz, QuizAttempt } from './types';

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz_space_101',
    title: 'Cosmic Beginners',
    topic: 'Basics of Space Exploration',
    difficulty: 'easy',
    createdBy: 'usr_admin001',
    createdAt: '2024-05-20T10:00:00Z',
    questions: [
      { question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Mars' },
      { question: 'What is the name of the galaxy we live in?', options: ['Andromeda', 'Triangulum', 'Milky Way', 'Whirlpool'], correctAnswer: 'Milky Way' },
      { question: 'Who was the first human to walk on the moon?', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins', 'Neil Armstrong'], correctAnswer: 'Neil Armstrong' },
    ],
  },
  {
    id: 'quiz_code_201',
    title: 'JavaScript Fundamentals',
    topic: 'JavaScript',
    difficulty: 'medium',
    createdBy: 'usr_admin001',
    createdAt: '2024-05-21T14:30:00Z',
    questions: [
      { question: 'What does "DOM" stand for?', options: ['Document Object Model', 'Data Object Model', 'Document Objective Model', 'Desktop Oriented-Model'], correctAnswer: 'Document Object Model' },
      { question: 'Which keyword is used to declare a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], correctAnswer: 'const' },
      { question: 'What is "NaN" in JavaScript?', options: ['Not a Number', 'No action needed', 'Null and Named', 'A built-in function'], correctAnswer: 'Not a Number' },
      { question: 'Which of the following is a primitive type in JavaScript?', options: ['Array', 'Object', 'String', 'Function'], correctAnswer: 'String' },
    ],
  },
    {
    id: 'quiz_history_301',
    title: 'Ancient Rome',
    topic: 'Roman Empire',
    difficulty: 'hard',
    createdBy: 'usr_admin001',
    createdAt: '2024-05-22T09:15:00Z',
    questions: [
      { question: 'Who was the first emperor of Rome?', options: ['Julius Caesar', 'Augustus', 'Nero', 'Constantine'], correctAnswer: 'Augustus' },
      { question: 'The Punic Wars were fought between Rome and which other power?', options: ['Greece', 'Egypt', 'Carthage', 'Persia'], correctAnswer: 'Carthage' },
      { question: 'In what year did the Western Roman Empire fall?', options: ['476 AD', '1453 AD', '330 AD', '753 BC'], correctAnswer: '476 AD' },
    ],
  },
];


export const MOCK_ATTEMPTS: QuizAttempt[] = [
    { id: 'att_001', quizId: 'quiz_space_101', quizTitle: 'Cosmic Beginners', userId: 'usr_student01', userName: 'Alice', score: 100, answers: {}, startedAt: '2024-05-23T10:00:00Z', completedAt: '2024-05-23T10:05:00Z', violations: 0, isFlagged: false },
    { id: 'att_002', quizId: 'quiz_code_201', quizTitle: 'JavaScript Fundamentals', userId: 'usr_student02', userName: 'Bob', score: 75, answers: {}, startedAt: '2024-05-23T11:00:00Z', completedAt: '2024-05-23T11:10:00Z', violations: 1, isFlagged: false },
    { id: 'att_003', quizId: 'quiz_history_301', quizTitle: 'Ancient Rome', userId: 'usr_student03', userName: 'Charlie', score: 33, answers: {}, startedAt: '2024-05-23T12:00:00Z', completedAt: '2024-05-23T12:15:00Z', violations: 4, isFlagged: true },
    { id: 'att_004', quizId: 'quiz_code_201', quizTitle: 'JavaScript Fundamentals', userId: 'usr_student04', userName: 'Diana', score: 50, answers: {}, startedAt: '2024-05-24T09:00:00Z', completedAt: '2024-05-24T09:08:00Z', violations: 5, isFlagged: true },
    { id: 'att_005', quizId: 'quiz_space_101', quizTitle: 'Cosmic Beginners', userId: 'usr_student05', userName: 'Eve', score: 67, answers: {}, startedAt: '2024-05-24T10:00:00Z', completedAt: '2024-05-24T10:06:00Z', violations: 0, isFlagged: false },
    { id: 'att_006', quizId: 'quiz_history_301', quizTitle: 'Ancient Rome', userId: 'usr_student01', userName: 'Alice', score: 100, answers: {}, startedAt: '2024-05-24T13:00:00Z', completedAt: '2024-05-24T13:12:00Z', violations: 2, isFlagged: false },
];
