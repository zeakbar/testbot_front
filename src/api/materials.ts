/**
 * Materials API Client
 * 
 * Unified API for all educational material types:
 * quiz, flashcards, roulette, matching, fill_blanks, true_false
 */

import type {
  Material,
  MaterialListItem,
  MaterialGenerateRequest,
  MaterialGenerateResponse,
  TaskProgressEvent,
  PaginatedResponse,
} from './types';
import { apiClient } from './client';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// =============================================================================
// MATERIAL TYPES & PRICING CONFIG
// =============================================================================

export type MaterialType =
  | 'quiz'
  | 'flashcards'
  | 'roulette'
  | 'matching'
  | 'fill_blanks'
  | 'true_false';

export interface MaterialTypeConfig {
  id: MaterialType;
  title: string;
  description: string;
  icon: string;
  color: string;
  /** Price in UZS (so'm) - easily changeable */
  price: number;
  /** Whether this type is available */
  enabled: boolean;
  /** Default number of items */
  defaultItems: number;
  /** Min/max items */
  minItems: number;
  maxItems: number;
}

/** Individual materials FREE for limited-time promo (Uzbekistan launch) */
export const INDIVIDUAL_MATERIALS_FREE_PROMO = true;

/**
 * Material types configuration
 * Prices are in UZS (so'm). Set to 0 when INDIVIDUAL_MATERIALS_FREE_PROMO
 */
export const MATERIAL_CONFIGS: Record<MaterialType, MaterialTypeConfig> = {
  quiz: {
    id: 'quiz',
    title: 'Viktorina',
    description: "Tez va qiziqarli savol-javob o'yini",
    icon: '❓',
    color: '#4CAF50',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 2000,
    enabled: true,
    defaultItems: 10,
    minItems: 5,
    maxItems: 30,
  },
  flashcards: {
    id: 'flashcards',
    title: 'Flashkardlar',
    description: "Tez yodlash uchun kartochkalar",
    icon: '🎴',
    color: '#2196F3',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 1500,
    enabled: true,
    defaultItems: 15,
    minItems: 5,
    maxItems: 50,
  },
  roulette: {
    id: 'roulette',
    title: 'Ruletka',
    description: "O'yinli savol-javob ruletka",
    icon: '🎡',
    color: '#9C27B0',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 2000,
    enabled: true,
    defaultItems: 10,
    minItems: 6,
    maxItems: 20,
  },
  matching: {
    id: 'matching',
    title: 'Moslashtirish',
    description: "Juftliklarni topish o'yini",
    icon: '🔗',
    color: '#FF9800',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 1500,
    enabled: true,
    defaultItems: 8,
    minItems: 4,
    maxItems: 15,
  },
  fill_blanks: {
    id: 'fill_blanks',
    title: "Bo'sh joylar",
    description: "Bo'sh joylarni to'ldirish mashqlari",
    icon: '✏️',
    color: '#00BCD4',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 1500,
    enabled: true,
    defaultItems: 10,
    minItems: 5,
    maxItems: 25,
  },
  true_false: {
    id: 'true_false',
    title: "To'g'ri/Noto'g'ri",
    description: "Ha yoki yo'q savollar",
    icon: '✅',
    color: '#E91E63',
    price: INDIVIDUAL_MATERIALS_FREE_PROMO ? 0 : 1000,
    enabled: true,
    defaultItems: 15,
    minItems: 5,
    maxItems: 30,
  },
};

/**
 * Get all enabled material types
 */
export function getEnabledMaterialTypes(): MaterialTypeConfig[] {
  return Object.values(MATERIAL_CONFIGS).filter(config => config.enabled);
}

/**
 * Get material config by type
 */
export function getMaterialConfig(type: MaterialType): MaterialTypeConfig {
  return MATERIAL_CONFIGS[type];
}

/**
 * Format price for display (in Uzbek)
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Bepul';
  return `${price.toLocaleString('uz-UZ')} so'm`;
}

// =============================================================================
// HOMEWORK (LESSON) PRICING - adjustable by number of materials
// =============================================================================

/** Base price for homework creation (UZS) - e.g. 5 materials = 2000 + 5000 = 7000 so'm */
export const HOMEWORK_BASE_PRICE = 0;
/** Price per material in homework (UZS) */
export const HOMEWORK_PRICE_PER_MATERIAL = 1000;

