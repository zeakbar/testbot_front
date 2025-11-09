import type { Field, Category } from './types';
import { apiClient } from './client';

/**
 * Get all fields
 */
export async function getFields(): Promise<Field[]> {
  return apiClient.get<Field[]>('/fields/');
}

/**
 * Get field by ID with categories
 */
export async function getFieldById(id: number): Promise<Field> {
  return apiClient.get<Field>(`/fields/${id}/`);
}

/**
 * Get categories in a field
 */
export async function getCategoriesByField(fieldId: number): Promise<Category[]> {
  const field = await apiClient.get<Field>(`/fields/${fieldId}/`);
  return field.categories || [];
}
