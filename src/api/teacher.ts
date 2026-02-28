/**
 * Teacher API Client
 * 
 * API for teacher preferences and settings
 */

import type { TeacherPreference } from './types';
import { apiClient } from './client';

// =============================================================================
// TEACHER PREFERENCES
// =============================================================================

/**
 * Get current user's teacher preferences
 * Creates default preferences if they don't exist
 */
export async function getTeacherPreferences(): Promise<TeacherPreference> {
  return apiClient.get<TeacherPreference>('/teacher/preferences/');
}

/**
 * Update teacher preferences
 */
export interface UpdateTeacherPreferenceData {
  default_subject?: string;
  default_grade_level?: string;
  default_language?: 'uz' | 'en' | 'ru';
  default_difficulty?: 'easy' | 'medium' | 'hard';
  preferred_llm_provider?: 'openai' | 'anthropic' | 'gemini' | '';
  teaching_style?: string;
}

export async function updateTeacherPreferences(
  data: UpdateTeacherPreferenceData
): Promise<TeacherPreference> {
  return apiClient.put<TeacherPreference>('/teacher/preferences/', data);
}

/**
 * Partial update teacher preferences
 */
export async function patchTeacherPreferences(
  data: Partial<UpdateTeacherPreferenceData>
): Promise<TeacherPreference> {
  return apiClient.patch<TeacherPreference>('/teacher/preferences/', data);
}

// =============================================================================
// GRADE LEVELS & SUBJECTS (Constants)
// =============================================================================

/** CEFR levels - for English/language teaching */
export const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Pre-Intermediate' },
  { value: 'B2', label: 'B2 - Intermediate' },
  { value: 'C1', label: 'C1 - Upper-Intermediate' },
  { value: 'C2', label: 'C2 - Advanced' },
];

/** School grades - for other subjects (math, biology, etc.) */
export const SCHOOL_LEVELS = [
  { value: '5-sinf', label: '5-sinf' },
  { value: '6-sinf', label: '6-sinf' },
  { value: '7-sinf', label: '7-sinf' },
  { value: '8-sinf', label: '8-sinf' },
  { value: '9-sinf', label: '9-sinf' },
  { value: '10-sinf', label: '10-sinf' },
  { value: '11-sinf', label: '11-sinf' },
  { value: 'universitet', label: 'Universitet' },
  { value: 'umumiy', label: 'Umumiy' },
];

/** Unified levels: CEFR + School - one seamless list, no mode toggle */
export const UNIFIED_LEVELS = [
  { group: 'CEFR - Language levels', options: CEFR_LEVELS },
  { group: 'School levels', options: SCHOOL_LEVELS },
];

/** Flat list for simpler selects - CEFR first, then school */
export const GRADE_LEVELS = [
  ...CEFR_LEVELS,
  ...SCHOOL_LEVELS,
];

export const SUBJECTS = [
  { value: 'English', label: 'English' },
];

export const SKILL_TYPES = [
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'reading', label: 'Reading' },
  { value: 'mixed', label: 'Mixed Practice' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'uz', label: "O'zbekcha" },
  { value: 'ru', label: 'Русский' },
];

export const DIFFICULTIES = [
  { value: 'easy', label: 'Oson', emoji: '🌱' },
  { value: 'medium', label: "O'rta", emoji: '⚡' },
  { value: 'hard', label: 'Qiyin', emoji: '🔥' },
];

export const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI GPT' },
  { value: 'anthropic', label: 'Anthropic Claude' },
  { value: 'gemini', label: 'Google Gemini' },
];
