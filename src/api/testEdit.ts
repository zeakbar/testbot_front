import { apiClient } from './client';

export interface EditableOption {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface EditableQuestion {
  id: number;
  question: string;
  image?: string | null;
  options: EditableOption[];
}

export interface EditableTest {
  id: number;
  topic: string;
  description: string;
  language: string;
  difficulty_level: 'easy' | 'medium' | 'hard' | number;
  open_period: number;
  is_public: boolean;
  can_edit: boolean;
  image?: string | null;
  questions: EditableQuestion[];
}

export interface EditTestResponse {
  id: number;
  topic: string;
  description: string;
  language: string;
  difficulty_level: 'easy' | 'medium' | 'hard' | number;
  open_period: number;
  is_public: boolean;
  can_edit: boolean;
  questions: EditableQuestion[];
}

export interface CreateQuestionRequest {
  question: string;
}

export interface UpdateQuestionRequest {
  question?: string;
}

export interface CreateOptionRequest {
  text: string;
  is_correct: boolean;
}

export interface UpdateOptionRequest {
  text?: string;
  is_correct?: boolean;
}

/**
 * Load editable test data
 */
export async function getEditableTest(testId: number): Promise<EditableTest> {
  return apiClient.get<EditableTest>(`/tests/${testId}/edit/`);
}

/**
 * Update test metadata (autosave)
 */
export async function updateTestMeta(
  testId: number,
  data: Partial<EditableTest>
): Promise<EditableTest> {
  return apiClient.patch<EditableTest>(`/tests/${testId}/update-meta/`, data);
}

/**
 * Create a new question
 */
export async function createQuestion(
  testId: number,
  data: CreateQuestionRequest
): Promise<EditableQuestion> {
  return apiClient.post<EditableQuestion>(`/tests/${testId}/questions/`, data);
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: number,
  data: UpdateQuestionRequest
): Promise<EditableQuestion> {
  return apiClient.patch<EditableQuestion>(`/questions/${questionId}/`, data);
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: number): Promise<void> {
  return apiClient.delete<void>(`/questions/${questionId}/`);
}

/**
 * Create an option for a question
 */
export async function createOption(
  questionId: number,
  data: CreateOptionRequest
): Promise<EditableOption> {
  return apiClient.post<EditableOption>(`/questions/${questionId}/options/`, data);
}

/**
 * Update an option
 */
export async function updateOption(
  optionId: number,
  data: UpdateOptionRequest
): Promise<EditableOption> {
  return apiClient.patch<EditableOption>(`/options/${optionId}/`, data);
}

/**
 * Delete an option
 */
export async function deleteOption(optionId: number): Promise<void> {
  return apiClient.delete<void>(`/options/${optionId}/`);
}

/**
 * Publish test
 */
export async function publishTest(testId: number): Promise<{ status: string; message?: string }> {
  return apiClient.post<{ status: string; message?: string }>(`/tests/${testId}/publish/`, {});
}

/**
 * Upload test cover image using multipart/form-data
 */
export async function uploadTestImage(testId: number, file: File): Promise<EditableTest> {
  const formData = new FormData();
  formData.append('image', file);

  const token = apiClient.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/tests/${testId}/update-meta/`, {
    method: 'PATCH',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<EditableTest>;
}

/**
 * Upload question image using multipart/form-data
 */
export async function uploadQuestionImage(questionId: number, file: File): Promise<EditableQuestion> {
  const formData = new FormData();
  formData.append('image', file);

  const token = apiClient.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/questions/${questionId}/`, {
    method: 'PATCH',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<EditableQuestion>;
}
