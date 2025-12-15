import type { Test, Question, TestDetailPageResponse, PaginatedResponse } from './types';
import { apiClient } from './client';

/**
 * Get all tests with pagination
 */
export async function getTests(page: number = 1, pageSize: number = 10) {
  return apiClient.get<PaginatedResponse<Test>>(`/tests/?page=${page}&page_size=${pageSize}`);
}

/**
 * Get test by ID with questions and options
 */
export async function getTestById(id: number): Promise<Test> {
  return apiClient.get<Test>(`/tests/${id}/lean/`);
}

/**
 * Get test detail page with overall stats, solved tests, and recommended tests
 */
export async function getTestDetailPage(id: number): Promise<TestDetailPageResponse> {
  return apiClient.get<TestDetailPageResponse>(`/tests/${id}/`);
}

/**
 * Get question by ID with options
 */
export async function getQuestionById(id: number): Promise<Question> {
  return apiClient.get<Question>(`/questions/${id}/`);
}

/**
 * Get current user's tests with pagination
 */
export async function getMyTests(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Test>> {
  return apiClient.get<PaginatedResponse<Test>>(`/tests/my-tests/?page=${page}&page_size=${pageSize}`);
}
