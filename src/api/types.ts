/* User Model */
export interface User {
  user_id: number;
  full_name: string;
  username?: string;
  language: string;
  created: string;
  balance: number;
  is_verified?: boolean;
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

/* Option Model */
export interface Option {
  id: number;
  text: string;
  is_correct: boolean;
  order: number;
  question: number;
}

/* Question Model */
export interface Question {
  id: number;
  test: number;
  question: string;
  image?: string | null;
  is_active: boolean;
  ai_generated: boolean;
  explanation: string;
  options: Option[];
}

/* Pagination Wrapper */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* Test/Quiz Model */
export interface Test {
  id: number;
  author: User;
  topic: string;
  language: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  target_num_questions: number;
  created: string;
  updated: string;
  total_questions: number;
  generated_questions: number;
  mannual_questions: number;
  is_public: boolean;
  creation_method: 'ai' | 'manual';
  open_period: number;
  description?: string | null;
  questions?: Question[];
  category?: {
    name: string;
  };
}

/* Category Model */
export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: string;
  icon_color: string;
  z_index: number;
  user_addable: boolean;
  test_ordering: string;
  field: number;
  tests: PaginatedResponse<Test>;
}

/* Field Model */
export interface Field {
  id: number;
  name: string;
  description?: string;
  image: string;
  z_index: number;
  created: string;
  categories_count?: number;
  categories?: Category[];
}

/* Author Model (alias for User) */
export interface Author extends User {}

/* API Request/Response Wrappers */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchResult {
  tests: Test[];
  categories: Category[];
  fields: Field[];
  total: number;
}
