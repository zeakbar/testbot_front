import { apiClient } from './client';
import type { Test, Category, Field } from './types';

// Re-export from new endpoint files for backward compatibility
export { getFields, getFieldById, getCategoriesByField } from './fields';
export { getCategories, getCategoryById, getTestsByCategory, loadMoreTests } from './categories';
export { getTests, getTestById, getQuestionById, getTestDetailPage } from './tests';

export interface SearchResults {
  tests?: Test[];
  categories?: Category[];
  fields?: Field[];
  total?: number;
}

/**
 * Search across fields, categories, and tests
 */
export async function globalSearch(query: string): Promise<SearchResults> {
  return apiClient.get<SearchResults>(`/search/?q=${encodeURIComponent(query)}`);
}
