import type { Author } from './types';
import { mockAuthors } from './mockData';
import { apiClient } from './client';

/**
 * Get top authors
 */
export async function getTopAuthors(limit: number = 4): Promise<Author[]> {
  try {
    return await apiClient.get<Author[]>(`/authors/top/?limit=${limit}`);
  } catch {
    // Fallback to mock data
    return mockAuthors.slice(0, limit);
  }
}

/**
 * Get all authors
 */
export async function getAllAuthors(): Promise<Author[]> {
  try {
    return await apiClient.get<Author[]>('/authors/');
  } catch {
    // Fallback to mock data
    return mockAuthors;
  }
}

/**
 * Get author by ID
 */
export async function getAuthorById(id: string): Promise<Author> {
  try {
    return await apiClient.get<Author>(`/authors/${id}/`);
  } catch {
    // Fallback to mock data
    const author = mockAuthors.find((a) => a.id === id);
    if (!author) {
      throw new Error('Author not found');
    }
    return author;
  }
}

/**
 * Get quizzes by author
 */
export async function getQuizzesByAuthor(authorId: string) {
  try {
    return await apiClient.get(`/authors/${authorId}/quizzes/`);
  } catch {
    // Fallback - would need to implement in mock
    return [];
  }
}
