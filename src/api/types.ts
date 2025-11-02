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

/* Quiz Model */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions_count: number;
  duration_minutes: number;
  author: Author;
  badge?: string;
}

/* Author Model */
export interface Author {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

/* Collection Model */
export interface Collection {
  id: string;
  title: string;
  image: string;
  quizzes_count: number;
  badge?: string;
}

/* API Request/Response Wrappers */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SearchResult {
  quizzes: Quiz[];
  total: number;
}
