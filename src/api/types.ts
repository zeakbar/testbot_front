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

// =============================================================================
// UNIFIED MATERIALS SYSTEM
// =============================================================================

/* Material Types */
export type MaterialType = 
  | 'quiz' 
  | 'flashcards' 
  | 'roulette' 
  | 'matching' 
  | 'fill_blanks' 
  | 'true_false';

/* Material Author (lightweight) */
export interface MaterialAuthor {
  user_id: number;
  full_name: string;
  username?: string;
}

/* Material Category (lightweight) */
export interface MaterialCategory {
  id: number;
  name: string;
  icon?: string;
  icon_color?: string;
}

/* Material List Item (for lists) */
export interface MaterialListItem {
  id: number;
  type: MaterialType;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  total_items: number;
  language: string;
  author: MaterialAuthor;
  category?: MaterialCategory;
  is_public: boolean;
  featured: boolean;
  creation_method: 'manual' | 'ai';
  created: string;
  updated: string;
}

/* Full Material (with content) */
export interface Material extends MaterialListItem {
  content: MaterialContent;
  content_version: string;
  lesson?: number;
  lesson_title?: string;
  order: number;
  is_active: boolean;
  standards: string[];
  keywords: string[];
  prerequisites: string[];
  metadata: Record<string, unknown>;
  agent_version: string;
  llm_provider: string;
  llm_model: string;
  version: number;
}

/* Material Content (JSON stored in DB) */
export interface MaterialContent {
  version: string;
  type: MaterialType;
  title: string;
  instructions: string;
  grade_level: string;
  body: MaterialBody;
  config: MaterialConfig;
  metadata?: Record<string, unknown>;
}

/* Material Body - varies by type */
export interface MaterialBody {
  items: MaterialItem[];
}

/* Generic Material Item */
export interface MaterialItem {
  id: number;
  question?: string;
  answer?: string;
  options?: MaterialOption[];
  is_correct?: boolean;
  hint?: string;
  explanation?: string;
  difficulty?: string;
  [key: string]: unknown;
}

/* Material Option (for quiz-like items) */
export interface MaterialOption {
  id: string | number;
  text: string;
  is_correct?: boolean;
}

/* Material Config */
export interface MaterialConfig {
  total_items: number;
  time_limit_seconds?: number;
  shuffle_items?: boolean;
  points_per_correct?: number;
  [key: string]: unknown;
}

/* Material Generate Request - seamless for English + general subjects */
export interface MaterialGenerateRequest {
  materialType: MaterialType;
  topic: string;
  description?: string;
  gradeLevel: string;
  numItems: number;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Content language - language of exercises/questions */
  language?: string;
  /** Instructions language - e.g. Uzbek when teaching English */
  instructionLanguage?: 'uz' | 'en' | 'ru';
  /** Skill focus for language: grammar, vocabulary, reading, mixed */
  skillFocus?: 'grammar' | 'vocabulary' | 'reading' | 'mixed';
  categoryId?: number;
  llmProvider?: 'anthropic' | 'openai' | 'gemini';
}

/* Material Generate Response (task created) */
export interface MaterialGenerateResponse {
  task_id: string;
  message: string;
  status_url: string;
}

/* Task Progress Event (from SSE) */
export interface TaskProgressEvent {
  status: 'pending' | 'started' | 'generating' | 'validating' | 'saving' | 'success' | 'failed' | 'timeout' | 'cancelled';
  progress: number;
  message: string;
  result?: TaskResult;
  error?: string;
}

/* Task Result (on success) */
export interface TaskResult {
  status: string;
  material_id?: number;
  message: string;
  material_type?: MaterialType;
  title?: string;
  total_items?: number;
}

// =============================================================================
// TEACHER & STUDENT SYSTEM
// =============================================================================

/* Teacher Preference */
export interface TeacherPreference {
  id: number;
  default_subject: string;
  default_grade_level: string;
  default_language: 'uz' | 'en' | 'ru';
  default_difficulty: 'easy' | 'medium' | 'hard';
  preferred_llm_provider: 'openai' | 'anthropic' | 'gemini' | '';
  teaching_style: string;
  created: string;
  updated: string;
}

/* Lesson (with enrollment info) */
export interface Lesson {
  id: number;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  learning_objectives?: string[];
  tags?: string[];
  language: 'uz' | 'en' | 'ru';
  author: MaterialAuthor;
  category?: MaterialCategory;
  materials_count: number;
  enrolled_count: number;
  is_public: boolean;
  featured: boolean;
  is_enrolled: boolean;
  is_owner: boolean;
  invite_code?: string;
  invite_link?: string;
  is_archived?: boolean;
  is_homework_enabled?: boolean;
  created: string;
  updated: string;
}

/* Lesson Detail (with materials) */
export interface LessonDetail extends Lesson {
  materials: MaterialListItem[];
}

/* Lesson Enrollment */
export interface LessonEnrollment {
  id: number;
  student: MaterialAuthor;
  enrolled_at: string;
  progress_summary: ProgressSummary;
}

/* Progress Summary */
export interface ProgressSummary {
  total_materials: number;
  completed: number;
  completion_percentage: number;
  average_score: number | null;
}

/* Material Progress */
export interface MaterialProgress {
  id: number;
  material: {
    id: number;
    type: MaterialType;
    title: string;
    total_items: number;
    order: number;
  };
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  time_spent_seconds: number;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
  answers_data: Record<string, unknown>;
}

/* Lesson Stats (teacher view) */
export interface LessonStats {
  total_enrolled: number;
  total_materials: number;
  students_completed_all: number;
  students_in_progress: number;
  students_not_started: number;
  average_score: number | null;
  highest_score: number | null;
  lowest_score: number | null;
  average_time_seconds: number | null;
  material_stats: MaterialStat[];
}

/* Material Stat */
export interface MaterialStat {
  id: number;
  title: string;
  type: MaterialType;
  total_students: number;
  completed: number;
  average_score: number | null;
}

/* Student Progress Detail (teacher view) */
export interface StudentProgressDetail {
  student: MaterialAuthor;
  enrolled_at: string;
  materials_completed: number;
  materials_total: number;
  completion_percentage: number;
  average_score: number | null;
  total_time_seconds: number;
  progress: MaterialProgress[];
}

/* My Progress (student view) */
export interface MyLessonProgress {
  lesson_id: number;
  lesson_title: string;
  materials_completed: number;
  materials_total: number;
  completion_percentage: number;
  average_score: number | null;
  materials: MaterialProgressItem[];
}

/* Material Progress Item (for my progress) */
export interface MaterialProgressItem {
  id: number;
  title: string;
  type: MaterialType;
  total_items: number;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  time_spent_seconds: number;
  attempts: number;
}

/* Invite Link Response */
export interface InviteLinkResponse {
  invite_code: string;
  invite_link: string;
  message: string;
}

/* Join Lesson Response */
export interface JoinLessonResponse {
  message: string;
  lesson: LessonDetail;
}
