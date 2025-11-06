import type { Author } from './types';
import { apiClient } from './client';

/**
 * Get top authors
 */
export async function getTopAuthors(limit: number = 4): Promise<Author[]> {
  return apiClient.get<Author[]>(`/authors/top/?limit=${limit}`);
}

/**
 * Get all authors
 */
export async function getAllAuthors(): Promise<Author[]> {
  return apiClient.get<Author[]>('/authors/');
}

/**
 * Get author by ID
 */
export async function getAuthorById(id: string): Promise<Author> {
  return apiClient.get<Author>(`/authors/${id}/`);
}

/**
 * Get tests by author
 */
export async function getTestsByAuthor(authorId: string) {
  return apiClient.get(`/authors/${authorId}/tests/`);
}
