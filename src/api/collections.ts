import { apiClient } from './client';

// Re-export from new endpoint files for backward compatibility
export { getFields, getFieldById, getCategoriesByField } from './fields';
export { getCategories, getCategoryById, getTestsByCategory, loadMoreTests } from './categories';
export { getTests, getTestById, getQuestionById, getTestDetailPage } from './tests';

/**
 * Search across fields, categories, and tests
 */
export async function globalSearch(query: string) {
  return apiClient.get(`/search/?q=${encodeURIComponent(query)}`);
}
