import type { Test, Question, Option, User } from './types';

// Mock user data
export const mockUsers: User[] = [
  {
    user_id: 1,
    full_name: 'John Doe',
    username: 'johndoe',
    language: 'en',
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    balance: 1000,
    is_verified: true,
  },
  {
    user_id: 2,
    full_name: 'Jane Smith',
    username: 'janesmith',
    language: 'en',
    created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    balance: 500,
  },
];

// Mock options
export const mockOptions: Option[] = [
  {
    id: 1,
    text: 'Option A',
    is_correct: true,
    order: 1,
    question: 1,
  },
  {
    id: 2,
    text: 'Option B',
    is_correct: false,
    order: 2,
    question: 1,
  },
  {
    id: 3,
    text: 'Option C',
    is_correct: false,
    order: 3,
    question: 1,
  },
];

// Mock questions
export const mockQuestions: Question[] = [
  {
    id: 1,
    test: 1,
    question: 'What is the capital of France?',
    image: undefined,
    is_active: true,
    ai_generated: false,
    explanation: 'Paris is the capital of France',
    options: mockOptions,
  },
  {
    id: 2,
    test: 1,
    question: 'What is 2 + 2?',
    image: undefined,
    is_active: true,
    ai_generated: false,
    explanation: 'The sum of 2 and 2 is 4',
    options: [
      {
        id: 4,
        text: '3',
        is_correct: false,
        order: 1,
        question: 2,
      },
      {
        id: 5,
        text: '4',
        is_correct: true,
        order: 2,
        question: 2,
      },
    ],
  },
];

// Mock tests
export const mockTests: Test[] = [
  {
    id: 1,
    author: mockUsers[0],
    topic: 'Geography',
    language: 'en',
    difficulty_level: 'easy',
    target_num_questions: 10,
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated: new Date().toISOString(),
    total_questions: 2,
    generated_questions: 1,
    mannual_questions: 1,
    is_public: true,
    creation_method: 'manual',
    open_period: 7,
    description: 'A test about geography',
    image: undefined,
    questions: mockQuestions,
  },
  {
    id: 2,
    author: mockUsers[1],
    topic: 'Mathematics',
    language: 'en',
    difficulty_level: 'medium',
    target_num_questions: 15,
    created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated: new Date().toISOString(),
    total_questions: 0,
    generated_questions: 0,
    mannual_questions: 0,
    is_public: true,
    creation_method: 'ai',
    open_period: 14,
    description: 'A math test',
    image: undefined,
  },
];
