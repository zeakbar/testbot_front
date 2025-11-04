import type { Quiz, SearchResult } from './types';
import { mockQuizzes, searchMockData } from './mockData';
import { apiClient } from './client';

/**
 * Get featured/promoted quizzes for home page
 */
export async function getFeaturedQuizzes(): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>('/quiz/featured/');
  } catch {
    // Fallback to mock data for now
    return mockQuizzes.slice(0, 2);
  }
}

/**
 * Get discover quizzes (discover section on home page)
 */
export async function getDiscoverQuizzes(): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>('/quiz/discover/');
  } catch {
    // Fallback to mock data
    return mockQuizzes.slice(0, 4);
  }
}

/**
 * Get trending quizzes
 */
export async function getTrendingQuizzes(): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>('/quiz/trending/');
  } catch {
    // Fallback to mock data
    return mockQuizzes.filter((q) => q.badge === 'trending');
  }
}

/**
 * Get recommended quizzes for user
 */
export async function getRecommendedQuizzes(): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>('/quiz/recommended/');
  } catch {
    // Fallback to mock data
    return mockQuizzes.slice(0, 2);
  }
}

/**
 * Search quizzes by query
 */
export async function searchQuizzes(query: string): Promise<SearchResult> {
  try {
    return await apiClient.get<SearchResult>(`/quiz/search/?q=${encodeURIComponent(query)}`);
  } catch {
    // Fallback to mock search
    const results = searchMockData(query);
    return {
      quizzes: results,
      total: results.length,
    };
  }
}

/**
 * Get single quiz by ID
 */
export async function getQuizById(id: string): Promise<Quiz> {
  try {
    return await apiClient.get<Quiz>(`/quiz/${id}/`);
  } catch {
    // Fallback to mock data
    const quiz = mockQuizzes.find((q) => q.id === id);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    return quiz;
  }
}

/**
 * Get quizzes by category
 */
export async function getQuizzesByCategory(category: string): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>(`/quiz/category/${category}/`);
  } catch {
    // Fallback to mock data
    return mockQuizzes.filter((q) => q.category === category);
  }
}

/**
 * Get quizzes by difficulty level
 */
export async function getQuizzesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Quiz[]> {
  try {
    return await apiClient.get<Quiz[]>(`/quiz/difficulty/${difficulty}/`);
  } catch {
    // Fallback to mock data
    return mockQuizzes.filter((q) => q.difficulty === difficulty);
  }
}
