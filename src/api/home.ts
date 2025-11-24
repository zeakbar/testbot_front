import type { Banner, Field, Category, Test } from './types';
import { apiClient } from './client';

export interface HomeData {
  banners: Banner[];
  fields: Field[];
  categories: Category[];
  tests: Test[];
  meta: {
    banners_count: number;
    fields_count: number;
    categories_count: number;
    tests_count: number;
  };
}

/**
 * Get all home page data including banners, fields, categories, and tests
 */
export async function getHomeData(): Promise<HomeData> {
  return apiClient.get<HomeData>('/home/');
}
