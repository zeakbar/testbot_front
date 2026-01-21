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
  success: boolean;
  access: string;
  refresh: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/* User Profile Stats */
export interface UserStats {
  solved_tests: number;
  hosted_tests: number;
  created_tests: number;
}

/* User Profile Response */
export interface UserProfileResponse {
  success: boolean;
  user: User;
  stats: UserStats;
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
  image?: string | null;
  questions?: Question[];
  category?: Category;
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
  tests?: PaginatedResponse<Test>;
  tests_count?: number;
  
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

/* Banner Model */
export interface Banner {
  id: number;
  name: string;
  image: string;
  link: string;
  z_index: number;
}

export interface SearchResult {
  tests: Test[];
  categories: Category[];
  fields: Field[];
  total: number;
}

/* Overall Statistics for Test */
export interface OverallStats {
  times_played: number;
  total_answers: number;
  total_correct: number;
  avg_percentage: number;
  avg_points: number;
  total_time_seconds: number;
  fastest_time_seconds: number;
  slowest_time_seconds: number;
}

/* Solved Test Item (for list display) */
export interface SolvedTestItem {
  id: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
  points: number;
  time_taken: number;
  created: string;
  type: 'indvidual_web' | string;
  quiz: null | number;
  user_id?: number;
}

/* Recommended Test Card */
export interface RecommendedTest {
  id: number;
  topic: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  target_num_questions: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
    full_name: string;
  };
  created: string;
}

/* Complete Test Detail Page Response */
export interface TestDetailPageResponse {
  test: Test;
  is_owner: boolean;
  overall_stats: OverallStats;
  solved_tests: SolvedTestItem[];
  recommended_tests: RecommendedTest[];
}

/* Quiz Model */
export interface Quiz {
  id: number;
  host: number;
  open_period: number;
  users: number[];
  test: Test | number;
  solved_tests: number | any[];
  created: string;
  status: 'active' | 'closed' | 'waiting' | string;
}

/* Quiz Leaderboard Entry */
export interface QuizLeaderboardEntry {
  user_id: number;
  username?: string;
  full_name: string;
  total_points: number;
  total_answers?: number;
  correct_answers?: number;
}

/* Roulette Question Model */
export interface RouletteQuestion {
  id: number;
  question: string;
  answer: string;
  ai_generated: boolean;
  order: number;
  created: string;
}

/* Roulette Model */
export interface Roulette {
  id: number;
  topic: string;
  description: string;
  language: 'uz' | 'en' | 'ru';
  difficulty_level: 'easy' | 'medium' | 'hard';
  target_num_questions: number;
  status: 'clarifying' | 'ready' | 'generated';
  summary: string | null;
  source_note: string | null;
  is_public: boolean;
  is_owner: boolean;
  created: string;
  questions?: RouletteQuestion[];
}

/* Roulette Creation Request */
export interface RouletteCreateRequest {
  topic: string;
  language: 'uz' | 'en' | 'ru';
  difficulty_level: 'easy' | 'medium' | 'hard';
  target_num_questions: number;
}

/* Roulette Clarification Option */
export interface RouletteClarificationOption {
  value: string;
  label: string;
}

/* Roulette Clarification Question (parsed) */
export interface RouletteClarificationQuestion {
  key: string;
  question: string;
  suggested_options: RouletteClarificationOption[];
  allows_custom: boolean;
}

/* Raw Roulette Clarification Question from Backend */
export type RawRouletteClarificationQuestion = Array<
  | ['key', string]
  | ['question', string]
  | ['suggested_options', Array<Array<['value', string] | ['label', string]>>]
  | ['allows_custom', boolean]
>;

/* Roulette Create Response */
export interface RouletteCreateResponse {
  id: number;
  needs_clarification: boolean;
  questions: RawRouletteClarificationQuestion[];
}

/* Roulette Generate Request */
export interface RouletteGenerateRequest {
  clarifications: Record<string, string>;
}

/* Roulette Generate Response */
export interface RouletteGenerateResponse {
  status: string;
  count: number;
  summary: string;
  source: string;
}

/* Roulette Game Team */
export interface RouletteTeam {
  id: number;
  name: string;
  color: string;
  score: number;
}

/* Roulette Game Session */
export interface RouletteGameSession {
  id: number;
  roulette: number;
  teams: RouletteTeam[];
  mode: 'single' | 'multi';
  status: 'setup' | 'in_progress' | 'completed';
  current_question_index: number;
  used_segments: number[];
  created: string;
}
