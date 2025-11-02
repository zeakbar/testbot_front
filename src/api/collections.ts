import type { Collection } from './types';
import { mockCollections } from './mockData';
import { apiClient } from './client';

/**
 * Get all collections
 */
export async function getCollections(): Promise<Collection[]> {
  try {
    return await apiClient.get<Collection[]>('/collections/');
  } catch {
    // Fallback to mock data
    return mockCollections;
  }
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: string): Promise<Collection> {
  try {
    return await apiClient.get<Collection>(`/collections/${id}/`);
  } catch {
    // Fallback to mock data
    const collection = mockCollections.find((c) => c.id === id);
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  }
}

/**
 * Get quizzes in a collection
 */
export async function getQuizzesInCollection(collectionId: string) {
  try {
    return await apiClient.get(`/collections/${collectionId}/quizzes/`);
  } catch {
    // Fallback - would need to implement in mock
    return [];
  }
}
