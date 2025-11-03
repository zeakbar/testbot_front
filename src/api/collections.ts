import type { Collection, Set, Test } from './types';
import { mockCollections, mockSets, mockTests, searchMockData } from './mockData';
import { apiClient } from './client';

/**
 * Get all collections/To'plams
 */
export async function getCollections(): Promise<Collection[]> {
  try {
    return await apiClient.get<Collection[]>('/collections/');
  } catch {
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
    const collection = mockCollections.find((c) => c.id === id);
    if (!collection) throw new Error('Collection not found');
    return collection;
  }
}

/**
 * Get sets in a collection
 */
export async function getSetsByCollection(collectionId: string): Promise<Set[]> {
  try {
    return await apiClient.get<Set[]>(`/collections/${collectionId}/sets/`);
  } catch {
    return mockSets.filter((s) => s.collection_id === collectionId);
  }
}

/**
 * Get set by ID
 */
export async function getSetById(id: string): Promise<Set> {
  try {
    return await apiClient.get<Set>(`/sets/${id}/`);
  } catch {
    const set = mockSets.find((s) => s.id === id);
    if (!set) throw new Error('Set not found');
    return set;
  }
}

/**
 * Get tests in a set
 */
export async function getTestsBySet(setId: string): Promise<Test[]> {
  try {
    return await apiClient.get<Test[]>(`/sets/${setId}/tests/`);
  } catch {
    const set = mockSets.find((s) => s.id === setId);
    return set?.tests || [];
  }
}

/**
 * Get test by ID
 */
export async function getTestById(id: string): Promise<Test> {
  try {
    return await apiClient.get<Test>(`/tests/${id}/`);
  } catch {
    const test = mockTests.find((t) => t.id === id);
    if (!test) throw new Error('Test not found');
    return test;
  }
}

/**
 * Get recommended collections
 */
export async function getRecommendedCollections(): Promise<Collection[]> {
  try {
    return await apiClient.get<Collection[]>('/collections/recommended/');
  } catch {
    return mockCollections.slice(0, 2);
  }
}

/**
 * Search across collections, sets, and tests
 */
export async function globalSearch(query: string) {
  try {
    return await apiClient.get(`/search/?q=${encodeURIComponent(query)}`);
  } catch {
    return searchMockData(query);
  }
}
