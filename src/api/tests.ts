import type { Test, Question, TestDetailPageResponse } from './types';
import { apiClient } from './client';

/**
 * Get all tests with pagination
 */
export async function getTests(page: number = 1, pageSize: number = 10) {
  return apiClient.get(`/testss/?page=${page}&page_size=${pageSize}`);
}

/**
 * Get test by ID with questions and options
 */
export async function getTestById(id: number): Promise<Test> {
  return apiClient.get<Test>(`/testss/${id}/lean/`);
}

/**
 * Get test detail page with overall stats, solved tests, and recommended tests
 */
export async function getTestDetailPage(id: number): Promise<TestDetailPageResponse> {
  return apiClient.get<TestDetailPageResponse>(`/testss/${id}/`);
}

/**
 * Get question by ID with options
 */
export async function getQuestionById(id: number): Promise<Question> {
  return apiClient.get<Question>(`/questions/${id}/`);
}
