import type { PaginatedResponse } from './types';
import { apiClient } from './client';

/* Request/Response Types for Step 1 - Get Test Details */
// Test details are retrieved via GET /testss/<test_id>/ in tests.ts

/* Request/Response Types for Step 2 - Start Test */
export interface StartTestPayload {
  test_id: number;
  quiz_id: null | number;
  type: 'indvidual_web' | string;
}

export interface StartTestResponse {
  solved_test_id: number;
  start_time: string;
}

/* Request/Response Types for Step 3 - Submit Single Answer */
export interface SubmitAnswerPayload {
  option_id: number;
  created: string;
}

export interface SubmitAnswerResponse {
  id: number;
  solved_test_id: number;
  option_id: number;
  is_true: boolean;
  points: number;
}

/* Request/Response Types for Step 4 - Submit All Answers at End */
export interface AnswerInput {
  option_id: number;
  created: string;
}

export interface SubmitTestPayload {
  test_id: number;
  quiz_id: null | number;
  type: 'indvidual_web' | string;
  answers: AnswerInput[];
}

/* Response Types for Step 5 - Get Final Results */
export interface AnswerResult {
  question_id: number;
  question_text: string;
  your_answer: string;
  is_true: boolean;
  points: number;
}

export interface SolvedTestDetail {
  id: number;
  test: number;
  quiz: null | number;
  type: 'indvidual_web' | string;
  created: string;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  total_points: number;
  percentage: number;
  answers: AnswerResult[];
}

/**
 * STEP 2: Start a test (creates SolvedTest entry)
 */
export async function startTest(payload: StartTestPayload): Promise<StartTestResponse> {
  return apiClient.post<StartTestResponse>('/solved-tests/start/', payload);
}

/**
 * STEP 3: Submit a single answer for a question
 */
export async function submitAnswer(
  solvedTestId: number,
  payload: SubmitAnswerPayload
): Promise<SubmitAnswerResponse> {
  return apiClient.post<SubmitAnswerResponse>(`/solved-tests/${solvedTestId}/answers/`, payload);
}

/**
 * STEP 4: Submit all answers at once (alternative to step 3)
 * Use this if sending answers one by one is not preferred
 */
export async function submitTest(payload: SubmitTestPayload): Promise<SolvedTestDetail> {
  return apiClient.post<SolvedTestDetail>('/solved-tests/', payload);
}

/**
 * STEP 5: Get solved test detail with final results
 */
export async function getSolvedTestDetail(solvedTestId: number): Promise<SolvedTestDetail> {
  return apiClient.get<SolvedTestDetail>(`/solved-tests/${solvedTestId}/`);
}

/**
 * Get user's solved tests (paginated)
 */
export async function getUserSolvedTests(page: number = 1, pageSize: number = 10) {
  return apiClient.get<PaginatedResponse<SolvedTestDetail>>(
    `/solved-tests/?page=${page}&page_size=${pageSize}`
  );
}
