import type { Test } from './types';
import { apiClient } from './client';

/**
 * Get featured/promoted tests for home page
 */
export async function getFeaturedTests(): Promise<Test[]> {
  return apiClient.get<Test[]>('/testss/featured/');
}

/**
 * Get discover tests (discover section on home page)
 */
export async function getDiscoverTests(): Promise<Test[]> {
  return apiClient.get<Test[]>('/testss/discover/');
}

/**
 * Get trending tests
 */
export async function getTrendingTests(): Promise<Test[]> {
  return apiClient.get<Test[]>('/testss/trending/');
}

/**
 * Get recommended tests for user
 */
export async function getRecommendedTests(): Promise<Test[]> {
  return apiClient.get<Test[]>('/testss/recommended/');
}

/**
 * Get single test by ID
 */
export async function getTestById(id: string): Promise<Test> {
  return apiClient.get<Test>(`/testss/${id}/`);
}

/**
 * Get tests by difficulty level
 */
export async function getTestsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Test[]> {
  return apiClient.get<Test[]>(`/testss/difficulty/${difficulty}/`);
}
