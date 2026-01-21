import type {
  Roulette,
  RouletteQuestion,
  RouletteCreateRequest,
  RouletteCreateResponse,
  RouletteGenerateRequest,
  RouletteGenerateResponse,
  PaginatedResponse,
} from './types';
import { apiClient } from './client';

/**
 * Create a new roulette (initial creation with validation)
 * Returns needs_clarification flag and clarification questions if needed
 */
export async function createRoulette(
  data: RouletteCreateRequest
): Promise<RouletteCreateResponse> {
  return apiClient.post<RouletteCreateResponse>('/api/roulettes/', {
    topic: data.topic,
    language: data.language,
    difficulty_level: data.difficulty_level,
    target_num_questions: data.target_num_questions,
  });
}

/**
 * Generate roulette questions based on clarifications
 */
export async function generateRouletteQuestions(
  rouletteId: number,
  data: RouletteGenerateRequest
): Promise<RouletteGenerateResponse> {
  return apiClient.post<RouletteGenerateResponse>(
    `/api/roulettes/${rouletteId}/generate/`,
    data
  );
}

/**
 * Get all roulettes created by current user
 */
export async function getMyRoulettes(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Roulette>> {
  return apiClient.get<PaginatedResponse<Roulette>>(
    `/api/roulettes/?page=${page}&page_size=${pageSize}`
  );
}

/**
 * Get roulette details by ID
 */
export async function getRouletteById(id: number | string): Promise<Roulette> {
  return apiClient.get<Roulette>(`/api/roulettes/${id}/`);
}

/**
 * Get roulette questions
 */
export async function getRouletteQuestions(
  rouletteId: number | string
): Promise<RouletteQuestion[]> {
  const response = await apiClient.get<RouletteQuestion[]>(
    `/api/roulettes/${rouletteId}/questions/`
  );
  // Backend returns array directly, not a paginated response
  return Array.isArray(response) ? response : [];
}

/**
 * Add a new question to roulette
 */
export async function addRouletteQuestion(
  rouletteId: number | string,
  data: { question: string; answer: string }
): Promise<RouletteQuestion> {
  return apiClient.post<RouletteQuestion>(
    `/api/roulettes/${rouletteId}/add_question/`,
    data
  );
}

/**
 * Update a roulette question
 */
export async function updateRouletteQuestion(
  rouletteId: number | string,
  questionId: number | string,
  data: { question?: string; answer?: string }
): Promise<RouletteQuestion> {
  return apiClient.patch<RouletteQuestion>(
    `/api/roulettes/${rouletteId}/questions/${questionId}/`,
    data
  );
}

/**
 * Delete a roulette question
 */
export async function deleteRouletteQuestion(
  rouletteId: number | string,
  questionId: number | string
): Promise<void> {
  return apiClient.delete<void>(
    `/api/roulettes/${rouletteId}/questions/${questionId}/`
  );
}

/**
 * Update roulette (publish, etc.)
 */
export async function updateRoulette(
  rouletteId: number | string,
  data: Partial<Roulette>
): Promise<Roulette> {
  return apiClient.patch<Roulette>(`/api/roulettes/${rouletteId}/`, data);
}

/**
 * Delete roulette
 */
export async function deleteRoulette(rouletteId: number | string): Promise<void> {
  return apiClient.delete<void>(`/api/roulettes/${rouletteId}/`);
}
