import { apiClient } from './client';

export interface SendMessagePayload {
  type: 'show_test_in_chat' | 'create_test' | string;
  data: Record<string, unknown>;
}

export interface SendMessageResponse {
  status: 'success' | 'error';
  message?: string;
}

export async function sendMessageToChat(payload: SendMessagePayload): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>('/send-message/', payload);
}

export async function showTestInChat(testId: number): Promise<SendMessageResponse> {
  return sendMessageToChat({
    type: 'show_test_in_chat',
    data: { test_id: testId },
  });
}

export async function sendCreateTestMessage(): Promise<SendMessageResponse> {
  return sendMessageToChat({
    type: 'create_test',
    data: {},
  });
}
