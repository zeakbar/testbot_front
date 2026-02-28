/**
 * Lessons API Client
 * 
 * API for lessons, enrollment, and sharing functionality
 */

import type {
  Lesson,
  LessonDetail,
  LessonEnrollment,
  LessonStats,
  StudentProgressDetail,
  MyLessonProgress,
  InviteLinkResponse,
  JoinLessonResponse,
  PaginatedResponse,
  MaterialProgress,
} from './types';
import { apiClient } from './client';

// =============================================================================
// LESSON CRUD
// =============================================================================

/**
 * Get user's own lessons (as teacher)
 */
export async function getMyLessons(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Lesson>> {
  return apiClient.get<PaginatedResponse<Lesson>>(
    `/lessons/my/?page=${page}&page_size=${pageSize}`
  );
}

/**
 * Get lessons user is enrolled in (as student)
 */
export async function getEnrolledLessons(): Promise<Lesson[]> {
  return apiClient.get<Lesson[]>('/lessons/enrolled/');
}

/**
 * Get public lessons
 */
export async function getPublicLessons(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Lesson>> {
  return apiClient.get<PaginatedResponse<Lesson>>(
    `/lessons/public/?page=${page}&page_size=${pageSize}`
  );
}

/**
 * Get lesson by ID
 */
export async function getLessonById(id: number | string): Promise<LessonDetail> {
  return apiClient.get<LessonDetail>(`/lessons/${id}/`);
}

/**
 * Create a new lesson
 */
export interface CreateLessonData {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  duration_minutes?: number;
  learning_objectives?: string[];
  tags?: string[];
  language?: 'uz' | 'en' | 'ru';
  category?: number;
  is_public?: boolean;
}

export async function createLesson(data: CreateLessonData): Promise<Lesson> {
  return apiClient.post<Lesson>('/lessons/', data);
}

/**
 * Update a lesson
 */
export async function updateLesson(
  id: number | string,
  data: Partial<CreateLessonData & { is_archived?: boolean; is_homework_enabled?: boolean }>
): Promise<Lesson> {
  return apiClient.patch<Lesson>(`/lessons/${id}/`, data);
}

/**
 * Delete a lesson (soft delete)
 */
export async function deleteLesson(id: number | string): Promise<void> {
  return apiClient.delete<void>(`/lessons/${id}/`);
}

/**
 * Duplicate a lesson
 */
export async function duplicateLesson(id: number | string): Promise<LessonDetail> {
  return apiClient.post<LessonDetail>(`/lessons/${id}/duplicate/`);
}

// =============================================================================
// SHARING / ENROLLMENT
// =============================================================================

/**
 * Generate invite code and Telegram link for a lesson
 */
export async function generateInviteLink(lessonId: number | string): Promise<InviteLinkResponse> {
  return apiClient.post<InviteLinkResponse>(`/lessons/${lessonId}/generate-invite/`);
}

/**
 * Join a lesson using invite code
 */
export async function joinLesson(inviteCode: string): Promise<JoinLessonResponse> {
  return apiClient.post<JoinLessonResponse>('/lessons/join/', {
    invite_code: inviteCode,
  });
}

/**
 * Get enrolled students for a lesson (teacher only)
 */
export async function getLessonStudents(lessonId: number | string): Promise<LessonEnrollment[]> {
  return apiClient.get<LessonEnrollment[]>(`/lessons/${lessonId}/students/`);
}

/**
 * Remove a student from a lesson (teacher only)
 */
export async function removeStudent(
  lessonId: number | string,
  studentId: number | string
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(
    `/lessons/${lessonId}/students/${studentId}/`
  );
}

// =============================================================================
// PROGRESS & STATS
// =============================================================================

/**
 * Get lesson stats (teacher only)
 */
export async function getLessonStats(lessonId: number | string): Promise<LessonStats> {
  return apiClient.get<LessonStats>(`/lessons/${lessonId}/stats/`);
}

/**
 * Get specific student's progress (teacher only)
 */
export async function getStudentProgress(
  lessonId: number | string,
  studentId: number | string
): Promise<StudentProgressDetail> {
  return apiClient.get<StudentProgressDetail>(
    `/lessons/${lessonId}/students/${studentId}/progress/`
  );
}

/**
 * Get my progress for a lesson (student)
 */
export async function getMyProgress(lessonId: number | string): Promise<MyLessonProgress> {
  return apiClient.get<MyLessonProgress>(`/lessons/${lessonId}/my-progress/`);
}

// =============================================================================
// MATERIAL PROGRESS
// =============================================================================

/**
 * Start working on a material
 */
export async function startMaterial(materialId: number): Promise<MaterialProgress> {
  return apiClient.post<MaterialProgress>('/progress/start/', {
    material_id: materialId,
  });
}

/**
 * Submit material completion with score
 */
export interface SubmitProgressData {
  material_id: number;
  score: number;
  time_spent_seconds: number;
  answers_data?: Record<string, unknown>;
}

export async function submitProgress(data: SubmitProgressData): Promise<MaterialProgress> {
  return apiClient.post<MaterialProgress>('/progress/submit/', data);
}

// =============================================================================
// LESSON MATERIALS
// =============================================================================

/**
 * Get lesson materials in order
 */
export async function getLessonMaterials(lessonId: number | string): Promise<import('./types').MaterialListItem[]> {
  return apiClient.get<import('./types').MaterialListItem[]>(`/lessons/${lessonId}/materials/`);
}

/**
 * Reorder materials in a lesson
 */
export async function reorderMaterials(
  lessonId: number | string,
  materialIds: number[]
): Promise<{ message: string; order: number[] }> {
  return apiClient.post<{ message: string; order: number[] }>(
    `/lessons/${lessonId}/reorder/`,
    { material_ids: materialIds }
  );
}

/**
 * Add material to a lesson
 */
export async function addMaterialToLesson(
  lessonId: number | string,
  materialId: number,
  order?: number
): Promise<{ message: string; material_id: number; lesson_id: number }> {
  return apiClient.post<{ message: string; material_id: number; lesson_id: number }>(
    `/lessons/${lessonId}/add-material/`,
    { material_id: materialId, order }
  );
}

/**
 * Remove material from a lesson
 */
export async function removeMaterialFromLesson(
  lessonId: number | string,
  materialId: number
): Promise<{ message: string; material_id: number }> {
  return apiClient.post<{ message: string; material_id: number }>(
    `/lessons/${lessonId}/remove-material/`,
    { material_id: materialId }
  );
}

// =============================================================================
// AI LESSON GENERATION
// =============================================================================

/**
 * AI Generation request data
 * Supports both English teachers (CEFR, dual language) and general subjects
 */
export interface GenerateLessonAIData {
  topic: string;
  description?: string;
  grade_level: string;
  num_materials?: number;
  duration_minutes?: number;
  /** Content language - language of the exercises/questions */
  language?: 'uz' | 'en' | 'ru';
  /** Instructions language - e.g. Uzbek for Uzbek teachers teaching English */
  instruction_language?: 'uz' | 'en' | 'ru';
  /** Skill focus for language: grammar, vocabulary, reading, mixed */
  skill_focus?: 'grammar' | 'vocabulary' | 'reading' | 'mixed';
  subject?: string;
  teacher_style?: string;
  preferred_types?: string[];
  is_public?: boolean;
  category_id?: number;
  llm_provider?: string;
  llm_model?: string;
}

/**
 * Task response
 */
export interface TaskResponse {
  task_id: string;
  message: string;
  status_url: string;
  num_materials?: number;
}

/**
 * Material plan item
 */
export interface MaterialPlanItem {
  order: number;
  material_type: string;
  topic: string;
  title: string;
  description: string;
  num_items: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_minutes: number;
  rationale: string;
}

/**
 * Lesson plan from AI
 */
export interface LessonPlan {
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  language: string;
  total_duration_minutes: number;
  learning_objectives: string[];
  materials: MaterialPlanItem[];
  teaching_notes: string;
}

/**
 * Task progress status
 */
export interface TaskProgress {
  task_id?: string;
  state?: string;  // Celery state: PENDING, PROGRESS, SUCCESS, FAILURE
  status: string;
  progress: number;
  message: string;
  result?: {
    status: 'success' | 'failed' | 'partial';
    lesson_id?: number;
    lesson_plan?: LessonPlan;
    materials_generated?: number;
    materials_failed?: number;
    errors?: string[];
    plan?: LessonPlan;
    error?: string;
    message?: string;
  };
}

/**
 * Generate a complete lesson using AI Agent
 * Returns a task ID for tracking progress
 */
export async function generateLessonWithAI(data: GenerateLessonAIData): Promise<TaskResponse> {
  return apiClient.post<TaskResponse>('/lessons/generate-ai/', data);
}

/**
 * Plan a lesson using AI Agent (without generating materials)
 * Returns a task ID for tracking progress
 */
export async function planLessonWithAI(data: Omit<GenerateLessonAIData, 'is_public' | 'category_id'>): Promise<TaskResponse> {
  return apiClient.post<TaskResponse>('/lessons/plan-ai/', data);
}

/**
 * Generate lesson from an existing plan
 */
export interface GenerateFromPlanData {
  plan: LessonPlan;
  is_public?: boolean;
  category_id?: number;
  llm_provider?: string;
  llm_model?: string;
}

export async function generateLessonFromPlan(data: GenerateFromPlanData): Promise<TaskResponse> {
  return apiClient.post<TaskResponse>('/lessons/generate-from-plan/', data);
}

/**
 * Get task status (for polling)
 * Uses the REST endpoint, not SSE
 */
export async function getTaskProgress(taskId: string): Promise<TaskProgress> {
  return apiClient.get<TaskProgress>(`/tasks/${taskId}/status/`);
}