/** Calculate homework price from number of materials */
export function getHomeworkPrice(numMaterials: number): number {
  return HOMEWORK_BASE_PRICE + numMaterials * HOMEWORK_PRICE_PER_MATERIAL;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Generate a new material using AI
 * Returns task_id for progress tracking
 */
export async function generateMaterial(
  data: MaterialGenerateRequest
): Promise<MaterialGenerateResponse> {
  const body: Record<string, unknown> = {
    material_type: data.materialType,
    topic: data.topic,
    grade_level: data.gradeLevel,
    num_items: data.numItems,
    title: data.title,
    difficulty: data.difficulty,
    language: data.language || 'uz',
    category_id: data.categoryId,
    llm_provider: data.llmProvider,
  };
  if (data.description) body.description = data.description;
  if (data.instructionLanguage) body.instruction_language = data.instructionLanguage;
  if (data.skillFocus) body.skill_focus = data.skillFocus;
  return apiClient.post<MaterialGenerateResponse>('/materials/generate/', body);
}

/**
 * Get task status (non-streaming)
 */
export async function getTaskStatus(taskId: string): Promise<TaskProgressEvent> {
  return apiClient.get<TaskProgressEvent>(`/tasks/${taskId}/status/`);
}

/**
 * Cancel a running task
 */
export async function cancelTask(taskId: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>(`/tasks/${taskId}/cancel/`);
}

/**
 * Subscribe to task progress via SSE
 * Returns an EventSource that emits TaskProgressEvent
 */
export function subscribeToTaskProgress(
  taskId: string,
  onProgress: (event: TaskProgressEvent) => void,
  onComplete: (result: TaskProgressEvent) => void,
  onError: (error: Error) => void
): () => void {
  const url = `${API_BASE_URL}/tasks/${taskId}/progress/`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as TaskProgressEvent;

      if (data.status === 'success' || data.status === 'failed') {
        onComplete(data);
        eventSource.close();
      } else {
        onProgress(data);
      }
    } catch (error) {
      console.error('Error parsing SSE event:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    onError(new Error('Ulanishda xatolik yuz berdi'));
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Get user's materials
 * @param standalone - If true, only return materials without a lesson attached
 */
export async function getMyMaterials(
  page: number = 1,
  pageSize: number = 10,
  type?: MaterialType,
  standalone?: boolean
): Promise<PaginatedResponse<MaterialListItem>> {
  let url = `/materials/my/?page=${page}&page_size=${pageSize}`;
  if (type) {
    url += `&type=${type}`;
  }
  if (standalone) {
    url += '&standalone=true';
  }
  return apiClient.get<PaginatedResponse<MaterialListItem>>(url);
}

/**
 * Get all public materials
 */
export async function getPublicMaterials(
  page: number = 1,
  pageSize: number = 10,
  type?: MaterialType
): Promise<PaginatedResponse<MaterialListItem>> {
  let url = `/materials/public/?page=${page}&page_size=${pageSize}`;
  if (type) {
    url += `&type=${type}`;
  }
  return apiClient.get<PaginatedResponse<MaterialListItem>>(url);
}

/**
 * Get featured materials
 */
export async function getFeaturedMaterials(): Promise<MaterialListItem[]> {
  return apiClient.get<MaterialListItem[]>('/materials/featured/');
}

/**
 * Get material by ID
 */
export async function getMaterialById(id: number | string): Promise<Material> {
  return apiClient.get<Material>(`/materials/${id}/`);
}

/**
 * Update material
 */
export async function updateMaterial(
  id: number | string,
  data: Partial<Material>
): Promise<Material> {
  return apiClient.patch<Material>(`/materials/${id}/`, data);
}

/**
 * Delete material
 */
export async function deleteMaterial(id: number | string): Promise<void> {
  return apiClient.delete<void>(`/materials/${id}/`);
}

/**
 * Duplicate material
 */
export async function duplicateMaterial(id: number | string): Promise<Material> {
  return apiClient.post<Material>(`/materials/${id}/duplicate/`);
}
