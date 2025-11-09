import type { Category, Test, PaginatedResponse } from './types';
import { apiClient } from './client';

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return apiClient.get<Category[]>('/categories/');
}

/**
 * Get category by ID with paginated tests
 */
export async function getCategoryById(
  id: number,
  page: number = 1,
  pageSize: number = 10
): Promise<Category> {
  return apiClient.get<Category>(`/categories/${id}/?page=${page}&page_size=${pageSize}`);
}

/**
 * Get paginated tests in a category
 */
export async function getTestsByCategory(
  categoryId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Test>> {
  const category = await apiClient.get<Category>(
    `/categories/${categoryId}/?page=${page}&page_size=${pageSize}`
  );
  return category.tests;
}

/**
 * Load next page of tests for a category
 */
export async function loadMoreTests(url: string): Promise<PaginatedResponse<Test>> {
  // Extract the relative path from full URL
  const matches = url.match(/\/api\/v1(.+)/);
  const endpoint = matches ? matches[1] : url;
  return apiClient.get<PaginatedResponse<Test>>(endpoint);
}
