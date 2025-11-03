/* User Model */
export interface User {
  user_id: number;
  full_name: string;
  username?: string;
  language: string;
  created: string;
  balance: number;
  is_verified: boolean;
}

/* Auth Responses */
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TokenPayload {
  user_id: number;
  full_name: string;
  username?: string;
  iat: number;
  exp: number;
}

/* Question Types */
export type QuestionType = 'quiz' | 'true_false' | 'fill_gap' | 'type_answer' | 'audio' | 'slider' | 'checkbox' | 'say_word';

/* Question Model */
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  image?: string;
  audio?: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/* Test/Quiz Model */
export interface Test {
  id: string;
  title: string;
  description: string;
  image: string;
  questions_count: number;
  duration_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  author: Author;
  is_public: boolean;
  created_at: string;
  badge?: string;
  questions: Question[];
}

/* Set Model */
export interface Set {
  id: string;
  title: string;
  description: string;
  image: string;
  tests_count: number;
  collection_id: string;
  is_public: boolean;
  created_at: string;
  tests: Test[];
}

/* Collection/To'plam Model */
export interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  sets_count: number;
  is_public: boolean;
  created_at: string;
  badge?: string;
  sets: Set[];
}

/* Progress/Tracking Models */
export interface TestProgress {
  test_id: string;
  attempts: number;
  time_spent_minutes: number;
  best_score: number;
  average_score: number;
  completed_at?: string;
}

export interface SetProgress {
  set_id: string;
  tests_solved: number;
  overall_time_spent_minutes: number;
  tests_to_finish: number;
  overall_best_score: number;
  completed_at?: string;
}

/* Author Model */
export interface Author {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

/* API Request/Response Wrappers */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchResult {
  tests: Test[];
  sets: Set[];
  collections: Collection[];
  total: number;
}
