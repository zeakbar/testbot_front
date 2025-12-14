import type { Test, Quiz, PaginatedResponse, QuizLeaderboardEntry } from './types';
import { apiClient } from './client';

/**
 * Get user's hosted quizzes (paginated)
 */
export async function getUserQuizzes(page: number = 1, pageSize: number = 10) {
  return apiClient.get<PaginatedResponse<Quiz>>(
    `/quizzes/?page=${page}&page_size=${pageSize}`
  );
}

/**
 * Get quiz details by ID
 */
export async function getQuizById(id: string | number): Promise<Quiz> {
  return apiClient.get<Quiz>(`/quizzes/${id}/`);
}

/**
 * Get quiz leaderboard with user scores
 */
export async function getQuizLeaderboard(id: string | number): Promise<QuizLeaderboardEntry[]> {
  const response = await apiClient.get<{ quiz_id: number; leaderboard: QuizLeaderboardEntry[] }>(
    `/quizzes/${id}/leaderboard/`
  );
  return response.leaderboard;
}

/**
 * Get quiz user scores with aggregated statistics
 */
export async function getQuizUserScores(id: string | number): Promise<QuizLeaderboardEntry[]> {
  return apiClient.get<QuizLeaderboardEntry[]>(`/quizzes/${id}/user_scores/`);
}

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
